<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Draft extends Model
{
    use HasFactory;

    // Menentukan kolom yang boleh diisi
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'subheadline',
        'content',
        'thumbnail',
        'allow_comments',
        'feature_on_homepage',
        'tags'
    ];

    // Mengubah data tags (Array di React) menjadi format JSON saat disimpan ke database
    protected $casts = [
        'tags' => 'json',
        'allow_comments' => 'boolean',
        'feature_on_homepage' => 'boolean',
    ];
}