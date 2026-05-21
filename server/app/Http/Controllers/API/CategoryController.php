<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Category::orderBy('sort_order')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:categories,slug|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $category = \App\Models\Category::create($data);
        return response()->json($category, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $category = \App\Models\Category::where('id', $id)->orWhere('slug', $id)->firstOrFail();
        return response()->json($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $category = \App\Models\Category::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:categories,slug,' . $id,
            'sort_order' => 'nullable|integer',
        ]);

        $category->update($data);
        return response()->json($category);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = \App\Models\Category::findOrFail($id);
        
        // Disassociate related news instead of cascade or prevent delete
        \App\Models\News::where('category_id', $category->id)->update(['category_id' => null]);
        
        $category->delete();
        return response()->json(['message' => 'श्रेणी सफलतापूर्वक हटा दी गई।']);
    }
}
