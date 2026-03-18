#!/bin/bash

# Script d'initialisation Ollama
# Télécharge automatiquement les modèles LLM au premier démarrage

echo "🤖 Ollama Initialization Script"
echo "================================"

# Configuration
OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"
MODEL="${OLLAMA_MODEL:-phi3}"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "📍 Ollama Host: $OLLAMA_HOST"
echo "📚 Model: $MODEL"

# Fonction pour vérifier la disponibilité d'Ollama
check_ollama_ready() {
    curl -s "$OLLAMA_HOST/api/tags" > /dev/null 2>&1
    return $?
}

# Fonction pour télécharger un modèle
pull_model() {
    local model=$1
    echo "📥 Downloading model: $model"
    
    curl -X POST "$OLLAMA_HOST/api/pull" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$model\"}" \
        -f
    
    if [ $? -eq 0 ]; then
        echo "✅ Model $model downloaded successfully"
        return 0
    else
        echo "❌ Failed to download model $model"
        return 1
    fi
}

# Fonction pour vérifier si un modèle est déjà présent
model_exists() {
    local model=$1
    local tags=$(curl -s "$OLLAMA_HOST/api/tags" | grep -o "\"name\":\"[^\"]*\"" | grep "$model")
    
    if [ -z "$tags" ]; then
        return 1  # Modèle n'existe pas
    else
        return 0  # Modèle existe
    fi
}

# Attendre qu'Ollama soit prêt
echo "⏳ Waiting for Ollama to be ready..."
retry_count=0

while [ $retry_count -lt $MAX_RETRIES ]; do
    if check_ollama_ready; then
        echo "✅ Ollama is ready!"
        break
    fi
    
    retry_count=$((retry_count + 1))
    echo "⏳ Retrying... ($retry_count/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
done

if [ $retry_count -ge $MAX_RETRIES ]; then
    echo "❌ Ollama failed to start after $MAX_RETRIES attempts"
    exit 1
fi

# Vérifier et télécharger le modèle s'il n'existe pas
echo "🔍 Checking if model '$MODEL' is available..."

if model_exists "$MODEL"; then
    echo "✅ Model '$MODEL' is already available"
else
    echo "📥 Model '$MODEL' not found, downloading..."
    
    if pull_model "$MODEL"; then
        echo "✅ Successfully pulled model '$MODEL'"
    else
        echo "⚠️  Failed to pull model '$MODEL', trying fallback (phi3)..."
        
        if [ "$MODEL" != "phi3" ]; then
            pull_model "phi3"
        else
            echo "❌ Could not pull any model"
            exit 1
        fi
    fi
fi

# Test du modèle
echo "🧪 Testing model..."
response=$(curl -s -X POST "$OLLAMA_HOST/api/generate" \
    -H "Content-Type: application/json" \
    -d "{
        \"model\":\"$MODEL\",
        \"prompt\":\"Test\",
        \"stream\":false
    }")

if echo "$response" | grep -q '"response"'; then
    echo "✅ Model is working correctly!"
else
    echo "⚠️  Model test response received (stream mode)"
fi

echo ""
echo "✅ Ollama initialization complete!"
echo "   Model: $MODEL"
echo "   API: $OLLAMA_HOST"
echo "   Ready for use by StockFlow backend"
echo ""

# Garder le script en attente
wait
