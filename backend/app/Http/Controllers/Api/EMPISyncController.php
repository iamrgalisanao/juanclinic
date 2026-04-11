<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HardwareTerminal;
use App\Services\EMPISyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EMPISyncController extends Controller
{
    public function __construct(protected EMPISyncService $empiService) {}

    // -------------------------------------------------------------------------
    // POST /api/empi/sync/submit
    // -------------------------------------------------------------------------

    /**
     * Ingest a hardware transaction payload.
     *
     * Expected JSON body (BIR EIS compatible):
     * {
     *   "transaction_id":    "SALE_00004044_20260329_162445",
     *   "hardware_id":       "XWS25903600296",
     *   "terminal_id":       "91",
     *   "payload_checksum":  "sha256...",
     *   "customer": {
     *     "customer_code":   "JC-00123",
     *     "first_name":      "Juan",
     *     "last_name":       "Dela Cruz",
     *     "dob":             "1990-05-15",
     *     "contact":         "09171234567"
     *   },
     *   ...
     * }
     */
    public function submit(Request $request): JsonResponse
    {
        // --- 1. Validate incoming request structure ---
        $validated = $request->validate([
            'transaction_id'   => 'required|string|max:100',
            'hardware_id'      => 'required|string|max:100',
            'terminal_id'      => 'required|string|max:50',
            'payload_checksum' => 'required|string|size:64',
            'customer'         => 'nullable|array',
        ]);

        $payload = $request->all();

        // --- 2. Hardware Authentication ---
        $terminal = $this->empiService->verifyHardware(
            $validated['hardware_id'],
            $validated['terminal_id']
        );

        if (! $terminal) {
            Log::warning('[EMPI] Unregistered hardware attempt', [
                'hardware_id' => $validated['hardware_id'],
                'terminal_id' => $validated['terminal_id'],
                'ip'          => $request->ip(),
            ]);
            return response()->json([
                'status'  => 'REJECTED',
                'message' => 'Hardware device not registered or inactive.',
            ], 403);
        }

        // --- 3. Checksum Verification ---
        if (! $this->empiService->verifyChecksum($payload, $validated['payload_checksum'])) {
            Log::warning('[EMPI] Checksum mismatch', [
                'transaction_id' => $validated['transaction_id'],
                'hardware_id'    => $validated['hardware_id'],
            ]);
            return response()->json([
                'status'  => 'REJECTED',
                'message' => 'Payload checksum mismatch. Transmission integrity could not be verified.',
            ], 422);
        }

        // --- 4. Process Submission ---
        try {
            $submission = $this->empiService->processSubmission($terminal, $payload);
        } catch (\Throwable $e) {
            Log::error('[EMPI] Submission processing failed', [
                'transaction_id' => $validated['transaction_id'],
                'error'          => $e->getMessage(),
            ]);
            return response()->json([
                'status'  => 'ERROR',
                'message' => 'Submission could not be processed. Please retry.',
            ], 500);
        }

        // --- 5. Response ---
        $responseBody = [
            'status'             => $submission->status,
            'submission_uuid'    => $submission->submission_uuid,
            'matching_confidence' => $submission->matching_confidence,
        ];

        if ($submission->status === 'PARTIAL_MATCH') {
            $responseBody['message'] = 'Patient identity requires manual review. Submission accepted.';
        }

        return response()->json($responseBody, 201);
    }

    // -------------------------------------------------------------------------
    // GET /api/empi/hardware
    // -------------------------------------------------------------------------

    /**
     * List all registered hardware terminals for the authenticated tenant.
     * Admin-only endpoint.
     */
    public function listHardware(Request $request): JsonResponse
    {
        // Removed: $this->authorize('admin'); - Managed by role:ADMIN middleware in api.php

        $terminals = HardwareTerminal::where('tenant_id', $request->user()->tenant_id)
            ->with('branch')
            ->get();

        return response()->json(['data' => $terminals]);
    }

    // -------------------------------------------------------------------------
    // POST /api/empi/hardware/register
    // -------------------------------------------------------------------------

    /**
     * Register a new hardware terminal.
     * Admin-only endpoint.
     */
    public function registerHardware(Request $request): JsonResponse
    {
        // Removed: $this->authorize('admin'); - Managed by role:ADMIN middleware in api.php

        $validated = $request->validate([
            'terminal_id' => 'required|string|max:50',
            'hardware_id' => 'required|string|max:100|unique:hardware_terminals,hardware_id',
            'branch_id'   => 'nullable|integer|exists:physical_branches,id',
            'min_number'  => 'nullable|string|max:50',
            'ptu_number'  => 'nullable|string|max:50',
        ]);

        $terminal = HardwareTerminal::create([
            'tenant_id'   => $request->user()->tenant_id,
            'branch_id'   => $validated['branch_id'] ?? null,
            'terminal_id' => $validated['terminal_id'],
            'hardware_id' => $validated['hardware_id'],
            'min_number'  => $validated['min_number'] ?? null,
            'ptu_number'  => $validated['ptu_number'] ?? null,
            'is_active'   => true,
        ]);

        return response()->json(['data' => $terminal], 201);
    }
}
