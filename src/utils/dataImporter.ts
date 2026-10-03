import { Nursery, NurseryType, NurseryStatus, TreeIconCategory } from '../types';
import { geojsonToNurseries } from '../data/nurseryData';
import { getNurseryTreeCategory } from './markerIcons';
import { LOCAL_NURSERY_PHOTOS } from './imageHelper';

export interface ParseResult {
  success: boolean;
  nurseries: Nursery[];
  formatDetected: 'geojson' | 'csv' | 'json_array' | 'unknown';
  error?: string;
  totalParsed: number;
  validCoordsCount: number;
  warnings?: string[];
  columnsFound?: string[];
}

/**
 * Clean and normalize a string key for fuzzy column matching
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, ''); // remove spaces and punctuation
}

/**
 * Intelligent field mapper for Nursery objects
 */
function mapRecordToNursery(record: Record<string, any>, index: number): Nursery | null {
  const normMap: Record<string, any> = {};
  for (const [k, v] of Object.entries(record)) {
    normMap[normalizeKey(k)] = v;
  }

  // 1. Nom de la pépinière
  const nom = 
    normMap['nom'] ||
    normMap['name'] ||
    normMap['pepiniere'] ||
    normMap['nompepiniere'] ||
    normMap['designation'] ||
    normMap['site'] ||
    normMap['titre'] ||
    normMap['etablissement'] ||
    `Pépinière #${index + 1}`;

  // 2. Type (ecole vs privee)
  const rawType = String(
    normMap['type'] ||
    normMap['categorie'] ||
    normMap['nature'] ||
    normMap['statutjuridique'] ||
    normMap['typepepiniere'] ||
    ''
  ).toLowerCase();

  const type: NurseryType = 
    rawType.includes('ecole') || rawType.includes('scol') || rawType.includes('pub')
      ? 'ecole'
      : 'privee';

  // 3. Commune
  const commune = 
    normMap['commune'] ||
    normMap['ville'] ||
    normMap['localite'] ||
    normMap['district'] ||
    normMap['municipality'] ||
    'Abomey';

  // 4. Arrondissement
  const arrondissement = 
    normMap['arrondissement'] ||
    normMap['arrond'] ||
    normMap['arr'] ||
    normMap['secteur'] ||
    normMap['quartier'] ||
    'Centre';

  // 5. Promoteur / Responsable
  const promoteur = 
    normMap['promoteur'] ||
    normMap['responsable'] ||
    normMap['gestionnaire'] ||
    normMap['proprietaire'] ||
    normMap['directeur'] ||
    normMap['contactnom'] ||
    'Non renseigné';

  // 6. Telephone & Email
  const telephone = 
    normMap['telephone'] ||
    normMap['tel'] ||
    normMap['phone'] ||
    normMap['contact'] ||
    normMap['cel'] ||
    normMap['mobile'] ||
    '+229 -- -- -- --';

  const email = normMap['email'] || normMap['mail'] || normMap['courriel'] || undefined;

  // 7. Coordinates & Smart Detection for Benin (Lat ~ 6 to 9, Lon ~ 1 to 3)
  let rawLat = 
    normMap['latitude'] ??
    normMap['lat'] ??
    normMap['y'] ??
    normMap['latdd'] ??
    normMap['nord'] ??
    normMap['coordy'];

  let rawLng = 
    normMap['longitude'] ??
    normMap['lng'] ??
    normMap['lon'] ??
    normMap['x'] ??
    normMap['longdd'] ??
    normMap['est'] ??
    normMap['coordx'];

  // Handle commas in numbers like "7,1845"
  const parseNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return NaN;
    const str = String(val).trim().replace(',', '.');
    return parseFloat(str);
  };

  let lat = parseNum(rawLat);
  let lng = parseNum(rawLng);

  // If coordinates are inverted (e.g. lat is ~ 1-3 and lon is ~ 6-8, which is common when X/Y or Lat/Lon is swapped)
  if (!isNaN(lat) && !isNaN(lng)) {
    if (lat >= 0.5 && lat <= 4.0 && lng >= 6.0 && lng <= 12.5) {
      // Swapped! Let's correct it
      const temp = lat;
      lat = lng;
      lng = temp;
    }
  }

  // Fallbacks if missing
  if (isNaN(lat)) lat = 7.1845 + (Math.random() - 0.5) * 0.08;
  if (isNaN(lng)) lng = 1.9912 + (Math.random() - 0.5) * 0.08;

  // 8. Capacite
  const rawCapacite = 
    normMap['capaciteannuelle'] ??
    normMap['capacite'] ??
    normMap['capacitean'] ??
    normMap['nbreplants'] ??
    normMap['plants'] ??
    normMap['production'];
  const capaciteAnnuelle = Number(rawCapacite) || 12000;

  // 9. Superficie
  const rawSuperficie = 
    normMap['superficiem2'] ??
    normMap['superficie'] ??
    normMap['surface'] ??
    normMap['taillem2'];
  const superficieM2 = Number(rawSuperficie) || 1000;

  // 10. Especes / Essences
  let especes: string[] = [];
  const rawEspeces = 
    normMap['especes'] ||
    normMap['essences'] ||
    normMap['varietes'] ||
    normMap['arbres'] ||
    normMap['plants'] ||
    normMap['espece'];

  if (Array.isArray(rawEspeces)) {
    especes = rawEspeces.map(String);
  } else if (typeof rawEspeces === 'string' && rawEspeces.trim()) {
    especes = rawEspeces
      .split(/[,;|/]/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  if (especes.length === 0) {
    especes = ['Acacia auriculiformis', 'Teck', 'Manguier greffé'];
  }

  // 11. Statut
  const rawStatut = String(normMap['statut'] || normMap['status'] || normMap['etat'] || 'actif').toLowerCase();
  let statut: NurseryStatus = 'actif';
  if (rawStatut.includes('crea') || rawStatut.includes('proj')) statut = 'en_creation';
  else if (rawStatut.includes('sais') || rawStatut.includes('temp')) statut = 'saisonnier';
  else if (rawStatut.includes('inact') || rawStatut.includes('ferm')) statut = 'inactif';

  // 12. Systeme d'arrosage
  const systemeArrosage = 
    normMap['systemearrosage'] ||
    normMap['arrosage'] ||
    normMap['systemeeau'] ||
    normMap['sourceeau'] ||
    normMap['eau'] ||
    'Forage avec motopompe';

  // 13. Description
  const description = 
    normMap['description'] ||
    normMap['details'] ||
    normMap['notes'] ||
    normMap['remarque'] ||
    `Pépinière ${type === 'ecole' ? 'scolaire' : 'privée'} située à ${commune} (${arrondissement}).`;

  // 14. Photo (using real local nursery photos)
  const defaultPhoto = LOCAL_NURSERY_PHOTOS[index % LOCAL_NURSERY_PHOTOS.length];
  let photoUrl = normMap['photourl'] || normMap['photo'] || normMap['image'] || defaultPhoto;
  if (!photoUrl || String(photoUrl).trim() === '' || String(photoUrl).includes('unsplash.com')) {
    photoUrl = defaultPhoto;
  }

  // 15. Tree Icon Category
  const rawTreeIcon = normMap['treeicon'] || normMap['iconearbre'] || normMap['icone_arbre'] || normMap['icone'];
  const treeIcon: TreeIconCategory = rawTreeIcon && typeof rawTreeIcon === 'string'
    ? (rawTreeIcon as TreeIconCategory)
    : getNurseryTreeCategory({ type, especes, statut, nom: String(nom) });

  const id = String(normMap['id'] || `pepi-${Date.now().toString().slice(-4)}-${index + 1}`);

  return {
    id,
    nom: String(nom),
    type,
    treeIcon,
    commune: String(commune),
    arrondissement: String(arrondissement),
    promoteur: String(promoteur),
    telephone: String(telephone),
    email: email ? String(email) : undefined,
    description: String(description),
    capaciteAnnuelle,
    especes,
    statut,
    latitude: lat,
    longitude: lng,
    photoUrl: String(photoUrl),
    superficieM2,
    systemeArrosage: String(systemeArrosage),
    rawProperties: {
      ...record,
      NOM: nom,
      COMMUNE: commune,
      ARRONDISSEMENT: arrondissement,
      TYPE: type,
      ICONE_ARBRE: treeIcon,
      GESTIONNAIRE: promoteur,
      CONTACT: telephone,
      CAPACITE_AN: capaciteAnnuelle,
      SUPERFICIE_M2: superficieM2,
      ESSENCES: especes.join(', '),
      SYSTEME_EAU: systemeArrosage,
      LATITUDE: lat,
      LONGITUDE: lng,
      COORD_EPSG4326: `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  };
}

/**
 * Parse CSV or TSV text with robust delimiter detection
 */
export function parseCsvText(csvText: string): Record<string, any>[] {
  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) return [];

  // Detect delimiter: semicolon, comma, tab, or pipe
  const firstLine = lines[0];
  const countSemicolons = (firstLine.match(/;/g) || []).length;
  const countTabs = (firstLine.match(/\t/g) || []).length;
  const countCommas = (firstLine.match(/,/g) || []).length;
  const countPipes = (firstLine.match(/\|/g) || []).length;

  let delimiter = ',';
  if (countSemicolons >= countCommas && countSemicolons >= countTabs) delimiter = ';';
  else if (countTabs > countCommas && countTabs > countSemicolons) delimiter = '\t';
  else if (countPipes > countCommas) delimiter = '|';

  // Helper to split a CSV line respecting quotes
  const splitLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = splitLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());

  const records: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]).map(v => v.replace(/^["']|["']$/g, '').trim());
    const row: Record<string, any> = {};
    headers.forEach((header, colIndex) => {
      row[header] = values[colIndex] ?? '';
    });
    records.push(row);
  }

  return records;
}

/**
 * Universal Parser that ingests string text (GeoJSON, JSON, CSV) or object
 */
export function parseRawDataToNurseries(input: string | any): ParseResult {
  const warnings: string[] = [];

  // Case 1: Already an object
  if (typeof input === 'object' && input !== null) {
    if (input.type === 'FeatureCollection' || Array.isArray(input.features)) {
      const parsed = geojsonToNurseries(input);
      return {
        success: parsed.length > 0,
        nurseries: parsed,
        formatDetected: 'geojson',
        totalParsed: parsed.length,
        validCoordsCount: parsed.filter(p => !isNaN(p.latitude) && !isNaN(p.longitude)).length
      };
    }
    if (Array.isArray(input)) {
      const mapped = input.map((item, idx) => mapRecordToNursery(item, idx)).filter(Boolean) as Nursery[];
      return {
        success: mapped.length > 0,
        nurseries: mapped,
        formatDetected: 'json_array',
        totalParsed: mapped.length,
        validCoordsCount: mapped.filter(p => !isNaN(p.latitude) && !isNaN(p.longitude)).length
      };
    }
  }

  const text = String(input || '').trim();
  if (!text) {
    return {
      success: false,
      nurseries: [],
      formatDetected: 'unknown',
      totalParsed: 0,
      validCoordsCount: 0,
      error: 'Le contenu fourni est vide.'
    };
  }

  // Attempt JSON/GeoJSON parsing
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const parsedJson = JSON.parse(text);

      if (parsedJson.type === 'FeatureCollection' || Array.isArray(parsedJson.features)) {
        const nurseries = geojsonToNurseries(parsedJson);
        return {
          success: nurseries.length > 0,
          nurseries,
          formatDetected: 'geojson',
          totalParsed: nurseries.length,
          validCoordsCount: nurseries.filter(p => !isNaN(p.latitude) && !isNaN(p.longitude)).length
        };
      }

      if (Array.isArray(parsedJson)) {
        const nurseries = parsedJson.map((item, idx) => mapRecordToNursery(item, idx)).filter(Boolean) as Nursery[];
        return {
          success: nurseries.length > 0,
          nurseries,
          formatDetected: 'json_array',
          totalParsed: nurseries.length,
          validCoordsCount: nurseries.filter(p => !isNaN(p.latitude) && !isNaN(p.longitude)).length
        };
      }
    } catch {
      // If JSON parse failed, try CSV fallback
    }
  }

  // Attempt CSV parsing
  try {
    const csvRecords = parseCsvText(text);
    if (csvRecords.length > 0) {
      const nurseries = csvRecords
        .map((row, idx) => mapRecordToNursery(row, idx))
        .filter(Boolean) as Nursery[];

      if (nurseries.length > 0) {
        return {
          success: true,
          nurseries,
          formatDetected: 'csv',
          totalParsed: nurseries.length,
          validCoordsCount: nurseries.filter(p => !isNaN(p.latitude) && !isNaN(p.longitude)).length,
          columnsFound: Object.keys(csvRecords[0] || {})
        };
      }
    }
  } catch (err: any) {
    warnings.push(`CSV parsing error: ${err?.message}`);
  }

  return {
    success: false,
    nurseries: [],
    formatDetected: 'unknown',
    totalParsed: 0,
    validCoordsCount: 0,
    error: 'Format non reconnu. Veuillez fournir un fichier GeoJSON, CSV ou JSON valide.'
  };
}

/**
 * Sample CSV Template generator
 */
export function getSampleCsvTemplate(): string {
  return `Nom;Type;Commune;Arrondissement;Promoteur;Telephone;Latitude;Longitude;CapaciteAnnuelle;Especes;Statut;SuperficieM2;SystemeArrosage
"Pépinière Royale d'Abomey";"privee";"Abomey";"Vidolè";"Koffi Agbossou";"+229 97 11 22 33";7.1852;1.9924;35000;"Teck, Manguier greffé, Acacia";"actif";1500;"Forage solaire"
"Pépinière Scolaire CEG 2 Bohicon";"ecole";"Bohicon";"Bohicon 2";"Club Écologie CEG 2";"+229 95 88 77 66";7.1980;2.0620;20000;"Acacia auriculiformis, Baobab, Eucalyptus";"actif";1200;"Puits tubé"
"Pépinière Forestière d'Agbangnizoun";"privee";"Agbangnizoun";"Agbangnizoun Centre";"Coopérative Zou Vert";"+229 96 44 33 22";7.1120;1.9560;40000;"Palmier à huile amélioré, Anacardier, Néré";"actif";3000;"Goutte-à-goutte"`;
}

/**
 * Sample GeoJSON Template generator
 */
export const GIS_LAYER_COLORS = [
  '#10B981', // Emerald
  '#2563EB', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#E11D48', // Rose
  '#0D9488', // Teal
  '#EA580C', // Orange
  '#06B6D4', // Cyan
  '#4F46E5', // Indigo
  '#84CC16'  // Lime
];

export interface GeoJsonAnalysis {
  isValid: boolean;
  featureCount: number;
  geometryTypes: string[];
  mainGeometryType: string;
  isNurseryDataset: boolean;
  nurseriesFound: Nursery[];
  previewProperties: Record<string, any>[];
  suggestedTitle: string;
  error?: string;
  rawJson?: any;
}

/**
 * Robust analyzer for any GeoJSON file: Polygons, Lines, Points, FeatureCollections
 */
export function analyzeGeoJsonContent(content: string | any, fallbackTitle: string = 'Couche GeoJSON'): GeoJsonAnalysis {
  let parsed: any;
  if (typeof content === 'object' && content !== null) {
    parsed = content;
  } else {
    try {
      parsed = JSON.parse(String(content || '').trim());
    } catch (e: any) {
      return {
        isValid: false,
        featureCount: 0,
        geometryTypes: [],
        mainGeometryType: 'Invalide',
        isNurseryDataset: false,
        nurseriesFound: [],
        previewProperties: [],
        suggestedTitle: fallbackTitle,
        error: 'Le fichier ne contient pas une structure JSON/GeoJSON valide : ' + (e?.message || 'Erreur de syntaxe')
      };
    }
  }

  // Extract features array
  let features: any[] = [];
  if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
    features = parsed.features;
  } else if (parsed.type === 'Feature') {
    features = [parsed];
  } else if (Array.isArray(parsed)) {
    features = parsed.map((item: any, i: number) => {
      if (item && item.type === 'Feature') return item;
      if (item && item.geometry) return { type: 'Feature', geometry: item.geometry, properties: item.properties || {} };
      if (item && (item.latitude || item.lat) && (item.longitude || item.lng)) {
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [Number(item.longitude || item.lng), Number(item.latitude || item.lat)] },
          properties: item
        };
      }
      return null;
    }).filter(Boolean);
  } else if (parsed.geometry && parsed.properties) {
    features = [{ type: 'Feature', geometry: parsed.geometry, properties: parsed.properties }];
  } else if (parsed.coordinates && parsed.type) {
    // Single geometry
    features = [{ type: 'Feature', geometry: parsed, properties: { nom: fallbackTitle } }];
  }

  if (features.length === 0) {
    return {
      isValid: false,
      featureCount: 0,
      geometryTypes: [],
      mainGeometryType: 'Vide',
      isNurseryDataset: false,
      nurseriesFound: [],
      previewProperties: [],
      suggestedTitle: fallbackTitle,
      error: 'Aucune entité géospatiale (Feature) détectée dans ce fichier GeoJSON.'
    };
  }

  // Count geometry types
  const typeCounts: Record<string, number> = {};
  const previewProps: Record<string, any>[] = [];

  features.forEach((f, idx) => {
    const gType = f?.geometry?.type || 'Inconnue';
    typeCounts[gType] = (typeCounts[gType] || 0) + 1;
    if (idx < 5 && f?.properties) {
      previewProps.push(f.properties);
    }
  });

  const geometryTypes = Object.keys(typeCounts);
  let mainGeometryType = geometryTypes[0] || 'Inconnue';
  if (geometryTypes.length > 1) {
    mainGeometryType = 'Mixte (' + geometryTypes.join(', ') + ')';
  } else if (mainGeometryType === 'Polygon' || mainGeometryType === 'MultiPolygon') {
    mainGeometryType = 'Polygone(s)';
  } else if (mainGeometryType === 'LineString' || mainGeometryType === 'MultiLineString') {
    mainGeometryType = 'Ligne(s)';
  } else if (mainGeometryType === 'Point' || mainGeometryType === 'MultiPoint') {
    mainGeometryType = 'Point(s)';
  }

  // Test if it contains nursery points
  let nurseriesFound: Nursery[] = [];
  try {
    const rawParsed = geojsonToNurseries(parsed.type === 'FeatureCollection' ? parsed : { type: 'FeatureCollection', features });
    nurseriesFound = rawParsed;
  } catch {
    nurseriesFound = [];
  }

  const isNurseryDataset = nurseriesFound.length > 0 && nurseriesFound.some(n => 
    Boolean(n.nom && (n.capaciteAnnuelle || n.especes.length > 0 || n.type || n.commune))
  );

  const suggestedTitle = 
    parsed.name || 
    features[0]?.properties?.layer || 
    features[0]?.properties?.nom || 
    fallbackTitle.replace(/\.(geojson|json)$/i, '');

  return {
    isValid: true,
    featureCount: features.length,
    geometryTypes,
    mainGeometryType,
    isNurseryDataset,
    nurseriesFound,
    previewProperties: previewProps,
    suggestedTitle,
    rawJson: parsed.type === 'FeatureCollection' ? parsed : { type: 'FeatureCollection', features }
  };
}

/**
 * Sample GeoJSON Template generator
 */
export function getSampleGeojsonTemplate(): string {
  return JSON.stringify({
    type: "FeatureCollection",
    name: "PEPI_BENIN_NOUVEAU",
    crs: { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    features: [
      {
        type: "Feature",
        properties: {
          id: "pepi-new-01",
          nom: "Pépinière Centrale d'Abomey",
          type: "privee",
          commune: "Abomey",
          arrondissement: "Vidolè",
          promoteur: "Groupement Silvo-Agricole",
          telephone: "+229 97 00 11 22",
          capaciteAnnuelle: 35000,
          especes: ["Teck", "Manguier greffé", "Acacia"],
          statut: "actif",
          superficieM2: 2000,
          systemeArrosage: "Forage solaire"
        },
        geometry: {
          type: "Point",
          coordinates: [1.9924, 7.1852]
        }
      }
    ]
  }, null, 2);
}
