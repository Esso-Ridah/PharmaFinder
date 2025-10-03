# Guide de Déploiement - PharmaFinder

Ce guide vous accompagne dans le déploiement de PharmaFinder, de l'environnement de développement local à la production.

## 📋 Prérequis

### Système
- **Docker** et **Docker Compose** (v2.0+)
- **Git**
- **Make** (optionnel, pour les commandes simplifiées)
- **Node.js** 18+ (pour le développement local)
- **Python** 3.11+ (pour le développement local)
- **PostgreSQL** 15+ (pour l'installation manuelle)

### Services externes
- **Compte AWS** (pour S3 et déploiement)
- **Stripe** (pour les paiements)
- **PayPal Developer** (pour les paiements)
- **Google Cloud** (pour Google Maps API)

## 🚀 Déploiement Local (Développement)

### 1. Cloner le projet
```bash
git clone https://github.com/votre-organisation/pharmafinder.git
cd pharmafinder
```

### 2. Configuration rapide
```bash
# Configuration automatique avec Make
make dev-setup

# OU configuration manuelle
make setup-env
# Puis modifier les fichiers .env créés
```

### 3. Variables d'environnement

Copiez et modifiez les fichiers d'environnement :

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend  
cp frontend/.env.local.example frontend/.env.local
```

**Variables essentielles à configurer :**
```env
# Database
DATABASE_URL=postgresql://pharma_user:pharma_pass@localhost:5432/pharmafinder_db

# JWT Secret (générez une clé sécurisée)
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Google Maps (obligatoire pour la géolocalisation)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe (pour les paiements)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Démarrage des services
```bash
# Avec Make (recommandé)
make start

# Ou avec Docker Compose directement
docker-compose up -d postgres redis
sleep 10  # Attendre que la DB soit prête
docker-compose up backend frontend
```

### 5. Vérification
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs
- **Base de données** : `localhost:5432`

## 🏥 Comptes de test

Le projet inclut des données de démonstration :

### Clients
- **Email** : `kofi.asante@gmail.com` 
- **Mot de passe** : `password123`

### Pharmaciens
- **Email** : `dr.mensah@pharmacielome.tg`
- **Mot de passe** : `password123`

### Administrateur
- **Email** : `admin@pharmafinder.tg`
- **Mot de passe** : `password123`

## 🌐 Déploiement en Production

### 1. Serveur de production

**Spécifications minimales :**
- **CPU** : 2 vCPUs
- **RAM** : 4 GB
- **Stockage** : 50 GB SSD
- **OS** : Ubuntu 20.04+ ou CentOS 8+

### 2. Installation des dépendances

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installation de Docker Compose
sudo apt install docker-compose-plugin

# Installation de certbot (pour SSL)
sudo apt install certbot
```

### 3. Configuration SSL

```bash
# Générer certificats Let's Encrypt
sudo certbot certonly --standalone -d pharmafinder.tg -d www.pharmafinder.tg

# Copier les certificats
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/pharmafinder.tg/fullchain.pem nginx/ssl/pharmafinder.tg.crt
sudo cp /etc/letsencrypt/live/pharmafinder.tg/privkey.pem nginx/ssl/pharmafinder.tg.key
sudo chown -R $USER:$USER nginx/ssl
```

### 4. Variables de production

Créez un fichier `.env` pour la production :

```env
# Application
DEBUG=False
SECRET_KEY=VOTRE_CLE_PRODUCTION_SUPER_SECURISEE

# Database (utilisez un serveur PostgreSQL dédié en production)
DATABASE_URL=postgresql://pharma_user:MOTDEPASSE_SECURISE@db.pharmafinder.tg:5432/pharmafinder_prod

# Redis (utilisez un serveur Redis dédié)
REDIS_URL=redis://redis.pharmafinder.tg:6379

# AWS S3 (obligatoire pour les prescriptions)
AWS_ACCESS_KEY_ID=VOTRE_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=VOTRE_AWS_SECRET_KEY
AWS_S3_BUCKET=pharmafinder-prescriptions-prod
AWS_S3_REGION=eu-west-1

# Paiements (clés de production)
STRIPE_SECRET_KEY=sk_live_votre_cle_stripe_production
STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_stripe_production
PAYPAL_CLIENT_ID=votre_paypal_client_id_production
PAYPAL_CLIENT_SECRET=votre_paypal_secret_production
PAYPAL_MODE=live

# Email (pour notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@pharmafinder.tg
SMTP_PASSWORD=votre_mot_de_passe_app

# URLs de production
NEXT_PUBLIC_API_URL=https://pharmafinder.tg/api
CORS_ORIGINS=https://pharmafinder.tg,https://www.pharmafinder.tg
```

### 5. Déploiement

```bash
# Cloner le projet sur le serveur
git clone https://github.com/votre-organisation/pharmafinder.git
cd pharmafinder

# Configuration SSL
make setup-ssl

# Déploiement production
make deploy-prod

# Vérifier les services
make health
```

### 6. Configuration Nginx

Si vous n'utilisez pas notre configuration Nginx, voici un exemple minimal :

```nginx
server {
    listen 443 ssl http2;
    server_name pharmafinder.tg www.pharmafinder.tg;

    ssl_certificate /etc/ssl/pharmafinder.tg.crt;
    ssl_certificate_key /etc/ssl/pharmafinder.tg.key;

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 Configuration des Services Externes

### Google Maps API
1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com)
2. Activer les APIs : Maps JavaScript API, Geocoding API, Places API
3. Créer une clé API et la configurer avec des restrictions de domaine
4. Ajouter la clé dans les variables d'environnement

### Stripe
1. Créer un compte sur [Stripe](https://stripe.com)
2. Récupérer les clés API (test et production)
3. Configurer les webhooks si nécessaire
4. Ajouter les clés dans les variables d'environnement

### PayPal
1. Créer un compte développeur sur [PayPal Developer](https://developer.paypal.com)
2. Créer une application et récupérer Client ID/Secret
3. Configurer les URLs de retour
4. Ajouter les credentials dans les variables d'environnement

### AWS S3
1. Créer un bucket S3 pour les prescriptions
2. Configurer les permissions IAM appropriées
3. Créer un utilisateur IAM avec accès au bucket
4. Ajouter les credentials dans les variables d'environnement

## 📊 Monitoring et Maintenance

### Logs
```bash
# Voir tous les logs
make logs

# Logs spécifiques
make logs-backend
make logs-frontend
make logs-db
```

### Sauvegarde
```bash
# Sauvegarde automatique
make db-backup

# Restauration
docker-compose exec postgres psql -U pharma_user -d pharmafinder_db < backup_file.sql
```

### Mise à jour
```bash
# Mise à jour du code
git pull origin main

# Redéploiement
make restart
```

### Monitoring des services
```bash
# Vérifier la santé des services
make health

# Statistiques d'utilisation
make stats
```

## 🚨 Dépannage

### Problèmes courants

#### Backend ne démarre pas
```bash
# Vérifier les logs
make logs-backend

# Vérifier la connexion DB
make db-shell
```

#### Frontend ne charge pas
```bash
# Vérifier les variables d'environnement
cat frontend/.env.local

# Reconstruire le container
docker-compose build frontend
```

#### Base de données inaccessible
```bash
# Réinitialiser la base de données
make db-reset

# Vérifier l'état de PostgreSQL
docker-compose logs postgres
```

#### Problèmes SSL
```bash
# Vérifier les certificats
sudo certbot certificates

# Renouveler les certificats
sudo certbot renew
```

### Ports utilisés
- **3000** : Frontend Next.js
- **8000** : Backend FastAPI
- **5432** : PostgreSQL
- **6379** : Redis
- **80/443** : Nginx (production)

### Support
Pour obtenir de l'aide :
1. Vérifier les logs avec `make logs`
2. Consulter la documentation API : http://localhost:8000/docs
3. Ouvrir une issue sur le repository GitHub

---

## 🔐 Sécurité en Production

### Checklist de sécurité
- [ ] Modifier tous les mots de passe par défaut
- [ ] Configurer SSL/TLS avec certificats valides
- [ ] Activer le firewall et fermer les ports inutiles
- [ ] Configurer les sauvegardes automatiques
- [ ] Mettre en place la surveillance des logs
- [ ] Configurer les notifications d'erreur
- [ ] Tester les procédures de récupération

### Mises à jour de sécurité
```bash
# Mise à jour régulière du système
sudo apt update && sudo apt upgrade -y

# Mise à jour des containers Docker
docker-compose pull
make restart
```