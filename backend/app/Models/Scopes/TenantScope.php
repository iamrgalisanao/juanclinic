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
        // HIS Multi-Tenant Context: Platform Administrators bypass isolation
        // to support tenant orchestration and impersonation.
        $user = auth()->user();
        if ($user && in_array($user->role, ['ADMIN', 'GLOBAL_ADMIN'])) {
            if (is_null($user->tenant_id) || (int) $user->tenant_id === \App\Models\Tenant::SYSTEM_ID) {
                return;
            }
        }

        $tenantId = null;

        if (app()->bound('tenant')) {
            $tenantId = app('tenant')->id;
        } elseif (request()->hasSession() && session()->has('tenant_id')) {
            $tenantId = session('tenant_id');
        }

        if ($tenantId) {
            $builder->where(function ($query) use ($tenantId) {
                $query->where('tenant_id', $tenantId)
                      ->orWhereNull('tenant_id')
                      // Allow System Root (888) entities to be visible across all contexts.
                      ->orWhere('tenant_id', \App\Models\Tenant::SYSTEM_ID);
            });
        }
    }
}
