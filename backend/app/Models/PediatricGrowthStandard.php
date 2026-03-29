<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PediatricGrowthStandard extends Model
{
    protected $fillable = [
        'source',
        'gender',
        'metric',
        'age_months',
        'l',
        'm',
        's',
    ];

    protected $casts = [
        'l' => 'decimal:6',
        'm' => 'decimal:6',
        's' => 'decimal:6',
    ];
}
