<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $fillable = [
        'title', 'slug', 'summary', 'content', 'featured_image',
        'category_id', 'author_id', 'views', 'is_breaking',
        'is_trending', 'is_sticky', 'status', 'published_at'
    ];

    protected $casts = [
        'is_breaking' => 'boolean',
        'is_trending' => 'boolean',
        'is_sticky' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'news_tags');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
