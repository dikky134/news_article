<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basename(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // TAMBAHKAN BARIS INI UNTUK MENGATUR PENGALIHAN GUEST
        $middleware->redirectTo(
            guests: '/login',      // Jika belum login dan butuh auth, tendang ke /login
            users: '/articles'     // Jika SUDAH login tapi nekat akses /login, tendang ke /articles (atau halaman lain selain beranda)
        );
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();