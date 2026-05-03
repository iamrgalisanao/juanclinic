<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AuditLogTrait;
use App\Traits\BelongsToTenant;

class DiagnosticResult extends Model
{
    use HasFactory, AuditLogTrait, BelongsToTenant;

    protected $fillable = [
        'order_id',
        'parameter_name',
        'value',
        'unit',
        'reference_range_min',
        'reference_range_max',
        'clinical_flag',
        'is_critical',
        'acknowledged_at',
        'acknowledged_by',
        'comments',
        'metadata',
    ];

    protected $casts = [
        'is_critical' => 'boolean',
        'acknowledged_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function acknowledgedBy()
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
