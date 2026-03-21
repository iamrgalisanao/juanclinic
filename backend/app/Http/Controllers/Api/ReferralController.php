<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Referral;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;

class ReferralController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Referral::with(['patient', 'sourceTenant', 'targetTenant', 'referredBy'])
            ->latest()
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'target_tenant_id' => 'required|exists:tenants,id',
            'clinical_notes' => 'nullable|string',
            'consent_proof' => 'required|string',
        ]);

        $referral = Referral::create([
            'patient_id' => $validated['patient_id'],
            'source_tenant_id' => app('tenant')->id,
            'target_tenant_id' => $validated['target_tenant_id'],
            'referred_by_user_id' => auth()->id(),
            'status' => 'PENDING',
            'clinical_notes' => $validated['clinical_notes'],
            'consent_proof' => $validated['consent_proof'],
        ]);

        return response()->json($referral, 201);
    }

    /**
     * Accept a referral and import patient data.
     */
    public function accept(Referral $referral)
    {
        // Safety check: ensure only the target tenant can accept
        if ($referral->target_tenant_id !== app('tenant')->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($referral->status !== 'PENDING') {
            return response()->json(['error' => 'Referral already processed'], 422);
        }

        return DB::transaction(function () use ($referral) {
            // 1. Get source patient data (bypassing global scope if needed, 
            // but Referral->patient relationship already has it via the bridge)
            $sourcePatient = $referral->patient;

            // 2. Import into target tenant (active tenant)
            $newPatient = Patient::create([
                'tenant_id' => app('tenant')->id,
                'first_name' => $sourcePatient->first_name,
                'last_name' => $sourcePatient->last_name,
                'dob' => $sourcePatient->dob,
                'gender' => $sourcePatient->gender,
                'contact' => $sourcePatient->contact,
                'patient_external_id' => 'REF-' . $referral->id, // Mark as referred
                'metadata' => array_merge($sourcePatient->metadata ?? [], [
                    'referred_from_tenant' => $referral->source_tenant_id,
                    'referral_id' => $referral->id
                ]),
            ]);

            // 3. Update Status
            $referral->update(['status' => 'ACCEPTED']);

            return response()->json([
                'message' => 'Referral accepted and patient imported',
                'patient' => $newPatient
            ]);
        });
    }

    public function show(Referral $referral)
    {
        return $referral->load(['patient', 'sourceTenant', 'targetTenant', 'referredBy']);
    }

    public function destroy(Referral $referral)
    {
        // Only source tenant can revoke/delete
        if ($referral->source_tenant_id !== app('tenant')->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $referral->delete();
        return response()->json(null, 204);
    }
}
