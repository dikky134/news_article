<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Category;

class HandleInertiaRequests extends Middleware
{
    /**
     * Menetapkan file Blade yang akan memuat antarmuka pengguna berbasis React.
     */
    protected $rootView = 'app';

    /**
     * Menentukan versi kompilasi aset untuk manajemen cache peramban.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Membagikan kumpulan data dan variabel global yang dapat diakses oleh seluruh komponen di Frontend.
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            // Mendistribusikan data objek pengguna secara reaktif.
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role_id' => (int) $request->user()->role_id,
                    'role' => $request->user()->role ? $request->user()->role : null, 
                ] : null,
            ],

            // Mendistribusikan koleksi kategori artikel ke menu navigasi situs.
            'categories' => Category::select('id', 'name', 'slug')->get(),

            // Mendistribusikan data sesaat (flash session) guna memicu notifikasi visual.
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}