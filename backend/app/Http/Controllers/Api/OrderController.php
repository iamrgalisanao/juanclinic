<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', \App\Models\Order::class);
        return \App\Models\Order::with('patient')->get();
    }

    /**
     * Specialized worklist for Technicians and Approvers.
     */
    public function worklist(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\Order::with('patient');

        if ($user->role === 'TECH') {
            $query->whereIn('status', ['PENDING', 'IN_PROGRESS']);
        } elseif ($user->role === 'DIAGNOSTIC_APPROVER') {
            $query->where('status', 'PRELIMINARY');
        } elseif ($user->role === 'ADMIN') {
            // Admin sees everything
        } else {
            return response()->json([], 200);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', \App\Models\Order::class);

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
        $order = \App\Models\Order::findOrFail($id);
        $this->authorize('view', $order);
        return $order->load(['performer', 'approver', 'patient']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $order = \App\Models\Order::findOrFail($id);

        // Authorize the specific update action
        $this->authorize('update', $order);

        $validated = $request->validate([
            'status' => 'sometimes|in:PENDING,IN_PROGRESS,PRELIMINARY,COMPLETED,CANCELLED',
            'result_data' => 'sometimes|array',
        ]);

        // Automatic Attribution logic for Electronic Sign-off
        if (isset($validated['status'])) {
            if ($validated['status'] === 'PRELIMINARY') {
                $validated['performed_by'] = $request->user()->id;
                $validated['performed_at'] = now();
            } elseif ($validated['status'] === 'COMPLETED') {
                $validated['approved_by'] = $request->user()->id;
                $validated['approved_at'] = now();
            }
        }

        $order->update($validated);

        return $order->load(['performer', 'approver']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
