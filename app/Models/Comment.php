<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    // Bagian ini berfungsi untuk mendaftarkan kolom apa saja yang boleh diisi data ke database, termasuk 'parent_id' agar balasan bisa disimpan.
    protected $fillable = [
        'user_id', 
        'article_id', 
        'content', 
        'parent_id'
    ];

    // Fungsi ini memiliki fungsi untuk menghubungkan komentar dengan data user yang menulisnya (mengambil nama dan role).
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Fungsi ini memiliki fungsi untuk menyambungkan dan mengetahui komentar ini berada di artikel berita yang mana.
    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    // Fungsi ini memiliki fungsi untuk menarik semua balasan otomatis di bawah komentar utama, sekaligus membawa data user yang membalas.
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id')->with('user');
    }
}