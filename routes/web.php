<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\TrendingController;
use App\Http\Controllers\ArticleDetailController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\AdminUserController;
use Inertia\Inertia;

// ==========================================
// 1. OTENTIKASI GUEST & REGISTRASI
// ==========================================
// Membatasi akses perlintasan menuju halaman pendaftaran akun spesifik pada entitas pengunjung tamu anonim.
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});

// Menyelaraskan sirkulasi penarikan izin pihak penyedia log masuk luar kendali web.
Route::get('/auth/{provider}', [SocialAuthController::class, 'redirectToProvider'])->name('social.redirect');
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);


// ==========================================
// 2. OTENTIKASI USER TERDAFTAR (AUTH)
// ==========================================
// Mendaulat fungsi pembuangan memori riwayat sesi maupun fungsional pengiriman komentar bagi individu pengguna valid.
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::post('/articles/{article}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::post('/comments/{comment}/reply', [CommentController::class, 'reply'])->name('comments.reply');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    Route::get('/suggestions/create', function() { 
        return 'Halaman Form Buat Saran (Under Construction)'; 
    })->name('suggestions.create');
});


// ==========================================
// 3. FITUR KHUSUS ADMIN (Tulis/Edit Artikel)
// ==========================================
// Merencanakan penyortiran gerbang menuju pusat kendali media di mana otorisasi admin diperlukan.
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/create', [ArticleController::class, 'create'])->name('articles.create');
    Route::post('/articles', [ArticleController::class, 'store'])->name('articles.store');
    Route::post('/api/articles/auto-save', [ArticleController::class, 'autoSave'])->name('articles.auto-save');
    Route::get('/articles/{article}/edit', [ArticleController::class, 'edit'])->name('articles.edit');
    Route::post('/articles/{article}', [ArticleController::class, 'update'])->name('articles.update');
    Route::delete('/articles/{id}', [ArticleController::class, 'destroy'])->name('articles.destroy');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
});


// ==========================================
// 4. RUTE PUBLIK (BISA DIAKSES SIAPAPUN)
// ==========================================
// Menerjemahkan sirkuit pemaparan seluruh laman konsumsi penelusuran massa.
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
Route::get('/trending', [TrendingController::class, 'index'])->name('trending.index');
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');
Route::get('/articles/{slug}', [ArticleDetailController::class, 'show'])->name('articles.show');
Route::post('/comments', [ArticleDetailController::class, 'storeComment'])->name('comments.store');
Route::get('/api/articles/search', [ArticleController::class, 'search'])->name('articles.search');


// ==========================================
// 5. FITUR KHUSUS SUPER ADMIN
// ==========================================
// Memasilitasi lalu lintas data operasional mutlak mencakup pembuatan, perombakan, dan peniadaan subjek dari dewan pengawas.
Route::middleware(['auth', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    // Fungsi melihat pengguna
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    // Fungsi menambah pengguna
    Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
    // Fungsi memperbarui profil pengguna
    Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    // Fungsi menghapus profil pengguna
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    
    Route::get('/suggestions', function() { 
        return 'Halaman Inbox Saran (Under Construction)'; 
    })->name('suggestions.index');
});