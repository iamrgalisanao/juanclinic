<?php

namespace App\Services;

use App\Models\HL7Outbox;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MirthBridge
{
    /**
     * Send a pending HL7 message to the configured Mirth endpoint.
     */
    public function send($message)
    {
        if (!$message instanceof HL7Outbox) {
            Log::error("MirthBridge::send received invalid message type: " . gettype($message));
            return false;
        }

        $tenantId = $message->tenant_id;
        // In a real scenario, this would be fetched from tenant admin settings
        $endpoint = config('services.mirth.endpoint', 'http://mirth-gateway:8080/hl7');

        try {
            $response = Http::withHeaders([
                'X-Tenant-ID' => $tenantId,
                'Content-Type' => 'text/plain',
            ])->post($endpoint, $message->payload);

            if ($response->successful()) {
                $message->update([
                    'status' => 'SENT',
                    'processed_at' => now(),
                ]);
                return true;
            }

            throw new \Exception("Mirth returned status: " . $response->status());

        } catch (\Exception $e) {
            $message->increment('retry_count');
            $message->update([
                'status' => $message->retry_count >= 5 ? 'FAILED' : 'PENDING',
                'last_error' => $e->getMessage(),
            ]);
            
            Log::error("HL7 Send Failed for Tenant {$tenantId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Process all pending messages.
     */
    public function processOutbox()
    {
        $pending = HL7Outbox::pending()->take(50)->get();
        
        foreach ($pending as $message) {
            $this->send($message);
        }
    }
}
