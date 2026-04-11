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

    public function getClinicalOutcomes(Request $request)
    {
        $start = $request->query('start_date', now()->subDays(30)->toDateString());
        $end = $request->query('end_date', now()->toDateString());
        $branchId = $request->query('branch_id');

        $queryBase = function ($model) use ($start, $end, $branchId) {
            $q = $model::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
            if ($branchId) $q->where('branch_id', $branchId);
            return $q;
        };

        // 1. Demographics (Gender)
        $genderDistribution = $queryBase(new \App\Models\Patient())
            ->select('gender', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->groupBy('gender')
            ->get();

        // 2. Demographics (Age Groups - Simplified calculation)
        $patients = $queryBase(new \App\Models\Patient())->get();
        $ageGroups = [
            'Neonatal (<1m)' => 0,
            'Pediatric (1m-17y)' => 0,
            'Adult (18y-59y)' => 0,
            'Senior (60y+)' => 0,
        ];

        foreach ($patients as $p) {
            $age = $p->dob->age;
            $months = $p->dob->diffInMonths(now());
            
            if ($months < 1) $ageGroups['Neonatal (<1m)']++;
            elseif ($age < 18) $ageGroups['Pediatric (1m-17y)']++;
            elseif ($age < 60) $ageGroups['Adult (18y-59y)']++;
            else $ageGroups['Senior (60y+)']++;
        }

        // 3. Diagnostic TAT (Turnaround Time in Hours)
        $tatStats = \App\Models\Order::whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59'])
            ->where('status', 'COMPLETED')
            ->select('order_type', \Illuminate\Support\Facades\DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_tat'))
            ->groupBy('order_type')
            ->get();

        // 4. Appointment Show/No-Show Rates
        $appointments = $queryBase(new \App\Models\Appointment())
            ->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // 5. Common Diagnoses (Keywords from Clinical Notes)
        // Note: In high-vol prod, this would be indexed or handled by an Elastic/AI layer.
        $recentNotes = $queryBase(new \App\Models\ClinicalNote())
            ->where('status', 'SIGNED')
            ->get();
        
        $diagnoses = [];
        foreach ($recentNotes as $note) {
            $content = $note->content;
            $diag = $content['diagnosis'] ?? $content['assessment'] ?? null;
            if ($diag) {
                // Simplified prevalence extractor
                $key = strtoupper(trim(strtok($diag, " ,.;\n"))); 
                if ($key && strlen($key) > 3) {
                    $diagnoses[$key] = ($diagnoses[$key] ?? 0) + 1;
                }
            }
        }
        arsort($diagnoses);
        $topDiagnoses = array_slice($diagnoses, 0, 5, true);

        return response()->json([
            'demographics' => [
                'gender' => $genderDistribution,
                'age_groups' => $ageGroups,
            ],
            'efficiency' => [
                'avg_tat' => $tatStats,
            ],
            'reliability' => [
                'appointments' => $appointments,
            ],
            'prevalence' => [
                'top_diagnoses' => $topDiagnoses,
            ]
        ]);
    }
}
