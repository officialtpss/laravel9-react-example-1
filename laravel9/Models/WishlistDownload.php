<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany, HasOne};


class WishlistDownload extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'wishlist_id',
        'download_id',
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
        'wishlist_id' => 'integer',
        'download_id' => 'integer',
    ];

    /**
     * Get the download belong to Wishlist
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function download(): BelongsTo
    {
        return $this->belongsTo(Download::class);
    }
}
