<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\ExternalProvider;
use App\Models\Referral;
use Illuminate\Support\Facades\Auth;

class ExternalProviderController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q');
        
        $providers = ExternalProvider::where('full_name', 'like', "%{$query}%")
            ->orWhere('specialty', 'like', "%{$query}%")
            ->orWhere('sub_specialty', 'like', "%{$query}%")
            ->orWhere('clinic_name', 'like', "%{$query}%")
            ->limit(20)
            ->get();
            
        return response()->json($providers);
    }

    public function refer(Request $request)
    {
        $request->validate([
            'patient_id' => 'required',
            'external_provider_id' => 'required|exists:external_providers,id',
            'clinical_notes' => 'nullable|string',
            'consent_proof' => 'required|string',
            'prc_no' => 'nullable|string', // Enrichment
            'email' => 'nullable|email',   // Enrichment
        ]);

        $provider = ExternalProvider::findOrFail($request->external_provider_id);
        
        // Enrichment if data was provided in the form but missing in DB
        if ($request->prc_no && !$provider->prc_no) {
            $provider->update(['prc_no' => $request->prc_no]);
        }
        if ($request->email && !$provider->email) {
            $provider->update(['email' => $request->email]);
        }

        $referral = Referral::create([
            'patient_id' => $request->patient_id,
            'source_tenant_id' => Auth::user()->tenant_id,
            'external_provider_id' => $request->external_provider_id,
            'type' => 'EXTERNAL',
            'referred_by_user_id' => Auth::id(),
            'status' => 'PENDING',
            'clinical_notes' => $request->clinical_notes,
            'consent_proof' => $request->consent_proof,
        ]);

        return response()->json([
            'message' => 'Referral created successfully',
            'referral' => $referral
        ]);
    }
}
