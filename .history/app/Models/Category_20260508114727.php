<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    // Nama tabel di phpMyAdmin
    protected $table = 'categories';

    // Sesuaikan kolom yang bisa diisi
    protected $fillable = ['name', 'slug'];

    // Relasi: Satu kategori punya banyak artikel
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'category_id');
    }
}
