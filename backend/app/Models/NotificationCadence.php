<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationCadence extends Model
{
    use HasFactory, BelongsToTenant;
    
    protected $table = 'clinical_notification_cadences';

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'category',
        'trigger_type',
        'days',
        'is_active',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'days' => 'integer',
    ];
}
