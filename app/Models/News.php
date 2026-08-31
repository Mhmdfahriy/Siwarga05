<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class News extends Model
{
    protected $fillable = [
        'title', 'slug', 'category', 'excerpt',
        'content', 'thumbnail', 'user_id', 'status', 'published_at',
        'event_date', 'event_time', 'event_location',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($news) {
            $baseSlug = Str::slug($news->title);
            $slug = $baseSlug . '-' . Str::random(5);

            while (static::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . Str::random(5);
            }

            $news->slug = $slug;
        });
    }

    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
                     ->where('published_at', '<=', now())
                     ->whereIn('status', ['published', 'scheduled']);
    }
}