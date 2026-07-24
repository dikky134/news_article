<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\User;
use App\Models\Article;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Comment>
 */
class CommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->value('id'),
            'article_id' => Article::inRandomOrder()->value('id'),
            'content' => fake()->realText(150),
            'parent_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
