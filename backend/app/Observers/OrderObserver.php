<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\HL7Generator;

class OrderObserver
{
    protected $generator;

    public function __construct(HL7Generator $generator)
    {
        $this->generator = $generator;
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Only trigger if status changed to COMPLETED or APPROVED
        if ($order->wasChanged('status') && in_array($order->status, ['COMPLETED', 'APPROVED'])) {
            $this->generator->generateORU($order);
        }
        
        // If it's a new order (ORM could also be used here, but for now we focus on Results)
    }
}
