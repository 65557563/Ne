import JSZip from 'jszip';
import { Nursery } from '../types';
import { nurseriesToGeojson } from '../data/nurseryData';

export interface DownloadDossierOptions {
  nurseries: Nursery[];
  onProgress?: (status: string) => void;
}

/**
 * Generate CSV text from nurseries
 */
function nurseriesToCsv(nurseries: Nursery[]): string {
  const headers = [
    'ID',
    'Nom',
    'Type',
    'Commune',
    'Arrondissement',
    'Latitude',
    'Longitude',
    'Statut',
    'Capacite_Annuelle',
    'Especes_Principales',
    'Promoteur',
    'Telephone',
    'Email',
    'Superficie_m2',
    'Systeme_Arrosage',
    'Description'
  ];

  const rows = nurseries.map(n => {
    return [
      `"${n.id}"`,
      `"${(n.nom || '').replace(/"/g, '""')}"`,
      `"${n.type}"`,
      `"${(n.commune || '').replace(/"/g, '""')}"`,
      `"${(n.arrondissement || '').replace(/"/g, '""')}"`,
      n.latitude,
      n.longitude,
      `"${n.statut}"`,
      n.capaciteAnnuelle || 0,
      `"${(n.especes || []).join(', ').replace(/"/g, '""')}"`,
      `"${(n.promoteur || '').replace(/"/g, '""')}"`,
      `"${(n.telephone || '').replace(/"/g, '""')}"`,
      `"${(n.email || '').replace(/"/g, '""')}"`,
      n.superficieM2 || '',
      `"${(n.systemeArrosage || '').replace(/"/g, '""')}"`,
      `"${(n.description || '').replace(/"/g, '""')}"`
    ].join(';');
  });

  return [headers.join(';'), ...rows].join('\r\n');
}

/**
 * Generate a standalone offline cartographic viewer HTML file
 */
function generateOfflineHtmlViewer(nurseries: Nursery[], geojson: any): string {
  const geojsonString = JSON.stringify(geojson);
  const totalCount = nurseries.length;
  const schoolCount = nurseries.filter(n => n.type === 'ecole').length;
  const privateCount = nurseries.filter(n => n.type === 'privee').length;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BENIN-PEPI - Visualiseur Cartographique Hors-Ligne (Dossier Prêt à l'Emploi)</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
    body { background-color: #0f172a; color: #1e293b; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    header { background: linear-gradient(135deg, #031c12 0%, #064e3b 100%); color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 36px; height: 36px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
    .brand h1 { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.5px; }
    .brand p { font-size: 0.75rem; color: #6ee7b7; }
    .stats-badge { display: flex; gap: 10px; font-size: 0.75rem; }
    .stat-pill { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 999px; }
    .stat-pill strong { color: #34d399; }
    .main-container { display: flex; flex: 1; height: calc(100vh - 65px); }
    #sidebar { width: 380px; background: #ffffff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; height: 100%; z-index: 1000; box-shadow: 2px 0 10px rgba(0,0,0,0.05); }
    .sidebar-header { padding: 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .search-input { width: 100%; padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem; outline: none; }
    .search-input:focus { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
    .filter-tabs { display: flex; gap: 6px; margin-top: 10px; }
    .filter-btn { flex: 1; padding: 6px; font-size: 0.75rem; font-weight: 600; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
    .filter-btn.active { background: #064e3b; color: white; border-color: #064e3b; }
    #nursery-list { flex: 1; overflow-y: auto; padding: 10px; }
    .nursery-card { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; background: #fafafa; }
    .nursery-card:hover { border-color: #10b981; background: #f0fdf4; transform: translateY(-1px); }
    .nursery-card h3 { font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
    .badge-type { font-size: 0.65rem; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; font-weight: 700; }
    .type-ecole { background: #dcfce7; color: #166534; }
    .type-privee { background: #fef3c7; color: #92400e; }
    .nursery-info { font-size: 0.75rem; color: #64748b; line-height: 1.4; }
    #map { flex: 1; height: 100%; }
    .leaflet-popup-content-wrapper { border-radius: 12px; padding: 4px; }
    .custom-popup h3 { font-size: 1rem; color: #064e3b; margin-bottom: 6px; font-weight: 800; }
    .custom-popup p { font-size: 0.8rem; color: #334155; margin-bottom: 4px; }
    .custom-popup .capacity { font-weight: 700; color: #047857; }
    .custom-popup img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-top: 8px; border: 1px solid #cbd5e1; }
    .footer-actions { padding: 10px 14px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; }
    .btn-action { flex: 1; padding: 8px; font-size: 0.75rem; font-weight: 700; text-align: center; border-radius: 6px; cursor: pointer; border: none; }
    .btn-green { background: #10b981; color: white; }
    .btn-green:hover { background: #059669; }
    .btn-outline { background: white; border: 1px solid #cbd5e1; color: #334155; }
    .btn-outline:hover { background: #f1f5f9; }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-icon">🌱</div>
      <div>
        <h1>BENIN-PEPI &bull; Visualiseur Cartographique SIG</h1>
        <p>Dossier Complet Prêt à l'Emploi &bull; Département du Zou &amp; Commune d'Abomey</p>
      </div>
    </div>
    <div class="stats-badge">
      <div class="stat-pill">Total : <strong id="stat-total">${totalCount}</strong> pépinières</div>
      <div class="stat-pill">Pépinières École : <strong id="stat-ecole">${schoolCount}</strong></div>
      <div class="stat-pill">Pépinières Privées : <strong id="stat-privee">${privateCount}</strong></div>
      <div class="stat-pill">SCR : <strong>EPSG:4326</strong></div>
    </div>
  </header>

  <div class="main-container">
    <div id="sidebar">
      <div class="sidebar-header">
        <input type="text" id="search" class="search-input" placeholder="🔍 Rechercher par nom, commune, essence..." onkeyup="filterNurseries()" />
        <div class="filter-tabs">
          <button class="filter-btn active" onclick="setFilter('all', this)">Toutes (${totalCount})</button>
          <button class="filter-btn" onclick="setFilter('ecole', this)">Écoles (${schoolCount})</button>
          <button class="filter-btn" onclick="setFilter('privee', this)">Privées (${privateCount})</button>
        </div>
      </div>

      <div id="nursery-list"></div>

      <div class="footer-actions">
        <button class="btn-action btn-green" onclick="window.print()">🖨️ Imprimer la fiche</button>
        <button class="btn-action btn-outline" onclick="exportDataCsv()">📥 Télécharger CSV</button>
      </div>
    </div>

    <div id="map"></div>
  </div>

  <script>
    // Embedded GeoJSON dataset
    const geojsonData = ${geojsonString};
    const nurseries = geojsonData.features.map(f => ({
      id: f.properties.id || f.properties.ID,
      nom: f.properties.nom || f.properties.Nom || 'Pépinière',
      type: f.properties.type || f.properties.Type || 'privee',
      commune: f.properties.commune || f.properties.Commune || 'Abomey',
      arrondissement: f.properties.arrondissement || f.properties.Arrondissement || '',
      promoteur: f.properties.promoteur || f.properties.Promoteur || '',
      capacite: f.properties.capaciteAnnuelle || f.properties.Capacite_Annuelle || 0,
      especes: f.properties.especes || f.properties.Especes_Principales || [],
      statut: f.properties.statut || f.properties.Statut || 'actif',
      telephone: f.properties.telephone || f.properties.Telephone || '',
      photo: f.properties.photoUrl || f.properties.Photo || 'assets/pepinieres/modele_photo_terrain.svg',
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0]
    }));

    // Initialize Leaflet Map centered on Zou / Abomey
    const map = L.map('map').setView([7.185, 2.02], 11);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &bull; BENIN-PEPI'
    }).addTo(map);

    let activeFilter = 'all';
    let markers = [];

    // Custom Marker Icons using SVG
    function getMarkerIcon(type) {
      const color = type === 'ecole' ? '#10b981' : '#f59e0b';
      const symbol = type === 'ecole' ? '🎓' : '🌿';
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: '<div style="background-color:' + color + '; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 6px rgba(0,0,0,0.3); font-size:14px;">' + symbol + '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
    }

    function renderMarkers() {
      // Clear existing markers
      markers.forEach(m => map.removeLayer(m));
      markers = [];

      const query = document.getElementById('search').value.toLowerCase();
      const listContainer = document.getElementById('nursery-list');
      listContainer.innerHTML = '';

      const filtered = nurseries.filter(n => {
        const matchesType = activeFilter === 'all' || n.type === activeFilter;
        const matchesQuery = n.nom.toLowerCase().includes(query) || 
                             n.commune.toLowerCase().includes(query) ||
                             n.arrondissement.toLowerCase().includes(query) ||
                             (Array.isArray(n.especes) ? n.especes.join(' ') : n.especes).toLowerCase().includes(query);
        return matchesType && matchesQuery;
      });

      filtered.forEach(n => {
        // Create marker
        const marker = L.marker([n.lat, n.lng], { icon: getMarkerIcon(n.type) }).addTo(map);
        
        const popupContent = '<div class="custom-popup">' +
          '<h3>' + n.nom + '</h3>' +
          '<p><strong>Commune :</strong> ' + n.commune + ' (' + n.arrondissement + ')</p>' +
          '<p class="capacity"><strong>Capacité :</strong> ' + Number(n.capacite).toLocaleString('fr-FR') + ' plants/an</p>' +
          '<p><strong>Promoteur :</strong> ' + (n.promoteur || 'Non renseigné') + '</p>' +
          (n.telephone ? '<p><strong>Contact :</strong> ' + n.telephone + '</p>' : '') +
          '<p><strong>Coordonnées :</strong> ' + n.lat.toFixed(4) + ', ' + n.lng.toFixed(4) + '</p>' +
          '<img src="' + n.photo + '" onerror="this.src=\\'assets/pepinieres/modele_photo_terrain.svg\\'" alt="' + n.nom + '"/>' +
        '</div>';

        marker.bindPopup(popupContent);
        markers.push(marker);

        // Sidebar card
        const card = document.createElement('div');
        card.className = 'nursery-card';
        card.innerHTML = '<h3>' + n.nom + ' <span class="badge-type ' + (n.type === 'ecole' ? 'type-ecole' : 'type-privee') + '">' + (n.type === 'ecole' ? 'Pépinière École' : 'Pépinière Privée') + '</span></h3>' +
          '<div class="nursery-info">' +
            '<div>📍 ' + n.commune + ' &bull; ' + n.arrondissement + '</div>' +
            '<div>🌱 ' + Number(n.capacite).toLocaleString('fr-FR') + ' plants/an</div>' +
          '</div>';
        
        card.onclick = () => {
          map.setView([n.lat, n.lng], 15);
          marker.openPopup();
        };

        listContainer.appendChild(card);
      });
    }

    function setFilter(type, btn) {
      activeFilter = type;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMarkers();
    }

    function filterNurseries() {
      renderMarkers();
    }

    function exportDataCsv() {
      window.location.href = 'data/PEPI_BENIN.csv';
    }

    // Initial render
    renderMarkers();
  </script>
</body>
</html>`;
}

/**
 * Create a complete ZIP package containing all GeoJSON files, CSV, Images folder, and SIG documentation
 */
export async function downloadCompleteDossier({ nurseries, onProgress }: DownloadDossierOptions): Promise<void> {
  const zip = new JSZip();

  if (onProgress) onProgress('Préparation de l\'arborescence du dossier complet...');

  // 1. Root Readme
  const rootReadme = `# BENIN-PEPI - Dossier Complet SIG & Données Cartographiques (Prêt à l'Emploi)
Projet : Conception et mise en place d'un géoportail des pépinières écoles et privées dans le département du Zou : cas de la commune d'Abomey, République du Bénin
Date d'export : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
Nombre de pépinières recensées : ${nurseries.length}
Système de coordonnées : WGS 84 (EPSG:4326)

## 📖 Résumé du projet :
Dans un contexte mondial marqué par l'urgence de la restauration des écosystèmes, les pépinières constituent des infrastructures stratégiques pour la production de plants forestiers et la réussite des campagnes de reboisement. Au Bénin, et plus particulièrement dans le département du Zou, les pépinières écoles et privées jouent un rôle central dans cet approvisionnement, mais leur gestion demeure entravée par la dispersion des données, l'absence de base centralisée et les difficultés de localisation et de suivi. Ce travail vise à concevoir un outil numérique interactif permettant de centraliser, spatialiser et diffuser ces informations, afin d'appuyer la planification et la prise de décision des acteurs de la filière.

Mots-clés : géoportail, pépinières écoles, pépinières privées, SIG, base de données géospatiale, analyse spatiale, webmapping, Abomey.

## 🌟 UTILISATION IMMÉDIATE (PRÊT À L'EMPLOI) :
1. **Visualiseur cartographique hors-ligne** :
   Double-cliquez directement sur le fichier \`Visualiseur_Carto_Hors_Ligne.html\` inclus à la racine de cette archive.
   Il s'ouvre dans n'importe quel navigateur (Chrome, Edge, Firefox, Safari) sans aucune installation requise et affiche instantanément la carte interactive, les fiches pépinières, le calcul des statistiques et les photos !

2. **Intégration directe dans votre logiciel SIG (QGIS / ArcGIS / Google Earth)** :
   Consultez le guide pas-à-pas dans \`DOCUMENTATION_IMPORT_SIG.md\`.
   Glissez-déposez simplement le fichier \`data/PEPI_BENIN.geojson\` dans la fenêtre de QGIS.

3. **Traitement sous Excel ou LibreOffice** :
   Ouvrez \`data/PEPI_BENIN.csv\` avec encodage UTF-8 et séparateur point-virgule (;).

---

## 📁 Arborescence complète de l'archive :
├── Visualiseur_Carto_Hors_Ligne.html  <- Outil interactif prêt à l'emploi (ouvrez dans votre navigateur)
├── DOCUMENTATION_IMPORT_SIG.md        <- Guide pratique d'intégration pour QGIS, ArcGIS et Google Earth
├── README.md                          <- Présentation générale et instructions
│
├── data/                              <- Couches vectorielles géoréférencées et tableurs
│   ├── PEPI_BENIN.geojson             <- Points de toutes les pépinières avec attributs complets (EPSG:4326)
│   ├── PEPI_BENIN.csv                 <- Données tabulaires complètes formatées pour Excel / Calc
│   ├── Commune_abomey.geojson         <- Découpage territorial officiel de la Commune d'Abomey
│   ├── departement_zou.geojson        <- Découpage départemental officiel du Zou
│   └── metadata_sig.json              <- Fiche de métadonnées géospatiales normalisées
│
└── assets/
    └── pepinieres/                    <- Dossier des photographies de terrain et logos
        ├── pepiniere_eni.svg          <- Exemple de visuel de terrain (Pépinière ENI)
        ├── pepiniere_teme.svg         <- Exemple de visuel de terrain (Pépinière TEME)
        ├── modele_photo_terrain.svg   <- Gabarit pour vos futures photographies
        ├── index_photos.json          <- Répertoire des correspondances Photos / Identifiants
        └── README_IMAGES.md           <- Guide d'insertion et spécifications des images

---
Direction Départementale du Cadre de Vie et des Transports / Eaux, Forêts et Chasses du Zou
Contact technique : +229 96 57 66 23
République du Bénin
`;

  zip.file('README.md', rootReadme);

  // 2. Interactive Offline HTML Viewer
  const liveGeojson = nurseriesToGeojson(nurseries);
  const offlineHtml = generateOfflineHtmlViewer(nurseries, liveGeojson);
  zip.file('Visualiseur_Carto_Hors_Ligne.html', offlineHtml);

  // 3. SIG Documentation
  const sigDoc = `# Guide Pratique d'Importation SIG (QGIS & ArcGIS)
Projet BENIN-PEPI &bull; Données Géospatiales Prêtes à l'Emploi

## 🗺️ Procédure pour QGIS (Système d'Information Géographique Libre)
1. Lancez **QGIS** (version 3.16 ou plus récente).
2. Dans le panneau Explorateur (gauche), parcourez jusqu'au dossier extrait ou cliquez sur le menu :
   **Couche > Ajouter une couche > Ajouter une couche vecteur...**
3. Choisissez le fichier : \`data/PEPI_BENIN.geojson\`
4. Le Système de Coordonnées de Référence (SCR) est automatiquement détecté : **EPSG:4326 (WGS 84)**.
5. Les points géographiques apparaissent instantanément sur votre canevas !
6. Ajoutez de la même manière les limites administratives :
   - \`data/Commune_abomey.geojson\` (Polygone de la Commune d'Abomey)
   - \`data/departement_zou.geojson\` (Polygone du Département du Zou)

### 🎨 Sémiologie graphique recommandée :
- Clic droit sur la couche \`PEPI_BENIN\` > **Propriétés > Symbologie**.
- Choisissez le type **Catégorisé** sur le champ \`type\` :
  - Valeur \`ecole\` : Couleur Vert Émeraude (\`#10b981\`), symbole arbre ou école.
  - Valeur \`privee\` : Couleur Orange Ambré (\`#f59e0b\`), symbole pépinière commerciale.
- Pour afficher les étiquettes : Onglet **Étiquettes > Étiquettes simples** > Champ \`nom\`.

---

## 🧭 Procédure pour ArcGIS Pro / ArcMap
1. Ouvrez ArcGIS Pro et créez une nouvelle carte.
2. Utilisez l'outil de géotraitement **JSON To Features** :
   - *Input JSON or GeoJSON* : Sélectionnez \`data/PEPI_BENIN.geojson\`
   - *Output Feature Class* : Donnez le nom \`PEPI_BENIN_Points\`
3. La couche s'ajoute à la table des matières avec tous ses attributs (Nom, Promoteur, Capacite, etc.).

---

## 🌍 Procédure pour Google Earth Pro
1. Dans Google Earth Pro, menu **Fichier > Ouvrir...**
2. Dans le filtre des types de fichiers, sélectionnez **Tous les fichiers (*.*)** ou **GeoJSON**.
3. Choisissez \`data/PEPI_BENIN.geojson\` et validez l'importation. Les repères s'affichent en 3D sur le globe.

---

## 📊 Utilisation dans Excel / LibreOffice Calc
1. Le fichier \`data/PEPI_BENIN.csv\` est encodé en **UTF-8 avec BOM**, garantissant la bonne prise en charge de tous les caractères accentués.
2. Double-cliquez simplement sur le fichier ou utilisez le séparateur point-virgule (**;**).
`;
  zip.file('DOCUMENTATION_IMPORT_SIG.md', sigDoc);

  // 4. FOLDER data/
  const dataFolder = zip.folder('data');
  if (dataFolder) {
    if (onProgress) onProgress('Compilation des données GeoJSON et tabulaires...');

    // Live updated GeoJSON
    dataFolder.file('PEPI_BENIN.geojson', JSON.stringify(liveGeojson, null, 2));

    // CSV format
    const csvContent = '\uFEFF' + nurseriesToCsv(nurseries); // BOM for Excel UTF-8
    dataFolder.file('PEPI_BENIN.csv', csvContent);

    // Fetch Commune_abomey.geojson
    try {
      const resAbomey = await fetch('/data/Commune_abomey.geojson');
      if (resAbomey.ok) {
        const textAbomey = await resAbomey.text();
        dataFolder.file('Commune_abomey.geojson', textAbomey);
      }
    } catch (e) {
      console.warn('Could not fetch Commune_abomey', e);
    }

    // Fetch departement_zou.geojson
    try {
      const resZou = await fetch('/data/departement_zou.geojson');
      if (resZou.ok) {
        const textZou = await resZou.text();
        dataFolder.file('departement_zou.geojson', textZou);
      }
    } catch (e) {
      console.warn('Could not fetch departement_zou', e);
    }

    // Metadata JSON
    const metadataSig = {
      title: 'Référentiel Géospatial des Pépinières du Bénin (BENIN-PEPI)',
      projection: 'EPSG:4326 (WGS 84)',
      territoire: 'République du Bénin / Département du Zou / Commune d\'Abomey',
      format: 'GeoJSON & CSV',
      nombre_entites: nurseries.length,
      contact: '+229 96 57 66 23',
      date_export: new Date().toISOString(),
      champs_attributaires: [
        { nom: 'id', description: 'Identifiant unique de la pépinière' },
        { nom: 'nom', description: 'Nom officiel de la pépinière' },
        { nom: 'type', description: 'Type : ecole (Pépinière École) ou privee (Pépinière Privée)' },
        { nom: 'commune', description: 'Commune de rattachement' },
        { nom: 'arrondissement', description: 'Arrondissement de localisation' },
        { nom: 'latitude', description: 'Coordonnée Y en degrés décimaux WGS84' },
        { nom: 'longitude', description: 'Coordonnée X en degrés décimaux WGS84' },
        { nom: 'capaciteAnnuelle', description: 'Nombre de plants produits par an' },
        { nom: 'especes', description: 'Essences et espèces arboricoles dominantes' },
        { nom: 'promoteur', description: 'Nom de la personne ou entité responsable' },
        { nom: 'telephone', description: 'Numéro de contact téléphonique' },
        { nom: 'systemeArrosage', description: 'Type d\'irrigation (Forage, Solaire, Goutte-à-goutte, Puits)' }
      ]
    };
    dataFolder.file('metadata_sig.json', JSON.stringify(metadataSig, null, 2));
  }

  // 5. FOLDER assets/pepinieres/
  if (onProgress) onProgress('Structuration du dossier des images et photos de terrain...');
  const assetsFolder = zip.folder('assets');
  const pepinieresFolder = assetsFolder ? assetsFolder.folder('pepinieres') : null;

  if (pepinieresFolder) {
    const imagesReadme = `# Dossier des Photos et Images des Pépinières
Ce dossier est prêt à recevoir toutes les photographies de terrain, logos et fiches visuelles des pépinières.

## 📸 Comment associer une photo à une pépinière ?
1. Copiez vos fichiers images dans ce dossier (ex: \`pepiniere_eni.jpg\`, \`pepiniere_teme.jpg\`, \`pepiniere_agonvide.jpg\`).
2. Dans le géoportail BENIN-PEPI, lors de la création ou modification d'une pépinière, renseignez le chemin relatif :
   \`/assets/pepinieres/votre_image.jpg\`
3. Vous pouvez également glisser-déposer vos photos directement depuis le formulaire de l'application.

## Formats recommandés :
- Extensions supportées : \`.jpg\`, \`.jpeg\`, \`.png\`, \`.webp\`, \`.svg\`
- Résolution idéale : 1200 x 800 px (poids inférieur à 2 Mo)
`;
    pepinieresFolder.file('README_IMAGES.md', imagesReadme);

    // Create an index of photos currently referenced by nurseries
    const photoIndex: Record<string, { nom: string; commune: string; photoUrl: string }> = {};
    nurseries.forEach(n => {
      if (n.photoUrl) {
        photoIndex[n.id] = {
          nom: n.nom,
          commune: n.commune,
          photoUrl: n.photoUrl
        };
      }
    });
    pepinieresFolder.file('index_photos.json', JSON.stringify(photoIndex, null, 2));

    // Pack SVG sample images & real field JPG photos
    try {
      const pepiPhotos = [
        'pepi_01.jpg', 'pepi_02.jpg', 'pepi_03.jpg', 'pepi_04.jpg', 'pepi_05.jpg',
        'pepi_06.jpg', 'pepi_07.jpg', 'pepi_08.jpg', 'pepi_09.jpg', 'pepi_10.jpg',
        'pepiniere_eni.svg', 'pepiniere_teme.svg', 'modele_photo_terrain.svg'
      ];
      for (const photo of pepiPhotos) {
        try {
          const res = await fetch(`/assets/pepinieres/${photo}`);
          if (res.ok) {
            const blob = await res.blob();
            pepinieresFolder.file(photo, blob);
          }
        } catch (err) {
          console.warn(`Could not bundle photo ${photo}`, err);
        }
      }
    } catch (e) {
      console.warn('Could not fetch nursery photos', e);
    }
  }

  // 6. FOLDER assets/trees/ (Botanical tree species icons)
  const treesFolder = assetsFolder ? assetsFolder.folder('trees') : null;
  if (treesFolder) {
    const treeImages = [
      'tree_acacia.jpg', 'tree_baobab.jpg', 'tree_ecole.jpg', 'tree_fruitier.jpg',
      'tree_jeune_plant.jpg', 'tree_palmier.jpg', 'tree_privee.jpg', 'tree_teck.jpg'
    ];
    for (const tree of treeImages) {
      try {
        const res = await fetch(`/assets/trees/${tree}`);
        if (res.ok) {
          const blob = await res.blob();
          treesFolder.file(tree, blob);
        }
      } catch (err) {
        console.warn(`Could not bundle tree ${tree}`, err);
      }
    }
  }

  // 7. QGIS Ready-To-Open Project File
  const qgisProjectXml = `<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis projectname="BENIN-PEPI SIG - Pépinières du Zou &amp; Abomey" version="3.28.0">
  <homePath path=""/>
  <title>BENIN-PEPI : Géoportail des Pépinières - Département du Zou &amp; Commune d'Abomey</title>
  <autotransaction active="0"/>
  <evaluateDefaultValues active="0"/>
  <trust active="0"/>
  <projectCrs>
    <spatialrefsys>
      <wkt>GEOGCRS["WGS 84",DATUM["World Geodetic System 1984",ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["geodetic latitude (Lat)",north,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["geodetic longitude (Lon)",east,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],USAGE[SCOPE["Horizontal, vertical and 3D coordinate system."],AREA["World."],BBOX[-90,-180,90,180]],ID["EPSG",4326]]</wkt>
      <proj4>+proj=longlat +datum=WGS84 +no_defs</proj4>
      <srsid>3452</srsid>
      <srid>4326</srid>
      <authid>EPSG:4326</authid>
      <description>WGS 84</description>
      <projectionacronym>longlat</projectionacronym>
      <ellipsoidacronym>EPSG:7030</ellipsoidacronym>
      <geographicflag>true</geographicflag>
    </spatialrefsys>
  </projectCrs>
  <layer-tree-group>
    <customproperties/>
    <layer-tree-layer name="Pépinières Scolaires &amp; Privées (Points)" id="pepi_points" source="./data/PEPI_BENIN.geojson" providerKey="ogr" expanded="1" checked="Qt::Checked"/>
    <layer-tree-layer name="Limite Commune d'Abomey (Polygone)" id="abomey_poly" source="./data/Commune_abomey.geojson" providerKey="ogr" expanded="1" checked="Qt::Checked"/>
    <layer-tree-layer name="Département du Zou (Polygone)" id="zou_poly" source="./data/departement_zou.geojson" providerKey="ogr" expanded="1" checked="Qt::Checked"/>
  </layer-tree-group>
  <projectlayers>
    <maplayer type="vector" geometry="Point">
      <id>pepi_points</id>
      <datasource>./data/PEPI_BENIN.geojson</datasource>
      <layername>Pépinières Scolaires &amp; Privées (Points)</layername>
      <srs><spatialrefsys><authid>EPSG:4326</authid><description>WGS 84</description></spatialrefsys></srs>
    </maplayer>
    <maplayer type="vector" geometry="Polygon">
      <id>abomey_poly</id>
      <datasource>./data/Commune_abomey.geojson</datasource>
      <layername>Limite Commune d'Abomey (Polygone)</layername>
      <srs><spatialrefsys><authid>EPSG:4326</authid><description>WGS 84</description></spatialrefsys></srs>
    </maplayer>
    <maplayer type="vector" geometry="Polygon">
      <id>zou_poly</id>
      <datasource>./data/departement_zou.geojson</datasource>
      <layername>Département du Zou (Polygone)</layername>
      <srs><spatialrefsys><authid>EPSG:4326</authid><description>WGS 84</description></spatialrefsys></srs>
    </maplayer>
  </projectlayers>
</qgis>`;
  zip.file('Projet_QGIS_BENIN_PEPI.qgs', qgisProjectXml);
  if (onProgress) onProgress('Ajout du dossier qgis2web autonome...');
  const qgisFolder = zip.folder('qgis2web');
  if (qgisFolder) {
    const qgisFiles = [
      'index.html',
      'layers/Commune_abomey_2.js',
      'layers/BENIN_PEPI_3.js',
      'layers/layers.js',
      'styles/Commune_abomey_2_style.js',
      'styles/BENIN_PEPI_3_style.js',
      'resources/qgis2web.js',
      'resources/qgis2web.css',
      'resources/functions.js'
    ];
    for (const file of qgisFiles) {
      try {
        const res = await fetch(`/qgis2web/${file}`);
        if (res.ok) {
          const txt = await res.text();
          qgisFolder.file(file, txt);
        }
      } catch (e) {
        console.warn(`Could not bundle /qgis2web/${file}`, e);
      }
    }
  }

  if (onProgress) onProgress('Finalisation et compression de l\'archive ZIP...');

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  // Trigger download in browser
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `BENIN-PEPI_Dossier_Complet_SIG_${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  if (onProgress) onProgress('Téléchargement terminé avec succès !');
}
