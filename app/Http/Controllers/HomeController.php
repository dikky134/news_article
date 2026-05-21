<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Inertia\Inertia;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $mainHighlight = Article::with('category')
            ->where('status', 'published')
            ->latest()
            ->first();
        
        $sideHighlights = Article::with('category')
            ->where('status', 'published')
            ->latest()
            ->skip(1)
            ->take(3)
            ->get();

        return Inertia::render('Home', [
            'mainHighlight' => $mainHighlight,
            'sideHighlights' => $sideHighlights,
        ]);
    }
}