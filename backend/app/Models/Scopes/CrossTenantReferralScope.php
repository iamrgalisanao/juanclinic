<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class CrossTenantReferralScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $tenantId = null;

        if (app()->bound('tenant')) {
            $tenantId = app('tenant')->id;
        }

        if ($tenantId) {
            $builder->where(function ($query) use ($tenantId) {
                $query->where('source_tenant_id', $tenantId)
                    ->orWhere('target_tenant_id', $tenantId);
            });
        }
    }
}
