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
                Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('name', 100);

            $table->string('email', 100)
                ->unique();

            $table->timestamp('email_verified_at')->nullable();

            $table->string('password')
                ->nullable();

            $table->string('remember_token', 100)
                ->nullable();

            $table->string('provider_name')
                ->nullable();

            $table->string('provider_id')
                ->nullable();

            $table->foreignId('role_id')
                ->nullable()
                ->constrained('roles')
                ->nullOnDelete();

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
