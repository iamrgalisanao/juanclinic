<?php

namespace App\Traits;

use App\Models\Scopes\BranchScope;
use Illuminate\Database\Eloquent\Model;

trait BelongsToBranch
{
    /**
     * The "boot" method of the trait.
     */
    protected static function bootBelongsToBranch()
    {
        static::addGlobalScope(new BranchScope);

        static::creating(function (Model $model) {
            if (app()->bound('branch')) {
                $model->branch_id = app('branch')->id;
            }
        });
    }
}
