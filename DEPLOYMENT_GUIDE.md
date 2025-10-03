# Guide de Déploiement PharmaFinder v1.0.0

## 📋 Table des matières

1. [Résumé des étapes Git](#résumé-des-étapes-git)
2. [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
3. [Initialisation de la base de données](#initialisation-de-la-base-de-données)
4. [Déploiement sur AWS Lightsail](#déploiement-sur-aws-lightsail)

---

## 🔄 Résumé des étapes Git

### Étapes effectuées pour pousser le code sur GitHub

1. **Initialisation du repository local**
   ```bash
   cd /home/erb/MyApps/Claude.ai/PharmaFinder
   git init
   ```

2. **Création du fichier .gitignore**
   - Exclusion des fichiers sensibles : `.env`, `node_modules/`, `venv/`, `*.db`, etc.
   - Protection des clés API et données sensibles

3. **Ajout de tous les fichiers**
   ```bash
   git add .
   ```

4. **Création du commit initial**
   ```bash
   git commit -m "Initial commit: PharmaFinder v1.0.0

   Fonctionnalités implémentées:
   - Système d'authentification (clients, pharmaciens, admin)
   - Recherche de médicaments avec sponsoring
   - Gestion du panier multi-pharmacies
   - Système de commandes avec paiement Stripe
   - Validation d'ordonnances avec timeout
   - Notifications en temps réel
   - Interface partenaire (analytics, inventaire)
   - Système d'adresses flexibles (moderne, description, GPS)
   - Déduplication des produits sponsorisés
   - Correction des erreurs de paiement 422"
   ```

5. **Ajout du remote GitHub**
   ```bash
   git remote add origin https://github.com/Esso-Ridah/PharmaFinder.git
   ```

6. **Renommage de la branche en main**
   ```bash
   git branch -M main
   ```

7. **Push vers GitHub**
   ```bash
   git push -u origin main
   ```

### Résultat du push

- **✅ 148 fichiers poussés**
- **✅ 34,161 insertions**
- **✅ Repository accessible sur** : https://github.com/Esso-Ridah/PharmaFinder.git

---

## 🔑 Configuration des variables d'environnement

### Fichiers de configuration requis

Deux fichiers `.env` doivent être créés (voir `APIKEYS.md` pour les valeurs complètes) :

#### 1. Backend - `/backend/.env`

```env
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
DEBUG=True
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

#### 2. Frontend - `/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SDZ4fPDhCVy2mHYgrg6D80xlKBSGyI0tHUnjcP7i1F7aJ5wrM1GiW7RlFKi5kGf0eQgurijH3eALQUNpc3d9aAx00P6dQkMhG
```

---

## 🗄️ Initialisation de la base de données

### Utilisation du script SQL fourni

Le fichier `init_production_db.sql` contient toutes les données de démonstration :

```bash
cd backend
sqlite3 pharmafinder.db < ../init_production_db.sql
```

### Données de test incluses

**Utilisateurs :**
- Client : `test@exemple.com` / `password123`
- Pharmacien : Voir dans la base après initialisation
- Admin : Voir dans la base après initialisation

**Données :**
- ✅ Catégories de médicaments
- ✅ ~100+ produits pharmaceutiques
- ✅ 10+ pharmacies de test
- ✅ Inventaire initial pour chaque pharmacie
- ✅ Système de notifications configuré

---

## 🚀 Déploiement sur AWS Lightsail

### Prérequis

- Instance AWS Lightsail Ubuntu 20.04+
- Au moins 2 GB RAM
- Ports ouverts : 80, 443, 3000, 8001

### Étape 1 : Se connecter à l'instance

```bash
ssh ubuntu@<votre-ip-lightsail>
```

### Étape 2 : Installer les dépendances

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Python 3.9+
sudo apt install python3 python3-pip python3-venv -y

# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Installer SQLite
sudo apt install sqlite3 -y

# Installer Git (si pas déjà installé)
sudo apt install git -y
```

### Étape 3 : Cloner le repository

```bash
cd /home/ubuntu
git clone https://github.com/Esso-Ridah/PharmaFinder.git
cd PharmaFinder
```

### Étape 4 : Configurer le Backend

```bash
cd backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
nano .env
# Copier le contenu de APIKEYS.md pour le backend
# IMPORTANT : Modifier CORS_ORIGINS pour inclure l'IP/domaine de production

# Initialiser la base de données
sqlite3 pharmafinder.db < ../init_production_db.sql

# Créer le dossier uploads
mkdir -p uploads/prescriptions
```

### Étape 5 : Configurer le Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local
nano .env.local
# Copier le contenu de APIKEYS.md pour le frontend
# IMPORTANT : Modifier NEXT_PUBLIC_API_URL vers l'IP/domaine du serveur
```

### Étape 6 : Lancer les services avec PM2 (recommandé pour production)

#### Installer PM2

```bash
sudo npm install -g pm2
```

#### Démarrer le backend

```bash
cd /home/ubuntu/PharmaFinder/backend
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8001" --name pharmafinder-backend
```

#### Démarrer le frontend

```bash
cd /home/ubuntu/PharmaFinder/frontend
npm run build  # Build de production
pm2 start "npm start" --name pharmafinder-frontend
```

#### Sauvegarder la configuration PM2

```bash
pm2 save
pm2 startup
# Suivre les instructions affichées
```

### Étape 7 : Configuration Nginx (Optionnel mais recommandé)

```bash
sudo apt install nginx -y

# Créer la configuration
sudo nano /etc/nginx/sites-available/pharmafinder
```

Copier cette configuration :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;  # Ou votre IP

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        rewrite ^/api(/.*)$ $1 break;
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/pharmafinder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Étape 8 : Configuration du pare-feu

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Étape 9 : Vérifier que tout fonctionne

```bash
# Vérifier les services PM2
pm2 list

# Vérifier les logs
pm2 logs pharmafinder-backend
pm2 logs pharmafinder-frontend

# Tester l'API
curl http://localhost:8001/docs

# Tester le frontend
curl http://localhost:3000
```

---

## 🔧 Commandes utiles pour la maintenance

### Backend

```bash
# Voir les logs
pm2 logs pharmafinder-backend

# Redémarrer
pm2 restart pharmafinder-backend

# Arrêter
pm2 stop pharmafinder-backend
```

### Frontend

```bash
# Voir les logs
pm2 logs pharmafinder-frontend

# Redémarrer
pm2 restart pharmafinder-frontend

# Rebuild après modifications
cd /home/ubuntu/PharmaFinder/frontend
npm run build
pm2 restart pharmafinder-frontend
```

### Base de données

```bash
# Backup
cd /home/ubuntu/PharmaFinder/backend
sqlite3 pharmafinder.db ".backup backup_$(date +%Y%m%d).db"

# Restaurer
sqlite3 pharmafinder.db ".restore backup_20231003.db"
```

---

## ⚠️ Points importants

1. **Sécurité :**
   - Les clés Stripe fournies sont des clés de TEST
   - Changer `SECRET_KEY` en production
   - Mettre `DEBUG=False` en production
   - Configurer HTTPS avec Let's Encrypt

2. **Performance :**
   - Considérer PostgreSQL pour la production (scalabilité)
   - Activer le caching Redis si disponible
   - Optimiser les images avec un CDN

3. **Monitoring :**
   - Configurer PM2 monitoring : `pm2 plus`
   - Mettre en place des logs rotatifs
   - Surveiller l'utilisation des ressources

---

## 📞 Support

Pour toute question :
- GitHub Issues : https://github.com/Esso-Ridah/PharmaFinder/issues
- Documentation complète : `/docs/`

---

**Version :** 1.0.0
**Date :** 2025-10-03
**Auteur :** PharmaFinder Team
