<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        // Pastikan login DAN punya role admin
        if (Auth::check() && Auth::user()->role && Auth::user()->role->name === 'admin') {
            return $next($request);
        }

        return redirect('/login')->withErrors(['email' => 'Unauthorized access.']);
    }
}