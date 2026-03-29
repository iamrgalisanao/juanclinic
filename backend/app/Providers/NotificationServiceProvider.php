<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class NotificationServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Notifications\Events\NotificationSent::class,
            \App\Listeners\LogNotificationStatus::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Notifications\Events\NotificationFailed::class,
            \App\Listeners\LogNotificationStatus::class
        );

        \Illuminate\Support\Facades\RateLimiter::for('notifications', function (object $job) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(100)->by($job->tenantId ?? 'default');
        });
    }
}
