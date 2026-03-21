<?php

namespace App\Policies;

use App\Models\ClinicalNote;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClinicalNotePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ClinicalNote $clinicalNote): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR']) && $user->tenant_id === $clinicalNote->tenant_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ClinicalNote $clinicalNote): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR']) && $user->tenant_id === $clinicalNote->tenant_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ClinicalNote $clinicalNote): bool
    {
        return $user->role === 'ADMIN' && $user->tenant_id === $clinicalNote->tenant_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ClinicalNote $clinicalNote): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ClinicalNote $clinicalNote): bool
    {
        return false;
    }
}
