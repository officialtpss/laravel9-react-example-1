<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wishlist_downloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wishlist_id')
                ->constrained('wishlists')
                ->onDelete('cascade');
            $table->foreignId('download_id')
                ->constrained('downloads')
                ->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('wishlist_downloads', function (Blueprint $table) {
            $table->dropForeign(['wishlist_id']);
            $table->dropForeign(['download_id']);
        });

        Schema::dropIfExists('wishlist_downloads');
    }
};
