<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return \App\Models\Order::with('patient')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'order_type' => 'required|in:LAB,RAD',
            'request_details' => 'nullable|array',
            'priority' => 'required|in:ROUTINE,STAT',
        ]);

        return \App\Models\Order::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $order = \App\Models\Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:PENDING,IN_PROGRESS,COMPLETED,CANCELLED',
        ]);

        $order->update($validated);

        // Audit Log for status change
        \App\Models\AuditLog::create([
            'tenant_id' => $order->tenant_id,
            'action' => 'ORDER_STATUS_UPDATE',
            'resource_type' => 'Order',
            'resource_id' => $order->id,
            'payload' => ['new_status' => $validated['status']],
        ]);

        return $order;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
