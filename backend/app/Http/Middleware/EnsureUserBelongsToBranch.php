<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserBelongsToBranch
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!app()->bound('branch')) {
            return $next($request);
        }

        $branch = app('branch');
        $user = $request->user();

        // Allow Tenant Admins and Global Admins to access all branches
        if (in_array($user->role, ['ADMIN', 'GLOBAL_ADMIN'])) {
            return $next($request);
        }

        if ($user->branch_id != $branch->id) {
            \Log::warning("Branch access denied: User ID {$user->id} (branch {$user->branch_id}) attempted to access Branch {$branch->id}");
            return response()->json(['message' => 'User does not belong to this branch.'], 403);
        }

        return $next($request);
    }
}
