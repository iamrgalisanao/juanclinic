<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'notification_id',
        'tenant_id',
        'branch_id',
        'channel',
        'recipient',
        'status',
        'error_message',
        'provider_response',
    ];

    protected $casts = [
        'provider_response' => 'array',
    ];
}
