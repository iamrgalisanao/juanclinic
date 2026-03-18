<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Amendment extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'auditable_type',
        'auditable_id',
        'original_value',
        'new_value',
        'reason',
        'actor_id',
    ];

    protected $casts = [
        'original_value' => 'array',
        'new_value' => 'array',
    ];

    public function auditable()
    {
        return $this->morphTo();
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
