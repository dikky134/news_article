<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'user_id',
        'title',
        'slug',
        'content',
        'excerpt',
        'thumbnail',
        'status',
        'allow_comments',
        'feature_on_homepage'
    ];

    protected $appends = ['reading_time'];

    public function getReadingTimeAttribute()
    {
        // Mengambil content dari baris artikel ini sendiri ($this)
        $wordCount = str_word_count(strip_tags($this->content));
        $minutes = ceil($wordCount / 200);
        
        return ($minutes < 1 ? 1 : $minutes) . ' MIN READ';
    }
    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Kategori
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // Relasi ke Tabel ArticleView (Gambar database kamu)
    public function views()
    {
        return $this->hasMany(ArticleView::class, 'article_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'article_id')->latest();
    }
}