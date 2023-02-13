<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo};
use App\Traits\SubscriptionTrait;

class Cart extends Model
{
    use HasFactory, SubscriptionTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'user_id',
        'download_id',
        'download_package_id',
        'quantity',
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
        'download_id' => 'integer',
        'download_package_id' => 'integer',
        'quantity' => 'integer'
    ];

    /**
     * The cart that belongs to user
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The cart that has one download
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function download(): BelongsTo
    {
        return $this->belongsTo(Download::class)->select('id', 'title', 'slug', 'type', 'notes');
    }

    /**
     * The cart that has one downloadPackage
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function downloadPackage(): BelongsTo
    {
        return $this->belongsTo(DownloadPackage::class)->select('id', 'price', 'package_id');
    }
}
