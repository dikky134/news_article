<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleView;
use Inertia\Inertia;

class TrendingController extends Controller
{
    public function index()
    {
        $trendingArticles = \App\Models\Article::with(['category', 'user'])
            ->withCount('views', 'comments')
            ->where('status', 'published')
            ->orderBy('articles.views_count', 'desc')
            ->limit(7)
            ->get();
        
        $trendingArticles->transform(function ($article) {
            $wordCount = str_word_count(strip_tags($article->content));
            $minutes = ceil($wordCount / 200);
            $article->reading_time = ($minutes < 1 ? 1 : $minutes) . ' MIN READ';
            
            return $article;
        });

        // --- HITUNG STATISTIK REAL-TIME ---
    
        // 1. Total Pembaca (Berdasarkan total views di tabel article_views)
        $totalReaders = ArticleView::count();
        
        // Format ke ribuan (K) atau jutaan (M)
        $formattedReaders = $totalReaders >= 1000000 
            ? number_format($totalReaders / 1000000, 1) . 'M' 
            : ($totalReaders >= 1000 ? number_format($totalReaders / 1000, 1) . 'K' : $totalReaders);

        // 2. Rata-rata Waktu Baca (Mengambil rata-rata dari semua konten artikel)
        $allArticles = Article::select('content')->get();
        $totalMinutes = $allArticles->sum(function($article) {
            $words = str_word_count(strip_tags($article->content));
            return ceil($words / 200);
        });
        $avgReadTime = $allArticles->count() > 0 ? round($totalMinutes / $allArticles->count(), 1) : 0;

        // 3. Jumlah Negara atau Kategori (Misal kita pakai jumlah kategori yang aktif)
        $countriesCount = \App\Models\Category::count();

        return Inertia::render('Trending', [
            'trendingArticles' => $trendingArticles,
            'stats' => [
                'readers' => $formattedReaders,
                'avgTime' => $avgReadTime . 'm',
                'countries' => $countriesCount,
                'accuracy' => '99.9%' // Ini bisa tetap statis sebagai branding
            ]
        ]);
    }
}