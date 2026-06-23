<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    // Fungsi ini memiliki fungsi untuk memproses dan menyimpan komentar baru pada sebuah artikel.
    public function store(Request $request, Article $article)
    {
        // Bagian ini berfungsi memvalidasi form agar isian komentar (content) tidak kosong dan maksimal 1000 huruf.
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        // Bagian ini berfungsi menyimpan data komentar ke database yang otomatis terhubung dengan artikel terkait.
        $article->comments()->create([
            'user_id' => Auth::id(),
            'content' => $request->input('content'), 
        ]);

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }

    // Fungsi ini memiliki fungsi untuk memproses dan menyimpan balasan komentar ke database.
    public function reply(Request $request, Comment $comment)
    {
        // Bagian ini berfungsi memvalidasi form agar isian balasan tidak kosong dan maksimal 1500 huruf.
        $request->validate([
            'content' => 'required|string|max:1500',
        ]);

        // Bagian ini berfungsi menyimpan data balasan ke tabel comments, dengan mengikat parent_id ke ID komentar utama yang dibalas.
        Comment::create([
            'user_id'    => Auth::id(),
            'article_id' => $comment->article_id,
            'content'    => $request->input('content'), 
            'parent_id'  => $comment->id,
        ]);

        return back()->with('success', 'Balasan komentar berhasil dikirim.');
    }

    // Fungsi ini memiliki fungsi untuk menghapus komentar (bisa dieksekusi oleh pemilik komentar sendiri atau oleh Admin/Super Admin).
    public function destroy(Comment $comment)
    {
        $user = Auth::user();

        // Bagian ini berfungsi untuk mengecek apakah user yang sedang login adalah pembuat asli komentar tersebut.
        $isOwner = $comment->user_id === $user->id;

        // Bagian ini berfungsi untuk mengecek apakah user yang login memiliki role Admin (1) atau Super Admin (2).
        $isAdminOrSuper = in_array($user->role_id, [1, 2]);

        // Bagian ini berfungsi mengeksekusi penghapusan dari database jika syarat kepemilikan atau role di atas terpenuhi.
        if ($isOwner || $isAdminOrSuper) {
            $comment->delete();
            return back()->with('success', 'Komentar berhasil dihapus.');
        }

        // Bagian ini berfungsi memblokir akses dan mengembalikan pesan error jika user biasa mencoba menghapus komentar orang lain.
        return back()->with('error', 'Akses Ditolak: Anda tidak memiliki otoritas.');
    }
}