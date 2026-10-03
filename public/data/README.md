# Guide d'intégration des Données GeoJSON - BENIN-PEPI

Bienvenue dans le dossier des données géographiques du **Géoportail BENIN-PEPI (Département du Zou & Commune d'Abomey)**.

## 📂 Fichiers présents dans ce dossier :

1. **`Commune_abomey.geojson`** : Délimitation surfacique (Polygone) de la commune d'Abomey avec ses arrondissements.
2. **`departement_zou.geojson`** : Limite départementale du Zou (Abomey, Bohicon, Djidja, Za-Kpota, Covè, Zagnanado, Agbangnizoun, etc.).
3. **`PEPI_BENIN.geojson`** : Couche ponctuelle (Points GPS) contenant les pépinières écoles et privées répertoriées.

---

## 🚀 Comment ajouter ou remplacer votre fichier GeoJSON ?

### Méthode 1 : Remplacement direct de fichier
Vous pouvez simplement remplacer ou déposer vos fichiers `.geojson` dans ce dossier `/public/data/` :
- Remplacez **`PEPI_BENIN.geojson`** par vos propres points de pépinières.
- Remplacez **`Commune_abomey.geojson`** par votre polygone officiel si vous en avez un plus précis.

### Méthode 2 : Importation en direct dans l'application
Vous pouvez aussi utiliser l'onglet **"Fichiers & GeoJSON"** ou **"Importer / Exporter"** directement dans l'interface web de BENIN-PEPI pour :
- Glisser-déposer votre fichier `.geojson` ou `.json`
- Voir immédiatement les nouveaux points s'afficher sur la carte interactive Leaflet
- Télécharger le GeoJSON mis à jour avec vos ajouts !

---

## 📋 Structure recommandée des propriétés GeoJSON (`properties`) :

Pour que toutes les fonctionnalités de filtrage, fiches détaillées, recherche et statistiques fonctionnent à 100%, chaque point peut contenir :

```json
{
  "type": "Feature",
  "properties": {
    "id": "pepi-01",
    "nom": "Nom de la Pépinière",
    "type": "ecole",             // "ecole" pour Pépinière École OU "privee" pour Pépinière Privée
    "commune": "Abomey",          // Nom de la commune (Abomey, Bohicon, Djidja...)
    "arrondissement": "Vidolè",   // Arrondissement
    "promoteur": "Nom du responsable ou de l'établissement",
    "telephone": "+229 97 00 00 00",
    "email": "contact@exemple.bj",
    "description": "Description des activités et objectifs sylvicoles...",
    "capaciteAnnuelle": 25000,    // Nombre de plants par an (nombre)
    "especes": ["Teck", "Acacia", "Manguier greffé", "Baobab"],
    "statut": "actif",            // "actif", "en_creation", "saisonnier"
    "photoUrl": "/assets/pepinieres/nom_de_votre_photo.jpg" // ou URL web
  },
  "geometry": {
    "type": "Point",
    "coordinates": [longitude, latitude] // ATTENTION : [Longitude (X), Latitude (Y)]
  }
}
```

*Note : Si votre GeoJSON a des noms de champs légèrement différents (ex: `name`, `NAME`, `capacite`, `tel`), le géoportail BENIN-PEPI intègre un auto-mappeur intelligent qui détecte automatiquement les champs équivalents !*
