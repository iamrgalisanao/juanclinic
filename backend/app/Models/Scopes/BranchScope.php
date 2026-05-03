<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class BranchScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $user = auth()->user();

        // 1. Global Admins (null tenant_id) bypass branch filtering for multi-tenant management
        if ($user && is_null($user->tenant_id)) {
            return;
        }

        // 2. Staff Roles (ADMIN, DOCTOR, FRONT_DESK) bypass branch filtering for Identity Models.
        // This ensures clinic staff can see all patients and providers in the tenant (clinic group).
        if ($user && in_array($user->role, ['ADMIN', 'FRONT_DESK', 'DOCTOR'])) {
            if ($model instanceof \App\Models\User || $model instanceof \App\Models\Patient) {
                return;
            }
        }

        // 3. Apply operational branch isolation for non-staff or other models
        if (app()->bound('branch')) {
            $builder->where(function ($query) use ($model) {
                $query->where($model->getTable() . '.branch_id', app('branch')->id)
                      ->orWhereNull($model->getTable() . '.branch_id');
            });
        }
    }
}
