<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class DevAuthentication
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Security Guard: Only run in local development
        if (config('app.env') === 'local' && $request->hasHeader('X-Simulated-User')) {
            $identifier = $request->header('X-Simulated-User');

            $user = User::where('id', $identifier)
                ->orWhere('email', $identifier)
                ->first();

            if ($user) {
                // Force simulation for all guards
                Auth::setUser($user);
                Auth::guard('sanctum')->setUser($user);
                Auth::shouldUse('sanctum');

                // Bind user to request resolver
                $request->setUserResolver(fn() => $user);

                \Log::debug('DevAuth: Bypass successful for ' . $user->email);
            } else {
                \Log::warning('DevAuth: User not found for ' . $identifier);
            }
        }

        return $next($request);
    }
}
