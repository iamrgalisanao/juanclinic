<?php

namespace App\Services;

use App\Models\EMPI_Submission;
use App\Models\HardwareTerminal;
use App\Models\Patient;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EMPISyncService
{
    /**
     * Verification weights for probabilistic matching.
     * Must sum to 1.0 in order to produce a 0.0 - 1.0 confidence score.
     */
    private const MATCH_WEIGHTS = [
        'first_name' => 0.20,
        'last_name'  => 0.30,
        'dob'        => 0.30,
        'contact'    => 0.20,
    ];

    /**
     * Confidence threshold for auto-linking a patient record.
     */
    private const AUTO_LINK_THRESHOLD = 0.85;

    // -------------------------------------------------------------------------
    // Step 1: Hardware Authentication
    // -------------------------------------------------------------------------

    /**
     * Verify that the hardware device is registered and active.
     *
     * @param  string $hardwareId  Device serial number from the payload
     * @param  string $terminalId  Terminal reference ID from the payload
     * @return HardwareTerminal|null
     */
    public function verifyHardware(string $hardwareId, string $terminalId): ?HardwareTerminal
    {
        return HardwareTerminal::where('hardware_id', $hardwareId)
            ->where('terminal_id', $terminalId)
            ->where('is_active', true)
            ->first();
    }

    // -------------------------------------------------------------------------
    // Step 2: Checksum Verification (SHA-256)
    // -------------------------------------------------------------------------

    /**
     * Verify the SHA-256 payload checksum.
     * The checksum is computed over the canonical payload EXCLUDING the
     * `payload_checksum` field itself (consistent with POS integration spec v2.1).
     *
     * @param  array  $payload           Full decoded JSON payload
     * @param  string $receivedChecksum  Checksum provided by the hardware device
     * @return bool
     */
    public function verifyChecksum(array $payload, string $receivedChecksum): bool
    {
        $canonical = $payload;
        unset($canonical['payload_checksum']);
        ksort($canonical);

        $computed = hash('sha256', json_encode($canonical));

        return hash_equals($computed, strtolower($receivedChecksum));
    }

    // -------------------------------------------------------------------------
    // Step 3: Patient Matching Engine
    // -------------------------------------------------------------------------

    /**
     * Deterministic match: attempt to find patient by external ID / customer code.
     *
     * @param  string $customerCode
     * @param  int    $tenantId
     * @return Patient|null
     */
    public function deterministicMatch(string $customerCode, int $tenantId): ?Patient
    {
        return Patient::where('tenant_id', $tenantId)
            ->where('patient_external_id', $customerCode)
            ->first();
    }

    /**
     * Probabilistic match: score a patient against the incoming demographics.
     * Returns ['patient' => Patient|null, 'confidence' => float]
     *
     * @param  array $demographics  ['first_name', 'last_name', 'dob', 'contact']
     * @param  int   $tenantId
     * @return array{patient: Patient|null, confidence: float}
     */
    public function probabilisticMatch(array $demographics, int $tenantId): array
    {
        $candidates = Patient::where('tenant_id', $tenantId)
            ->where('last_name', 'like', substr($demographics['last_name'] ?? '', 0, 3) . '%')
            ->get();

        $bestScore  = 0.0;
        $bestMatch  = null;

        foreach ($candidates as $patient) {
            $score = 0.0;

            // First name (fuzzy)
            similar_text(
                strtolower($patient->first_name ?? ''),
                strtolower($demographics['first_name'] ?? ''),
                $pct
            );
            $score += (self::MATCH_WEIGHTS['first_name'] * ($pct / 100));

            // Last name (fuzzy)
            similar_text(
                strtolower($patient->last_name ?? ''),
                strtolower($demographics['last_name'] ?? ''),
                $pct
            );
            $score += (self::MATCH_WEIGHTS['last_name'] * ($pct / 100));

            // DOB (exact)
            if (
                isset($demographics['dob']) &&
                $patient->dob &&
                $patient->dob->format('Y-m-d') === $demographics['dob']
            ) {
                $score += self::MATCH_WEIGHTS['dob'];
            }

            // Contact (exact)
            if (
                isset($demographics['contact']) &&
                $patient->contact === $demographics['contact']
            ) {
                $score += self::MATCH_WEIGHTS['contact'];
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestMatch = $patient;
            }
        }

        return ['patient' => $bestMatch, 'confidence' => round($bestScore, 4)];
    }

    // -------------------------------------------------------------------------
    // Step 4: Process & Persist Submission
    // -------------------------------------------------------------------------

    /**
     * Process an incoming hardware submission.
     *
     * Workflow:
     *  1. Deterministic match via customer_code
     *  2. Fallback to probabilistic match
     *  3. Auto-link if confidence >= 0.85, else set PARTIAL_MATCH
     *  4. Create UNVERIFIED skeleton patient if no match at all
     *  5. Persist encrypted submission record
     *
     * @param  HardwareTerminal $terminal
     * @param  array            $payload   Full decoded JSON payload
     * @return EMPI_Submission
     */
    public function processSubmission(HardwareTerminal $terminal, array $payload): EMPI_Submission
    {
        return DB::transaction(function () use ($terminal, $payload) {

            $tenantId     = $terminal->tenant_id;
            $customerCode = $payload['customer']['customer_code'] ?? null;
            $demographics = [
                'first_name' => $payload['customer']['first_name'] ?? null,
                'last_name'  => $payload['customer']['last_name'] ?? null,
                'dob'        => $payload['customer']['dob'] ?? null,
                'contact'    => $payload['customer']['contact'] ?? null,
            ];

            $matchedPatient    = null;
            $matchingConfidence = 0.0;
            $status            = 'FAILED';

            // --- Stage 1: Deterministic match ---
            if ($customerCode) {
                $matchedPatient = $this->deterministicMatch($customerCode, $tenantId);
                if ($matchedPatient) {
                    $matchingConfidence = 1.0;
                    $status             = 'SUCCESS';
                }
            }

            // --- Stage 2: Probabilistic match ---
            if (! $matchedPatient && array_filter($demographics)) {
                $result             = $this->probabilisticMatch($demographics, $tenantId);
                $matchedPatient     = $result['patient'];
                $matchingConfidence = $result['confidence'];

                if ($matchedPatient && $matchingConfidence >= self::AUTO_LINK_THRESHOLD) {
                    $status = 'SUCCESS';
                } elseif ($matchedPatient) {
                    $status = 'PARTIAL_MATCH';
                }
            }

            // --- Stage 3: Create unverified skeleton patient if no match ---
            if (! $matchedPatient && array_filter($demographics)) {
                $matchedPatient = Patient::create([
                    'tenant_id'           => $tenantId,
                    'patient_external_id' => $customerCode,
                    'first_name'          => $demographics['first_name'] ?? 'UNKNOWN',
                    'last_name'           => $demographics['last_name'] ?? 'UNKNOWN',
                    'dob'                 => $demographics['dob'] ?? null,
                    'gender'              => 'O', // Default to Other/Unknown to satisfy NOT NULL constraint
                    'contact'             => $demographics['contact'] ?? null,
                    'metadata'            => ['empi_status' => 'UNVERIFIED', 'source' => 'HARDWARE_SYNC'],
                ]);
                $matchingConfidence = 0.0;
                $status             = 'SUCCESS';
            }

            // --- Stage 4: Persist the auditable submission record ---
            return EMPI_Submission::create([
                'submission_uuid'     => $payload['transaction_id'] ?? Str::uuid()->toString(),
                'hardware_terminal_id' => $terminal->id,
                'raw_payload'         => Crypt::encryptString(json_encode($payload)),
                'matched_patient_id'  => $matchedPatient?->id,
                'matching_confidence' => $matchingConfidence,
                'status'              => $status,
                'processed_at'        => now(),
            ]);
        });
    }
}
