<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSettingsTable extends Migration
{
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('section'); // e.g., 'banner', 'promo_section'
            $table->string('key'); // e.g., 'title_en', 'image'
            $table->text('value'); // Store plain text or image paths
            $table->string('language')->default('en'); // 'en' or 'ar'
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('settings');
    }
}
