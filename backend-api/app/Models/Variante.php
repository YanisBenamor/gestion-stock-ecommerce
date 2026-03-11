<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Variante extends Model
{
    protected $fillable = ['produit_id', 'taille', 'couleur', 'code_barre', 'quantite_actuelle', 'seuil_alerte'];

    // Une variante appartient à un produit
    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    // Une variante a plusieurs mouvements de stock
    public function mouvements()
    {
        return $this->hasMany(MouvementStock::class);
    }
}