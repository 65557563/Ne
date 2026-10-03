# BENIN-PEPI — Géoportail des Pépinières du Département du Zou & Commune d'Abomey

Application cartographique SIG web interactive dédiée au recensement, à la localisation et à la gestion des pépinières (écoles et privées) dans le département du Zou et la commune d'Abomey au Bénin.

---

## 🚀 Lien Direct vers le Géoportail

- **Lien direct en ligne** : [https://ais-dev-c4h5ua75wz7ivqp5bl2bf2-906085649607.europe-west2.run.app/#geoportail](https://ais-dev-c4h5ua75wz7ivqp5bl2bf2-906085649607.europe-west2.run.app/#geoportail)
- **Lien direct en local** : [http://localhost:3000/#geoportail](http://localhost:3000/#geoportail)

Ajoutez `#geoportail` (ou `#map`) à n'importe quelle URL pour arriver immédiatement sur la carte interactive avec tous les outils cartographiques et les couches actives.

---

## 💻 Exécution en Local (Guide Rapide)

### 1. Prérequis
- **Node.js** version 18.x, 20.x ou supérieure ([Télécharger Node.js](https://nodejs.org/))
- **npm** (inclus avec Node.js) ou **bun** / **yarn**

### 2. Installation
Ouvrez votre terminal dans le dossier du projet :

```bash
# Installation de toutes les dépendances du projet
npm install
```

### 3. Lancement du Serveur de Développement
```bash
# Démarrage du serveur Vite en local
npm run dev
```

Le serveur démarre immédiatement sur :
- **Application** : `http://localhost:3000`
- **Accès direct Géoportail** : `http://localhost:3000/#geoportail`

### 4. Compilation pour la Production
```bash
# Création du bundle de production optimisé dans /dist
npm run build

# Prévisualisation du bundle de production
npm run preview
```

---

## 🏛️ Architecture du Projet

Le projet repose sur une architecture moderne, modulaire et sans dépendance serveur complexe (Single Page Application réactive) :

```text
BENIN-PEPI/
├── index.html                 # Point d'entrée HTML (titre, polices, Leaflet CSS)
├── package.json               # Dépendances npm et scripts de lancement
├── tsconfig.json              # Configuration TypeScript stricte
├── vite.config.ts             # Configuration du bundler Vite avec Tailwind CSS v4
├── README.md                  # Documentation technique d'installation locale
│
├── public/                    # Fichiers statiques et données SIG sources
│   ├── data/
│   │   ├── PEPI_BENIN.geojson       # Données vectorielles WGS84 des 16 pépinières
│   │   ├── Commune_abomey.geojson   # Tracé officiel de la commune d'Abomey
│   │   ├── departement_zou.geojson  # Tracé officiel du département du Zou
│   │   └── README.md                # Guide des formats géographiques
│   └── assets/
│       └── pepinieres/              # Photos et médias des sites
│
└── src/                       # Code source TypeScript / React
    ├── main.tsx               # Point de montage React 19
    ├── App.tsx                # Composant racine, routage par hash URL & synchronisation
    ├── index.css              # Feuilles de style Tailwind v4
    ├── types.ts               # Types TypeScript (Nursery, Layers, GeoJSONFeature, etc.)
    │
    ├── components/            # Composants graphiques modulaires
    │   ├── MapPortal.tsx            # Géoportail interactif Leaflet complet (couches, popups, dessin, mesures)
    │   ├── Header.tsx               # Barre de navigation responsive avec accès direct géoportail
    │   ├── HomeView.tsx             # Page d'accueil moderne avec bouton d'accès direct
    │   ├── AdminView.tsx            # Espace Administrateur sécurisé (CRUD, exports SIG)
    │   ├── AdminLoginModal.tsx      # Modal de connexion administrateur
    │   ├── DataFileManager.tsx     # Gestionnaire des fichiers GeoJSON & arborescence
    │   ├── StatisticsView.tsx       # Tableaux de bord et graphiques analytiques
    │   ├── NurseryList.tsx          # Annuaire et recherche filtrable des sites
    │   ├── AboutView.tsx            # Présentation de l'initiative et contexte
    │   ├── ContactView.tsx          # Fiche contact et support technique
    │   ├── GeoJSONInspector.tsx     # Inspecteur SIG des entités géométriques
    │   ├── AttributeTableDrawer.tsx # Table attributaire tabulaire
    │   └── LocalSetupModal.tsx      # Modal d'aide pour l'exécution en local
    │
    ├── data/                  # Données par défaut et convertisseurs
    │   └── nurseryData.ts           # Données de référence et helpers GeoJSON <-> TypeScript
    │
    └── utils/                 # Logique métier et sécurité
        ├── adminAuth.ts             # Gestion de l'authentification et des sessions admin
        ├── dataImporter.ts          # Analyseur universel de fichiers GeoJSON
        └── downloadDossier.ts       # Générateur d'archives et exportateurs
```

---

## 🗺️ Fonctionnalités du Géoportail

1. **Cartographie Multi-fonds** :
   - OpenStreetMap Standard
   - Imagerie Satellite Hybride (ESRI World Imagery)
   - CartoDB Positron (Mode Clair Minimaliste)
   - CartoDB Dark Matter (Mode Sombre)
   - Vue Topographique Relief (OpenTopoMap)

2. **Couches Vectorielles Natives** :
   - Polygone départemental du Zou (zone d'intervention)
   - Polygone communal d'Abomey
   - Points pépinières avec symbologie différenciée (Pépinières écoles vs Privées)
   - Importation dynamique par glisser-déposer de n'importe quel fichier `.geojson` externe avec zoom et table attributaire automatique.

3. **Outils SIG Intégrés** :
   - Recherche textuelle dynamique par nom, commune, essence d'arbres
   - Filtres thématiques par statut, espèces disponibles et capacité de plants
   - Outil de mesure de distances (segments métriques)
   - Outil de géolocalisation GPS utilisateur
   - Centrage automatique sur le Zou et Abomey
   - Outil d'impression / export de la carte en image HD
   - Table attributaire escamotable avec inspecteur détaillé de métadonnées

---

## 🔐 Identifiants Administrateur en Local

Pour accéder aux fonctions d'édition, d'ajout et de suppression en local :
- Cliquez sur **« Connexion Admin »** dans l'en-tête ou rendez-vous sur `http://localhost:3000/#admin`
- Compte préconfiguré disponible :
  - **Identifiant / Email** : `admin@pepi-benin.bj` ou `kofarohagli@gmail.com`
  - **Mot de passe** : `Admin2026@` (ou création directe de compte administrateur local sécurisé)
- Les données personnalisées sont stockées de façon persistante dans le `localStorage` de votre navigateur en local.

---

## 🛠️ Technologies Utilisées
- **Framework** : React 19 & TypeScript
- **Bundler** : Vite 8
- **Cartographie** : Leaflet 1.9.4 & `@types/leaflet`
- **Styles** : Tailwind CSS v4 avec `@tailwindcss/vite`
- **Icônes** : Lucide React
