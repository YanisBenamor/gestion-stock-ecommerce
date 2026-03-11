<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Variante;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Créer un compte Admin pour pouvoir se connecter plus tard
        User::create([
            'name' => 'Admin E-commerce',
            'email' => 'admin@ecommerce.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        // 2. Créer des Catégories (avec les collections mentionnées dans le doc)
        $catHauts = Categorie::create(['nom' => 'Hauts', 'collection' => 'Printemps/Été 2026']);
        $catBas = Categorie::create(['nom' => 'Bas', 'collection' => 'Permanent']);

        // 3. Créer des Produits basés sur vos maquettes
        $chemise = Produit::create([
            'nom' => 'Oxford Cotton Shirt',
            'description' => 'Chemise classique en coton pour homme.',
            'prix_vente' => 45.00,
            'marque' => 'Nordic Apparel',
            'categorie_id' => $catHauts->id,
        ]);

        $chino = Produit::create([
            'nom' => 'Slim Fit Chinos',
            'description' => 'Pantalon Chino coupe ajustée.',
            'prix_vente' => 60.00,
            'marque' => 'Urban Classics',
            'categorie_id' => $catBas->id,
        ]);

        // 4. Créer des Variantes avec leurs stocks et seuils d'alerte
        // Variante 1 : En stock normal
        Variante::create([
            'produit_id' => $chemise->id,
            'taille' => 'M',
            'couleur' => 'Blue Sky',
            'code_barre' => 'OXF-M-BLUE',
            'quantite_actuelle' => 450,
            'seuil_alerte' => 100,
        ]);

        // Variante 2 : En alerte de stock bas (pour tester le Dashboard d'Amira !)
        Variante::create([
            'produit_id' => $chino->id,
            'taille' => '32',
            'couleur' => 'Khaki',
            'code_barre' => 'CHI-32-KHA',
            'quantite_actuelle' => 45,
            'seuil_alerte' => 50, // L'alerte se déclenchera car 45 < 50
        ]);
    }
}