<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Advertisement::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'image_url' => 'required|string',
            'target_url' => 'nullable|string',
            'placement' => 'required|in:header,sidebar,in_article,footer',
            'is_active' => 'boolean',
        ]);

        $ad = \App\Models\Advertisement::create($data);
        return response()->json($ad, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $ad = \App\Models\Advertisement::findOrFail($id);
        return response()->json($ad);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $ad = \App\Models\Advertisement::findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'image_url' => 'required|string',
            'target_url' => 'nullable|string',
            'placement' => 'required|in:header,sidebar,in_article,footer',
            'is_active' => 'boolean',
        ]);

        $ad->update($data);
        return response()->json($ad);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $ad = \App\Models\Advertisement::findOrFail($id);
        $ad->delete();
        return response()->json(['message' => 'विज्ञापन सफलतापूर्वक हटा दिया गया।']);
    }
}
