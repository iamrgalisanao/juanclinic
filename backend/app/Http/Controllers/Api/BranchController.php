<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index()
    {
        // 1. Explicit Tenant Header / Context
        if (app()->bound('tenant')) {
            return \App\Models\Branch::where('tenant_id', app('tenant')->id)->get();
        }

        // 2. Global Admin Fallback (Role ADMIN/GLOBAL_ADMIN with no specific tenant assignment)
        if (auth()->user() && in_array(auth()->user()->role, ['ADMIN', 'GLOBAL_ADMIN']) && is_null(auth()->user()->tenant_id)) {
            return \App\Models\Branch::all();
        }

        // 3. Clinic Admin Fallback (Role ADMIN with an assigned tenant)
        if (auth()->user()?->role === 'ADMIN' && auth()->user()->tenant_id) {
            return \App\Models\Branch::where('tenant_id', auth()->user()->tenant_id)->get();
        }

        return response()->json(['message' => 'Tenant context missing.'], 403);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
            'tenant_id' => 'nullable|exists:tenants,id'
        ]);

        $tenantId = $validated['tenant_id'] ?? (app()->bound('tenant') ? app('tenant')->id : null);

        if (!$tenantId) {
            return response()->json([
                'message' => 'The tenant_id field is required when no tenant context is provided.',
                'errors' => ['tenant_id' => ['Tenant identification required.']]
            ], 422);
        }

        $branch = \App\Models\Branch::create(array_merge($validated, [
            'tenant_id' => $tenantId
        ]));

        return response()->json($branch, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(\App\Models\Branch $branch)
    {
        return $branch;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean'
        ]);

        $branch->update($validated);

        return response()->json($branch);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Branch $branch)
    {
        $branch->delete();
        return response()->json(null, 204);
    }
}
