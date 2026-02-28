<?php

namespace App\Traits;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;

trait BelongsToTenant
{
    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function (Model $model) {
            $tenantId = null;

            if (app()->bound('tenant')) {
                $tenantId = app('tenant')->id;
            } elseif (request()->hasSession() && session()->has('tenant_id')) {
                $tenantId = session('tenant_id');
            }

            if ($tenantId) {
                $model->tenant_id = $tenantId;
            }
        });
    }
}
