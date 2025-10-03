#!/bin/bash

# PharmaFinder Quick Start Script
# Démarrage rapide de l'environnement de développement

echo "🏥 Démarrage de PharmaFinder..."

# Vérifier si les ports sont disponibles
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Le port $port est déjà utilisé"
        return 1
    else
        echo "✅ Port $port disponible"
        return 0
    fi
}

# Fonction pour démarrer le backend
start_backend() {
    echo "🔧 Démarrage du backend FastAPI..."
    cd backend
    if [ ! -f ".env" ]; then
        echo "📝 Création du fichier .env backend..."
        cp .env.example .env
    fi
    
    # Démarrer le backend en arrière-plan
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo "✅ Backend démarré (PID: $BACKEND_PID) sur http://localhost:8000"
    cd ..
}

# Fonction pour démarrer le frontend
start_frontend() {
    echo "🎨 Démarrage du frontend Next.js..."
    cd frontend
    
    if [ ! -f ".env.local" ]; then
        echo "📝 Création du fichier .env.local frontend..."
        cp .env.local.example .env.local
    fi
    
    # Installer les dépendances si nécessaire
    if [ ! -d "node_modules" ]; then
        echo "📦 Installation des dépendances frontend..."
        npm install
    fi
    
    # Démarrer le frontend
    if check_port 3000; then
        echo "🚀 Démarrage sur le port 3000..."
        npm run dev -- -p 3000 &
        FRONTEND_PID=$!
        echo "✅ Frontend démarré (PID: $FRONTEND_PID) sur http://localhost:3000"
    else
        echo "🚀 Démarrage sur le port 3001..."
        npm run dev -- -p 3001 &
        FRONTEND_PID=$!
        echo "✅ Frontend démarré (PID: $FRONTEND_PID) sur http://localhost:3001"
    fi
    cd ..
}

# Fonction pour arrêter les services
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend arrêté"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend arrêté"
    fi
    echo "👋 PharmaFinder arrêté"
    exit 0
}

# Capturer Ctrl+C pour nettoyer
trap cleanup INT

# Vérifier les prérequis
echo "🔍 Vérification des prérequis..."

if ! command -v python &> /dev/null; then
    echo "❌ Python n'est pas installé"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ Tous les prérequis sont installés"

# Vérifier les ports
echo ""
echo "🔍 Vérification des ports..."
check_port 8000
if [ $? -eq 1 ]; then
    echo "❌ Le port 8000 (backend) est déjà utilisé. Veuillez l'arrêter avant de continuer."
    exit 1
fi

# Démarrer les services
echo ""
start_backend
sleep 2  # Attendre que le backend démarre
start_frontend

echo ""
echo "🎉 PharmaFinder est maintenant démarré !"
echo ""
echo "🌐 Accès aux services :"
if check_port 3000; then
    echo "   Frontend: http://localhost:3000"
else
    echo "   Frontend: http://localhost:3001"
fi
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "👥 Comptes de test :"
echo "   Client:     kofi.asante@gmail.com / password123"
echo "   Pharmacien: dr.mensah@pharmacielome.tg / password123"
echo "   Admin:      admin@pharmafinder.tg / password123"
echo ""
echo "⌨️  Appuyez sur Ctrl+C pour arrêter tous les services"

# Attendre indéfiniment (les services tournent en arrière-plan)
while true; do
    sleep 1
done