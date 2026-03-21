<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Order;
use App\Models\ClinicalNote;
use App\Models\ClinicalTemplate;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    /**
     * Pull changes since last sync.
     */
    public function pull(Request $request)
    {
        $lastSync = $request->query('last_sync_at', '1970-01-01 00:00:00');
        $tenantId = app('tenant')->id;

        return response()->json([
            'server_time' => now()->toDateTimeString(),
            'data' => [
                'patients' => Patient::where('updated_at', '>', $lastSync)->get(),
                'orders' => Order::where('updated_at', '>', $lastSync)->get(),
                'clinical_notes' => ClinicalNote::where('updated_at', '>', $lastSync)->get(),
                'clinical_templates' => ClinicalTemplate::where('updated_at', '>', $lastSync)->get(),
            ]
        ]);
    }

    /**
     * Push local changes to server.
     */
    public function push(Request $request)
    {
        $queue = $request->input('queue', []);
        $results = [];

        DB::beginTransaction();
        try {
            foreach ($queue as $item) {
                $method = strtoupper($item['method']);
                $url = $item['url'];
                $data = $item['data'];

                // Simple routing logic for sync queue
                // In a real app, we'd use internal request dispatching
                if ($method === 'POST' && str_contains($url, 'clinical-notes')) {
                    $note = ClinicalNote::create($data);
                    $results[] = ['id' => $item['id'], 'status' => 'success', 'server_id' => $note->id];
                } else if ($method === 'POST' && str_contains($url, 'patients')) {
                    $patient = Patient::create($data);
                    $results[] = ['id' => $item['id'], 'status' => 'success', 'server_id' => $patient->id];
                } else {
                    $results[] = ['id' => $item['id'], 'status' => 'skipped', 'message' => 'Method/URL not supported for sync yet'];
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Sync failed: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'results' => $results,
            'server_time' => now()->toDateTimeString()
        ]);
    }
}
