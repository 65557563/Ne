export type NurseryType = 'ecole' | 'privee';

export type NurseryStatus = 'actif' | 'en_creation' | 'saisonnier' | 'inactif';

export type TreeIconCategory = 
  | 'ecole' 
  | 'privee' 
  | 'teck' 
  | 'fruitier' 
  | 'palmier' 
  | 'acacia' 
  | 'baobab' 
  | 'jeune_plant';

export interface Nursery {
  id: string;
  nom: string;
  type: NurseryType;
  commune: string;
  arrondissement: string;
  promoteur: string;
  telephone: string;
  email?: string;
  description: string;
  capaciteAnnuelle: number; // en nombre de plants par an
  especes: string[]; // ex: Teck, Acacia, Manguier greffé, Baobab, etc.
  statut: NurseryStatus;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  treeIcon?: TreeIconCategory;
  dateCreation?: string;
  superficieM2?: number;
  systemeArrosage?: string; // Puits, Forage, Manuel, Goutte-à-goutte
  rawProperties?: Record<string, any>; // Stocke tous les attributs originaux du GeoJSON (sans perte)
}

export interface GeoJSONFeatureDetails {
  title: string;
  layerName: string;
  geometryType: string;
  coordinatesFormatted?: string;
  properties: Record<string, any>;
  rawFeature?: any;
}

export interface FilterState {
  search: string;
  type: 'all' | NurseryType;
  commune: string;
  arrondissement: string;
  statut: 'all' | NurseryStatus;
  espece: string;
}

export interface LayerSettings {
  showEcoles: boolean;
  showPrivees: boolean;
  showAbomeyBoundary: boolean;
  showZouBoundary: boolean;
  baseLayer: 'osm' | 'satellite' | 'topo';
}

export type ActiveTab = 'home' | 'about' | 'map' | 'list' | 'stats' | 'ressources' | 'contact' | 'add' | 'admin' | 'data_files';

export interface AdminAccount {
  id: string;
  nom: string;
  email: string;
  passwordHash: string;
  role: string;
  organisation?: string;
  telephone?: string;
  dateCreation: string;
  avatarColor?: string;
}

export interface CustomGeoJsonLayer {
  id: string;
  name: string;
  data: any;
  color: string;
  visible: boolean;
  featureCount: number;
  geometryType: string;
  dateAdded: string;
  opacity?: number;
}

