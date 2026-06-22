<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Mengatur hak akses kolom database agar dapat menerima sisipan data secara massal (Mass Assignment) melalui formulir.
     * FUNGSI VITAL: 'role_id' didaftarkan di sini agar form React "Tambah/Edit User" memiliki izin untuk merekam opsi ke database.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'provider_name',
        'provider_id',
    ];

    /**
     * Menyembunyikan atribut atau data sensitif dari objek model agar tidak ikut terekspos ketika data dikirim ke antarmuka React.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Menerapkan mutasi otomatis tipe data saat sistem mengambil (get) atau menyimpan (set) nilai dari database.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Mendeklarasikan relasi logis basis data (One-to-Many Inverse) yang mengikat tabel 'users' ke tabel referensi 'roles'.
     * Fungsi ini melayani pemanggilan objek '$user->role->name' untuk mencetak teks jabatan di layar frontend.
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
    
    /**
     * Mendeklarasikan relasi logis basis data (One-to-Many) yang menautkan tabel 'users' dengan tabel 'articles'.
     * Fungsi ini memungkinkan sistem menghitung atau memanggil seluruh karya tulis yang diterbitkan oleh satu penulis.
     */
    public function articles()
    {
        return $this->hasMany(Article::class);
    }
}