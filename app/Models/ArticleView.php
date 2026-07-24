<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleView extends Model
{
    use HasFactory;
    protected $table = 'article_views';

    // Matikan timestamps Laravel karena tabelmu hanya punya created_at
    public $timestamps = false;

    protected $fillable = [
        'article_id',
        'user_id',
        'ip_address',
        'user_agent'
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}