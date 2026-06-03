<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ArticleController extends Controller
{
    public function create()
    {
        return Inertia::render('Article/Create', [
            'categories' => Category::all(['id', 'name'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subheadline' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'thumbnail' => 'nullable|image|max:2048'
        ]);

        return redirect()->route('articles.index')->with('message', 'Article published successfully!');
    }

    public function index(Request $request)
    {
        $search = trim($request->input('search'));

        $categorySlug = $request->string('category')->trim();
        
        $query = Article::query()
            ->with(['category', 'user'])
            ->where('status', 'published');
            
        // Logika Pencarian
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%");
            });
        }   

        // Logika Filter Kategori
        if ($categorySlug->isNotEmpty()) {
            $query->whereHas('category', function($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }
        
        // Logika Filter Tanggal
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        $articles = $query->latest()->get();

        return Inertia::render('Article', [
            'articles'   => $articles,
            'categories' => Category::select('id', 'name', 'slug')->get(),
            'filters'    => [
                'search'   => $search,
                'category' => $categorySlug->isNotEmpty() ? $categorySlug->toString() : null, // Aman, selalu string/null
                'date'     => $request->input('date')
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