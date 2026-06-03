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

// Semua orang bisa login
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

// Route Khusus Admin (Gunakan middleware admin di sini)
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/articles/create', [ArticleController::class, 'create'])->name('articles.create');
    Route::post('/articles/store', [ArticleController::class, 'store'])->name('articles.store');
});

// Rute OAuth Socialite
Route::get('/auth/{provider}', [SocialAuthController::class, 'redirectToProvider'])->name('social.redirect');
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

// Route untuk Komentar (Semua yang sudah login bisa)
Route::post('/articles/{article}/comments', [CommentController::class, 'store'])
    ->name('comments.store')
    ->middleware('auth');
    
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout') // <--- Bagian ini wajib ada
    ->middleware('auth');
    
// Rute untuk menampilkan halaman form buat akun
Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');

// Rute untuk memproses data data masuk (POST) ke database
Route::post('/register', [RegisteredUserController::class, 'store']);

Route::get('/', function () {
    return Inertia::render('Home'); 
})->name('dashboard');

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

// Route untuk Detail Artikel & Simpan Komentar
Route::get('/articles/{slug}', [ArticleDetailController::class, 'show'])->name('articles.show');
Route::post('/comments', [ArticleDetailController::class, 'storeComment'])->name('comments.store');

// Grouping Route khusus Manajemen Artikel Admin
Route::prefix('admin')->group(function () {
    // Route untuk menampilkan halaman input form
    Route::get('/articles/create', [ArticleController::class, 'create'])->name('articles.create');
    
    // Route untuk mengeksekusi penyimpanan data input dari Inertia form submission
    Route::post('/admin/articles', [ArticleController::class, 'store'])->name('articles.store');
});