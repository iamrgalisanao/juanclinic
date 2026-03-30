<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicineLot extends Model
{
    protected $fillable = [
        'medicine_id',
        'lot_number',
        'manufacturer',
        'vis_edition_date',
        'cvx_code',
        'expiry_date',
        'stock'
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
