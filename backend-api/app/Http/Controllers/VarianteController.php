<?php

namespace App\Http\Controllers;

use App\Models\Variante;
use App\Models\Produit;
use Illuminate\Http\Request;

class VarianteController extends Controller
{
    /**
     * Lister toutes les variantes (Optimisé).
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $variantes = Variante::select(['id', 'produit_id', 'taille', 'couleur', 'code_barre', 'quantite_actuelle', 'seuil_alerte'])
                             ->with('produit:id,nom,prix_vente')
                             ->paginate(15);
        return response()->json($variantes);
    }

    /**
     * Afficher une variante spécifique.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $variante = Variante::findOrFail($id)->load('produit');
        return response()->json($variante);
    }

    /**
     * Créer une nouvelle variante pour un produit existant.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'taille' => 'required|string|max:50',
            'couleur' => 'required|string|max:100',
            'code_barre' => 'nullable|string|max:255|unique:variantes',
            'sku' => 'nullable|string|max:255',
            'quantite_actuelle' => 'required|integer|min:0',
            'seuil_alerte' => 'required|integer|min:0',
        ]);

        $variante = Variante::create($validatedData);
        
        return response()->json($variante->load('produit'), 201);
    }

    /**
     * Mettre à jour une variante.
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $variante = Variante::findOrFail($id);

        $validatedData = $request->validate([
            'taille' => 'sometimes|required|string|max:50',
            'couleur' => 'sometimes|required|string|max:100',
            'code_barre' => 'nullable|string|max:255|unique:variantes,code_barre,' . $id,
            'sku' => 'nullable|string|max:255',
            'quantite_actuelle' => 'sometimes|required|integer|min:0',
            'seuil_alerte' => 'sometimes|required|integer|min:0',
        ]);

        $variante->update($validatedData);

        return response()->json($variante->load('produit'));
    }

    /**
     * Supprimer une variante.
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $variante = Variante::findOrFail($id);
        $variante->delete();

        return response()->json(['message' => 'Variante supprimée avec succès']);
    }
}
