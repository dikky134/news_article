<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Draft;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ArticleController extends Controller
{
    public function create()
    {
        return Inertia::render('Create', [
            'categories' => Category::all(['id', 'name'])
        ]);
    }

    Public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'category_id' => 'required',
            'thumbnail'   => 'nullable|image|max:2048',
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        Article::create([
            'user_id'      => auth()->id() ?? 1,
            'category_id'  => $request->category_id,
            'title'        => $request->title,
            'slug'         => Str::slug($request->title) . '-' . Str::random(5),
            'excerpt'      => Str::limit(strip_tags($request->subheadline ?? $request->content), 150),
            'content'      => $request->content,
            'thumbnail'    => $thumbnailPath,
            'status'       => 'published',
            'published_at' => now(),
            'views_count'  => 0,
        ]);

        Return redirect()->back();
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
                'category' => $categorySlug->isNotEmpty() ? $categorySlug->toString() : null,
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

    Public function storeDraft(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'category_id' => 'required',
            'thumbnail'   => 'nullable',
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        Draft::create([
            'user_id'             => auth()->id() ?? 1,
            'category_id'         => $request->category_id,
            'title'               => $request->title,
            'subheadline'         => $request->subheadline,
            'content'             => $request->content,
            'thumbnail'           => $thumbnailPath,
            'allow_comments'      => $request->allow_comments ? 1 : 0,
            'feature_on_homepage' => $request->feature_on_homepage ? 1 : 0,
            'tags'                => $request->tags, // Otomatis ter-cast menjadi JSON oleh Model Draft
        ]);

        Return redirect()->back();
    }
}