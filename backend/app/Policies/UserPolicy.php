<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can create other users (doctor/staff accounts).
     */
    public function create(User $user): bool
    {
        return $user->role === 'ADMIN';
    }

    /**
     * Determine whether the user can update other users.
     */
    public function update(User $user, User $target): bool
    {
        return $user->role === 'ADMIN';
    }

    /**
     * Determine whether the user can delete other users.
     */
    public function delete(User $user, User $target): bool
    {
        return $user->role === 'ADMIN';
    }
}
