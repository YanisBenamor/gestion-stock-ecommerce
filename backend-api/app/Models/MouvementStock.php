<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    protected $fillable = ['variante_id', 'user_id', 'type', 'quantite', 'date'];

    // Un mouvement concerne une variante précise
    public function variante()
    {
        return $this->belongsTo(Variante::class);
    }

    // Un mouvement a été effectué par un utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
