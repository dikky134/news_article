<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Pastikan user sudah login
        if (!$request->user()) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        // 2. Ambil objek User dan objek Role relasinya
        $user = $request->user();
        
        // Ambil nama/slug dari objek role. 
        // Ubah 'slug' atau 'name' di bawah ini sesuai dengan nama kolom teks di tabel roles Anda (misal: 'admin')
        $userRoleName = $users->rolea->slug ?? $users->roles->name ?? null;

        // 3. Bandingkan dengan string 'admin' dari Route (Gunakan strtolower agar aman dari Caps Lock)
        if (!$userRoleName || strtolower($userRoleName) !== strtolower($role)) {
            return redirect('/articles')->with('error', 'Anda tidak memiliki hak akses Admin.');
        }

        return $next($request);
    }
}
