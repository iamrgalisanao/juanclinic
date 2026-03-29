<?php

namespace App\Listeners;

use App\Models\NotificationLog;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Notifications\Events\NotificationFailed;

class LogNotificationStatus
{
    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        $tenantId = null;
        $branchId = null;

        // Try to get tenant context from the notification object
        if (isset($event->notification->tenantId)) {
            $tenantId = $event->notification->tenantId;
            $branchId = $event->notification->branchId ?? null;
        }

        // Determine the recipient
        $recipient = $this->getRecipient($event);

        NotificationLog::create([
            'notification_id' => $event->notification->id,
            'tenant_id' => $tenantId,
            'branch_id' => $branchId,
            'channel' => $event->channel,
            'recipient' => $recipient,
            'status' => ($event instanceof NotificationSent) ? 'sent' : 'failed',
            'error_message' => ($event instanceof NotificationFailed) ? $this->getErrorMessage($event) : null,
            'provider_response' => $event->response,
        ]);
    }

    protected function getRecipient(object $event): string
    {
        $notifiable = $event->notifiable;

        if (method_exists($notifiable, 'routeNotificationFor')) {
            return $notifiable->routeNotificationFor($event->channel, $event->notification) ?: 'unknown';
        }

        return $notifiable->email ?? $notifiable->phone ?? 'unknown';
    }

    protected function getErrorMessage(NotificationFailed $event): ?string
    {
        if (isset($event->data['exception'])) {
            return $event->data['exception']->getMessage();
        }
        return 'Unknown provider error';
    }
}
