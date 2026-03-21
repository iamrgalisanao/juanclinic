<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function dashboard()
    {
        $totalPatients = \App\Models\Patient::count();
        $totalOrders = \App\Models\Order::count();
        $completedOrders = \App\Models\Order::where('status', 'COMPLETED')->count();
        $totalRevenue = \App\Models\Payment::sum('amount');

        // Order completion rate
        $completionRate = $totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100, 1) : 0;

        // Admissions Trend (Last 7 days)
        $admissionsTrend = \App\Models\Patient::select(
            \Illuminate\Support\Facades\DB::raw('DATE(created_at) as date'),
            \Illuminate\Support\Facades\DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Order Distribution
        $orderDistribution = \App\Models\Order::select(
            'order_type',
            \Illuminate\Support\Facades\DB::raw('count(*) as count')
        )
            ->groupBy('order_type')
            ->get();

        return response()->json([
            'stats' => [
                'total_patients' => $totalPatients,
                'total_orders' => $totalOrders,
                'completion_rate' => $completionRate,
                'total_revenue' => $totalRevenue,
            ],
            'trends' => [
                'admissions' => $admissionsTrend,
            ],
            'distribution' => [
                'orders' => $orderDistribution,
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
