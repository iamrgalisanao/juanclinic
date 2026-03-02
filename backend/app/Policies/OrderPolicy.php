<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Order $order): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR']);
    }

    /**
     * Determine whether the user can update the model (General).
     */
    public function update(User $user, Order $order): bool
    {
        // Cancel logic
        if (request()->has('status') && request()->input('status') === 'CANCELLED') {
            return in_array($user->role, ['ADMIN', 'DOCTOR']);
        }

        // Status transition logic
        if (request()->has('status')) {
            $newStatus = request()->input('status');

            if ($newStatus === 'IN_PROGRESS' || $newStatus === 'PRELIMINARY') {
                return in_array($user->role, ['ADMIN', 'TECH', 'DIAGNOSTIC_APPROVER']);
            }

            if ($newStatus === 'COMPLETED') {
                return in_array($user->role, ['ADMIN', 'DIAGNOSTIC_APPROVER']);
            }
        }

        return in_array($user->role, ['ADMIN']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Order $order): bool
    {
        return $user->role === 'ADMIN';
    }
}
