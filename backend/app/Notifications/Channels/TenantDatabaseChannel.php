<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Channels\DatabaseChannel;
use Illuminate\Notifications\Notification;

class TenantDatabaseChannel extends DatabaseChannel
{
    /**
     * Build an array payload for the DatabaseNotification Model.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return array
     */
    protected function buildPayload($notifiable, Notification $notification)
    {
        $payload = parent::buildPayload($notifiable, $notification);

        // Encrypt the 'data' field to ensure PHI is never stored in cleartext at rest
        // Note: Laravel expects 'data' to be a string or array that it then JSON encodes.
        // We will JSON encode it ourselves and then encrypt the resulting string.
        $payload['data'] = encrypt($payload['data']);

        // Inject the tenant and branch context into the notification record
        return array_merge($payload, [
            'tenant_id' => $notification->tenantId ?? (app()->bound('tenant') ? app('tenant')->id : null),
            'branch_id' => $notification->branchId ?? (app()->bound('branch') ? app('branch')->id : null),
        ]);
    }
}
