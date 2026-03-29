<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\BelongsToBranch;

class NotificationSetting extends Model
{
    use BelongsToTenant, BelongsToBranch;

    protected $table = 'tenant_notification_settings';

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'channel',
        'provider',
        'config',
        'is_active',
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
    ];
}
