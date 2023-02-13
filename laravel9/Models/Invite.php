<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invite extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'referred_user_id',
        'user_id',
        'name',
        'email',
        'refer_code',
        'is_used',
        'status',
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
        'referred_user_id' => 'integer',
        'user_id' => 'integer',
        'name' => 'string',
        'email' => 'string',
        'refer_code' => 'string',
        'is_used' => 'integer',
        'status' => 'integer',
    ];

    /**
     * Invite belongs to User Model
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class,'referred_user_id');
    }

    /**
     * Invite belongs to User Model
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function invitedUser(): BelongsTo
    {
        return $this->belongsTo(User::class,'user_id');
    }
}
