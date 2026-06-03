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
        dd([
            'Role_Yang_Diminta_Route' => $role,
            'Data_User_Merespon' => $request->user(),
            'Isi_Kolom_Role_Anda' => $request->user()->role
        ]);
        // 1. Pastikan user sudah login terlebih dahulu
        if (!$request->user()) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        $user = $request->user();
        $userRole = null;

        // 2. DETEKSI OTOMATIS: Apakah role berupa Objek Relasi atau String biasa?
        if (is_object($user->role)) {
            // Jika Anda menggunakan relasi model (misal punya tabel roles sendiri)
            // Cek properti 'slug' atau 'name' dari objek tersebut
            $userRole = $user->role->slug ?? $user->role->name ?? null;
        } else {
            // Jika Anda menyimpan string langsung di kolom 'role' pada tabel users
            $userRole = $user->role;
        }

        // 3. KOMPARASI AMAN: Ubah kedua sisi menjadi huruf kecil semua (case-insensitive)
        if (!$userRole || strtolower($userRole) !== strtolower($role)) {
            // Log untuk debugging (bisa Anda cek di storage/logs/laravel.log jika masih gagal)
            \Log::warning("Akses ditolak untuk user ID: {$user->id}. Memiliki role: " . json_encode($user->role) . " tetapi mencoba mengakses halaman dengan aturan: {$role}");

            // Tendang kembali ke halaman artikel dengan pesan error
            return redirect('/articles')->with('error', 'Anda tidak memiliki hak akses Admin.');
        }

        return $next($request);
    }
}
