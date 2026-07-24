<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\User;
use App\Models\ArticleView;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ArticleView>
 */
class ArticleViewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'article_id' => Article::inRandomOrder()->value('id'),
            'user_id' => fake()->boolean(70)
                ? User::inRandomOrder()->value('id')
                : null,
            'ip_address' => fake()->ipv4(),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => now(),
        ];
    }
}
