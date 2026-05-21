<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    //
    use HasFactory;

    // Tentukan kolom mana saja yang bisa diisi jika perlu
    protected $fillable = ['name'];

    /**
     * Relasi ke User (Satu role bisa dimiliki banyak user)
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
