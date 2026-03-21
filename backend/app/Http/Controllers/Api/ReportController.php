<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function dashboard(Request $request)
    {
        $start = $request->query('start_date', now()->subDays(30)->toDateString());
        $end = $request->query('end_date', now()->toDateString());

        $totalPatients = \App\Models\Patient::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])->count();
        $totalOrders = \App\Models\Order::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])->count();
        $completedOrders = \App\Models\Order::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->where('status', 'COMPLETED')->count();
        $totalRevenue = \App\Models\Payment::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])->sum('amount');

        // Order completion rate
        $completionRate = $totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100, 1) : 0;

        // Admissions Trend
        $admissionsTrend = \App\Models\Patient::select(
            \Illuminate\Support\Facades\DB::raw('DATE(created_at) as date'),
            \Illuminate\Support\Facades\DB::raw('count(*) as count')
        )
            ->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Order Distribution
        $orderDistribution = \App\Models\Order::select(
            'order_type',
            \Illuminate\Support\Facades\DB::raw('count(*) as count')
        )
            ->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
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

    public function benchmarking(Request $request)
    {
        $start = $request->query('start_date', now()->subDays(30)->toDateString());
        $end = $request->query('end_date', now()->toDateString());

        // Group patients by branch
        $branchStats = \App\Models\Branch::select('id', 'name')
            ->withCount([
                'patients' => function ($query) use ($start, $end) {
                    $query->withoutGlobalScope(\App\Models\Scopes\BranchScope::class)
                        ->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
                }
            ])
            ->withCount([
                'orders' => function ($query) use ($start, $end) {
                    $query->withoutGlobalScope(\App\Models\Scopes\BranchScope::class)
                        ->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
                }
            ])
            ->get()
            ->map(function ($branch) use ($start, $end) {
                // Directly use branch_id on Payment model, bypassing branch scope
                $revenue = \App\Models\Payment::withoutGlobalScope(\App\Models\Scopes\BranchScope::class)
                    ->where('branch_id', $branch->id)
                    ->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
                    ->sum('amount');

                return [
                    'branch_id' => $branch->id,
                    'branch_name' => $branch->name,
                    'patient_count' => $branch->patients_count,
                    'order_count' => $branch->orders_count,
                    'revenue' => (float) $revenue,
                ];
            });

        return response()->json([
            'benchmarking' => $branchStats,
            'period' => ['start' => $start, 'end' => $end]
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
