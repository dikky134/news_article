<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi untuk menambah kolom ke Supabase.
     */
    public function up(): void
    {
        // Membuka tabel 'comments' yang sudah ada di Supabase Anda
        Schema::table('comments', function (Blueprint $table) {
            
            // 1. Menambahkan kolom 'parent_id' dengan tipe foreignId (BigInteger)
            // 2. nullable() -> karena jika itu komentar utama, nilainya kosong (NULL)
            // 3. after('article_id') -> posisi kolom diletakkan setelah kolom article_id agar rapi
            // 4. constrained('comments') -> kolom ini mengikat/merujuk ke kolom 'id' di tabel 'comments' itu sendiri
            // 5. onDelete('cascade') -> REVISI PRIORITAS: jika komentar utama dihapus oleh Admin/User, 
            //    maka semua balasan di bawahnya otomatis ikut terhapus bersih dari Supabase.
            $table->foreignId('parent_id')
                  ->nullable()
                  ->after('article_id')
                  ->constrained('comments')
                  ->onDelete('cascade');
        });
    }

    /**
     * Batalkan migrasi (jika melakukan php artisan migrate:rollback).
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // Menghapus hubungan relasi foreign key parent_id
            $table->dropForeign(['parent_id']);
            // Menghapus kolom parent_id dari tabel comments
            $table->dropColumn('parent_id');
        });
    }
};