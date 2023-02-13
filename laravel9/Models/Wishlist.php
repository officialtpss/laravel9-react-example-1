<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\{Model,Builder};
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, HasManyThrough, HasOne};
use App\Interfaces\WishlistInterface;

class Wishlist extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'user_id',
        'name',
        'slug',
        'description',
        'is_public',
        'created_at',
        'updated_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'name' => 'string',
        'slug' => 'string',
        'description' => 'string',
        'is_public' => 'integer',
    ];

    /**
     * Scope a query to only include public wishlists.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', WishlistInterface::PUBLIC);
    }
    
    /**
     * Scope a query to only include private wishlists.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePrivate(Builder $query): Builder
    {
        return $query->where('is_public', WishlistInterface::PRIVATE);
    }

    /**
     * Interact with the Tag slug.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function slug(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => $this->incrementSlug($value),
        );
    }

    /**
     * Unique the Tag slug.
     *
     * @return string
     */
    private function incrementSlug($slug): string
    {
        $original = \Illuminate\Support\Str::slug($slug);
        $count = 1;

        while (static::whereSlug($slug)->exists()) {
            $slug = "{$original}-" . $count++;
        }

        return $slug;
    }

    /**
     * Get the wishlist downloads
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function downloads(): HasMany
    {
        return $this->hasMany(WishlistDownload::class);
    }

    /**
     * Get the user belong to wishlist
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * get downloads
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
    public function activeDownloads(): HasManyThrough
    {
        return $this->hasManyThrough(Download::class, WishlistDownload::class, 'wishlist_id', 'id', 'id', 'download_id')->publish()->has('watermarkedFile');
    }
}
