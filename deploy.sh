#!/bin/bash

# ==============================================
# PharmaFinder - Script de Déploiement Automatique
# Version: 1.0.0
# Pour: AWS Lightsail / Ubuntu 20.04+
# ==============================================

set -e  # Exit on error

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${BLUE}==== $1 ====${NC}"
}

# Vérifier si le script est exécuté en tant que root
if [ "$EUID" -eq 0 ]; then
    print_error "Ne pas exécuter ce script en tant que root"
    exit 1
fi

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║     PharmaFinder Deployment Script       ║
║              Version 1.0.0                ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Variables
INSTALL_DIR="$HOME/PharmaFinder"
REPO_URL="https://github.com/Esso-Ridah/PharmaFinder.git"
USE_DOCKER=true

# Détection du mode d'installation
echo ""
print_info "Choisissez votre mode d'installation:"
echo "  1) Docker (Recommandé - Installation rapide)"
echo "  2) Manuel (PM2 + Nginx)"
read -p "Entrez votre choix [1-2]: " install_choice

case $install_choice in
    1)
        USE_DOCKER=true
        print_success "Mode Docker sélectionné"
        ;;
    2)
        USE_DOCKER=false
        print_success "Mode manuel sélectionné"
        ;;
    *)
        print_error "Choix invalide"
        exit 1
        ;;
esac

# ===== ÉTAPE 1: Mise à jour du système =====
print_step "ÉTAPE 1: Mise à jour du système"
sudo apt update
sudo apt upgrade -y
print_success "Système mis à jour"

# ===== ÉTAPE 2: Installation des prérequis =====
print_step "ÉTAPE 2: Installation des prérequis"

# Git
if ! command -v git &> /dev/null; then
    print_info "Installation de Git..."
    sudo apt install -y git
    print_success "Git installé"
else
    print_success "Git déjà installé"
fi

# Curl
if ! command -v curl &> /dev/null; then
    print_info "Installation de Curl..."
    sudo apt install -y curl
    print_success "Curl installé"
else
    print_success "Curl déjà installé"
fi

# SQLite3 (toujours nécessaire pour l'initialisation de la base)
if ! command -v sqlite3 &> /dev/null; then
    print_info "Installation de SQLite3..."
    sudo apt install -y sqlite3
    print_success "SQLite3 installé"
else
    print_success "SQLite3 déjà installé"
fi

if [ "$USE_DOCKER" = true ]; then
    # ===== Installation Docker =====
    print_step "Installation de Docker"

    if ! command -v docker &> /dev/null; then
        print_info "Installation de Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        print_success "Docker installé"
    else
        print_success "Docker déjà installé"
    fi

    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_info "Installation de Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installé"
    else
        print_success "Docker Compose déjà installé"
    fi
else
    # ===== Installation manuelle =====
    # Python
    print_info "Installation de Python 3..."
    sudo apt install -y python3 python3-pip python3-venv sqlite3
    print_success "Python installé"

    # Node.js
    if ! command -v node &> /dev/null; then
        print_info "Installation de Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
        print_success "Node.js installé"
    else
        print_success "Node.js déjà installé"
    fi

    # PM2
    if ! command -v pm2 &> /dev/null; then
        print_info "Installation de PM2..."
        sudo npm install -g pm2
        print_success "PM2 installé"
    else
        print_success "PM2 déjà installé"
    fi
fi

# ===== ÉTAPE 3: Clonage du repository =====
print_step "ÉTAPE 3: Clonage du repository"

if [ -d "$INSTALL_DIR" ]; then
    print_warning "Le répertoire $INSTALL_DIR existe déjà"
    read -p "Voulez-vous le supprimer et recommencer? [y/N]: " confirm
    if [[ $confirm == [yY] ]]; then
        rm -rf "$INSTALL_DIR"
        print_info "Répertoire supprimé"
    else
        print_error "Installation annulée"
        exit 1
    fi
fi

print_info "Clonage depuis $REPO_URL..."
git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"
print_success "Repository cloné"

# ===== ÉTAPE 4: Configuration des variables d'environnement =====
print_step "ÉTAPE 4: Configuration"

print_info "Configuration du backend..."
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << 'EOF'
# Database
DATABASE_URL=sqlite+aiosqlite:///./pharmafinder.db

# Security
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Payment APIs
STRIPE_SECRET_KEY=sk_test_51SDZ4fPDhCVy2mHYsXoxLZG2bsLPZpyaAU4uzTZFI6Ge3qOrxe51aAuHLaQuGQXquADR6wjBNiw6ATdue7ivzURp00E8WrYFPB
STRIPE_PUBLISHABLE_KEY=pk_test_51SDZ4fPDhCVy2mHYgrg6D80xlKBSGyI0tHUnjcP7i1F7aJ5wrM1GiW7RlFKi5kGf0eQgurijH3eALQUNpc3d9aAx00P6dQkMhG

# App Configuration
APP_NAME=PharmaFinder
APP_VERSION=1.0.0
DEBUG=False
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
EOF
    print_success "Fichier backend/.env créé"
else
    print_success "backend/.env existe déjà"
fi

print_info "Configuration du frontend..."
if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SDZ4fPDhCVy2mHYgrg6D80xlKBSGyI0tHUnjcP7i1F7aJ5wrM1GiW7RlFKi5kGf0eQgurijH3eALQUNpc3d9aAx00P6dQkMhG
EOF
    print_success "Fichier frontend/.env.local créé"
else
    print_success "frontend/.env.local existe déjà"
fi

# ===== ÉTAPE 5: Initialisation de la base de données =====
print_step "ÉTAPE 5: Initialisation de la base de données"

cd backend
if [ -f "../init_production_db.sql" ]; then
    print_info "Création de la base de données..."
    sqlite3 pharmafinder.db < ../init_production_db.sql
    print_success "Base de données initialisée"
else
    print_warning "Script SQL non trouvé, création d'une base vide"
    touch pharmafinder.db
fi

# Créer le dossier uploads
mkdir -p uploads/prescriptions
print_success "Dossier uploads créé"

cd ..

# ===== ÉTAPE 6: Déploiement =====
print_step "ÉTAPE 6: Déploiement de l'application"

if [ "$USE_DOCKER" = true ]; then
    # ===== Déploiement Docker =====
    print_info "Démarrage des conteneurs Docker..."

    # Créer le fichier .env pour docker-compose
    cat > .env << EOF
STRIPE_SECRET_KEY=sk_test_51SDZ4fPDhCVy2mHYsXoxLZG2bsLPZpyaAU4uzTZFI6Ge3qOrxe51aAuHLaQuGQXquADR6wjBNiw6ATdue7ivzURp00E8WrYFPB
STRIPE_PUBLISHABLE_KEY=pk_test_51SDZ4fPDhCVy2mHYgrg6D80xlKBSGyI0tHUnjcP7i1F7aJ5wrM1GiW7RlFKi5kGf0eQgurijH3eALQUNpc3d9aAx00P6dQkMhG
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
EOF

    # Build et démarrage
    docker-compose -f docker-compose.production.yml build
    docker-compose -f docker-compose.production.yml up -d

    print_success "Conteneurs Docker démarrés"

    # Afficher les logs
    print_info "Vérification du démarrage..."
    sleep 10
    docker-compose -f docker-compose.production.yml ps

else
    # ===== Déploiement Manuel =====
    print_info "Configuration du backend..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..

    print_info "Configuration du frontend..."
    cd frontend
    npm install
    npm run build
    cd ..

    print_info "Démarrage des services avec PM2..."

    # Backend
    cd backend
    pm2 start "$(pwd)/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001" --name pharmafinder-backend
    cd ..

    # Frontend
    cd frontend
    pm2 start "npm start" --name pharmafinder-frontend
    cd ..

    # Sauvegarder la configuration PM2
    pm2 save
    pm2 startup

    print_success "Services PM2 démarrés"
fi

# ===== ÉTAPE 7: Configuration du pare-feu =====
print_step "ÉTAPE 7: Configuration du pare-feu"

print_info "Configuration UFW..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
print_success "Pare-feu configuré"

# ===== ÉTAPE 8: Résumé =====
print_step "Installation terminée!"

echo ""
print_success "PharmaFinder a été déployé avec succès!"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌐 URLs d'accès:${NC}"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "   Backend:  http://$(hostname -I | awk '{print $1}'):8001"
echo "   API Docs: http://$(hostname -I | awk '{print $1}'):8001/docs"
echo ""
echo -e "${BLUE}👥 Comptes de test:${NC}"
echo "   Client: test@exemple.com / password123"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$USE_DOCKER" = true ]; then
    echo ""
    print_info "Commandes Docker utiles:"
    echo "   Voir les logs:     docker-compose -f docker-compose.production.yml logs -f"
    echo "   Arrêter:          docker-compose -f docker-compose.production.yml down"
    echo "   Redémarrer:       docker-compose -f docker-compose.production.yml restart"
    echo "   Statut:           docker-compose -f docker-compose.production.yml ps"
else
    echo ""
    print_info "Commandes PM2 utiles:"
    echo "   Voir les logs:     pm2 logs"
    echo "   Statut:           pm2 list"
    echo "   Redémarrer:       pm2 restart all"
    echo "   Arrêter:          pm2 stop all"
fi

echo ""
print_warning "IMPORTANT: Pensez à modifier les variables suivantes en production:"
echo "   - SECRET_KEY dans backend/.env"
echo "   - CORS_ORIGINS pour inclure votre domaine"
echo "   - NEXT_PUBLIC_API_URL pour pointer vers votre domaine"
echo ""

print_success "Profitez de PharmaFinder! 🎉"
