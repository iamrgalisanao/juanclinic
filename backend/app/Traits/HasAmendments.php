<?php

namespace App\Traits;

use App\Models\Amendment;
use Illuminate\Support\Facades\Auth;

trait HasAmendments
{
    /**
     * Record an amendment if clinical data is being updated.
     */
    public function recordAmendment(array $newValues, string $reason)
    {
        $originalValues = array_intersect_key($this->getOriginal(), $newValues);
        
        // Only record if values actually changed
        if ($originalValues === $newValues) {
            return $this;
        }

        Amendment::create([
            'tenant_id' => $this->tenant_id,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->id,
            'original_value' => $originalValues,
            'new_value' => $newValues,
            'reason' => $reason,
            'actor_id' => Auth::id(),
        ]);

        $this->update($newValues);

        return $this;
    }

    public function amendments()
    {
        return $this->morphMany(Amendment::class, 'auditable');
    }
}
