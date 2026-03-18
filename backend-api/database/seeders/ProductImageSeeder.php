<?php

namespace Database\Seeders;

use App\Models\Produit;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Images fictives réalistes de vêtements
        $clothingImages = [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop', // T-shirt
            'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=300&h=300&fit=crop', // Jeans
            'https://images.unsplash.com/photo-1539533057440-7db8979211be?w=300&h=300&fit=crop', // Chaussures
            'https://images.unsplash.com/photo-1548886657-1a96b6c14a0f?w=300&h=300&fit=crop', // Veste
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop', // Robe
            'https://images.unsplash.com/photo-1591047990052-f3fb3c3f6e4d?w=300&h=300&fit=crop', // Pantalon
            'https://images.unsplash.com/photo-1572635196237-14b3f281503a?w=300&h=300&fit=crop', // Accessoires
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop', // Chemise
            'https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=300&h=300&fit=crop', // Cardigan
            'https://images.unsplash.com/photo-1603122423028-a1e2ba54949f?w=300&h=300&fit=crop', // Pull
        ];

        $produits = Produit::all();
        
        foreach ($produits as $index => $produit) {
            // Assigner une image de façon cyclique
            $produit->update([
                'image_url' => $clothingImages[$index % count($clothingImages)]
            ]);
        }
    }
}
