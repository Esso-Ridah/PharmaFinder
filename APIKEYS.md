# Configuration des API et Variables d'Environnement - PharmaFinder

## Backend (.env dans /backend/)

```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./pharmafinder.db

# Security
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Payment APIs
STRIPE_SECRET_KEY=sk_test_51SDZ4fPDhCVy2mHYsXoxLZG2bsLPZpyaAU4uzTZFI6Ge3qOrxe51aAuHLaQuGQXquADR6wjBNiw6ATdue7ivzURp00E8WrYFPB
STRIPE_PUBLISHABLE_KEY=pk_test_51SDZ4fPDhCVy2mHYgrg6D80xlKBSGyI0tHUnjcP7i1F7aJ5wrM1GiW7RlFKi5kGf0eQgurijH3eALQUNpc3d9aAx00P6dQkMhG
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or live for production

# AWS S3 (for prescription images)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=pharmafinder-prescriptions
AWS_S3_REGION=eu-west-1

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# App Configuration
APP_NAME=PharmaFinder
APP_VERSION=1.0.0
DEBUG=True
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://localhost:3001","http://127.0.0.1:3001","http://localhost:3002","http://127.0.0.1:3002"]
```

## Frontend (.env.local dans /frontend/)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SDZ4fPDhCVy2mHYgrg6D80xlKBSGyI0tHUnjcP7i1F7aJ5wrM1GiW7RlFKi5kGf0eQgurijH3eALQUNpc3d9aAx00P6dQkMhG
```

## Instructions de déploiement

### Pour le déploiement en production sur AWS Lightsail :

1. **Backend** : Copier le contenu ci-dessus dans `/backend/.env`
   - Modifier `CORS_ORIGINS` pour inclure l'URL de production
   - Modifier `DEBUG=False` en production
   - Changer `SECRET_KEY` pour une clé plus sécurisée

2. **Frontend** : Copier le contenu ci-dessus dans `/frontend/.env.local`
   - Modifier `NEXT_PUBLIC_API_URL` vers l'URL du backend en production (ex: `https://api.pharmafinder.com`)

3. **Base de données** : Utiliser le script `init_production_db.sql` pour initialiser la base avec les données de démo

## Notes importantes

⚠️ **SÉCURITÉ** :
- Ces clés sont des clés de TEST pour Stripe
- Ne JAMAIS exposer le fichier `.env` dans le repo git (déjà dans .gitignore)
- Changer toutes les clés par des clés de production avant le lancement
- Utiliser des variables d'environnement ou un gestionnaire de secrets en production

## Clés à configurer absolument :

1. **Stripe** : Déjà configuré avec clés de test ✅
2. **PayPal** : À configurer si vous voulez activer PayPal
3. **AWS S3** : À configurer si vous voulez stocker les prescriptions sur S3 (optionnel, utilise le système de fichiers local par défaut)
4. **Google Maps** : À configurer si vous voulez activer la carte interactive
5. **Email SMTP** : À configurer pour l'envoi d'emails de notification
