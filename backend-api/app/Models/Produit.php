<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $fillable = ['nom', 'description', 'prix_vente', 'marque', 'categorie_id', 'fournisseur_id', 'image_url'];

    // Un produit appartient à une catégorie
    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    // Un produit possède plusieurs variantes
    public function variantes()
    {
        return $this->hasMany(Variante::class);
    }

    // Un produit appartient à un fournisseur
    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }
}