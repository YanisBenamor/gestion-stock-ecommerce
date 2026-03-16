<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProduitController;
// AJOUTE CETTE LIGNE CI-DESSOUS :
use App\Http\Controllers\MouvementStockController;

Route::apiResource('produits', ProduitController::class);
Route::apiResource('mouvements', MouvementStockController::class);