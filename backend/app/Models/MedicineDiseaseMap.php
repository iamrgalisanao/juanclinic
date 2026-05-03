<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\AuditLogTrait;

class MedicineDiseaseMap extends Model
{
    use HasFactory, AuditLogTrait;

    protected $table = 'medicine_disease_map';

    protected $fillable = [
        'disease_id',
        'medicine_id',
        'source',
        'is_system',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_system' => 'boolean',
    ];

    public function disease()
    {
        return $this->belongsTo(Disease::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
