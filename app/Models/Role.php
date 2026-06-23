<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    // Menggunakan trait HasFactory untuk mendukung fitur seeding data
    use HasFactory;

    // Menentukan kolom yang diizinkan untuk diisi secara massal
    protected $fillable = ['name'];

    /**
     * Relasi One-to-Many ke User:
     * Satu role dapat dimiliki oleh banyak user (misal: role 'admin' untuk admin1, admin2, dst)
     */
    public function users()
    {
        return $this->hasMany(User::class, 'role_id', 'id');
    }
}