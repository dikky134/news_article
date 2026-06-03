<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Pastikan user sudah login
        if (!$request->user()) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        $user = $request->user();

        if ($role === 'admin') {
            if ((int) $user->role_id !== 1) {
                return redirect('/articles')->with('error', 'Akses ditolak. Anda bukan Admin.');
            }
        } 
        elseif ($role === 'user') {
            if ((int) $user->role_id !== 2) {
                return redirect('/articles')->with('error', 'Akses terbatas.');
            }
        }

        return $next($request);
    }
}