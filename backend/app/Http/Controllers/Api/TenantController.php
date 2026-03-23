<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function index()
    {
        return \App\Models\Tenant::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:tenants,slug|max:255',
            'admin_settings' => 'nullable|array',
        ]);

        $tenant = \App\Models\Tenant::create($validated);
        return response()->json($tenant, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(\App\Models\Tenant $tenant)
    {
        return $tenant;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:tenants,slug,' . $tenant->id . '|max:255',
            'admin_settings' => 'nullable|array',
        ]);

        $tenant->update($validated);
        return response()->json($tenant);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Tenant $tenant)
    {
        // Safety check: Don't delete tenants with active branches easily?
        // For now, allow deletion but maybe warn in UI.
        $tenant->delete();
        return response()->json(null, 204);
    }
}
