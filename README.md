# Epytogo 🇪🇬

**Plateforme de voyage intelligente dédiée à l'Égypte**

Epytogo est une application web moderne qui transforme l'expérience de voyage en Égypte en une aventure fluide, enrichissante et instinctive. Développée spécifiquement pour les voyageurs francophones, elle intègre des fonctionnalités avancées de recherche, de réservation et d'assistance IA.

## 🌟 Fonctionnalités principales

### 🔍 **Découverte intelligente**
- **Recherche avancée** : Restaurants, hôtels et attractions touristiques avec filtrage par type
- **Intégration Google Places** : Données en temps réel avec informations détaillées (horaires, photos, avis)
- **Interface bilingue** : Français/Arabe pour une meilleure accessibilité
- **Géolocalisation** : Recherche basée sur la position ou par adresse

### 🤖 **Assistant IA "Anubis"**
- **Intelligence conversationnelle** : Powered by Google Gemini AI
- **Expertise Égypte** : Recommandations personnalisées pour destinations, restaurants et hébergements
- **Intégration dynamique** : Les suggestions du chatbot mettent à jour automatiquement l'interface de recherche
- **Connaissance locale** : Informations culturelles et pratiques sur l'Égypte

### 📅 **Système de réservation complet**
- **Multi-types** : Hôtels, restaurants, attractions touristiques
- **Gestion intelligente** : Créneaux horaires pour restaurants, numéros de chambres pour hôtels
- **Prévention des conflits** : Vérification automatique des disponibilités
- **Historique personnel** : Suivi des réservations pour utilisateurs connectés

### ⭐ **Système d'avis et évaluations**
- **Reviews internes** : Système d'avis des utilisateurs inscrits
- **Intégration externe** : Récupération automatique des avis Google Places
- **Modération** : Les utilisateurs peuvent modifier leurs propres avis
- **Affichage unifié** : Interface cohérente entre avis internes et externes

### 💼 **Système d'abonnements**
- **Freemium** : Accès gratuit avec publicités
- **Business (20€/mois)** : 1 établissement, sans pub, dashboard propriétaire
- **Enterprise (50€/mois)** : 3 établissements, analytics avancées, API access
- **Premium Plus** : Établissements illimités, support premium

### 🎯 **Monétisation intégrée**
- **Système publicitaire** : 8 positions stratégiques d'annonces
- **Analytics avancées** : Suivi des impressions, clics et revenus en temps réel
- **Optimisation automatique** : Rotation intelligente des annonces
- **Dashboard complet** : Métriques CPM, CPC et performance globale

### 🏢 **Gestion d'établissements**
- **Workflow complet** : Demande → Approbation → Gestion
- **Types supportés** : Restaurants, hôtels, attractions touristiques
- **Dashboard propriétaire** : Calendrier, réservations, statistiques
- **Intégration Google Places** : Auto-complétion et données enrichies

## 🛠 Stack technique

### **Frontend**
- **Next.js 14+** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le design responsive
- **React Query** pour la gestion d'état et cache
- **Zustand** pour l'état global léger

### **Backend & Base de données**
- **Next.js API Routes** pour l'API
- **MongoDB** avec Prisma ORM
- **NextAuth.js** pour l'authentification
- **Bcryptjs** pour le hashage des mots de passe

### **Intégrations externes**
- **Google Places API** : Données des lieux en temps réel
- **Google Maps JavaScript API** : Cartes interactives
- **Google Gemini AI** : Assistant conversationnel
- **Vercel** : Déploiement et hébergement

### **Outils de développement**
- **ESLint** : Analyse de code
- **PostCSS** : Transformation CSS
- **Git** avec workflow Agile SCRUM

## 🚀 Installation et développement

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Google Cloud (pour les APIs)
- Base de données MongoDB

### Configuration

1. **Cloner le repository**
```bash
git clone [repository-url]
cd epytogo
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
Créer un fichier `.env.local` :
```env
# Database
DATABASE_URL="mongodb://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google APIs
GOOGLE_PLACES_API_KEY="your-google-places-key"
GOOGLE_MAPS_API_KEY="your-google-maps-key"
GOOGLE_GEMINI_AI_KEY="your-gemini-key"
```

4. **Initialiser la base de données**
```bash
npx prisma generate
npx prisma db push
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
src/
├── app/                    # App Router Next.js 14
│   ├── (home)/            # Page d'accueil
│   ├── auth/              # Authentification
│   └── api/               # Routes API
├── components/            # Composants React
│   ├── ui/                # Composants UI réutilisables
│   ├── home/              # Composants page d'accueil
│   ├── form/              # Formulaires
│   └── navigation/        # Navigation
├── hooks/                 # Hooks personnalisés
├── lib/                   # Utilitaires et configurations
├── store/                 # État global (Zustand)
└── types/                 # Définitions TypeScript

prisma/
└── schema.prisma          # Schéma base de données

rapport/                   # Documentation du projet
├── images/                # Screenshots et diagrammes
└── Rapport Epytogo.pdf    # Rapport complet
```

## 🔧 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Vérification ESLint
```

## 🎯 Méthodologie de projet

**Approche Agile SCRUM**
- Sprints de 2 semaines
- Rôles définis : Product Owner, SCRUM Master
- Daily meetings et rétrospectives
- Intégration continue avec Git

**Gestion des coûts**
- Budget mensuel : 6 170,31€
- Monitoring des APIs et services
- Optimisation continue des performances

## 🚀 Déploiement

L'application est déployée sur Vercel avec :
- Build automatique sur push
- Variables d'environnement sécurisées  
- CDN global pour performances optimales
- Monitoring et analytics intégrés

## 📊 Performances et monitoring

- **CDN OVH** : Réduction latence et distribution sécurisée
- **React Query** : Cache intelligent des données
- **Optimisations Next.js** : Images, fonts, et bundle optimisés
- **Monitoring continu** : Tests non-régressifs automatisés

## 🤝 Contribution

Ce projet est développé dans le cadre d'un Bachelor RPI (Responsable de Projet Informatique). 

---

**Développé avec ❤️ pour révolutionner l'expérience touristique en Égypte**
