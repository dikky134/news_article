<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Mengatur distribusi hak akses pengguna berdasarkan parameter peran yang diterima.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Memeriksa status sesi pengguna saat ini.
        if (!$request->user()) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        $user = $request->user();

        // Mengkondisikan jalur rute apabila target parameter merujuk pada peran admin.
        if ($role === 'admin') {
            if (!in_array((int) $user->role_id, [1, 3])) {
                return redirect('/articles')->with('error', 'Akses ditolak. Anda bukan Admin.');
            }
        } 
        // Mengkondisikan jalur rute apabila target parameter merujuk pada peran pengguna biasa.
        elseif ($role === 'user') {
            if ((int) $user->role_id !== 2) {
                return redirect('/articles')->with('error', 'Akses terbatas.');
            }
        }
        // Mengkondisikan jalur rute apabila target parameter merujuk secara absolut pada super admin.
        elseif ($role === 'super_admin') {
            if ((int) $user->role_id !== 3) {
                return redirect('/articles')->with('error', 'Akses terbatas hanya untuk Super Admin.');
            }
        }

        return $next($request);
    }
}