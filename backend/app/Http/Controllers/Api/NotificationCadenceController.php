<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationCadence;
use Illuminate\Http\Request;

class NotificationCadenceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = NotificationCadence::query();

        // If no tenant context is bound (e.g. global admin), default to system tenant 888
        // to avoid showing duplicates across all tenants.
        if (!app()->bound('tenant')) {
            $query->where('tenant_id', 888);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        return $query->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|exists:physical_branches,id',
            'category' => 'required|string|in:APPOINTMENT,VACCINATION',
            'trigger_type' => 'required|string|in:BEFORE_DUE,ON_DUE,AFTER_DUE',
            'days' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $cadence = new NotificationCadence($validated);

        // Ensure tenant_id is set if the trait fallback failed (e.g. global admin context)
        if (!$cadence->tenant_id) {
            $cadence->tenant_id = app()->bound('tenant') 
                ? app('tenant')->id 
                : (\App\Models\Tenant::where('id', 888)->exists() ? 888 : \App\Models\Tenant::first()?->id);
        }

        $cadence->save();

        return $cadence;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, NotificationCadence $notificationCadence)
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        $notificationCadence->update($validated);

        return $notificationCadence;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NotificationCadence $notificationCadence)
    {
        $notificationCadence->delete();

        return response()->json(['message' => 'Cadence deleted successfully']);
    }
}
