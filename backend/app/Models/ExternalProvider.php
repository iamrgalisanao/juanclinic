<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExternalProvider extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'full_name',
        'slug',
        'specialty',
        'sub_specialty',
        'clinic_name',
        'clinic_address',
        'province_name',
        'clinic_contacts',
        'hmos',
        'prc_no',
        'email',
        'avatar_url',
    ];

    protected $casts = [
        'clinic_contacts' => 'array',
        'hmos' => 'array',
    ];
}
