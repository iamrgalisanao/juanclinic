<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Platform Admins (Root/System) see all organizations
        $isGlobalAdmin = in_array($user->role, ['ADMIN', 'GLOBAL_ADMIN']);
        $isSystemTenant = is_null($user->tenant_id) || (int) $user->tenant_id === \App\Models\Tenant::SYSTEM_ID;

        if ($isGlobalAdmin && $isSystemTenant) {
            return \App\Models\Tenant::withCount('branches')->get();
        }

        // Clinic Admins only see their own organization
        if ($user->tenant_id) {
            return \App\Models\Tenant::where('id', $user->tenant_id)->withCount('branches')->get();
        }

        return \App\Models\Tenant::withCount('branches')->get();
    }

    public function store(Request $request)
    {
        // Handle FormData JSON strings
        if (is_string($request->admin_settings)) {
            $request->merge([
                'admin_settings' => json_decode($request->admin_settings, true)
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:tenants,slug|max:255',
            'official_address' => 'nullable|string',
            'contact_number' => 'nullable|string|max:50',
            'tin' => 'nullable|string|max:50',
            'admin_settings' => 'nullable|array',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_path'] = $path;
        }

        $tenant = \App\Models\Tenant::create($validated);
        return response()->json($tenant, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, \App\Models\Tenant $tenant)
    {
        $user = $request->user();
        if (!$this->isSuperAdmin($user) && (int) $user->tenant_id !== (int) $tenant->id) {
            abort(403, 'You are not allowed to view this organization.');
        }

        return $tenant;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\Tenant $tenant)
    {
        $user = $request->user();
        
        // 1. Ownership Guard
        if (!$this->isSuperAdmin($user) && (int) $user->tenant_id !== (int) $tenant->id) {
            abort(403, 'You are not allowed to update another organization.');
        }

        // Handle FormData JSON strings
        if (is_string($request->admin_settings)) {
            $request->merge([
                'admin_settings' => json_decode($request->admin_settings, true)
            ]);
        }

        $isSuper = $this->isSuperAdmin($user);

        // 2. Dynamic Validation & Field-Level Protection
        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:tenants,slug,' . $tenant->id . '|max:255',
            'official_address' => 'nullable|string',
            'contact_number' => 'nullable|string|max:50',
            'tin' => 'nullable|string|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
        ];

        // Only Super Admins can touch admin_settings or commercial fields via this endpoint
        // (Though commercial plans have their own controller, we harden here too)
        if ($isSuper) {
            $rules['admin_settings'] = 'nullable|array';
            $rules['plan_tier'] = 'nullable|string';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('logo')) {
            // Delete old logo if it exists
            if ($tenant->logo_path) {
                \Storage::disk('public')->delete($tenant->logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_path'] = $path;
        }

        $tenant->update($validated);
        return response()->json($tenant);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, \App\Models\Tenant $tenant)
    {
        if (!$this->isSuperAdmin($request->user())) {
            abort(403, 'Only Super Admins can delete organizations.');
        }

        $tenant->delete();
        return response()->json(null, 204);
    }

    public function listTenants()
    {
        \Log::info("Global Admin requested all tenants list.");
        return Tenant::withCount('branches')->get();
    }

    /**
     * Helper to determine if user is a Master/Super Admin.
     */
    private function isSuperAdmin($user): bool
    {
        if (!$user) return false;
        
        return (is_null($user->tenant_id) || (int) $user->tenant_id === \App\Models\Tenant::SYSTEM_ID) 
            && in_array($user->role, ['ADMIN', 'GLOBAL_ADMIN']);
    }
}
