<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

use Illuminate\Contracts\Queue\ShouldBeEncrypted;

abstract class JuanClinicNotification extends Notification implements ShouldQueue, ShouldBeEncrypted
{
    use Queueable;

    public $tenantId;
    public $branchId;

    /**
     * Create a new notification instance.
     */
    public function __construct(?int $tenantId = null, ?int $branchId = null)
    {
        $this->tenantId = $tenantId ?? (app()->bound('tenant') ? app('tenant')->id : null);
        $this->branchId = $branchId ?? (app()->bound('branch') ? app('branch')->id : null);
    }

    /**
     * Get the middleware the notification should be sent through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new \Illuminate\Queue\Middleware\RateLimited('notifications')];
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    abstract public function via(object $notifiable): array;

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            // Base notification data
        ];
    }
}
