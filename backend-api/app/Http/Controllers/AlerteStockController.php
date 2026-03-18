<?php

namespace App\Http\Controllers;

use App\Models\Variante;
use Illuminate\Http\Request;

class AlerteStockController extends Controller
{
    /**
     * Display a listing of the variants with low stock (Optimisé).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $variantes = Variante::select(['id', 'produit_id', 'taille', 'couleur', 'quantite_actuelle', 'seuil_alerte', 'code_barre'])
            ->with('produit:id,nom,marque,prix_vente')
            ->whereColumn('quantite_actuelle', '<=', 'seuil_alerte')
            ->orderBy('quantite_actuelle', 'asc') // Afficher les plus critiques en premier
            ->paginate(25);

        return response()->json($variantes);
    }
}
