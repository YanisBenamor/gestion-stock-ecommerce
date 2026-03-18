<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\Variante;
use App\Models\MouvementStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    /**
     * Traiter une requête d'IA d'après le contexte du stock
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function query(Request $request)
    {
        // Global try/catch pour capturer TOUTES les erreurs
        try {
            // Validation
            $validated = $request->validate([
                'question' => 'required|string|max:500',
            ]);

            $question = $validated['question'];
            $user = $request->user();

            \Log::info('AI Chat - Requête reçue', ['question' => $question]);

            // 1. Récupérer le contexte
            $context = $this->buildContext();
            \Log::info('AI Chat - Contexte construit', ['alerts' => $context['stats']['low_stock_count']]);

            // 2. Générer la réponse
            $response = $this->generateResponse($question, $context);
            \Log::info('AI Chat - Réponse générée', ['model' => $response['model']]);

            return response()->json([
                'question' => $question,
                'response' => $response['text'],
                'context_summary' => $response['summary'],
                'ai_model' => $response['model'],
                'timestamp' => now(),
            ]);

        } catch (\Exception $e) {
            \Log::error('AI Chat - Erreur', [
                'exception' => class_basename($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'error' => 'Erreur lors du traitement de la requête',
                'message' => $e->getMessage(),
                'exception' => class_basename($e),
                'in_file' => $e->getFile() . ':' . $e->getLine(),
            ], 500);
        }
    }

    /**
     * Construire le contexte à partir des données d'inventaire
     * 
     * @return array
     */
    private function buildContext(): array
    {
        try {
            // 1. Alertes de stock (produits avec quantité <= seuil)
            $alerts = Variante::with('produit')
                ->whereColumn('quantite_actuelle', '<=', 'seuil_alerte')
                ->orderBy('quantite_actuelle', 'asc')
                ->take(10)
                ->get()
                ->map(fn($v) => [
                    'nom' => $v->produit->nom ?? 'Unknown',
                    'image_url' => $v->produit->image_url ?? null,
                    'taille_couleur' => "{$v->taille}/{$v->couleur}",
                    'stock_actuel' => $v->quantite_actuelle,
                    'seuil' => $v->seuil_alerte,
                    'difference' => $v->seuil_alerte - $v->quantite_actuelle,
                ]);

            // 2. Top 5 derniers mouvements
            $movements = MouvementStock::with(['variante.produit', 'utilisateur'])
                ->orderBy('date', 'desc')
                ->take(5)
                ->get()
                ->map(fn($m) => [
                    'type' => $m->type,
                    'quantite' => $m->quantite,
                    'produit' => $m->variante->produit->nom ?? 'Unknown',
                    'image_url' => $m->variante->produit->image_url ?? null,
                    'date' => optional($m->date)->format('Y-m-d H:i') ?? 'N/A',
                    'utilisateur' => $m->utilisateur->name ?? 'System',
                ]);

            // 3. Total de produits et statistiques
            $totalProducts = Produit::count();
            $totalVariantes = Variante::count();
            $alertCount = $alerts->count();
            $avgStock = Variante::avg('quantite_actuelle') ?? 0;

            return [
                'alerts' => $alerts,
                'movements' => $movements,
                'stats' => [
                    'total_products' => $totalProducts,
                    'total_variantes' => $totalVariantes,
                    'low_stock_count' => $alertCount,
                    'average_stock' => round((float)$avgStock, 2),
                ],
            ];
        } catch (\Exception $e) {
            \Log::error('buildContext error', ['message' => $e->getMessage()]);
            // Retour avec contexte vide si erreur
            return [
                'alerts' => [],
                'movements' => [],
                'stats' => [
                    'total_products' => 0,
                    'total_variantes' => 0,
                    'low_stock_count' => 0,
                    'average_stock' => 0,
                ],
            ];
        }
    }

    /**
     * Générer une réponse intelligente
     * Priorité: Ollama (local) → Groq (gratuit) → OpenAI → Smart Templates
     * 
     * @param string $question
     * @param array $context
     * @return array
     */
    private function generateResponse(string $question, array $context): array
    {
        // Déterminer le type de requête
        $questionLower = strtolower($question);

        // 1. PRIORITÉ 1: Ollama (local, autonome, pas de clé API)
        \Log::info('AI Chat - Tentative Ollama');
        try {
            return $this->generateOllamaResponse($question, $context);
        } catch (\Exception $e) {
            \Log::warning('AI Chat - Ollama échoue, essai Groq', ['error' => $e->getMessage()]);
            // Continuer vers Groq
        }

        // 2. PRIORITÉ 2: Groq (API gratuite avec Llama 3)
        if ($this->hasGroqKey()) {
            \Log::info('AI Chat - Tentative Groq');
            try {
                return $this->generateGroqResponse($question, $context);
            } catch (\Exception $e) {
                \Log::warning('AI Chat - Groq échoue, essai OpenAI', ['error' => $e->getMessage()]);
                // Continuer vers OpenAI
            }
        }

        // 3. PRIORITÉ 3: OpenAI
        if ($this->hasOpenAIKey()) {
            \Log::info('AI Chat - Tentative OpenAI');
            try {
                return $this->generateOpenAIResponse($question, $context);
            } catch (\Exception $e) {
                \Log::warning('AI Chat - OpenAI échoue, fallback Smart Templates', ['error' => $e->getMessage()]);
                return $this->generateSmartTemplateResponse($question, $context);
            }
        }

        // 4. FALLBACK: Smart Templates (pas de dépendance externe)
        \Log::info('AI Chat - Utilisation Smart Templates (toutes les APIs indisponibles)');
        return $this->generateSmartTemplateResponse($question, $context);
    }

    /**
     * Utiliser Ollama (LLM local) pour une réponse intelligente
     * L'infrastructure est 100% autonome et ne dépend d'aucune clé API externe
     * 
     * @param string $question
     * @param array $context
     * @return array
     * @throws \Exception
     */
    private function generateOllamaResponse(string $question, array $context): array
    {
        $ollamaUrl = env('OLLAMA_URL', 'http://ollama:11434');
        $model = env('OLLAMA_MODEL', 'phi3');

        if (empty($ollamaUrl)) {
            throw new \Exception('OLLAMA_URL is not configured');
        }

        // Construire le prompt système avec contexte
        $systemPrompt = $this->buildSystemPrompt($context);

        try {
            \Log::info('AI Chat - Ollama request', [
                'ollama_url' => $ollamaUrl,
                'model' => $model,
            ]);

            // Appel à l'API Ollama locale
            // Format: POST http://ollama:11434/api/generate ou /api/chat
            $response = Http::timeout(30)->post("{$ollamaUrl}/api/generate", [
                'model' => $model,
                'prompt' => "System:\n{$systemPrompt}\n\nUser:\n{$question}",
                'stream' => false,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                $message = $responseData['response'] ?? '';

                if (empty($message)) {
                    throw new \Exception('Ollama returned empty response');
                }

                // Nettoyer la réponse (supprimer les tokens spéciaux)
                $message = trim($message);

                \Log::info('AI Chat - Ollama response received', [
                    'model' => $model,
                    'response_length' => strlen($message),
                ]);

                return [
                    'text' => $message,
                    'summary' => $this->generateContextSummary($context),
                    'model' => "ollama-{$model}",
                ];
            }

            // Si Ollama retourne une erreur HTTP
            $statusCode = $response->status();
            $errorMsg = $response->json('error', 'Unknown Ollama error');
            \Log::error('Ollama API error - HTTP ' . $statusCode, [
                'error_message' => $errorMsg,
                'response_body' => $response->body(),
            ]);
            throw new \Exception("Ollama API error (HTTP {$statusCode}): {$errorMsg}");

        } catch (\Exception $e) {
            \Log::error('Ollama exception', [
                'message' => $e->getMessage(),
                'exception' => class_basename($e),
            ]);
            throw $e;
        }
    }

    /**
    private function generateGroqResponse(string $question, array $context): array
    {
        $apiKey = env('GROQ_API_KEY');
        
        if (empty($apiKey)) {
            throw new \Exception('GROQ_API_KEY is not configured');
        }

        // Préparer le prompt pour Groq (même format que OpenAI)
        $systemPrompt = $this->buildSystemPrompt($context);
        
        try {
            $response = Http::timeout(10)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.1-8b-instant',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt,
                    ],
                    [
                        'role' => 'user',
                        'content' => $question,
                    ],
                ],
                'temperature' => 0.7,
                'max_tokens' => 500,
            ]);

            if ($response->successful()) {
                $message = $response->json('choices.0.message.content', '');
                \Log::info('AI Chat - Groq réponse reçue');
                return [
                    'text' => $message,
                    'summary' => $this->generateContextSummary($context),
                    'model' => 'groq-llama3',
                ];
            }

            // Si Groq retourne une erreur HTTP
            $statusCode = $response->status();
            $errorMsg = $response->json('error.message', 'Unknown Groq error');
            \Log::error('Groq API error - HTTP ' . $statusCode, [
                'error_message' => $errorMsg,
                'response_body' => $response->body(),
            ]);
            throw new \Exception("Groq API error (HTTP {$statusCode}): {$errorMsg}");

        } catch (\Exception $e) {
            \Log::error('Groq exception: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Utiliser OpenAI pour une réponse intelligente
     * 
     * @param string $question
     * @param array $context
     * @return array
     * @throws \Exception
     */
    private function generateOpenAIResponse(string $question, array $context): array
    {
        $apiKey = env('OPENAI_API_KEY');
        
        if (empty($apiKey)) {
            throw new \Exception('OPENAI_API_KEY is not configured');
        }

        // Préparer le prompt pour OpenAI
        $systemPrompt = $this->buildSystemPrompt($context);
        
        try {
            $response = Http::timeout(10)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt,
                    ],
                    [
                        'role' => 'user',
                        'content' => $question,
                    ],
                ],
                'temperature' => 0.7,
                'max_tokens' => 500,
            ]);

            if ($response->successful()) {
                $message = $response->json('choices.0.message.content', '');
                \Log::info('AI Chat - OpenAI réponse reçue');
                return [
                    'text' => $message,
                    'summary' => $this->generateContextSummary($context),
                    'model' => 'openai-gpt3.5',
                ];
            }

            // Si OpenAI retourne une erreur
            $errorMsg = $response->json('error.message', 'Unknown OpenAI error');
            \Log::warning('OpenAI error', ['status' => $response->status(), 'error' => $errorMsg]);
            throw new \Exception("OpenAI API error: {$errorMsg}");

        } catch (\Exception $e) {
            \Log::error('OpenAI exception', ['message' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Générer une réponse avec Smart Templates
     * 
     * @param string $question
     * @param array $context
     * @return array
     */
    private function generateSmartTemplateResponse(string $question, array $context): array
    {
        $questionLower = strtolower($question);
        $stats = $context['stats'];
        $alerts = $context['alerts'];
        $movements = $context['movements'];

        // Déterminer le type de requête
        if ($this->matchesPattern($questionLower, ['résumé', 'resume', 'summary', 'apercu', 'status', 'état'])) {
            return [
                'text' => $this->buildSummaryResponse($context),
                'summary' => $this->generateContextSummary($context),
                'model' => 'smart-templates',
            ];
        }

        if ($this->matchesPattern($questionLower, ['alertes', 'comando', 'commander', 'stock bas', 'restock', 'faible', 'low'])) {
            return [
                'text' => $this->buildAlertResponse($context),
                'summary' => $this->generateContextSummary($context),
                'model' => 'smart-templates',
            ];
        }

        if ($this->matchesPattern($questionLower, ['mouvement', 'historique', 'history', 'activité', 'recent'])) {
            return [
                'text' => $this->buildMovementResponse($context),
                'summary' => $this->generateContextSummary($context),
                'model' => 'smart-templates',
            ];
        }

        if ($this->matchesPattern($questionLower, ['statistiques', 'stats', 'nombre', 'combien', 'total'])) {
            return [
                'text' => $this->buildStatsResponse($context),
                'summary' => $this->generateContextSummary($context),
                'model' => 'smart-templates',
            ];
        }

        // Réponse par défaut générique
        return [
            'text' => $this->buildGenericResponse($question, $context),
            'summary' => $this->generateContextSummary($context),
            'model' => 'smart-templates',
        ];
    }

    /**
     * Construire le prompt système pour OpenAI
     * 
     * @param array $context
     * @return string
     */
    private function buildSystemPrompt(array $context): string
    {
        $stats = $context['stats'];
        $alertsText = $this->formatAlertsForPrompt($context['alerts']);
        $movementsText = $this->formatMovementsForPrompt($context['movements']);

        return <<<PROMPT
Tu es un assistant IA spécialisé en gestion d'inventaire B2B.

Contexte actuel du système :
- Total de produits : {$stats['total_products']}
- Total de variantes : {$stats['total_variantes']}
- Stock moyen : {$stats['average_stock']} unités
- Alertes actives : {$stats['low_stock_count']}

Produits en alerte (stock faible) :
{$alertsText}

5 derniers mouvements de stock :
{$movementsText}

Tu dois :
1. Analyser les questions sur l'inventaire
2. Donner des recommandations pragmatiques et précises
3. Utiliser les données fournies pour justifier tes réponses
4. Être concis et actionnable
5. Proposer des commandes si nécessaire

**IMPORTANT - Instructions sur les images:**
Quand tu mentionnes un produit, tu DOIS TOUJOURS ecrire explicitement son nom en gras dans le texte, suivi immediatement de son image en Markdown sur une nouvelle ligne (ou a cote).
Format obligatoire : **Nom du produit**
![Image](URL_DE_L_IMAGE)

Le nom du produit ne doit jamais etre uniquement dans le texte alternatif de l'image.

Réponds en français, de manière professionnelle.
PROMPT;
    }

    /**
     * Formater les alertes pour le prompt OpenAI
     * 
     * @param \Illuminate\Support\Collection $alerts
     * @return string
     */
    private function formatAlertsForPrompt($alerts): string
    {
        if ($alerts->isEmpty()) {
            return "Aucune alerte pour le moment.";
        }

        return $alerts->map(function($a) {
            $imageMarkdown = $a['image_url'] ? '![' . $a['nom'] . '](' . $a['image_url'] . ')' : '';
            return "- " . $a['nom'] . " (" . $a['taille_couleur'] . "): " . $a['stock_actuel'] . "/" .
                   $a['seuil'] . " (manque " . $a['difference'] . " unités)\n  " . $imageMarkdown;
        })->join("\n");
    }

    /**
     * Formater les mouvements pour le prompt OpenAI
     * 
     * @param \Illuminate\Support\Collection $movements
     * @return string
     */
    private function formatMovementsForPrompt($movements): string
    {
        if ($movements->isEmpty()) {
            return "Aucun mouvement récent.";
        }

        return $movements->map(fn($m) => 
            "- [{$m['date']}] {$m['type']}: {$m['quantite']} unités de {$m['produit']} " .
            "(par {$m['utilisateur']})"
        )->join("\n");
    }

    /**
     * Construire réponse Résumé
     * 
     * @param array $context
     * @return string
     */
    private function buildSummaryResponse(array $context): string
    {
        $stats = $context['stats'];
        $alertCount = $stats['low_stock_count'];

        if ($alertCount === 0) {
            return "✅ **Résumé de l'Inventaire**\n\n" .
                   "Excellent! Votre inventaire est en bon état.\n\n" .
                   "- **Produits totaux**: {$stats['total_products']}\n" .
                   "- **Variantes**: {$stats['total_variantes']}\n" .
                   "- **Stock moyen**: {$stats['average_stock']} unités\n" .
                   "- **Alertes**: Aucune ✅\n\n" .
                   "Aucun restock urgent nécessaire pour le moment.";
        }

        return "⚠️ **Résumé de l'Inventaire**\n\n" .
               "Vous avez **{$alertCount} produits en alerte** (stock faible).\n\n" .
               "**Action recommandée**: Vérifier les produits listés et passer des commandes.\n\n" .
               "- **Produits totaux**: {$stats['total_products']}\n" .
               "- **Variantes**: {$stats['total_variantes']}\n" .
               "- **Alertes actives**: {$alertCount}\n" .
               "- **Stock moyen**: {$stats['average_stock']} unités\n\n" .
               "Voulez-vous que je vous montre les détails des alertes?";
    }

    /**
     * Construire réponse Alertes
     * 
     * @param array $context
     * @return string
     */
    private function buildAlertResponse(array $context): string
    {
        $alerts = $context['alerts'];
        $stats = $context['stats'];

        if ($alerts->isEmpty()) {
            return "✅ Pas d'alerte actuellement. Votre inventaire est en bon état!";
        }

        $alertsList = $alerts->map(fn($a) => 
            "- **{$a['nom']}** ({$a['taille_couleur']}): " .
            "{$a['stock_actuel']}/{$a['seuil']} (manque {$a['difference']} unités)"
        )->join("\n");

        return "🔴 **Produits en Alerte ({$stats['low_stock_count']} total)**\n\n" .
               $alertsList . "\n\n" .
               "**Recommandation**: Commander au moins les quantités manquantes pour atteindre les seuils.";
    }

    /**
     * Construire réponse Mouvements
     * 
     * @param array $context
     * @return string
     */
    private function buildMovementResponse(array $context): string
    {
        $movements = $context['movements'];

        if ($movements->isEmpty()) {
            return "Aucun mouvement de stock récent.";
        }

        $movementsList = $movements->map(fn($m) => 
            "- **[{$m['date']}]** {$m['type']}: {$m['quantite']} unités de " .
            "**{$m['produit']}** (par {$m['utilisateur']})"
        )->join("\n");

        return "📊 **5 Derniers Mouvements**\n\n" . $movementsList;
    }

    /**
     * Construire réponse Statistiques
     * 
     * @param array $context
     * @return string
     */
    private function buildStatsResponse(array $context): string
    {
        $stats = $context['stats'];

        return "📈 **Statistiques d'Inventaire**\n\n" .
               "- **Total de produits**: {$stats['total_products']}\n" .
               "- **Total de variantes**: {$stats['total_variantes']}\n" .
               "- **Stock moyen**: {$stats['average_stock']} unités\n" .
               "- **Alertes actives**: {$stats['low_stock_count']}\n" .
               "- **Taux de couverture**: " .
               ($stats['low_stock_count'] === 0 ? "100% ✅" : 
                round((1 - $stats['low_stock_count'] / $stats['total_variantes']) * 100) . "%");
    }

    /**
     * Construire réponse Générique
     * 
     * @param string $question
     * @param array $context
     * @return string
     */
    private function buildGenericResponse(string $question, array $context): string
    {
        return "Je suis l'assistant IA de gestion d'inventaire StockFlow.\n\n" .
               "Je peux vous aider avec:\n" .
               "- ✅ **Résumé** de l'inventaire\n" .
               "- 🔴 **Alertes** (produits à restock)\n" .
               "- 📊 **Statistiques** de stock\n" .
               "- 📈 **Historique** des mouvements\n\n" .
               "Votre question: \"" . htmlspecialchars($question) . "\"\n\n" .
               "Essayez une des catégories ci-dessus pour une réponse ciblée!";
    }

    /**
     * Générer un résumé du contexte
     * 
     * @param array $context
     * @return array
     */
    private function generateContextSummary(array $context): array
    {
        $stats = $context['stats'];
        $alerts = $context['alerts'];
        $movements = $context['movements'];

        return [
            'products_monitored' => $stats['total_variantes'],
            'alerts_active' => $stats['low_stock_count'],
            'average_stock_level' => $stats['average_stock'],
            'recent_movements' => $movements->count(),
            'critical_products' => $alerts->where('difference', '>', 5)->count(),
        ];
    }

    /**
     * Vérifier si Ollama est disponible
     *
     * @return bool
     */
    private function hasOllamaUrl(): bool
    {
        return !empty(env('OLLAMA_URL'));
    }

    /**
     * Vérifier si Groq est disponible
     *
     * @return bool
     */
    private function hasGroqKey(): bool
    {
        return !empty(env('GROQ_API_KEY'));
    }

    /**
     * Vérifier si OpenAI est disponible
     * 
     * @return bool
     */
    private function hasOpenAIKey(): bool
    {
        return !empty(env('OPENAI_API_KEY'));
    }

    /**
     * Vérifier si la question correspond à certains patterns
     * 
     * @param string $text
     * @param array $patterns
     * @return bool
     */
    private function matchesPattern(string $text, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            if (str_contains($text, strtolower($pattern))) {
                return true;
            }
        }
        return false;
    }
}
