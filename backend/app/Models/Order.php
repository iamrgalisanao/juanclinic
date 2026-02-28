<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToTenant;
use App\Traits\LogsClinicalActions;

class Order extends Model
{
    use HasFactory, BelongsToTenant, LogsClinicalActions;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'order_type',
        'request_details',
        'priority',
        'status',
    ];

    protected $casts = [
        'request_details' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
