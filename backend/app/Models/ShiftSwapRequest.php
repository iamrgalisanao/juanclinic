<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use App\Traits\AuditLogTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftSwapRequest extends Model
{
    use HasFactory, BelongsToTenant, AuditLogTrait;

    protected $fillable = [
        'tenant_id',
        'requester_id',
        'requester_schedule_id',
        'receiver_id',
        'receiver_schedule_id',
        'status', // PENDING, APPROVED, REJECTED, CANCELLED
        'admin_approver_id',
        'notes',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function requesterSchedule()
    {
        return $this->belongsTo(StaffSchedule::class, 'requester_schedule_id');
    }

    public function receiverSchedule()
    {
        return $this->belongsTo(StaffSchedule::class, 'receiver_schedule_id');
    }
}
