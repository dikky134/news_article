<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    public function create()
    {
        $drafts = Article::with(['category'])
            ->where('status', 'draft')
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('Create', [
            'categories' => Category::all(['id', 'name']),
            'drafts' => $drafts 
        ]);
    }

    public function store(Request $request)
    {
        $isDraft = filter_var($request->is_draft, FILTER_VALIDATE_BOOLEAN);
        $statusArtikel = $isDraft ? 'draft' : 'published';

        $rules = [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:articles,slug|max:255',
            'category_id' => 'required|exists:categories,id',
            'excerpt' => 'nullable|string',
            'allow_comments' => 'required|boolean',
            'feature_on_homepage' => 'required|boolean',
        ];

        if ($statusArtikel === 'published') {
            $rules['content'] = 'required|string';
            $rules['thumbnail'] = 'required|image|mimes:jpeg,png,jpg,webp|max:2048';
        } else {
            $rules['content'] = 'nullable|string';
            $rules['thumbnail'] = 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048';
        }

        $validated = $request->validate($rules);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $slug = Str::slug($request->slug ?: $request->title);

        Article::create([
            'user_id'             => auth()->id(), 
            'category_id'         => $request->category_id,
            'title'               => $request->title,
            'excerpt'             => $request->excerpt,
            'slug'                => $slug,
            'content'             => $request->content ?? '', 
            'thumbnail'           => $thumbnailPath,
            'status'              => $statusArtikel,
            'published_at'        => $statusArtikel === 'published' ? now() : null,
            'views_count'         => 0,
            'allow_comments'      => filter_var($request->allow_comments, FILTER_VALIDATE_BOOLEAN),
            'feature_on_homepage' => filter_var($request->feature_on_homepage, FILTER_VALIDATE_BOOLEAN),
        ]);

        return redirect()->route('articles.index')->with('message', $statusArtikel === 'draft' ? 'Draf berhasil disimpan!' : 'Artikel berhasil diterbitkan!');
    }

    public function edit(Article $article)
    {
        if ($article->status === 'draft' && $article->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $drafts = Article::with(['category'])
            ->where('status', 'draft')
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('Create', [
            'categories' => Category::all(['id', 'name']),
            'article' => $article,
            'drafts' => $drafts
        ]);
    }

    public function update(Request $request, Article $article)
    {
        $isDraft = filter_var($request->is_draft, FILTER_VALIDATE_BOOLEAN);
        $statusArtikel = $isDraft ? 'draft' : 'published';

        $rules = [
            'title' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('articles', 'slug')->ignore($article->id)],
            'excerpt' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'allow_comments' => 'required|boolean',
            'feature_on_homepage' => 'required|boolean',
        ];

        if ($statusArtikel === 'published') {
            $rules['content'] = 'required|string';
        } else {
            $rules['content'] = 'nullable|string';
        }

        $validated = $request->validate($rules);
        $validated['status'] = $statusArtikel;
        
        if ($statusArtikel === 'published') {
            $validated['published_at'] = $article->published_at ?? now();
        }

        if ($request->hasFile('thumbnail')) {
            if ($article->thumbnail && Storage::disk('public')->exists($article->thumbnail)) {
                Storage::disk('public')->delete($article->thumbnail);
            }

            $path = $request->file('thumbnail')->store('thumbnails', 'public');
            $validated['thumbnail'] = $path;
        } else {
            unset($validated['thumbnail']); 
        }

        $validated['slug'] = Str::slug($request->slug);

        $article->update($validated);

        if ($validated['status'] === 'published') {
            return redirect()->route('articles.index')->with('message', 'Artikel berhasil diperbarui/diterbitkan!');
        }

        return redirect()->route('articles.create')->with('message', 'Perubahan draf berhasil disimpan!');
    }

    public function index(Request $request)
    {
        $search = trim($request->input('search'));
        $categorySlug = $request->string('category')->trim();
        
        $query = Article::query()
            ->with(['category', 'user'])
            ->where('status', 'published');
            
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

        $featuredArticles = Article::query()
            ->with(['category', 'user'])
            ->where('status', 'published')
            ->where('feature_on_homepage', true)
            ->latest()
            ->take(3) // Ambil 3 artikel pilihan terbaru
            ->get();

        return Inertia::render('Article', [
            'articles'   => $articles,
            'featuredArticles' => $featuredArticles,
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
}