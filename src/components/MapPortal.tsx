import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FilterState, LayerSettings, Nursery, GeoJSONFeatureDetails, TreeIconCategory, CustomGeoJsonLayer } from '../types';
import { createNurseryIcon, getNurseryTreeCategory, TREE_CATEGORIES_INFO } from '../utils/markerIcons';
import { getNurseryPhoto, LOCAL_NURSERY_PHOTOS } from '../utils/imageHelper';
import { COMMUNES_ZOU, ESPECES_COURANTES } from '../data/nurseryData';
import { analyzeGeoJsonContent, GIS_LAYER_COLORS } from '../utils/dataImporter';
import { GeoJSONInspector } from './GeoJSONInspector';
import { AttributeTableDrawer } from './AttributeTableDrawer';
import { 
  Search, 
  Filter, 
  Layers, 
  Compass, 
  RotateCcw, 
  Check, 
  Info, 
  GraduationCap, 
  Store, 
  MapPin, 
  ChevronRight, 
  X, 
  Eye, 
  EyeOff,
  Maximize2,
  TreePine,
  SlidersHorizontal,
  Satellite,
  Globe,
  Table,
  FileJson,
  Upload,
  Trash2,
  Palette,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Download,
  Link2
} from 'lucide-react';

interface MapPortalProps {
  nurseries: Nursery[];
  onSelectNursery: (nursery: Nursery) => void;
  onOpenAddModalWithCoords?: (lat: number, lng: number) => void;
  onNavigateToAdmin?: () => void;
  isAdmin?: boolean;
  onRequestAdminAuth?: (reason: 'download_geojson' | 'edit_data' | 'general') => void;
  customAbomeyBoundary?: any;
  onUpdateAbomeyBoundary?: (geojsonData: any) => void;
  customLayers?: CustomGeoJsonLayer[];
  onAddCustomLayer?: (layer: CustomGeoJsonLayer) => void;
  onRemoveCustomLayer?: (id: string) => void;
  onToggleCustomLayer?: (id: string) => void;
  onUpdateCustomLayerColor?: (id: string, color: string) => void;
  onImportNurseries?: (imported: Nursery[], mode: 'replace' | 'merge') => void;
}

export const MapPortal: React.FC<MapPortalProps> = ({
  nurseries,
  onSelectNursery,
  onOpenAddModalWithCoords,
  onNavigateToAdmin,
  isAdmin = false,
  onRequestAdminAuth,
  customAbomeyBoundary,
  onUpdateAbomeyBoundary,
  customLayers = [],
  onAddCustomLayer,
  onRemoveCustomLayer,
  onToggleCustomLayer,
  onUpdateCustomLayerColor,
  onImportNurseries
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const abomeyGeojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const zouGeojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const customGeojsonLayersRef = useRef<Map<string, L.GeoJSON>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isAdminRef = useRef(isAdmin);
  isAdminRef.current = isAdmin;

  // Filter state (as shown in Mockup #2 right sidebar)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    commune: 'all',
    arrondissement: 'all',
    statut: 'all',
    espece: 'all'
  });

  // Layer toggles
  const [layers, setLayers] = useState<LayerSettings>({
    showEcoles: true,
    showPrivees: true,
    showAbomeyBoundary: true,
    showZouBoundary: true,
    baseLayer: 'satellite' // default to satellite as shown in mockup, with OSM option
  });

  // Left sidebar active tool rail tab
  const [activeToolTab, setActiveToolTab] = useState<'none' | 'layers' | 'legend' | 'quicklist' | 'stats'>('none');
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [selectedMarkerNursery, setSelectedMarkerNursery] = useState<Nursery | null>(null);
  const [markerDisplayMode, setMarkerDisplayMode] = useState<'realistic_tree' | 'photo'>('realistic_tree');

  // GeoJSON Full Details Inspector & Attribute Table State
  const [inspectedFeature, setInspectedFeature] = useState<GeoJSONFeatureDetails | null>(null);
  const [isAttributeTableOpen, setIsAttributeTableOpen] = useState(false);

  // GeoJSON file upload & custom layers UI state
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [geoJsonToast, setGeoJsonToast] = useState<{ type: 'success' | 'error'; message: string; submessage?: string } | null>(null);
  const [nurseryPrompt, setNurseryPrompt] = useState<{
    layer: CustomGeoJsonLayer;
    nurseries: Nursery[];
  } | null>(null);
  const [activeColorPickerLayerId, setActiveColorPickerLayerId] = useState<string | null>(null);

  // Helper to open inspector with 100% of all GeoJSON attributes
  const openInspectorForNursery = (nursery: Nursery) => {
    setSelectedMarkerNursery(nursery);
    setInspectedFeature({
      title: nursery.nom,
      layerName: nursery.type === 'ecole' ? 'Pépinière École' : 'Pépinière Privée',
      geometryType: 'Point (WGS84)',
      coordinatesFormatted: `${nursery.latitude.toFixed(5)}, ${nursery.longitude.toFixed(5)}`,
      properties: {
        ...(nursery.rawProperties || {}),
        ID: nursery.id,
        NOM: nursery.nom,
        TYPE: nursery.type === 'ecole' ? 'École (Pédagogique)' : 'Privée (Exploitation)',
        COMMUNE: nursery.commune,
        ARRONDISSEMENT: nursery.arrondissement,
        CAPACITE_ANNUELLE: `${nursery.capaciteAnnuelle.toLocaleString()} plants/an`,
        SUPERFICIE_M2: nursery.superficieM2 ? `${nursery.superficieM2.toLocaleString()} m²` : 'Non renseignée',
        SYSTEME_EAU: nursery.systemeArrosage || 'Puits / Forage',
        STATUT_PRODUCTION: nursery.statut === 'actif' ? 'En activité régulière' : nursery.statut === 'en_creation' ? 'En création' : 'Saisonnier',
        GESTIONNAIRE: nursery.promoteur,
        CONTACT_TEL: nursery.telephone,
        EMAIL: nursery.email || 'Non renseigné',
        ESSENCES_CULTIVEES: nursery.especes,
        ANNEE_CREATION: nursery.dateCreation || '2022',
        LATITUDE: nursery.latitude,
        LONGITUDE: nursery.longitude,
        PROJECTION: 'EPSG:4326 (WGS84)',
        DESCRIPTION: nursery.description,
        SOURCE: 'Inventaire officiel BENIN-PEPI (Zou)'
      },
      rawFeature: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [nursery.longitude, nursery.latitude]
        },
        properties: {
          ...(nursery.rawProperties || {}),
          ...nursery
        }
      }
    });
  };

  const handleZoomToNursery = (nursery: Nursery) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([nursery.latitude, nursery.longitude], 15, { animate: true });
    }
    openInspectorForNursery(nursery);
  };

  // Filtered nurseries list
  const filteredNurseries = nurseries.filter((n) => {
    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const matchName = n.nom.toLowerCase().includes(q);
      const matchCommune = n.commune.toLowerCase().includes(q);
      const matchPromoteur = n.promoteur.toLowerCase().includes(q);
      const matchEspece = n.especes.some(e => e.toLowerCase().includes(q));
      if (!matchName && !matchCommune && !matchPromoteur && !matchEspece) return false;
    }

    // Type
    if (filters.type !== 'all' && n.type !== filters.type) return false;

    // Layer visibility
    if (n.type === 'ecole' && !layers.showEcoles) return false;
    if (n.type === 'privee' && !layers.showPrivees) return false;

    // Commune
    if (filters.commune !== 'all' && n.commune.toLowerCase() !== filters.commune.toLowerCase()) return false;

    // Arrondissement
    if (filters.arrondissement !== 'all' && n.arrondissement.toLowerCase() !== filters.arrondissement.toLowerCase()) return false;

    // Statut
    if (filters.statut !== 'all' && n.statut !== filters.statut) return false;

    // Espece
    if (filters.espece !== 'all' && !n.especes.some(e => e.toLowerCase().includes(filters.espece.toLowerCase()))) return false;

    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: Abomey / Zou department, Benin
    const defaultCenter: L.LatLngExpression = [7.185, 2.05];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 11,
      zoomControl: false // custom position
    });

    // Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Scale control at bottom left (metric 5km)
    L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 150 }).addTo(map);

    // Layer groups
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Load GeoJSON Boundaries
    loadBoundaries(map);

    // Click on map: if admin, allow adding nursery at coordinates. If public, show read-only coordinates info.
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(5));
      const lng = parseFloat(e.latlng.lng.toFixed(5));

      if (isAdminRef.current) {
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`
            <div class="p-2.5 text-xs font-sans min-w-[210px]">
              <div class="font-bold text-emerald-800 flex items-center gap-1.5">
                <span>🛡️ Coordonnées GPS (Admin)</span>
              </div>
              <div class="text-slate-600 mt-1 font-mono text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                ${lat}, ${lng}
              </div>
              <p class="text-[10px] text-slate-500 mt-1.5">
                L'ajout de données est réservé à l'espace administrateur.
              </p>
              <button id="btn-admin-space-${lat}" class="mt-2 w-full px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer shadow-xs transition flex items-center justify-center gap-1.5">
                <span>Accéder à l'Espace Admin pour ajouter</span>
              </button>
            </div>
          `)
          .openOn(map);

        setTimeout(() => {
          const btn = document.getElementById(`btn-admin-space-${lat}`);
          if (btn) {
            btn.onclick = () => {
              map.closePopup();
              if (onNavigateToAdmin) {
                onNavigateToAdmin();
              }
            };
          }
        }, 50);
      } else {
        // Public user: informative read-only coordinate tooltip
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`
            <div class="p-2 text-xs font-sans">
              <div class="font-bold text-emerald-900">Point géographique</div>
              <div class="text-slate-600 mt-1 font-mono">${lat}, ${lng}</div>
              <div class="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1">
                Consultation publique du géoportail
              </div>
            </div>
          `)
          .openOn(map);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri &mdash; World Imagery, Earthstar Geographics';

    if (layers.baseLayer === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    } else if (layers.baseLayer === 'topo') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://carto.com/">CARTO</a>';
    }

    const newTileLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [layers.baseLayer]);

  // Build Abomey Commune Layer helper
  const buildAbomeyLayer = (abomeyData: any, map: L.Map) => {
    if (abomeyGeojsonLayerRef.current) {
      if (map.hasLayer(abomeyGeojsonLayerRef.current)) {
        map.removeLayer(abomeyGeojsonLayerRef.current);
      }
    }
    const abomeyLayer = L.geoJSON(abomeyData, {
      style: {
        color: '#047857',
        weight: 3.5,
        dashArray: '6, 6',
        fillColor: '#10B981',
        fillOpacity: 0.16
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip("<b>🏛️ Commune d'Abomey</b><br/><span style='font-size:11px;'>Département du Zou &bull; Arrondissements : Vidolè, Djègbé, Hounli, Détokpo...</span><br/><span style='font-size:10px; color:#047857; font-weight:bold;'>Superficie : 142.5 km² &bull; Cliquer pour inspecter</span>", {
          sticky: true,
          className: 'leaflet-custom-tooltip'
        });
        layer.on('mouseover', () => {
          (layer as any).setStyle({ weight: 4.5, fillOpacity: 0.24, color: '#065f46' });
        });
        layer.on('mouseout', () => {
          (layer as any).setStyle({ weight: 3.5, fillOpacity: 0.16, color: '#047857' });
        });
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setInspectedFeature({
            title: feature.properties?.nom || feature.properties?.NOM || feature.properties?.nom_commune || "Commune d'Abomey",
            layerName: "Polygone Administratif (Commune d'Abomey)",
            geometryType: feature.geometry?.type || "Polygon",
            properties: feature.properties || {
              NOM: "Abomey",
              TYPE_ADMIN: "Commune",
              DEPARTEMENT: "Zou",
              PAYS: "Bénin",
              CHEF_LIEU: "Abomey",
              SUPERFICIE_KM2: 142.5,
              ARRONDISSEMENTS: "Détokpo, Djègbé, Hounli, Vidolè, Sèhoun, Agbokpa, Adjahito",
              STATUT_GEOJSON: "Couche vectorielle officielle"
            },
            rawFeature: feature
          });
        });
      }
    });
    abomeyGeojsonLayerRef.current = abomeyLayer;
    if (layers.showAbomeyBoundary) abomeyLayer.addTo(map);
    return abomeyLayer;
  };

  // Load Boundaries from GeoJSON
  const loadBoundaries = async (map: L.Map) => {
    try {
      // Abomey Commune Boundary
      let abomeyData = customAbomeyBoundary;
      if (!abomeyData) {
        const resAbomey = await fetch('/data/Commune_abomey.geojson');
        if (resAbomey.ok) {
          abomeyData = await resAbomey.json();
        }
      }
      if (abomeyData) {
        buildAbomeyLayer(abomeyData, map);
      }

      // Zou Department Boundary
      const resZou = await fetch('/data/departement_zou.geojson');
      if (resZou.ok) {
        const zouData = await resZou.json();
        const zouLayer = L.geoJSON(zouData, {
          style: {
            color: '#F59E0B',
            weight: 2,
            dashArray: '8, 6',
            fillColor: '#F59E0B',
            fillOpacity: 0.04
          },
          onEachFeature: (feature, layer) => {
            layer.bindTooltip("<b>Département du Zou</b><br/><span style='font-size:10px; color:#F59E0B;'>Cliquer pour inspecter les attributs GeoJSON</span>", {
              sticky: true,
              className: 'leaflet-custom-tooltip'
            });
            layer.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setInspectedFeature({
                title: feature.properties?.nom || feature.properties?.NOM || "Département du Zou",
                layerName: "Polygone Départemental (Zou)",
                geometryType: feature.geometry?.type || "Polygon",
                properties: feature.properties || {
                  NOM: "Zou",
                  TYPE_ADMIN: "Département",
                  CHEF_LIEU: "Abomey",
                  PAYS: "Bénin",
                  NOMBRE_COMMUNES: 9,
                  COMMUNES_INCLUSES: "Abomey, Bohicon, Covè, Djidja, Ouinhi, Za-Kpota, Zagnanado, Zogbodomey, Agbangnizoun",
                  STATUT_GEOJSON: "Couche vectorielle officielle"
                },
                rawFeature: feature
              });
            });
          }
        });
        zouGeojsonLayerRef.current = zouLayer;
        if (layers.showZouBoundary) zouLayer.addTo(map);
      }
    } catch (e) {
      console.warn("Notice: GeoJSON boundaries fetched with fallback", e);
    }
  };

  // Watch for customAbomeyBoundary updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && customAbomeyBoundary) {
      buildAbomeyLayer(customAbomeyBoundary, map);
    }
  }, [customAbomeyBoundary]);

  const handleUploadAbomeyGeoJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (mapInstanceRef.current) {
            const layer = buildAbomeyLayer(parsed, mapInstanceRef.current);
            const b = layer.getBounds();
            if (b.isValid()) {
              mapInstanceRef.current.fitBounds(b, { padding: [40, 40] });
            }
          }
          if (onUpdateAbomeyBoundary) {
            onUpdateAbomeyBoundary(parsed);
          }
        } catch (err) {
          alert("Erreur lors de la lecture du fichier GeoJSON de la commune d'Abomey.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Toggle boundary layers on state change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (abomeyGeojsonLayerRef.current) {
      if (layers.showAbomeyBoundary && !map.hasLayer(abomeyGeojsonLayerRef.current)) {
        abomeyGeojsonLayerRef.current.addTo(map);
      } else if (!layers.showAbomeyBoundary && map.hasLayer(abomeyGeojsonLayerRef.current)) {
        map.removeLayer(abomeyGeojsonLayerRef.current);
      }
    }

    if (zouGeojsonLayerRef.current) {
      if (layers.showZouBoundary && !map.hasLayer(zouGeojsonLayerRef.current)) {
        zouGeojsonLayerRef.current.addTo(map);
      } else if (!layers.showZouBoundary && map.hasLayer(zouGeojsonLayerRef.current)) {
        map.removeLayer(zouGeojsonLayerRef.current);
      }
    }
  }, [layers.showAbomeyBoundary, layers.showZouBoundary]);

  // Synchronize Custom GeoJSON Layers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const layersMap = customGeojsonLayersRef.current;
    const currentCustomLayers = customLayers || [];
    const activeIds = new Set(currentCustomLayers.map(l => l.id));

    // 1. Remove deleted layers from map
    for (const [id, leafletLayer] of layersMap.entries()) {
      if (!activeIds.has(id)) {
        if (map.hasLayer(leafletLayer)) {
          map.removeLayer(leafletLayer);
        }
        layersMap.delete(id);
      }
    }

    // 2. Synchronize visible/hidden & update styles
    currentCustomLayers.forEach((customLayer) => {
      const existing = layersMap.get(customLayer.id);

      if (!customLayer.visible) {
        if (existing && map.hasLayer(existing)) {
          map.removeLayer(existing);
        }
        return;
      }

      if (existing) {
        // If it exists, update style color and ensure it's on map
        existing.setStyle({
          color: customLayer.color,
          fillColor: customLayer.color
        });
        existing.eachLayer((child: any) => {
          if (child.setStyle) {
            child.setStyle({
              color: customLayer.color,
              fillColor: customLayer.color
            });
          }
        });
        if (!map.hasLayer(existing)) {
          existing.addTo(map);
        }
        return;
      }

      // Create new Leaflet GeoJSON layer
      try {
        const leafletGeoJson = L.geoJSON(customLayer.data, {
          style: () => ({
            color: customLayer.color,
            weight: 2.5,
            fillColor: customLayer.color,
            fillOpacity: 0.28
          }),
          pointToLayer: (_feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 7,
              fillColor: customLayer.color,
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.85
            });
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties || {};
            const title = 
              props.nom || 
              props.name || 
              props.NOM || 
              props.NAME || 
              props.designation || 
              props.site || 
              props.id || 
              `Entité ${feature.geometry?.type || 'SIG'}`;

            layer.bindTooltip(`
              <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
                <b style="color: ${customLayer.color};">${customLayer.name}</b><br/>
                <span style="font-weight: 600;">${title}</span><br/>
                <span style="font-size: 9px; color: #64748b;">Cliquer pour inspecter les attributs</span>
              </div>
            `, {
              sticky: true,
              className: 'leaflet-custom-tooltip'
            });

            layer.on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              setInspectedFeature({
                title: String(title),
                layerName: customLayer.name,
                geometryType: feature.geometry?.type || 'GeoJSON',
                properties: props,
                rawFeature: feature
              });
            });
          }
        });

        leafletGeoJson.addTo(map);
        layersMap.set(customLayer.id, leafletGeoJson);
      } catch (err) {
        console.error('Erreur lors du rendu de la couche GeoJSON:', customLayer.name, err);
      }
    });
  }, [customLayers]);

  // Process and Integrate GeoJSON File
  const processGeoJsonFile = (file: File) => {
    setGeoJsonToast(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const analysis = analyzeGeoJsonContent(text, file.name);

        if (!analysis.isValid || analysis.featureCount === 0) {
          setGeoJsonToast({
            type: 'error',
            message: "Fichier GeoJSON non reconnu",
            submessage: analysis.error || "Aucune géométrie valide (Point, Polygone, Ligne) trouvée."
          });
          return;
        }

        // Generate distinct color from palette
        const layerColor = GIS_LAYER_COLORS[(customLayers?.length || 0) % GIS_LAYER_COLORS.length];

        const newLayer: CustomGeoJsonLayer = {
          id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: analysis.suggestedTitle,
          data: analysis.rawJson,
          color: layerColor,
          visible: true,
          featureCount: analysis.featureCount,
          geometryType: analysis.mainGeometryType,
          dateAdded: new Date().toISOString()
        };

        // Add layer to state
        if (onAddCustomLayer) {
          onAddCustomLayer(newLayer);
        }

        // Auto zoom map to layer
        if (mapInstanceRef.current) {
          try {
            const tempLayer = L.geoJSON(newLayer.data);
            const b = tempLayer.getBounds();
            if (b.isValid()) {
              mapInstanceRef.current.fitBounds(b, { padding: [50, 50], maxZoom: 16 });
            }
          } catch (zoomErr) {
            console.warn('Zoom to GeoJSON failed', zoomErr);
          }
        }

        // If it also contains point features that look like nurseries
        if (analysis.isNurseryDataset && analysis.nurseriesFound.length > 0 && onImportNurseries) {
          setNurseryPrompt({
            layer: newLayer,
            nurseries: analysis.nurseriesFound
          });
        }

        setGeoJsonToast({
          type: 'success',
          message: `Couche GeoJSON "${newLayer.name}" intégrée et affichée avec succès !`,
          submessage: `${newLayer.featureCount} entité(s) (${newLayer.geometryType}) tracées sur la carte.`
        });

        // Automatically open layers drawer so the user sees the active layer control
        setActiveToolTab('layers');

      } catch (err: any) {
        setGeoJsonToast({
          type: 'error',
          message: "Erreur de lecture du fichier GeoJSON",
          submessage: err?.message || "Format invalide."
        });
      }
    };

    reader.onerror = () => {
      setGeoJsonToast({
        type: 'error',
        message: "Erreur lors de la lecture du fichier",
        submessage: "Impossible d'accéder au contenu du fichier."
      });
    };

    reader.readAsText(file);
  };

  const handleZoomToCustomLayer = (layer: CustomGeoJsonLayer) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      const leafletLayer = customGeojsonLayersRef.current.get(layer.id);
      if (leafletLayer) {
        const b = leafletLayer.getBounds();
        if (b.isValid()) {
          map.fitBounds(b, { padding: [50, 50], maxZoom: 16 });
          return;
        }
      }
      const temp = L.geoJSON(layer.data);
      const b = temp.getBounds();
      if (b.isValid()) {
        map.fitBounds(b, { padding: [50, 50], maxZoom: 16 });
      }
    } catch (e) {
      console.warn('Could not zoom to custom layer', e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processGeoJsonFile(file);
    }
  };

  // Update Markers on filter / nurseries change
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!markersGroup || !map) return;

    markersGroup.clearLayers();

    filteredNurseries.forEach((nursery, index) => {
      const isSelected = selectedMarkerNursery?.id === nursery.id;
      const icon = createNurseryIcon(nursery, isSelected, markerDisplayMode);
      const treeCategory = getNurseryTreeCategory(nursery);
      const treeInfo = TREE_CATEGORIES_INFO[treeCategory] || TREE_CATEGORIES_INFO.ecole;
      const photoSrc = getNurseryPhoto(nursery, index);
      const fallbackPhoto = LOCAL_NURSERY_PHOTOS[index % LOCAL_NURSERY_PHOTOS.length];

      const marker = L.marker([nursery.latitude, nursery.longitude], { icon });

      // Clean interactive HTML popup
      const isEcole = nursery.type === 'ecole';
      const badgeColor = isEcole ? 'bg-emerald-600' : 'bg-amber-500 text-amber-950';
      const typeLabel = isEcole ? 'Pépinière École' : 'Pépinière Privée';

      const popupContent = document.createElement('div');
      popupContent.className = 'nursery-popup-card font-sans p-0.5 min-w-[260px] max-w-[310px]';
      popupContent.innerHTML = `
        <div class="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
          <div class="relative h-28 overflow-hidden bg-slate-900">
            <img 
              src="${photoSrc}" 
              alt="${nursery.nom}" 
              onerror="this.onerror=null; this.src='${fallbackPhoto}';"
              class="w-full h-full object-cover" 
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            <div class="absolute top-2 left-2 flex flex-col gap-1 items-start">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor} text-white shadow-xs">
                ${typeLabel}
              </span>
              <span class="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-950/80 text-white border border-white/20 shadow-xs flex items-center gap-1">
                🌿 ${treeInfo.label.split('(')[0].trim()}
              </span>
            </div>

            <span class="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
              ${nursery.statut === 'actif' ? 'Actif' : nursery.statut === 'en_creation' ? 'Création' : 'Saisonnier'}
            </span>
          </div>
          
          <div class="p-3 bg-white space-y-2">
            <div>
              <div class="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                📍 ${nursery.commune} &bull; ${nursery.arrondissement}
              </div>
              <h4 class="font-extrabold text-slate-900 text-sm leading-snug mt-0.5">
                ${nursery.nom}
              </h4>
            </div>

            <!-- Detailed GeoJSON Properties Grid -->
            <div class="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100 font-sans">
              <div>
                <span class="text-slate-400 block text-[9px]">Capacité :</span>
                <b class="text-slate-900 font-bold font-mono">${nursery.capaciteAnnuelle.toLocaleString()} plants/an</b>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px]">Superficie :</span>
                <b class="text-slate-900 font-mono">${nursery.superficieM2 ? nursery.superficieM2.toLocaleString() + ' m²' : '-'}</b>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px]">Système d'eau :</span>
                <b class="text-slate-800 truncate block">${nursery.systemeArrosage || 'Forage'}</b>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px]">GPS (WGS84) :</span>
                <b class="font-mono text-emerald-700 block">${nursery.latitude.toFixed(4)}, ${nursery.longitude.toFixed(4)}</b>
              </div>
              <div class="col-span-2 pt-1 border-t border-slate-200/60 truncate">
                <span class="text-slate-400 text-[9px]">Promoteur : </span>
                <b class="text-slate-800">${nursery.promoteur}</b>
              </div>
              <div class="col-span-2 truncate">
                <span class="text-slate-400 text-[9px]">Contact : </span>
                <b class="text-emerald-700 font-mono">${nursery.telephone}</b>
              </div>
            </div>

            <!-- Essences produites -->
            <div class="text-[10px] text-slate-600 truncate">
              <span class="font-semibold text-slate-400">Essences : </span>
              <span class="font-medium text-slate-800">${nursery.especes.join(', ')}</span>
            </div>

            <!-- Two action buttons -->
            <div class="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <button 
                id="btn-popup-inspect-${nursery.id}" 
                class="w-full py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
              >
                <span>🔍 Inspecter tous les attributs GeoJSON</span>
              </button>
              <button 
                id="btn-popup-detail-${nursery.id}" 
                class="w-full py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] text-center cursor-pointer transition"
              >
                Ouvrir la fiche complète du site &rarr;
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 320 });

      marker.on('click', () => {
        openInspectorForNursery(nursery);
      });

      marker.on('popupopen', () => {
        const btnDetail = document.getElementById(`btn-popup-detail-${nursery.id}`);
        if (btnDetail) {
          btnDetail.onclick = (e) => {
            e.preventDefault();
            onSelectNursery(nursery);
          };
        }

        const btnInspect = document.getElementById(`btn-popup-inspect-${nursery.id}`);
        if (btnInspect) {
          btnInspect.onclick = (e) => {
            e.preventDefault();
            openInspectorForNursery(nursery);
          };
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredNurseries, selectedMarkerNursery, markerDisplayMode]);

  // Reset to default Abomey/Zou zoom
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([7.185, 2.05], 11, { animate: true });
    }
  };

  // Zoom directly to Commune d'Abomey polygon
  const handleZoomToAbomey = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!layers.showAbomeyBoundary) {
      setLayers(prev => ({ ...prev, showAbomeyBoundary: true }));
    }

    if (abomeyGeojsonLayerRef.current) {
      try {
        const bounds = abomeyGeojsonLayerRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true });
          return;
        }
      } catch (err) {
        console.warn('Could not fit bounds to Abomey layer', err);
      }
    }
    // Fallback coordinates of Abomey centre
    map.setView([7.1845, 1.9912], 13, { animate: true });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      commune: 'all',
      arrondissement: 'all',
      statut: 'all',
      espece: 'all'
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] flex overflow-hidden bg-slate-900">
      
      {/* Floating Abomey Boundary Layer & GeoJSON Quick Control */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-400 flex flex-wrap items-center justify-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Limite Commune d'Abomey</span>
        </div>
        <button
          id="btn-toggle-abomey-boundary"
          onClick={() => setLayers(prev => ({ ...prev, showAbomeyBoundary: !prev.showAbomeyBoundary }))}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
            layers.showAbomeyBoundary
              ? 'bg-emerald-700 text-white shadow-xs hover:bg-emerald-800'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title={layers.showAbomeyBoundary ? "Masquer la couche de la limite d'Abomey" : "Afficher la couche de la limite d'Abomey"}
        >
          {layers.showAbomeyBoundary ? '✓ Affichée' : '○ Masquée'}
        </button>
        <button
          id="btn-zoom-abomey"
          onClick={handleZoomToAbomey}
          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-98"
          title="Centrer la carte et zoomer sur la Commune d'Abomey"
        >
          <Compass className="w-3 h-3 text-slate-950" />
          <span>Centrer Abomey</span>
        </button>

        <span className="w-px h-4 bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Prominent "+ Intégrer GeoJSON" Button */}
        <label
          title="Intégrer un fichier GeoJSON (.geojson, .json) et l'afficher immédiatement sur le géoportail"
          className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
        >
          <Upload className="w-3 h-3 text-white" />
          <span>+ Intégrer GeoJSON</span>
          <input
            type="file"
            accept=".geojson,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                processGeoJsonFile(file);
              }
              e.target.value = '';
            }}
          />
        </label>

        {/* Copy Direct Geoportal Link */}
        <button
          type="button"
          onClick={() => {
            const url = `${window.location.origin}${window.location.pathname}#geoportail`;
            if (navigator.clipboard) {
              navigator.clipboard.writeText(url);
            }
            setGeoJsonToast({
              type: 'success',
              message: "Lien direct copié dans le presse-papiers !",
              submessage: url
            });
          }}
          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-98"
          title="Copier le lien direct vers le géoportail (#geoportail)"
        >
          <Link2 className="w-3 h-3 text-emerald-700" />
          <span className="hidden sm:inline">Lien direct</span>
        </button>
      </div>

      {/* Admin Mode Badge on Map */}
      {isAdmin && (
        <div className="absolute top-16 left-20 z-400 bg-emerald-950/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full shadow-xl border border-emerald-500/40 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-amber-300">Mode Administrateur :</span>
          <span className="text-emerald-100 hidden sm:inline">Cliquez sur la carte pour capturer les coordonnées GPS et ajouter un site</span>
          <span className="text-emerald-100 sm:hidden">Clic carte = Ajout GPS</span>
        </div>
      )}

      {/* 1. Left GIS Floating Tool Rail (Inspired by Mockup #2) */}
      <div className="absolute top-4 left-4 z-400 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-1.5 flex flex-col gap-1">
          
          <button
            title="Réinitialiser le centrage (Abomey & Zou)"
            onClick={handleResetView}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-emerald-800 transition flex items-center justify-center"
          >
            <Compass className="w-5 h-5" />
          </button>

          <button
            title="Intégrer une couche GeoJSON (.geojson, .json)"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition flex items-center justify-center relative group"
          >
            <FileJson className="w-5 h-5 text-emerald-700" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".geojson,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                processGeoJsonFile(file);
              }
              e.target.value = '';
            }}
          />

          <button
            title="Légende de la carte"
            onClick={() => setActiveToolTab(activeToolTab === 'legend' ? 'none' : 'legend')}
            className={`p-2.5 rounded-xl transition flex items-center justify-center ${
              activeToolTab === 'legend' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Info className="w-5 h-5" />
          </button>

          <button
            title="Gestion des couches & Fond cartographique"
            onClick={() => setActiveToolTab(activeToolTab === 'layers' ? 'none' : 'layers')}
            className={`p-2.5 rounded-xl transition flex items-center justify-center relative ${
              activeToolTab === 'layers' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Layers className="w-5 h-5" />
            {customLayers.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            title="Liste rapide des pépinières"
            onClick={() => setActiveToolTab(activeToolTab === 'quicklist' ? 'none' : 'quicklist')}
            className={`p-2.5 rounded-xl transition flex items-center justify-center ${
              activeToolTab === 'quicklist' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <TreePine className="w-5 h-5" />
          </button>

          <button
            title="Table attributaire SIG (Tous les détails GeoJSON)"
            onClick={() => setIsAttributeTableOpen(!isAttributeTableOpen)}
            className={`p-2.5 rounded-xl transition flex items-center justify-center ${
              isAttributeTableOpen 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Table className="w-5 h-5" />
          </button>
        </div>

        {/* Espace Admin quick shortcut at bottom of rail (as in mockup) */}
        {onNavigateToAdmin && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-1.5">
            <button
              onClick={onNavigateToAdmin}
              title="Accéder à l'Espace Administrateur"
              className="p-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition flex items-center justify-center text-xs font-bold"
            >
              ⚙️
            </button>
          </div>
        )}
      </div>

      {/* Left Expanded Tool Drawers */}
      {activeToolTab !== 'none' && (
        <div className="absolute top-4 left-20 z-400 w-80 max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              {activeToolTab === 'legend' && 'Légende cartographique'}
              {activeToolTab === 'layers' && 'Gestion des Couches'}
              {activeToolTab === 'quicklist' && 'Pépinières visibles'}
            </h3>
            <button
              onClick={() => setActiveToolTab('none')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Légende Panel */}
          {activeToolTab === 'legend' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Icônes d'Arbres &amp; Typologies ({Object.keys(TREE_CATEGORIES_INFO).length})
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">SIG Bénin</span>
                </div>
                
                <div className="space-y-1.5 max-h-[46vh] overflow-y-auto pr-1">
                  {(Object.keys(TREE_CATEGORIES_INFO) as TreeIconCategory[]).map((catKey) => {
                    const cat = TREE_CATEGORIES_INFO[catKey];
                    return (
                      <div 
                        key={catKey}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 transition"
                      >
                        <div 
                          className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-900" 
                          style={{ boxShadow: `0 0 0 2px ${cat.color}` }}
                        >
                          <img 
                            src={cat.image} 
                            alt={cat.label} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 text-[9px] bg-white rounded-full px-0.5 shadow-xs leading-none">
                            {cat.badge}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 text-xs truncate">
                            {cat.label}
                          </div>
                          <div className="text-slate-500 text-[10px] truncate leading-tight">
                            {cat.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Limites Administratives (GeoJSON)
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-3 border-2 border-dashed border-emerald-500 bg-emerald-500/20 rounded-xs" />
                  <span className="text-slate-700 font-medium">Limite commune d'Abomey</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-3 border-2 border-dashed border-amber-500 bg-amber-500/20 rounded-xs" />
                  <span className="text-slate-700 font-medium">Limite Département du Zou</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Couches Panel */}
          {activeToolTab === 'layers' && (
            <div className="space-y-4 text-xs">
              {/* Marker Display Mode Switcher */}
              <div>
                <label className="font-semibold text-slate-700 block mb-2 text-[11px] uppercase tracking-wider">
                  Style des marqueurs de pépinières
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMarkerDisplayMode('realistic_tree')}
                    className={`p-2.5 rounded-xl text-center border font-semibold flex flex-col items-center gap-1 cursor-pointer transition ${
                      markerDisplayMode === 'realistic_tree'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">🌳</span>
                    <span className="font-bold text-[11px]">Icônes Réalistes</span>
                    <span className="text-[9px] text-slate-500">Arbres &amp; essences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarkerDisplayMode('photo')}
                    className={`p-2.5 rounded-xl text-center border font-semibold flex flex-col items-center gap-1 cursor-pointer transition ${
                      markerDisplayMode === 'photo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">📷</span>
                    <span className="font-bold text-[11px]">Photos Réelles</span>
                    <span className="text-[9px] text-slate-500">Sites pépinières</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2 text-[11px] uppercase tracking-wider">
                  Fond cartographique
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLayers({ ...layers, baseLayer: 'satellite' })}
                    className={`p-2 rounded-xl text-center border font-semibold flex flex-col items-center gap-1 ${
                      layers.baseLayer === 'satellite'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Satellite className="w-4 h-4" />
                    <span>Satellite</span>
                  </button>

                  <button
                    onClick={() => setLayers({ ...layers, baseLayer: 'osm' })}
                    className={`p-2 rounded-xl text-center border font-semibold flex flex-col items-center gap-1 ${
                      layers.baseLayer === 'osm'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Plan OSM</span>
                  </button>

                  <button
                    onClick={() => setLayers({ ...layers, baseLayer: 'topo' })}
                    className={`p-2 rounded-xl text-center border font-semibold flex flex-col items-center gap-1 ${
                      layers.baseLayer === 'topo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Relief</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                  Couches thématiques
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={layers.showEcoles}
                    onChange={(e) => setLayers({ ...layers, showEcoles: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-800">Afficher les pépinières écoles</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={layers.showPrivees}
                    onChange={(e) => setLayers({ ...layers, showPrivees: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-medium text-slate-800">Afficher les pépinières privées</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={layers.showAbomeyBoundary}
                    onChange={(e) => setLayers({ ...layers, showAbomeyBoundary: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-800">Polygone Commune d'Abomey</span>
                </label>

                {/* Abomey Boundary Quick Card */}
                {layers.showAbomeyBoundary && (
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <span>🏛️ Limite d'Abomey</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-full font-bold">
                        142.5 km²
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      7 arrondissements (Vidolè, Djègbé, Hounli, Détokpo...). Couche vectorielle active.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={handleZoomToAbomey}
                        className="flex-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Centrer la carte sur la commune d'Abomey"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Centrer</span>
                      </button>
                      <label 
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Remplacer par votre fichier GeoJSON de la commune"
                      >
                        <FileJson className="w-3 h-3 text-emerald-700" />
                        <span>Remplacer .geojson</span>
                        <input
                          type="file"
                          accept=".geojson,.json"
                          className="hidden"
                          onChange={handleUploadAbomeyGeoJSON}
                        />
                      </label>
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={layers.showZouBoundary}
                    onChange={(e) => setLayers({ ...layers, showZouBoundary: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-800">Polygone Département du Zou</span>
                </label>

                {/* Couches GeoJSON Importées / Intégrées */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Couches GeoJSON Intégrées</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                        {customLayers.length}
                      </span>
                    </label>
                  </div>

                  {/* Upload Drop Zone / Button */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 border-2 border-dashed border-emerald-400/80 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl cursor-pointer transition text-center space-y-1"
                  >
                    <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-emerald-950 text-xs">
                      + Intégrer un fichier GeoJSON
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Glissez ou cliquez (.geojson, .json &bull; Points, Polygones, Lignes)
                    </div>
                  </div>

                  {/* List of Custom Layers */}
                  {customLayers.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
                      Aucune couche GeoJSON externe ajoutée. Chargez un fichier pour l'afficher sur le géoportail.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {customLayers.map((cLayer) => (
                        <div
                          key={cLayer.id}
                          className={`p-2.5 rounded-xl border transition text-xs space-y-2 ${
                            cLayer.visible 
                              ? 'bg-white border-slate-200 shadow-xs' 
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
                              <input
                                type="checkbox"
                                checked={cLayer.visible}
                                onChange={() => onToggleCustomLayer && onToggleCustomLayer(cLayer.id)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-900 truncate" title={cLayer.name}>
                                  {cLayer.name}
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                  <span>{cLayer.featureCount} entité(s)</span>
                                  <span>&bull;</span>
                                  <span className="font-medium text-emerald-700">{cLayer.geometryType}</span>
                                </div>
                              </div>
                            </label>

                            {/* Actions: Color, Zoom, Remove */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                title="Changer la couleur de la couche"
                                onClick={() => setActiveColorPickerLayerId(activeColorPickerLayerId === cLayer.id ? null : cLayer.id)}
                                className="w-5 h-5 rounded-full border border-white shadow-xs transition hover:scale-110 cursor-pointer"
                                style={{ backgroundColor: cLayer.color }}
                              />
                              <button
                                type="button"
                                onClick={() => handleZoomToCustomLayer(cLayer)}
                                className="p-1 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer"
                                title="Centrer et zoomer sur cette couche"
                              >
                                <Compass className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Supprimer la couche "${cLayer.name}" du géoportail ?`)) {
                                    if (onRemoveCustomLayer) onRemoveCustomLayer(cLayer.id);
                                  }
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Supprimer la couche"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Inline Color Palette Picker */}
                          {activeColorPickerLayerId === cLayer.id && (
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap gap-1.5 animate-fade-in">
                              {GIS_LAYER_COLORS.map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateCustomLayerColor) onUpdateCustomLayerColor(cLayer.id, col);
                                    setActiveColorPickerLayerId(null);
                                  }}
                                  className={`w-4 h-4 rounded-full border border-white shadow-xs transition hover:scale-125 cursor-pointer ${
                                    cLayer.color === col ? 'ring-2 ring-slate-900 scale-110' : ''
                                  }`}
                                  style={{ backgroundColor: col }}
                                  title={`Choisir la couleur ${col}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Quick List Panel */}
          {activeToolTab === 'quicklist' && (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              <div className="text-xs text-slate-500 mb-2">
                {filteredNurseries.length} pépinière(s) selon les filtres
              </div>
              {filteredNurseries.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([n.latitude, n.longitude], 15, { animate: true });
                    }
                    setSelectedMarkerNursery(n);
                  }}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 cursor-pointer transition text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{n.nom}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      n.type === 'ecole' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {n.type === 'ecole' ? 'École' : 'Privée'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {n.commune} &middot; {n.arrondissement}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 2. Top Centered Quick Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-400 w-11/12 max-w-md">
        <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 flex items-center px-3.5 py-2.5">
          <Search className="w-4 h-4 text-emerald-700 shrink-0 mr-2.5" />
          <input
            id="map-quick-search"
            type="text"
            placeholder="Rechercher une pépinière, commune (Abomey, Bohicon...)"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="pl-2 border-l border-slate-200 text-xs font-bold text-emerald-800 shrink-0">
            {filteredNurseries.length}
          </div>
        </div>
      </div>

      {/* 3. Main Leaflet Map Canvas with Drag & Drop */}
      <div 
        ref={mapContainerRef} 
        id="geoportail-map-canvas"
        className="w-full h-full z-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropFile}
      />

      {/* Full-Map Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-500 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white border-4 border-dashed border-emerald-400 p-8 pointer-events-none animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-emerald-600/60 border border-emerald-400/80 flex items-center justify-center mb-4 animate-bounce">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2 text-center text-emerald-100">
            Déposez votre fichier GeoJSON ici
          </h2>
          <p className="text-sm text-emerald-200/90 max-w-md text-center">
            Le fichier (.geojson ou .json) sera immédiatement intégré, tracé sur la carte et centré automatiquement.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-900/60 px-4 py-1.5 rounded-full border border-emerald-600/40">
            <span>✓ Points &amp; Pépinières</span>
            <span>&bull;</span>
            <span>✓ Polygones &amp; Limites</span>
            <span>&bull;</span>
            <span>✓ Lignes &amp; Réseaux</span>
          </div>
        </div>
      )}

      {/* Toast Notification for GeoJSON Upload */}
      {geoJsonToast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-600 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fade-in text-xs max-w-lg ${
          geoJsonToast.type === 'success' 
            ? 'bg-slate-950 text-white border-emerald-500' 
            : 'bg-rose-950 text-white border-rose-500'
        }`}>
          {geoJsonToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <div className="flex-1">
            <div className="font-bold text-sm leading-tight">{geoJsonToast.message}</div>
            {geoJsonToast.submessage && (
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">{geoJsonToast.submessage}</div>
            )}
          </div>
          <button
            onClick={() => setGeoJsonToast(null)}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nursery Prompt if Point features detected */}
      {nurseryPrompt && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-600 bg-emerald-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500 flex flex-col sm:flex-row items-center gap-4 animate-fade-in max-w-xl text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center shrink-0">
              <TreePine className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-emerald-200">
                {nurseryPrompt.nurseries.length} pépinières détectées dans le fichier
              </div>
              <div className="text-[11px] text-slate-300">
                La couche est affichée. Souhaitez-vous également intégrer ces pépinières au catalogue ?
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (onImportNurseries) {
                  onImportNurseries(nurseryPrompt.nurseries, 'merge');
                }
                setNurseryPrompt(null);
              }}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition cursor-pointer"
            >
              Ajouter aux pépinières
            </button>
            <button
              onClick={() => setNurseryPrompt(null)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
            >
              Ignorer
            </button>
          </div>
        </div>
      )}

      {/* 4. Right Filter Sidebar (Inspired by Mockup #2) */}
      <div className={`absolute top-4 right-4 z-400 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 transition-all duration-300 ${
        filterPanelOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
      }`}>
        <div className="p-5 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">Filtres cartographiques</h3>
            </div>
            <button
              onClick={() => setFilterPanelOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Type de pépinière */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Type de pépinière
            </label>
            <select
              id="filter-type-select"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 font-medium"
            >
              <option value="all">Toutes (Scolaires et Privées)</option>
              <option value="ecole">Pépinière école (scolaire)</option>
              <option value="privee">Pépinière privée (commerciale)</option>
            </select>
          </div>

          {/* Commune */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Commune du Zou
            </label>
            <select
              id="filter-commune-select"
              value={filters.commune}
              onChange={(e) => setFilters({ ...filters, commune: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 font-medium"
            >
              <option value="all">Toutes les communes</option>
              {COMMUNES_ZOU.map((com) => (
                <option key={com} value={com}>{com}</option>
              ))}
            </select>
          </div>

          {/* Arrondissement */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Arrondissement
            </label>
            <select
              id="filter-arrondissement-select"
              value={filters.arrondissement}
              onChange={(e) => setFilters({ ...filters, arrondissement: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 font-medium"
            >
              <option value="all">Tous les arrondissements</option>
              <option value="Vidolè">Vidolè (Abomey)</option>
              <option value="Djègbé">Djègbé (Abomey)</option>
              <option value="Hounli">Hounli (Abomey)</option>
              <option value="Sèhoun">Sèhoun (Abomey)</option>
              <option value="Bohicon 1">Bohicon 1</option>
              <option value="Bohicon 2">Bohicon 2</option>
              <option value="Covè Centre">Covè Centre</option>
              <option value="Zagnanado">Zagnanado</option>
            </select>
          </div>

          {/* Statut */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Statut opérationnel
            </label>
            <select
              id="filter-statut-select"
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value as any })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 font-medium"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif (En pleine production)</option>
              <option value="en_creation">En création / Projet</option>
              <option value="saisonnier">Saisonnier</option>
            </select>
          </div>

          {/* Espèces d'arbres produites */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Espèce d'arbre cultivée
            </label>
            <select
              id="filter-espece-select"
              value={filters.espece}
              onChange={(e) => setFilters({ ...filters, espece: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 font-medium"
            >
              <option value="all">Toutes essences</option>
              {ESPECES_COURANTES.map((sp) => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          {/* Action buttons (from mockup: Réinitialiser / Appliquer) */}
          <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
            <button
              id="filter-btn-reset"
              onClick={handleResetFilters}
              className="w-1/2 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition text-center"
            >
              Réinitialiser
            </button>
            <button
              id="filter-btn-apply"
              onClick={() => {
                // Flash feedback
              }}
              className="w-1/2 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition text-center shadow-xs"
            >
              Appliquer ({filteredNurseries.length})
            </button>
          </div>

          {/* Quick Legend at bottom of filter panel */}
          <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1.5 text-slate-600">
            <div className="font-bold text-slate-700">Légende :</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block" />
              <span>Pépinière école</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>Pépinière privée</span>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Toggle Button when filter panel is closed */}
      {!filterPanelOpen && (
        <button
          onClick={() => setFilterPanelOpen(true)}
          className="absolute top-4 right-4 z-400 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-200 text-xs font-bold text-emerald-800 flex items-center gap-2 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtres ({filteredNurseries.length})</span>
        </button>
      )}

      {/* 5. Dedicated GeoJSON Feature Inspector (Shows 100% of all GeoJSON attributes) */}
      <GeoJSONInspector
        featureDetails={inspectedFeature}
        onClose={() => setInspectedFeature(null)}
        onSelectNurseryFull={onSelectNursery}
        nurseryRef={selectedMarkerNursery}
      />

      {/* 6. GIS Attribute Table Drawer (QGIS / ArcGIS Web Map table view) */}
      <AttributeTableDrawer
        nurseries={filteredNurseries}
        isOpen={isAttributeTableOpen}
        onToggle={() => setIsAttributeTableOpen(!isAttributeTableOpen)}
        onSelectNursery={onSelectNursery}
        onZoomToNursery={handleZoomToNursery}
        isAdmin={isAdmin}
        onRequestAdminAuth={onRequestAdminAuth}
      />

    </div>
  );
};
