<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(rand(5,10));

        return [
            'user_id' => User::inRandomOrder()->first()->id,
            'category_id' => Category::inRandomOrder()->first()?->id,
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1000,999999),
            'excerpt' => fake()->paragraph(),
            'content' => fake()->paragraphs(20, true),
            'allow_comments' => fake()->boolean(90),
            'feature_on_homepage' => fake()->boolean(15),
            'status' => 'published',
            'published_at' => now(),
            'views_count' => fake()->numberBetween(0,5000),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
