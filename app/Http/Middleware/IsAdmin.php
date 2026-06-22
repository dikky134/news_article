<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IsAdmin
{
    /**
     * Menjalankan prosedur pemeriksaan validasi peran pengguna melalui pengecekan nama relasi.
     */
    public function handle(Request $request, Closure $next)
    {
        // Memeriksa autentikasi dan mencocokkan kepemilikan relasi penamaan 'admin'.
        if (Auth::check() && Auth::user()->role && Auth::user()->role->name === 'admin') {
            return $next($request);
        }

        return redirect('/login')->withErrors(['email' => 'Unauthorized access.']);
    }
}