# 🚀 Guide de Démarrage Rapide - PharmaFinder

## ✅ Problème Résolu !

**Toutes les pages sont maintenant fonctionnelles !**

### 🔧 Statut des Services

| Service | URL | Statut |
|---------|-----|---------|
| 🎨 Frontend | http://localhost:3001 | ✅ Fonctionnel |
| ⚡ Backend API | http://localhost:8000 | ✅ Fonctionnel |
| 📖 API Docs | http://localhost:8000/docs | ✅ Fonctionnel |

### 📄 Pages Créées

| Page | URL | Description |
|------|-----|-------------|
| 🏠 Accueil | http://localhost:3001 | Page d'accueil avec recherche |
| 🔐 Connexion | http://localhost:3001/auth/login | Authentification utilisateurs |
| 📝 Inscription | http://localhost:3001/auth/register | Création de compte |
| 🏥 Pharmacies | http://localhost:3001/pharmacies | Liste des pharmacies |
| 💊 Médicaments | http://localhost:3001/products | Catalogue des produits |
| ℹ️ À Propos | http://localhost:3001/about | Information sur l'entreprise |
| 📞 Contact | http://localhost:3001/contact | Formulaire de contact |

## 🏃‍♂️ Méthodes de Démarrage

### Méthode 1 : Démarrage Automatique (Recommandé)

```bash
# Démarrage avec script automatique
./start.sh
```

### Méthode 2 : Docker Compose

```bash
# Avec Make
make start

# Ou directement avec Docker
docker-compose up -d postgres redis
docker-compose up backend frontend
```

### Méthode 3 : Démarrage Manuel

```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

## 👥 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👤 Client | `kofi.asante@gmail.com` | `password123` |
| 💊 Pharmacien | `dr.mensah@pharmacielome.tg` | `password123` |
| 🔧 Admin | `admin@pharmafinder.tg` | `password123` |

## 🔧 Configuration Rapide

### Variables d'environnement essentielles

```bash
# Backend (.env)
DATABASE_URL=postgresql://pharma_user:pharma_pass@localhost:5432/pharmafinder_db
SECRET_KEY=your-super-secret-key

# Frontend (.env.local)  
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🌐 Accès aux Services

- **Site Web** : http://localhost:3001
- **API** : http://localhost:8000
- **Documentation** : http://localhost:8000/docs
- **Base de données** : localhost:5432

## 🚨 Dépannage Rapide

### Frontend inaccessible ?
```bash
# Vérifier le processus
ps aux | grep next

# Redémarrer
cd frontend && npm run dev
```

### Backend ne répond pas ?
```bash
# Vérifier le processus
ps aux | grep uvicorn

# Redémarrer
cd backend && uvicorn main:app --reload
```

### Port 3000 occupé ?
Le frontend utilise automatiquement le port 3001 si 3000 est occupé.

## ✨ Fonctionnalités Disponibles

- ✅ Recherche de médicaments
- ✅ Localisation des pharmacies  
- ✅ Authentification multi-rôles
- ✅ Interface responsive
- ✅ API REST complète
- ✅ Documentation interactive

## 🎯 Prochaines Étapes

1. **Tester l'application** avec les comptes fournis
2. **Configurer Google Maps API** pour la géolocalisation
3. **Ajouter vos données** de pharmacies
4. **Personnaliser** selon vos besoins

---

**🎉 PharmaFinder est maintenant opérationnel !**

Pour plus de détails, consultez le [README principal](README.md) et le [guide de déploiement](docs/DEPLOYMENT.md).