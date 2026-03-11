<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\ProduitController;

// Routes pour les catégories (ex: GET /api/categories)
Route::apiResource('categories', CategorieController::class);

// Routes pour les produits (ex: GET /api/produits)
Route::apiResource('produits', ProduitController::class);