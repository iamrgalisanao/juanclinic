<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffSchedule;
use Illuminate\Http\Request;

class StaffScheduleController extends Controller
{
    /**
     * List all schedules with branch and user details.
     */
    public function index(Request $request)
    {
        $query = StaffSchedule::with(['user', 'branch']);

        if ($request->has('date')) {
            $query->where('shift_date', $request->date);
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        return $query->orderBy('shift_date')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Store a new shift with conflict detection.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'branch_id' => 'required|exists:branches,id',
            'shift_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'notes' => 'nullable|string',
        ]);

        // CROSS-BRANCH CONFLICT DETECTION
        // Check if the user is already scheduled in ANY branch during this time.
        $exists = StaffSchedule::where('user_id', $validated['user_id'])
            ->where('shift_date', $validated['shift_date'])
            ->where(function ($query) use ($validated) {
                $query->where(function ($q) use ($validated) {
                    $q->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
                });
            })
            ->first();

        if ($exists) {
            $branchName = $exists->branch->name ?? "another branch";
            return response()->json([
                'message' => "Conflict: Staff member is already scheduled at {$branchName} during this time.",
                'conflict' => $exists
            ], 422);
        }

        $schedule = StaffSchedule::create([
            'tenant_id' => auth()->user()->tenant_id,
            ...$validated,
            'is_active' => true
        ]);

        return response()->json([
            'message' => 'Shift scheduled successfully.',
            'schedule' => $schedule
        ]);
    }

    /**
     * Remove/Cancel a shift.
     */
    public function destroy(StaffSchedule $schedule)
    {
        $schedule->delete();
        return response()->json(['message' => 'Shift cancelled successfully.']);
    }
}
