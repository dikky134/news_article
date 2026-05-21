<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    // Pastikan nama tabelnya 'comments' di phpMyAdmin
    protected $fillable = ['user_id', 'article_id', 'content'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}