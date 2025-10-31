# 🐎 Equi Saddles - Premium Equestrian E-commerce Platform

Une plateforme e-commerce complète dédiée aux selles d'équitation premium, construite avec les dernières technologies web modernes.

## 🌟 Fonctionnalités Principales

### 🛒 E-commerce Complet
- **Catalogue de produits** avec filtrage avancé par catégorie et taille
- **Panier d'achat** persistant avec gestion des quantités
- **Système de paiement Stripe** sécurisé et intégré
- **Gestion des commandes** avec historique complet

### 🌍 Multilingue
Support complet pour 5 langues :
- 🇫🇷 Français
- 🇬🇧 English  
- 🇳🇱 Nederlands
- 🇪🇸 Español
- 🇩🇪 Deutsch

### 📱 Progressive Web App (PWA)
- **Installation mobile** native sur iOS et Android
- **Fonctionnement hors ligne** avec service worker intelligent
- **Design responsive** optimisé mobile-first
- **Thème cuir authentique** (#6B4226) harmonisé

### ⚡ Interface Moderne
- **React 18** avec TypeScript pour la fiabilité
- **Tailwind CSS** pour un design professionnel
- **shadcn/ui** composants accessibles et élégants
- **Menu hamburger doré** optimisé mobile
- **Mode sombre** adaptatif pour le confort visuel

### 🔐 Panel Administrateur
- **Authentification sécurisée** (admin/Justine1234!)
- **Gestion produits CRUD** complète
- **Upload d'images** avec galerie organisée
- **Chat support** temps réel avec notifications email
- **Interface responsive** adaptée à tous les écrans

### 💬 Chat Support Temps Réel
- **WebSocket** pour communication instantanée
- **Notifications email** automatiques via Brevo API
- **Widget flottant** élégant et accessible
- **Historique des conversations** persistant

## 🛠️ Stack Technique

### Frontend
- **React 18.3.1** + TypeScript
- **Vite** pour le build ultra-rapide
- **Tailwind CSS** + shadcn/ui
- **React Query** pour la gestion d'état serveur
- **Wouter** pour le routing léger
- **React Hook Form** + Zod validation

### Backend
- **Express.js** + TypeScript
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM** avec migrations automatiques
- **Session PostgreSQL** sécurisée
- **WebSocket** pour le chat temps réel

### Intégrations
- **Stripe** paiements sécurisés
- **Brevo** notifications email
- **PWA** service worker intelligent
- **Responsive** mobile-first design

## 🚀 Installation et Déploiement

### Prérequis
- Node.js 18+
- PostgreSQL database
- Clés Stripe (test/production)
- API key Brevo pour les emails

### Variables d'Environnement
```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
BREVO_API_KEY=xkeysib-...
SESSION_SECRET=your-secret-key
```

### Installation
```bash
npm install
npm run db:push  # Migration base de données
npm run dev      # Développement
npm run build    # Production
```

### Déploiement
Application optimisée pour Replit avec :
- Build production 794KB compressé
- Service worker HTTPS intelligent
- Cache optimisé et sécurisé
- Configuration PWA complète

## 📋 Pages et Navigation

### Pages Publiques
- **/** - Accueil avec présentation des catégories
- **/catalog** - Catalogue produits avec filtres
- **/product/:id** - Détail produit avec galerie
- **/cart** - Panier d'achat complet
- **/checkout** - Processus de paiement Stripe
- **/gallery** - Galerie d'images catégorisée
- **/contact** - Contact avec widget chat

### Pages Légales
- **/support** - Support client et garanties
- **/privacy** - Politique de confidentialité RGPD
- **/terms** - Conditions générales
- **/returns** - Retours et échanges
- **/delivery** - Informations livraison DPD
- **/customer-service** - Excellence service client

### Administration
- **/admin** - Panel administrateur sécurisé
- Gestion produits, galerie, commandes, chat

## 💼 Configuration Entreprise

### Informations Légales
- **Entreprise** : Justine Bogaerts
- **Adresse** : Rue du Vicinal 9, 4141 Louveigné, Belgique
- **TVA** : BE0542650464
- **Email** : contact@equisaddles.com
- **Téléphone** : +32 496 94 41 25

### Conformité
- **RGPD** compliant avec politique de confidentialité
- **Droit belge** pour toutes les pages légales
- **DPD** configuration livraison européenne
- **Stripe** paiements sécurisés PCI DSS

## 🎯 Catégories Produits

### Selles d'Équitation
- **Obstacle** - Selles de saut d'obstacles
- **Dressage** - Selles de dressage classique  
- **Cross** - Selles de cross et concours complet
- **Mixte** - Selles polyvalentes
- **Poney** - Selles adaptées aux poneys

### Accessoires
- **Sangles** - Sangles en cuir et synthétique
- **Étrivières** - Étrivières réglables
- **Étriers** - Étriers de sécurité
- **Amortisseurs** - Pads et amortisseurs
- **Tapis** - Tapis de selle
- **Briderie** - Brides et licols
- **Couvertures** - Couvertures d'écurie et extérieur
- **Protections** - Protections membres

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Ouvrir le site dans Safari/Chrome
2. Menu "Partager" → "Sur l'écran d'accueil"
3. L'app s'installe comme une application native

### Desktop
1. Icône d'installation dans la barre d'adresse
2. "Installer Equi Saddles"
3. Application standalone disponible

## 🔧 Administration

### Accès Admin
- **URL** : `/admin` ou `/administrateur`
- **Identifiants** : `admin` / `Justine1234!`

### Fonctionnalités Admin
- ✅ Gestion produits (CRUD complet)
- ✅ Upload et organisation d'images
- ✅ Suivi des commandes clients
- ✅ Chat support temps réel
- ✅ Interface responsive mobile/desktop

## 📊 Performance et Optimisation

### Métriques
- **Build size** : 794KB optimisé (gzip: 223KB)
- **Mobile-first** : Design responsive parfait
- **PWA score** : Installation native fonctionnelle
- **SEO** : Meta tags et structure optimisés

### Optimisations
- Service worker intelligent (cache GET uniquement)
- Exclusion automatique des requêtes API du cache
- Images optimisées et lazy loading
- CSS Tailwind purge pour taille minimale
- Bundle splitting automatique avec Vite

## 🌟 Points Forts

- **Production-ready** : Application complètement fonctionnelle
- **Mobile-optimized** : Menu hamburger doré, navigation parfaite
- **PWA complète** : Installation sans écran blanc
- **Multilingue** : 5 langues avec traductions professionnelles
- **Sécurisé** : Stripe + HTTPS + validation complète
- **Évolutif** : Architecture modulaire et maintenable

---

**Equi Saddles** - L'excellence dans l'équipement équestre, maintenant disponible en ligne ! 🐎✨
