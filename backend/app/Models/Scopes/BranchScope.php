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
        // Global Admins (null tenant_id) bypass branch filtering for multi-tenant management
        if (auth()->check() && is_null(auth()->user()->tenant_id)) {
            return;
        }

        if (app()->bound('branch')) {
            $builder->where(function ($query) use ($model) {
                $query->where($model->getTable() . '.branch_id', app('branch')->id)
                      ->orWhereNull($model->getTable() . '.branch_id');
            });
        }
    }
}
