<?php

namespace App\Http\Controllers;

use App\Models\MouvementStock;
use App\Models\Variante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MouvementStockController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validation des données (Harmonisation avec les majuscules)
        $validated = $request->validate([
            'variante_id' => 'required|exists:variantes,id',
            'type' => 'required|in:ENTREE,SORTIE,RETOUR_CLIENT',
            'quantite' => 'required|integer|min:1',
        ]);

        // 2. Utilisation d'une transaction pour la sécurité des données
        return DB::transaction(function () use ($validated) {
            $variante = Variante::findOrFail($validated['variante_id']);

            // 3. Calculer le nouveau stock (Logique corrigée avec MAJUSCULES)
            if ($validated['type'] === 'ENTREE' || $validated['type'] === 'RETOUR_CLIENT') {
                $variante->quantite_actuelle += $validated['quantite'];
            } elseif ($validated['type'] === 'SORTIE') {
                // Sortie : on vérifie si on a assez de stock
                if ($variante->quantite_actuelle < $validated['quantite']) {
                    return response()->json(['error' => 'Stock insuffisant'], 400);
                }
                $variante->quantite_actuelle -= $validated['quantite'];
            }

            // 4. Sauvegarder la nouvelle quantité
            $variante->save();

            // 5. Enregistrer le mouvement (historique)
            $mouvement = MouvementStock::create([
                'variante_id' => $validated['variante_id'],
                'user_id' => 1, // On garde 1 tant qu'on a pas fait le Login
                'type' => $validated['type'],
                'quantite' => $validated['quantite'],
                'date' => now(),
            ]);

            return response()->json([
                'message' => 'Mouvement enregistré !',
                'nouveau_stock' => $variante->quantite_actuelle,
                'mouvement' => $mouvement
            ], 201);
        });
    }

    public function index()
    {
        // Voir l'historique complet optimisé
        return response()->json(
            MouvementStock::select(['id', 'variante_id', 'user_id', 'type', 'quantite', 'date'])
                         ->with([
                             'variante:id,produit_id,code_barre,quantite_actuelle',
                             'variante.produit:id,nom,prix_vente',
                             'utilisateur:id,name'
                         ])
                         ->latest()
                         ->paginate(20)
        );
    }
}