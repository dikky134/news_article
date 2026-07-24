<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ArticleView;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::create([
        //     'name' => 'Administrator',
        //     'email' => 'admin@example.com',
        //     'password' => bcrypt('password'),
        //     'role_id' => 1,
        // ]);

        // \App\Models\User::factory()->count(1499)->create([
        //     'role_id' => 2,
        // ]);

        // \App\Models\Article::factory(1000)->create();

        // \App\Models\Comment::factory(100)->create();

        ArticleView::factory()->count(5000)->create();
    }
}
