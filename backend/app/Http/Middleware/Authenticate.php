<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Never redirect for API requests or if the login route is simply not defined
        if ($request->is('api/*') || ! \Route::has('login')) {
            return null;
        }

        return $request->expectsJson() ? null : route('login');
    }
}
