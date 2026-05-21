<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;
use Inertia\Inertia;

class ArticleDetailController extends Controller
{
    public function show($slug)
    {
        $article = Article::where('slug', $slug)->firstOrFail();

        // LOGIKA PENCATATAN VIEW:
        // Tambahkan data ke tabel article_views setiap kali halaman ini diakses
        \App\Models\ArticleView::create([
            'article_id' => $article->id,
            'user_id' => auth()->id(), // Akan berisi ID user jika login, atau NULL jika tamu
            'ip_address' => request()->ip(), // Opsional: untuk tracking unik
        ]);

        // Ambil data lengkap artikel beserta hitungan yang baru
        $article->load(['category', 'user', 'comments.user']);
        
        // Hitung reading time
        $wordCount = str_word_count(strip_tags($article->content));
        $article->reading_time = ceil($wordCount / 200) . ' MIN READ';

        return Inertia::render('ArticleDetail', [
            'article' => $article
        ]);
    }

    public function storeComment(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'article_id' => 'required|exists:articles,id',
        ]);

        \App\Models\Comment::create([
            // Gunakan ID user yang login, atau ID user default (misal: 1) jika belum ada sistem login
            'user_id' => auth()->id() ?? 1, 
            'article_id' => $request->article_id,
            'content' => $request->content,
        ]);

        return back();
    }
}