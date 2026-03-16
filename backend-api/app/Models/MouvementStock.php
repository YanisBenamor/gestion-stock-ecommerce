<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    use HasFactory;

    // On indique le nom de la table car Laravel pourrait chercher "mouvement_stocks"
    protected $table = 'mouvements_stock';

    // On autorise le remplissage de ces colonnes
    protected $fillable = [
        'variante_id',
        'user_id',
        'type',
        'quantite',
        'date'
    ];

    // Relation vers la variante
    public function variante()
    {
        return $this->belongsTo(Variante::class);
    }

    // Relation vers l'utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}