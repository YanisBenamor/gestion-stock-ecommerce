<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\MouvementStockController;
use App\Http\Controllers\AlerteStockController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VarianteController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\DashboardController;

// Public routes
Route::post('login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', function (Request $request) {
        return $request->user();
    });
    
    // Produit CRUD
    Route::apiResource('produits', ProduitController::class);
    
    // Recherche globale
    Route::get('search', [ProduitController::class, 'search']);
    
    // Variante CRUD
    Route::apiResource('variantes', VarianteController::class);

    // Categories list
    Route::get('categories', [CategorieController::class, 'index']);

    // Dashboard analytics
    Route::get('dashboard/peak-demand', [DashboardController::class, 'getPeakDemand']);
    
    // Mouvement Stock CRUD
    Route::apiResource('mouvements', MouvementStockController::class);
    
    // Alertes Stock (Read-only)
    Route::get('alertes-stock', [AlerteStockController::class, 'index']);
    
    // IA Assistant
    Route::post('ai/chat', [AIController::class, 'query']);
    
    // Logout
    Route::post('logout', [AuthController::class, 'logout']);
});