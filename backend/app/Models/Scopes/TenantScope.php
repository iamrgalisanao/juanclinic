<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return void
     */
    public function apply(Builder $builder, Model $model)
    {
        $tenantId = null;

        if (app()->bound('tenant')) {
            $tenantId = app('tenant')->id;
        } elseif (request()->hasSession() && session()->has('tenant_id')) {
            $tenantId = session('tenant_id');
        }

        if ($tenantId) {
            $builder->where('tenant_id', $tenantId);
        }
    }
}
