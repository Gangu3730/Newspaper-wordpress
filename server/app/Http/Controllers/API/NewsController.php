<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\News::with(['category', 'author'])
            ->orderBy('published_at', 'desc');

        if (!$request->has('all')) {
            $query->where('status', 'published');
        }

        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->has('breaking')) {
            $query->where('is_breaking', true);
        }

        if ($request->has('trending')) {
            $query->where('is_trending', true);
        }

        $news = $query->paginate(15);
        return response()->json($news);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug',
            'summary' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'featured_image' => 'nullable|string',
            'is_breaking' => 'boolean',
            'is_trending' => 'boolean',
            'is_sticky' => 'boolean',
            'status' => 'required|in:draft,published',
        ]);

        $data['author_id'] = $request->user()?->id ?: 1;
        $data['published_at'] = $data['status'] === 'published' ? now() : null;

        $article = \App\Models\News::create($data);
        return response()->json($article, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        // Try locating by slug, fall back to id (useful for admin direct links)
        $article = \App\Models\News::with(['category', 'author', 'tags', 'comments' => function($q) {
            $q->where('status', 'approved');
        }])
        ->where('slug', $slug)
        ->orWhere('id', $slug)
        ->firstOrFail();

        $article->increment('views');

        return response()->json($article);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $article = \App\Models\News::findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:news,slug,' . $id,
            'summary' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'featured_image' => 'nullable|string',
            'is_breaking' => 'boolean',
            'is_trending' => 'boolean',
            'is_sticky' => 'boolean',
            'status' => 'required|in:draft,published',
        ]);

        if ($data['status'] === 'published' && !$article->published_at) {
            $data['published_at'] = now();
        }

        $article->update($data);
        return response()->json($article);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $article = \App\Models\News::findOrFail($id);
        $article->delete();
        return response()->json(['message' => 'खबर सफलतापूर्वक हटा दी गई।']);
    }
}
