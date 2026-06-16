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
use Illuminate\Support\Facades\Http;
class ArticleController extends Controller
{
    private function uploadToSupabase($file)
{
    $fileName = time().'_'.$file->getClientOriginalName();

    Http::withHeaders([
        'apikey' => env('SUPABASE_KEY'),
        'Authorization' => 'Bearer '.env('SUPABASE_KEY'),
        'Content-Type' => $file->getMimeType(),
    ])->withBody(
        file_get_contents($file->getRealPath()),
        $file->getMimeType()
    )->post(
        env('SUPABASE_URL')
        . '/storage/v1/object/'
        . env('SUPABASE_BUCKET')
        . '/'
        . $fileName
    );

    return env('SUPABASE_URL')
        . '/storage/v1/object/public/'
        . env('SUPABASE_BUCKET')
        . '/'
        . $fileName;
}
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

        $request->merge([
            'allow_comments' => filter_var($request->allow_comments, FILTER_VALIDATE_BOOLEAN),
            'feature_on_homepage' => filter_var($request->feature_on_homepage, FILTER_VALIDATE_BOOLEAN),
        ]);

        $rules = [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:articles,slug|max:255',
            'excerpt' => 'nullable|string',
            'allow_comments' => 'required|boolean',
            'feature_on_homepage' => 'required|boolean',
        ];

        // JIKA PUBLISH: Kategori wajib ada. JIKA DRAF: Kategori boleh kosong (nullable)
        if ($statusArtikel === 'published') {
            $rules['category_id'] = 'required|exists:categories,id';
            $rules['content'] = 'required|string';
            $rules['thumbnail'] = 'required|image|mimes:jpeg,png,jpg,webp|max:2048';
        } else {
            $rules['category_id'] = 'nullable|exists:categories,id';
            $rules['content'] = 'nullable|string';
            $rules['thumbnail'] = 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048';
        }

        $validated = $request->validate($rules);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
        $thumbnailPath = $this->uploadToSupabase(
        $request->file('thumbnail')
    );
}
        

        $slug = Str::slug($request->slug ?: $request->title);

        Article::create([
            'user_id'             => auth()->id(), 
            'category_id'         => $request->category_id ?: null,
            'title'               => $request->title,
            'excerpt'             => $request->excerpt,
            'slug'                => $slug,
            'content'             => $request->content ?? '', 
            'thumbnail'           => $thumbnailPath,
            'status'              => $statusArtikel,
            'published_at'        => $statusArtikel === 'published' ? now() : null,
            'views_count'         => 0,
            'allow_comments'      => $request->allow_comments,
            'feature_on_homepage' => $request->feature_on_homepage,
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

        // 1. Bersihkan data masukan sebelum masuk ke Validator
        $request->merge([
            'allow_comments' => filter_var($request->allow_comments, FILTER_VALIDATE_BOOLEAN),
            'feature_on_homepage' => filter_var($request->feature_on_homepage, FILTER_VALIDATE_BOOLEAN),
            'category_id' => ($request->category_id === '' || $request->category_id === 'null' || !$request->category_id) ? null : $request->category_id,
        ]);

        $rules = [
            'title' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('articles', 'slug')->ignore($article->id)],
            'excerpt' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'allow_comments' => 'required|boolean',
            'feature_on_homepage' => 'required|boolean',
        ];

        if ($statusArtikel === 'published') {
            $rules['category_id'] = 'required|exists:categories,id';
            $rules['content'] = 'required|string';
        } else {
            $rules['category_id'] = 'nullable|exists:categories,id';
            $rules['content'] = 'nullable|string';
        }

        // 2. Ambil data yang sudah lolos validasi
        $validated = $request->validate($rules);
        
        // 3. Tambahkan status dan category_id hasil merge yang aman
        $validated['status'] = $statusArtikel;
        $validated['category_id'] = $request->category_id; // <--- Menggunakan hasil merge request, bukan ditimpa ulang!
        
        if ($statusArtikel === 'published') {
            $validated['published_at'] = $article->published_at ?? now();
        }

        if ($request->hasFile('thumbnail')) {
            if ($article->thumbnail && Storage::disk('public')->exists($article->thumbnail)) {
                Storage::disk('public')->delete($article->thumbnail);
            }

            $validated['thumbnail'] = $this->uploadToSupabase(
            $request->file('thumbnail')
            );
        } else {
            unset($validated['thumbnail']); 
        }

        $validated['slug'] = Str::slug($request->slug ?: $request->title);

        // 4. Eksekusi update data aman ke Database
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

        return Inertia::render('Article', [
            'articles'         => $articles,
            'categories'       => Category::select('id', 'name', 'slug')->get(),
            'filters'          => [
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
            ->with(['category', 'user', 'comments.user'])
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
            'article'         => $article,
            'relatedArticles' => $relatedArticles
        ]);
    }

    public function autoSave(Request $request)
    {
        try {
            $title = $request->title ?: 'Untitled Draft';
            
            // Ambil category_id lama dari database jika di request bernilai kosong
            $existingArticle = $request->id ? Article::find($request->id) : null;
            $categoryId = $request->category_id ?: ($existingArticle?->category_id ?? null);

            $article = Article::updateOrCreate(
                ['id' => $request->id], 
                [
                    'title'       => $title,
                    'slug'        => $request->slug ?: Str::slug($title) . '-' . time(),
                    'excerpt'     => $request->excerpt ?: '',
                    'content'     => $request->content ?: '',
                    'category_id' => $categoryId, // Mengunci nilai kategori agar tidak terhapus otomatis oleh auto-save
                    'status'      => 'draft',
                    'user_id'     => auth()->id(),
                ]
            );

            return response()->json([
                'success'    => true,
                'article_id' => $article->id
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $keyword = $request->query('q');

            if (blank($keyword)) {
                return response()->json([]);
            }

            $articles = Article::where('status', 'published')
            ->where(function($query) use ($keyword) {
                $query->where('title', 'LIKE', "%{$keyword}%")
                      ->orWhere('content', 'LIKE', "%{$keyword}%");
            })
                ->limit(5)
                ->get(['id', 'title', 'slug', 'status']);

            return response()->json($articles, 200);

        } catch (\Exception $e) {
            // Jika backend error, pesan aslinya akan dikirim ke Console Browser Anda!
            return response()->json([
                'message' => 'Laravel search query failed',
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $article = Article::findOrFail($id);
            
            if (auth()->user()->role !== 'admin' && auth()->user()->role?->name !== 'admin') {
                return redirect()->back()->with('error', 'Unauthorized action.');
            }

            // Hapus artikel dari database
            $article->delete();

            // Redirect ke halaman index artikel setelah berhasil dihapus
            return redirect()->route('articles.index')->with('success', 'Article deleted successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete article: ' . $e->getMessage());
        }
    }
}