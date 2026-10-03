import { Nursery, TreeIconCategory } from '../types';
import { getNurseryTreeCategory } from '../utils/markerIcons';

export const NURSERY_PHOTOS = [
  '/assets/pepinieres/pepi_01.jpg',
  '/assets/pepinieres/pepi_02.jpg',
  '/assets/pepinieres/pepi_03.jpg',
  '/assets/pepinieres/pepi_04.jpg',
  '/assets/pepinieres/pepi_05.jpg',
  '/assets/pepinieres/pepi_06.jpg',
  '/assets/pepinieres/pepi_07.jpg',
  '/assets/pepinieres/pepi_08.jpg',
  '/assets/pepinieres/pepi_09.jpg',
  '/assets/pepinieres/pepi_10.jpg'
];

export const INITIAL_NURSERIES: Nursery[] = [
  {
    id: 'pepi-01',
    nom: "Pépinière de l'ENI",
    type: 'ecole',
    treeIcon: 'ecole',
    commune: 'Abomey',
    arrondissement: 'Vidolè',
    promoteur: "École Normale d'Instituteurs d'Abomey",
    telephone: '+229 97 12 34 56',
    email: 'eni.abomey@education.gouv.bj',
    description: "Pépinière pédagogique de l'ENI Abomey dédiée à la formation pratique des élèves-maîtres aux techniques sylvicoles et reboisement scolaire.",
    capaciteAnnuelle: 25000,
    especes: ['Acacia auriculiformis', 'Teck (Tectona grandis)', 'Manguier greffé', 'Eucalyptus'],
    statut: 'actif',
    latitude: 7.1845,
    longitude: 1.9912,
    photoUrl: '/assets/pepinieres/pepi_01.jpg',
    dateCreation: '2021-04-15',
    superficieM2: 1200,
    systemeArrosage: 'Forage avec pompe solaire'
  },
  {
    id: 'pepi-02',
    nom: 'Pépinière TEME',
    type: 'privee',
    treeIcon: 'fruitier',
    commune: 'Bohicon',
    arrondissement: 'Bohicon 1',
    promoteur: 'M. Barnabé Agossou (GIE TEME)',
    telephone: '+229 95 44 88 12',
    email: 'contact@teme-benin.org',
    description: "Exploitation privée d'agroforesterie spécialisée dans la multiplication d'arbres fruitiers tropicaux greffés et bois d'œuvre.",
    capaciteAnnuelle: 45000,
    especes: ['Manguier greffé', 'Agrumes (Oranger, Citronnier)', 'Palmier à huile', 'Anacardier'],
    statut: 'actif',
    latitude: 7.1782,
    longitude: 2.0678,
    photoUrl: '/assets/pepinieres/pepi_02.jpg',
    dateCreation: '2018-06-10',
    superficieM2: 2500,
    systemeArrosage: 'Goutte-à-goutte'
  },
  {
    id: 'pepi-03',
    nom: 'Pépinière de Tchanou',
    type: 'ecole',
    treeIcon: 'baobab',
    commune: 'Bantè',
    arrondissement: 'Bantè Centre',
    promoteur: 'Club Environnement CEG Tchanou',
    telephone: '+229 96 33 21 00',
    description: "Projet d'éco-citoyenneté des élèves de collège pour la lutte contre la désertification et l'embellissement des espaces scolaires.",
    capaciteAnnuelle: 15000,
    especes: ['Baobab', 'Khaya senegalensis (Caïlcédrat)', 'Teck', 'Moringa'],
    statut: 'actif',
    latitude: 7.4210,
    longitude: 1.8845,
    photoUrl: '/assets/pepinieres/pepi_03.jpg',
    dateCreation: '2022-10-05',
    superficieM2: 800,
    systemeArrosage: 'Puits à motopompe'
  },
  {
    id: 'pepi-04',
    nom: 'Pépinière Agonvidé',
    type: 'privee',
    treeIcon: 'fruitier',
    commune: 'Abomey',
    arrondissement: 'Djègbé',
    promoteur: 'Mme Pascaline Dossou',
    telephone: '+229 97 88 55 22',
    email: 'agonvide.pepi@gmail.com',
    description: "Pépinière horticole et forestière fournissant les riverains et les collectivités locales pour la végétalisation urbaine d'Abomey.",
    capaciteAnnuelle: 20000,
    especes: ['Flamboyant', 'Acacia', 'Goyavier', 'Corossolier', 'Ficus'],
    statut: 'actif',
    latitude: 7.1720,
    longitude: 1.9820,
    photoUrl: '/assets/pepinieres/pepi_04.jpg',
    dateCreation: '2020-03-12',
    superficieM2: 950,
    systemeArrosage: 'Raccordement SONEB & cuve'
  },
  {
    id: 'pepi-05',
    nom: 'Pépinière Sègbé',
    type: 'ecole',
    treeIcon: 'acacia',
    commune: 'Abomey',
    arrondissement: 'Sèhoun',
    promoteur: 'École Primaire Publique Sègbé',
    telephone: '+229 61 70 80 90',
    description: "Initiative communautaire scolaire intégrant les parents d'élèves pour reboiser la cour de récréation et créer un verger scolaire.",
    capaciteAnnuelle: 8000,
    especes: ['Papayer solo', 'Manguier', 'Acacia', 'Citronnelle'],
    statut: 'actif',
    latitude: 7.1580,
    longitude: 1.9650,
    photoUrl: '/assets/pepinieres/pepi_05.jpg',
    dateCreation: '2023-01-20',
    superficieM2: 600,
    systemeArrosage: 'Manuel'
  },
  {
    id: 'pepi-06',
    nom: 'Pépinière Forestière CEG 1 Bohicon',
    type: 'ecole',
    treeIcon: 'teck',
    commune: 'Bohicon',
    arrondissement: 'Bohicon 2',
    promoteur: 'Club Vert CEG 1',
    telephone: '+229 97 45 10 20',
    description: "Grande pépinière scolaire établie en partenariat avec l'Inspection Forestière du Zou pour la distribution de plants aux écoles.",
    capaciteAnnuelle: 35000,
    especes: ['Teck (Tectona grandis)', 'Khaya senegalensis', 'Acacia auriculiformis', 'Gmelina arborea'],
    statut: 'actif',
    latitude: 7.2020,
    longitude: 2.0590,
    photoUrl: '/assets/pepinieres/pepi_06.jpg',
    dateCreation: '2019-11-10',
    superficieM2: 1800,
    systemeArrosage: 'Forage'
  },
  {
    id: 'pepi-07',
    nom: 'Pépinière Privée Bio-Vert Dako',
    type: 'privee',
    treeIcon: 'palmier',
    commune: 'Abomey',
    arrondissement: 'Hounli',
    promoteur: 'M. Sylvestre Dako',
    telephone: '+229 96 11 22 33',
    description: "Production de plants maraîchers et d'arbres à forte valeur ajoutée économique pour les planteurs du plateau d'Abomey.",
    capaciteAnnuelle: 30000,
    especes: ['Anacardier', 'Palmier à huile amélioré', 'Manguier Kent', 'Avocatier'],
    statut: 'actif',
    latitude: 7.1990,
    longitude: 2.0080,
    photoUrl: '/assets/pepinieres/pepi_07.jpg',
    dateCreation: '2017-09-01',
    superficieM2: 1500,
    systemeArrosage: 'Puits tubé avec surpresseur'
  },
  {
    id: 'pepi-08',
    nom: 'Pépinière Écologique de Covè',
    type: 'privee',
    treeIcon: 'acacia',
    commune: 'Covè',
    arrondissement: 'Covè Centre',
    promoteur: 'Coopérative des Pépiniéristes du Zou-Est',
    telephone: '+229 97 60 70 80',
    description: "Spécialisée dans la restauration des berges du fleuve Ouémé et la fourniture de bois d'énergie.",
    capaciteAnnuelle: 40000,
    especes: ['Bambou géant', 'Acacia', 'Teck', 'Rônier'],
    statut: 'actif',
    latitude: 7.2210,
    longitude: 2.3410,
    photoUrl: '/assets/pepinieres/pepi_08.jpg',
    dateCreation: '2020-07-22',
    superficieM2: 2200,
    systemeArrosage: 'Pompage fleuve'
  },
  {
    id: 'pepi-09',
    nom: 'Pépinière Oasis Verte Djidja',
    type: 'privee',
    treeIcon: 'baobab',
    commune: 'Djidja',
    arrondissement: 'Djidja Centre',
    promoteur: 'GIE Agro-Pastorale Zou',
    telephone: '+229 94 00 11 22',
    description: "Grande station de pépinière pour plantations agroforestières et brise-vents au nord d'Abomey.",
    capaciteAnnuelle: 50000,
    especes: ['Anacardier', 'Teck', 'Moringa', 'Néré'],
    statut: 'actif',
    latitude: 7.3450,
    longitude: 1.9320,
    photoUrl: '/assets/pepinieres/pepi_09.jpg',
    dateCreation: '2019-02-14',
    superficieM2: 3200,
    systemeArrosage: 'Retenue d eau collinaire'
  },
  {
    id: 'pepi-10',
    nom: 'Pépinière Scolaire CEG Agbangnizoun',
    type: 'ecole',
    treeIcon: 'teck',
    commune: 'Agbangnizoun',
    arrondissement: 'Agbangnizoun Centre',
    promoteur: "Collège d'Enseignement Général Agbangnizoun",
    telephone: '+229 95 12 78 90',
    description: 'Pépinière entretenue par les élèves du club UNESCO pour reboiser les pistes rurales et sentiers scolaires.',
    capaciteAnnuelle: 12000,
    especes: ['Acacia', 'Teck', 'Manguier', 'Gmelina'],
    statut: 'actif',
    latitude: 7.0850,
    longitude: 1.9610,
    photoUrl: '/assets/pepinieres/pepi_10.jpg',
    dateCreation: '2022-03-01',
    superficieM2: 750,
    systemeArrosage: 'Puits'
  },
  {
    id: 'pepi-11',
    nom: 'Pépinière Reforest Zagnanado',
    type: 'privee',
    treeIcon: 'palmier',
    commune: 'Zagnanado',
    arrondissement: 'Zagnanado',
    promoteur: 'Association Terre Fertile',
    telephone: '+229 97 34 56 78',
    description: "Production d'arbres mellifères et d'arbres d'ombrage pour vergers apicoles.",
    capaciteAnnuelle: 18000,
    especes: ['Moringa', 'Acacia auriculiformis', 'Eucalyptus', 'Baobab'],
    statut: 'actif',
    latitude: 7.2650,
    longitude: 2.4150,
    photoUrl: '/assets/pepinieres/pepi_01.jpg',
    dateCreation: '2021-08-19',
    superficieM2: 1100,
    systemeArrosage: 'Manuel & arrosage localisé'
  },
  {
    id: 'pepi-12',
    nom: 'Pépinière Verte de Za-Kpota',
    type: 'ecole',
    treeIcon: 'jeune_plant',
    commune: 'Za-Kpota',
    arrondissement: 'Za-Kpota Centre',
    promoteur: 'Inspection Pédagogique Za-Kpota',
    telephone: '+229 96 78 12 34',
    description: 'Sensibilisation pratique des écoliers aux changements climatiques et protection des sols.',
    capaciteAnnuelle: 14000,
    especes: ['Teck', 'Acacia', 'Néré', 'Tamarinier'],
    statut: 'en_creation',
    latitude: 7.2380,
    longitude: 2.2150,
    photoUrl: '/assets/pepinieres/pepi_02.jpg',
    dateCreation: '2024-02-10',
    superficieM2: 850,
    systemeArrosage: "Citerne d'eau de pluie"
  }
];

export const COMMUNES_ZOU = [
  'Abomey',
  'Bohicon',
  'Djidja',
  'Za-Kpota',
  'Zogbodomey',
  'Covè',
  'Zagnanado',
  'Agbangnizoun',
  'Ouinhi',
  'Bantè'
];

export const ESPECES_COURANTES = [
  'Acacia auriculiformis',
  'Teck (Tectona grandis)',
  'Manguier greffé',
  'Baobab (Adansonia digitata)',
  'Khaya senegalensis (Caïlcédrat)',
  'Eucalyptus',
  'Palmier à huile amélioré',
  'Anacardier (Anacardium occidentale)',
  'Moringa oleifera',
  'Gmelina arborea',
  'Agrumes (Citronnier, Oranger)',
  'Flamboyant',
  'Néré (Parkia biglobosa)',
  'Bambou géant'
];

/**
 * Helper to convert GeoJSON FeatureCollection to Nursery[]
 */
export function geojsonToNurseries(geojson: any): Nursery[] {
  if (!geojson || !Array.isArray(geojson.features)) {
    return [];
  }

  return geojson.features.map((feature: any, index: number) => {
    const props = feature.properties || {};
    const coords = feature.geometry?.coordinates || [2.0, 7.18];
    const lng = Number(coords[0]) || 2.0;
    const lat = Number(coords[1]) || 7.18;

    const rawType = (props.type || props.type_pep || props.categorie || '').toLowerCase();
    const type = rawType.includes('ecole') || rawType.includes('scolaire') ? 'ecole' : 'privee';

    let especes: string[] = [];
    if (Array.isArray(props.especes)) {
      especes = props.especes;
    } else if (typeof props.especes === 'string') {
      especes = props.especes.split(',').map((s: string) => s.trim());
    } else if (typeof props.varietes === 'string') {
      especes = props.varietes.split(',').map((s: string) => s.trim());
    } else {
      especes = ['Acacia', 'Teck', 'Manguier'];
    }

    const rawTreeIcon = props.treeIcon || props.icone_arbre || props.iconeArbre;
    const treeIcon: TreeIconCategory = rawTreeIcon && typeof rawTreeIcon === 'string'
      ? (rawTreeIcon as TreeIconCategory)
      : getNurseryTreeCategory({ type, especes, statut: props.statut, nom: props.nom });

    return {
      id: String(props.id || `pepi-${index + 1}`),
      nom: props.nom || props.name || props.NOM || `Pépinière #${index + 1}`,
      type,
      treeIcon,
      commune: props.commune || props.COMMUNE || 'Abomey',
      arrondissement: props.arrondissement || props.ARROND || 'Centre',
      promoteur: props.promoteur || props.responsable || props.GESTION || 'Non renseigné',
      telephone: props.telephone || props.tel || props.contact || '+229 -- -- -- --',
      email: props.email,
      description: props.description || 'Pépinière répertoriée dans le cadre de BENIN-PEPI.',
      capaciteAnnuelle: Number(props.capaciteAnnuelle || props.capacite || props.capacite_an) || 10000,
      especes,
      statut: props.statut === 'en_creation' ? 'en_creation' : props.statut === 'saisonnier' ? 'saisonnier' : 'actif',
      latitude: lat,
      longitude: lng,
      photoUrl: props.photoUrl || props.photo || props.image || NURSERY_PHOTOS[index % NURSERY_PHOTOS.length],
      dateCreation: props.dateCreation || props.date_crea || '2022-01-01',
      superficieM2: Number(props.superficieM2 || props.superficie) || 800,
      systemeArrosage: props.systemeArrosage || 'Forage / Puits',
      rawProperties: {
        ...props,
        NOM: props.nom || props.name || props.NOM || `Pépinière #${index + 1}`,
        COMMUNE: props.commune || props.COMMUNE || 'Abomey',
        ARRONDISSEMENT: props.arrondissement || props.ARROND || 'Centre',
        TYPE: type,
        ICONE_ARBRE: treeIcon,
        GESTIONNAIRE: props.promoteur || props.responsable || props.GESTION || 'Non renseigné',
        CONTACT: props.telephone || props.tel || props.contact || '+229 -- -- -- --',
        CAPACITE_AN: Number(props.capaciteAnnuelle || props.capacite || props.capacite_an) || 10000,
        SUPERFICIE_M2: Number(props.superficieM2 || props.superficie) || 800,
        ESSENCES: Array.isArray(especes) ? especes.join(', ') : especes,
        SYSTEME_EAU: props.systemeArrosage || 'Forage / Puits',
        LATITUDE: lat,
        LONGITUDE: lng,
        COORD_EPSG4326: `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      }
    };
  });
}

/**
 * Helper to convert Nursery[] to standard GeoJSON FeatureCollection
 */
export function nurseriesToGeojson(nurseries: Nursery[]) {
  return {
    type: 'FeatureCollection',
    name: 'PEPI_BENIN',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    features: nurseries.map(n => ({
      type: 'Feature',
      properties: {
        ...(n.rawProperties || {}),
        id: n.id,
        nom: n.nom,
        type: n.type,
        treeIcon: n.treeIcon || 'ecole',
        icone_arbre: n.treeIcon || 'ecole',
        commune: n.commune,
        arrondissement: n.arrondissement,
        promoteur: n.promoteur,
        telephone: n.telephone,
        email: n.email || '',
        description: n.description,
        capaciteAnnuelle: n.capaciteAnnuelle,
        especes: n.especes,
        statut: n.statut,
        photoUrl: n.photoUrl || '',
        dateCreation: n.dateCreation || '',
        superficieM2: n.superficieM2 || 0,
        systemeArrosage: n.systemeArrosage || '',
        latitude: n.latitude,
        longitude: n.longitude,
        crs_epsg: 'EPSG:4326 (WGS84)',
        date_export: new Date().toISOString()
      },
      geometry: {
        type: 'Point',
        coordinates: [n.longitude, n.latitude]
      }
    }))
  };
}
