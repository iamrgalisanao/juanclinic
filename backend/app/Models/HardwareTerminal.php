<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Branch;

class HardwareTerminal extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $table = 'hardware_terminals';

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'terminal_id',
        'hardware_id',
        'min_number',
        'ptu_number',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function submissions()
    {
        return $this->hasMany(EMPI_Submission::class);
    }
}
