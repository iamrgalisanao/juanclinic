<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait;

    protected $fillable = [
        'tenant_id',
        'name',
        'sku',
        'category', // SUPPLY, REAGENT
        'unit', // PCS, BOX, KIT, ML
        'description',
        'min_stock_level',
    ];

    public function stocks()
    {
        return $this->hasMany(InventoryStock::class);
    }
}
