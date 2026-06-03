<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search'));

        // Gunakan query builder agar bisa difilter secara dinamis
        $query = Article::query()
            ->with(['category', 'user'])
            ->where('status', 'published');
            
        // Search    
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%");
            });
        }   

        // Filter Kategori (berdasarkan slug)
        if ($request->filled('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }
        
        // Filter Tanggal
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        $articles = $query->latest()->get();

        return Inertia::render('Article', [
            'articles'   => $articles,
            'categories' => \App\Models\Category::all(),
            'filters'    => [
                'search'   => $search,
                'category' => $request->category,
                'date'     => $request->input('date') // Mengembalikan string tanggal tunggal ke React
            ],
        ]);
    }

    public function show($slug)
    {
        $article = Article::where('slug', $slug)
            ->where('status', 'published')
            ->with(['category', 'user'])
            ->firstOrFail();

        // Mencatat View
        DB::table('article_views')->insert([
            'article_id' => $article->id,
            'user_id'    => auth()->id(),
            'ip_address' => request()->ip(),
            'created_at' => now(), 
        ]);

        $relatedArticles = Article::where('category_id', $article->category_id)
            ->where('id', '!=', $article->id)
            ->where('status', 'published')
            ->latest()
            ->take(2)
            ->get();

        return Inertia::render('ArticleDetail', [
            'article' => $article,
            'relatedArticles' => $relatedArticles
        ]);
    }
}