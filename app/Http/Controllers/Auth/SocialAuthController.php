<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    // 1. Alihkan pengguna ke Google/Apple
    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    // 2. Ambil data dari Google/Apple setelah pengguna login
    public function handleProviderCallback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect('/register')->with('error', 'Authentication failed.');
        }

        // Cek apakah user dengan provider_id ini sudah ada, atau buat baru jika belum
        $user = User::firstOrCreate(
            [
                'email' => $socialUser->getEmail()
            ],
            [
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'provider_name' => $provider,
                'provider_id' => $socialUser->getId(),
                'password' => null // Tidak butuh password karena via OAuth
            ]
        );

        // Langsung loginkan pengguna ke aplikasi
        Auth::login($user, true);

        // Alihkan ke beranda utama
        return redirect('/');
    }
}