<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('variantes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('produit_id')->constrained('produits')->cascadeOnDelete();
        $table->string('taille');
        $table->string('couleur');
        $table->string('code_barre')->unique()->nullable();
        $table->integer('quantite_actuelle')->default(0);
        $table->integer('seuil_alerte')->default(5);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variantes');
    }
};
