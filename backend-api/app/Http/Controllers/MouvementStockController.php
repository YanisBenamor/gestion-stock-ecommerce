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
        // 1. Validation des données
        $validated = $request->validate([
            'variante_id' => 'required|exists:variantes,id',
            'type' => 'required|in:entree,sortie,retour',
            'quantite' => 'required|integer|min:1',
        ]);

        // 2. Utilisation d'une transaction pour être sûr que tout se passe bien
        return DB::transaction(function () use ($validated) {
            $variante = Variante::findOrFail($validated['variante_id']);

            // 3. Calculer le nouveau stock
            if ($validated['type'] === 'entree' || $validated['type'] === 'retour') {
                $variante->quantite_actuelle += $validated['quantite'];
            } else {
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
                'user_id' => 1, // Temporaire en attendant l'Auth
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
        // Voir l'historique complet
        return response()->json(MouvementStock::with(['variante.produit', 'utilisateur'])->latest()->get());
    }
}