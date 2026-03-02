<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR', 'FRONT_DESK', 'DIAGNOSTIC_APPROVER', 'TECH']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Patient $patient): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR', 'FRONT_DESK', 'DIAGNOSTIC_APPROVER', 'TECH']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR', 'FRONT_DESK']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Patient $patient): bool
    {
        // Simple demographic update check
        return in_array($user->role, ['ADMIN', 'DOCTOR', 'FRONT_DESK']);
    }

    /**
     * Determine whether the user can view sensitive clinical notes.
     * Note: This is an example of a fine-grained permission.
     */
    public function viewClinical(User $user, Patient $patient): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Patient $patient): bool
    {
        return $user->role === 'ADMIN';
    }
}
