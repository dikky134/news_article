<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id');

            $table->foreignId('category_id')
                ->nullable();

            $table->string('title');
            $table->string('slug')->unique();

            $table->text('excerpt')->nullable();
            $table->longText('content');

            $table->boolean('allow_comments')->default(true);
            $table->boolean('feature_on_homepage')->default(false);

            $table->string('thumbnail', 500)->nullable();

            $table->enum('status', [
                'draft',
                'published'
            ])->default('draft');

            $table->timestamp('published_at')->nullable();

            $table->unsignedInteger('views_count')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
