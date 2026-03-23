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
    private $syncModels = [
        'patients' => \App\Models\Patient::class,
        'clinical_notes' => \App\Models\ClinicalNote::class,
        'orders' => \App\Models\Order::class,
        'prescriptions' => \App\Models\Prescription::class,
        'appointments' => \App\Models\Appointment::class,
    ];

    /**
     * Pull changes since last sync.
     */
    public function pull(Request $request)
    {
        $lastSync = $request->query('last_sync_at', '1970-01-01 00:00:00');

        $data = [];
        foreach ($this->syncModels as $key => $modelClass) {
            $data[$key] = $modelClass::where('updated_at', '>', $lastSync)->get();
        }

        return response()->json([
            'server_time' => now()->toDateTimeString(),
            'data' => $data
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
                $method = strtoupper($item['method'] ?? 'POST');
                $url = $item['url'] ?? '';
                $data = $item['data'] ?? [];
                $localId = $item['id'] ?? null;

                // Resolve model from URL
                $modelKey = $this->resolveModelKey($url);

                if (!$modelKey || !isset($this->syncModels[$modelKey])) {
                    $results[] = ['id' => $localId, 'status' => 'error', 'message' => "Unsupported sync path: $url"];
                    continue;
                }

                $modelClass = $this->syncModels[$modelKey];
                $serverRecord = null;

                // Conflict Detection & Resolution logic
                if (isset($data['id'])) {
                    $serverRecord = $modelClass::find($data['id']);
                }

                if ($method === 'DELETE' && $serverRecord) {
                    $serverRecord->delete();
                    $results[] = ['id' => $localId, 'status' => 'success', 'server_id' => $data['id']];
                    continue;
                }

                // If record exists and server version is newer than local skip (simplified conflict resolution)
                if ($serverRecord && isset($data['updated_at']) && $serverRecord->updated_at->gt($data['updated_at'])) {
                    $results[] = ['id' => $localId, 'status' => 'conflict', 'server_data' => $serverRecord];
                    continue;
                }

                // Perform update or create
                $record = $modelClass::updateOrCreate(['id' => $data['id'] ?? null], $data);
                $results[] = ['id' => $localId, 'status' => 'success', 'server_id' => $record->id];
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

    private function resolveModelKey($url)
    {
        foreach (array_keys($this->syncModels) as $key) {
            if (str_contains($url, $key))
                return $key;
        }
        return null;
    }
}
