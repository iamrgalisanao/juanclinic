<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use App\Traits\HasAmendments;

class Payment extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait, HasAmendments;

    protected $fillable = [
        'tenant_id',
        'invoice_id',
        'amount',
        'payment_method', // CASH, CARD, INSURANCE
        'transaction_id',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
