<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    /**
     * 1. AFFICHER LA LISTE (Utilisé par Amira pour le Dashboard B2B)
     */
    public function index()
    {
        // La magie d'Eloquent : on récupère tous les produits, 
        // ET on inclut directement leur catégorie et leurs variantes (tailles/couleurs) !
        $produits = Produit::with(['categorie', 'variantes'])->get();
        
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
        ]);

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
        $produit->update($request->all());
        
        return response()->json($produit);
    }

    /**
     * 5. SUPPRIMER UN PRODUIT
     */
    public function destroy($id)
    {
        $produit = Produit::findOrFail($id);
        $produit->delete();
        
        return response()->json(['message' => 'Produit supprimé avec succès']);
    }
}