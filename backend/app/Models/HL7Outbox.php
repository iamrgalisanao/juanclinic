<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class HL7Outbox extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'hl7_outbox';

    protected $fillable = [
        'tenant_id',
        'message_type',
        'model_type',
        'model_id',
        'payload',
        'status',
        'retry_count',
        'last_error',
        'processed_at',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];

    /**
     * Scope for pending messages.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }

    /**
     * Associate with the source model.
     */
    public function model()
    {
        return $this->morphTo();
    }
}
