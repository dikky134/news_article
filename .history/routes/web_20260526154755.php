<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\TrendingController;
use App\Http\Controllers\ArticleDetailController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialAuthController;
use Inertia\Inertia;

// ==========================================
// 1. RUTE OTENTIKASI & AKUN (GUEST / PUBLIC)
// ==========================================
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login'); 
    })->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout')
    ->middleware('auth');

// Rute OAuth Socialite
Route::get('/auth/{provider}', [SocialAuthController::class, 'redirectToProvider'])->name('social.redirect');
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);


// ==========================================
// 2. RUTE KHUSUS MANAGEMENT ADMIN (PROTECTED)
// ==========================================
// Semua rute pembuatan artikel disatukan di sini agar aman & rapi menggunakan URL berawalan /admin/...
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    // Menampilkan halaman form tulis artikel (Ditembak oleh route('articles.create'))
    Route::get('/articles/create', [ArticleController::class, 'create'])->name('articles.create');
    
    // Memproses penyimpanan artikel baru ke database
    Route::post('/articles', [ArticleController::class, 'store'])->name('articles.store');
});


// ==========================================
// 3. RUTE KONTEN UTAMA (PUBLIC)
// ==========================================
// Route untuk Home
Route::get('/', [HomeController::class, 'index'])->name('home');

// Route Listing Artikel (Halaman daftar berita)
Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');

// Route Trending
Route::get('/trending', [TrendingController::class, 'index'])->name('trending.index');

// Route About
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

// Route untuk Detail Artikel
Route::get('/articles/{slug}', [ArticleDetailController::class, 'show'])->name('articles.show');


// ==========================================
// 4. RUTE FITUR INTERAKTIF USER (AUTH ONLY)
// ==========================================
Route::middleware('auth')->group(function () {
    Route::post('/articles/{article}/comments', [CommentController::class, 'store'])->name('comments.store');
});