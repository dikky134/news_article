<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;
use App\Models\ArticleView;
use Inertia\Inertia;

class ArticleDetailController extends Controller
{
    public function show($slug)
    {
        $article = Article::where('slug', $slug)->firstOrFail();

        // LOGIKA PENCATATAN VIEW:
        \App\Models\ArticleView::create([
            'article_id' => $article->id,
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
        ]);

        $article->load(['category', 'user', 'comments.user']);
        
        $wordCount = str_word_count(strip_tags($article->content));
        $article->reading_time = ceil($wordCount / 200) . ' MIN READ';

        $relatedArticles = Article::with(['category'])
            ->where('category_id', $article->category_id)
            ->where('id', '!=', $article->id)
            ->where('status', 'published')
            ->latest()
            ->limit(3)
            ->get();

        return Inertia::render('ArticleDetail', [
            'article' => $article,
            'relatedArticles' => $relatedArticles 
        ]);
    }

    public function storeComment(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'article_id' => 'required|exists:articles,id',
        ]);

        \App\Models\Comment::create([
            'user_id' => auth()->id() ?? 1, 
            'article_id' => $request->article_id,
            'content' => $request->content,
        ]);

        return back();
    }
}