<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use App\Traits\BelongsToBranch;
use App\Traits\AuditLogTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryStock extends Model
{
    use HasFactory, BelongsToTenant, BelongsToBranch, AuditLogTrait;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'inventory_item_id',
        'batch_number',
        'quantity',
        'expiry_date',
        'last_restocked_at',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'last_restocked_at' => 'datetime',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
