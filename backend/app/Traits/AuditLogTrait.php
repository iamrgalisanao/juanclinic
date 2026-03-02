<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait AuditLogTrait
{
    /**
     * Boot the trait and register Eloquent events.
     */
    public static function bootAuditLogTrait()
    {
        static::created(function ($model) {
            self::logEvent('created', $model);
        });

        static::updated(function ($model) {
            self::logEvent('updated', $model);
        });

        static::deleted(function ($model) {
            self::logEvent('deleted', $model);
        });
    }

    /**
     * Record the audit event.
     */
    protected static function logEvent($event, $model)
    {
        // For HIPAA/ISO 15189 compliance, we record both old and new states on update
        $oldValues = null;
        $newValues = $model->getAttributes();

        if ($event === 'updated') {
            $oldValues = array_intersect_key($model->getOriginal(), $model->getDirty());
            $newValues = $model->getDirty();
        } elseif ($event === 'deleted') {
            $oldValues = $model->getOriginal();
            $newValues = null;
        }

        AuditLog::create([
            'tenant_id' => $model->tenant_id ?? (app()->bound('tenant') ? app('tenant')->id : 0),
            'user_id' => Auth::id(),
            'event' => $event,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
