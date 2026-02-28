<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'patient_external_id',
        'first_name',
        'last_name',
        'dob',
        'gender',
        'contact',
        'metadata'
    ];

    protected $casts = [
        'dob' => 'date',
        'metadata' => 'array',
    ];
}
