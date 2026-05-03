<?php

namespace App\Policies;

use App\Models\Prescription;
use App\Models\User;

class PrescriptionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admins, Doctors, Techs (Pharmacy), and Front Desk can view prescriptions
        return in_array($user->role, ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Prescription $prescription): bool
    {
        return in_array($user->role, ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only Doctors and Admins can prescribe
        return in_array($user->role, ['ADMIN', 'DOCTOR']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Prescription $prescription): bool
    {
        // Only Doctors and Admins can update/amend prescriptions
        return in_array($user->role, ['ADMIN', 'DOCTOR']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Prescription $prescription): bool
    {
        return $user->role === 'ADMIN';
    }
}
