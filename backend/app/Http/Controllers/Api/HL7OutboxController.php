<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HL7Outbox;
use App\Services\MirthBridge;
use Illuminate\Http\Request;

class HL7OutboxController extends Controller
{
    protected $bridge;

    public function __construct(MirthBridge $bridge)
    {
        $this->bridge = $bridge;
    }

    /**
     * Display a listing of messages.
     */
    public function index(Request $request)
    {
        $messages = HL7Outbox::where('tenant_id', $request->header('X-Tenant-ID', 1))
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($messages);
    }

    /**
     * Retry a specific message.
     */
    public function retry(HL7Outbox $message)
    {
        $success = $this->bridge->send($message);
        
        if ($success) {
            return response()->json(['message' => 'Message sent successfully.']);
        }
        
        return response()->json(['message' => 'Failed to send message.', 'error' => $message->last_error], 500);
    }

    /**
     * Process all pending messages for the current tenant.
     */
    public function process(Request $request)
    {
        $this->bridge->processOutbox();
        return response()->json(['message' => 'Outbox processing triggered.']);
    }
}
