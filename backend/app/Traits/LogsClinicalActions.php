<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait LogsClinicalActions
{
    public static function bootLogsClinicalActions()
    {
        static::created(function ($model) {
            self::logAction('CREATED', $model);
        });

        static::updated(function ($model) {
            self::logAction('UPDATED', $model);
        });

        static::deleted(function ($model) {
            self::logAction('DELETED', $model);
        });
    }

    protected static function logAction($action, $model)
    {
        AuditLog::create([
            'tenant_id' => $model->tenant_id ?? (app()->bound('tenant') ? app('tenant')->id : 0),
            'user_id' => Auth::id(),
            'action' => $action,
            'resource_type' => get_class($model),
            'resource_id' => $model->id,
            'payload' => $model->getDirty() ?: $model->toArray(),
            'ip_address' => request()->ip(),
        ]);
    }
}
