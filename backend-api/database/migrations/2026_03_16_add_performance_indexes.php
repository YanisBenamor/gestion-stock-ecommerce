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
        // Index pour les recherches sur produits
        Schema::table('produits', function (Blueprint $table) {
            $table->index('categorie_id');
            $table->index('nom'); // Pour les recherches par nom
            $table->fullText('nom', 'description'); // Full-text search
        });

        // Index pour les variantes
        Schema::table('variantes', function (Blueprint $table) {
            $table->index('produit_id');
            $table->index('code_barre');
            $table->index('quantite_actuelle'); // Pour les alertes de stock
            $table->index('seuil_alerte');
        });

        // Index pour les mouvements de stock
        Schema::table('mouvement_stocks', function (Blueprint $table) {
            $table->index('variante_id');
            $table->index('user_id');
            $table->index('type');
            $table->index('date'); // Pour les historiques triés par date
        });

        // Index pour les catégories
        Schema::table('categories', function (Blueprint $table) {
            $table->index('nom'); // Pour les recherches de catégories
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropIndex(['categorie_id']);
            $table->dropIndex(['nom']);
            $table->dropFullText(['nom', 'description']);
        });

        Schema::table('variantes', function (Blueprint $table) {
            $table->dropIndex(['produit_id']);
            $table->dropIndex(['code_barre']);
            $table->dropIndex(['quantite_actuelle']);
            $table->dropIndex(['seuil_alerte']);
        });

        Schema::table('mouvement_stocks', function (Blueprint $table) {
            $table->dropIndex(['variante_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['type']);
            $table->dropIndex(['date']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['nom']);
        });
    }
};
