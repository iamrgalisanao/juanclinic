<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveBranch
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $branchId = $request->header('X-Branch-ID');

        if (!$branchId && $request->hasSession()) {
            $branchId = $request->session()->get('branch_id');
        }

        if ($branchId) {
            $query = \App\Models\Branch::where('id', $branchId);

            // Ensure the branch belongs to the resolved tenant if one exists
            if (app()->bound('tenant')) {
                $query->where('tenant_id', app('tenant')->id);
            }

            $branch = $query->first();

            if ($branch) {
                app()->instance('branch', $branch);

                if ($request->hasSession()) {
                    session(['branch_id' => $branchId]);
                }
            }
        }

        return $next($request);
    }
}
