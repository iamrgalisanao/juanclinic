<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VaccineSchedule extends Model
{
    protected $fillable = [
        'vaccine_name',
        'cvx_code',
        'dose_number',
        'recommended_age_weeks',
        'recommended_age_months',
        'source',
        'description',
    ];
}
