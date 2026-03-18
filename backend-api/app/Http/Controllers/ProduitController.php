<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\QueryException;

class ProduitController extends Controller
{
    /**
     * 1. AFFICHER LA LISTE (Utilisé par Amira pour le Dashboard B2B)
     * Optimisé avec Eager Loading, select() et pagination
     */
    public function index()
    {
        // Eager Loading + sélection de champs + pagination
        $produits = Produit::select(['id', 'nom', 'description', 'prix_vente', 'marque', 'categorie_id', 'image_url'])
                           ->with([
                               'categorie:id,nom',
                               'variantes:id,produit_id,taille,couleur,code_barre,quantite_actuelle,seuil_alerte'
                           ])
                           ->paginate(15);
        
        return response()->json($produits);
    }

    /**
     * 2. CRÉER UN NOUVEAU PRODUIT (Utilisé par l'Admin)
     */
    public function store(Request $request)
    {
        // On vérifie que les données envoyées sont correctes
        $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix_vente' => 'required|numeric',
            'marque' => 'nullable|string|max:255',
            'categorie_id' => 'required|exists:categories,id',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $baseUrl = rtrim(env('APP_URL', 'http://localhost:8000'), '/');
            $validatedData['image_url'] = $baseUrl . Storage::url($imagePath);
        }

        $produit = Produit::create($validatedData);
        return response()->json($produit, 201); // 201 = Created
    }

    /**
     * 3. AFFICHER UN SEUL PRODUIT (Utilisé par Amira pour la page "Product Details")
     */
    public function show($id)
    {
        // On cherche le produit par son ID, avec ses relations
        $produit = Produit::with(['categorie', 'variantes'])->findOrFail($id);
        
        return response()->json($produit);
    }

    /**
     * 4. METTRE À JOUR UN PRODUIT
     */
    public function update(Request $request, $id)
    {
        $produit = Produit::findOrFail($id);
        
        $validatedData = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'prix_vente' => 'sometimes|required|numeric',
            'marque' => 'nullable|string|max:255',
            'categorie_id' => 'sometimes|required|exists:categories,id',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $oldPath = $this->extractStoragePath($produit->image_url);
            if ($oldPath) {
                Storage::disk('public')->delete($oldPath);
            }

            $imagePath = $request->file('image')->store('products', 'public');
            $baseUrl = rtrim(env('APP_URL', 'http://localhost:8000'), '/');
            $validatedData['image_url'] = $baseUrl . Storage::url($imagePath);
        }
        
        $produit->update($validatedData);
        return response()->json($produit->load(['categorie', 'variantes']));
    }

    /**
     * 5. SUPPRIMER UN PRODUIT
     */
    public function destroy($id)
    {
        $produit = Produit::with('variantes')->findOrFail($id);

        try {
            DB::transaction(function () use ($produit) {
                // Supprime l'image si elle est stockée localement
                $oldPath = $this->extractStoragePath($produit->image_url);
                if ($oldPath) {
                    Storage::disk('public')->delete($oldPath);
                }

                // Les variantes et mouvements liés sont supprimés via cascadeOnDelete
                $produit->delete();
            });

            return response()->json([
                'message' => 'Produit supprimé avec succès',
                'deleted_product_id' => $id,
            ]);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Suppression impossible: ce produit est encore référencé.',
                'error' => $e->getMessage(),
            ], 409);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression du produit.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 6. RECHERCHE GLOBALE (Optimisée)
     * Cherche le mot-clé dans: nom, description, et sku des variantes
     */
    public function search(Request $request)
    {
        $keyword = $request->query('q', '');

        if (empty($keyword)) {
            return response()->json([]);
        }

        try {
            // Search in product name and description - optimisé avec select()
            $ids1 = Produit::select(['id'])
                           ->where('nom', 'like', "%{$keyword}%")
                           ->orWhere('description', 'like', "%{$keyword}%")
                           ->limit(50)
                           ->pluck('id');
            
            // Search in variant code_barre (barcode)
            $ids2 = DB::table('variantes')
                      ->select('produit_id')
                      ->where('code_barre', 'like', "%{$keyword}%")
                      ->limit(50)
                      ->pluck('produit_id');
            
            // Merge and get unique IDs
            $allIds = collect($ids1)->merge($ids2)->unique()->values()->take(50);
            
            if ($allIds->isEmpty()) {
                return response()->json([]);
            }
            
            // Get products with relations - optimisé
            $produits = Produit::whereIn('id', $allIds)
                               ->select(['id', 'nom', 'description', 'prix_vente', 'marque', 'categorie_id', 'image_url'])
                               ->with([
                                   'categorie:id,nom',
                                   'variantes:id,produit_id,taille,couleur,code_barre,quantite_actuelle'
                               ])
                               ->get();
            
            return response()->json($produits);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Extraire le chemin relatif du disque public depuis une URL image
     */
    private function extractStoragePath(?string $imageUrl): ?string
    {
        if (empty($imageUrl)) {
            return null;
        }

        $path = parse_url($imageUrl, PHP_URL_PATH);
        if (!$path) {
            return null;
        }

        $prefix = '/storage/';
        if (str_starts_with($path, $prefix)) {
            return ltrim(substr($path, strlen($prefix)), '/');
        }

        return null;
    }
}