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
// 1. OTENTIKASI GUEST & REGISTRASI
// ==========================================
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});

// Rute OAuth Socialite
Route::get('/auth/{provider}', [SocialAuthController::class, 'redirectToProvider'])->name('social.redirect');
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);


// ==========================================
// 2. OTENTIKASI USER TERDAFTAR (AUTH)
// ==========================================
Route::middleware('auth')->group(function () {
    // Proses Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    
    // Fitur Komentar User
    Route::post('/articles/{article}/comments', [CommentController::class, 'store'])->name('comments.store');
});


// ==========================================
// 3. FITUR KHUSUS ADMIN (Disesuaikan dengan MainLayout)
// ==========================================
Route::middleware(['auth', 'role:admin'])->group(function () {
    // SINKRONISASI TOMBOL DESKTOP: Menggunakan URL '/create' sesuai MainLayout.jsx baris desktop Anda
    Route::get('/create', [ArticleController::class, 'create'])->name('articles.create');
    
    // URL cadangan untuk tombol Mobile yang memanggil route('articles.create')
    Route::get('/articles/reate', [ArticleController::class, 'create']);
    
    // Proses penyimpanan artikel baru
    Route::post('/articles', [ArticleController::class, 'store']); // Untuk Publish ke tabel articles
    Route::post('/drafts', [ArticleController::class, 'storeDraft']); // Untuk Draf ke tabel drafts
});


// ==========================================
// 4. RUTE PUBLIK (BISA DIAKSES SIAPAPUN)
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

// Route untuk Detail Artikel & Simpan Komentar Publik
Route::get('/articles/{slug}', [ArticleDetailController::class, 'show'])->name('articles.show');
Route::post('/comments', [ArticleDetailController::class, 'storeComment'])->name('comments.store');