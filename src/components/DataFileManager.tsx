import React, { useState } from 'react';
import { Nursery, CustomGeoJsonLayer } from '../types';
import { geojsonToNurseries, nurseriesToGeojson } from '../data/nurseryData';
import { canDownloadNurseryData } from '../utils/adminAuth';
import { analyzeGeoJsonContent, GIS_LAYER_COLORS } from '../utils/dataImporter';
import { 
  Folder, 
  FileCode2, 
  Image as ImageIcon, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  FileText,
  ExternalLink,
  Layers,
  Database,
  Lock,
  ShieldCheck,
  Trash2,
  Sparkles,
  MapPin,
  Compass
} from 'lucide-react';

interface DataFileManagerProps {
  nurseries: Nursery[];
  onImportNurseries: (imported: Nursery[], mode: 'replace' | 'merge') => void;
  isAdmin?: boolean;
  onRequestAdminAuth?: (reason: 'download_geojson' | 'edit_data' | 'general') => void;
  onResetToDefaults?: () => void;
  onSyncWithServerFile?: () => void;
  onAddCustomLayer?: (layer: CustomGeoJsonLayer) => void;
  onNavigateToMap?: () => void;
  customLayers?: CustomGeoJsonLayer[];
}

export const DataFileManager: React.FC<DataFileManagerProps> = ({
  nurseries,
  onImportNurseries,
  isAdmin = false,
  onRequestAdminAuth,
  onResetToDefaults,
  onSyncWithServerFile,
  onAddCustomLayer,
  onNavigateToMap,
  customLayers = []
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const isDownloadAllowed = canDownloadNurseryData(isAdmin);

  // Download PEPI_BENIN.geojson
  const handleDownloadGeoJSON = () => {
    if (!isDownloadAllowed) {
      if (onRequestAdminAuth) onRequestAdminAuth('download_geojson');
      return;
    }
    const geojson = nurseriesToGeojson(nurseries);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'PEPI_BENIN.geojson');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download Commune_abomey.geojson
  const handleDownloadAbomey = async () => {
    if (!isDownloadAllowed) {
      if (onRequestAdminAuth) onRequestAdminAuth('download_geojson');
      return;
    }
    try {
      const res = await fetch('/data/Commune_abomey.geojson');
      const data = await res.json();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = 'Commune_abomey.geojson';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Fichier disponible dans /public/data/Commune_abomey.geojson');
    }
  };

  // Download departement_zou.geojson
  const handleDownloadZou = async () => {
    if (!isDownloadAllowed) {
      if (onRequestAdminAuth) onRequestAdminAuth('download_geojson');
      return;
    }
    try {
      const res = await fetch('/data/departement_zou.geojson');
      const data = await res.json();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = 'departement_zou.geojson';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Fichier disponible dans /public/data/departement_zou.geojson');
    }
  };

  // Handle uploaded GeoJSON file directly in UI
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => {
    if (!isAdmin) {
      if (onRequestAdminAuth) onRequestAdminAuth('edit_data');
      return;
    }

    setImportError(null);
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const analysis = analyzeGeoJsonContent(text, file.name);

        if (!analysis.isValid || analysis.featureCount === 0) {
          throw new Error(analysis.error || 'Aucune entité géométrique trouvée dans le fichier GeoJSON.');
        }

        // Case A: Contains nursery points
        if (analysis.isNurseryDataset && analysis.nurseriesFound.length > 0) {
          onImportNurseries(analysis.nurseriesFound, mode);
          
          if (onAddCustomLayer) {
            onAddCustomLayer({
              id: `layer-${Date.now()}`,
              name: analysis.suggestedTitle,
              data: analysis.rawJson,
              color: GIS_LAYER_COLORS[customLayers.length % GIS_LAYER_COLORS.length],
              visible: true,
              featureCount: analysis.featureCount,
              geometryType: analysis.mainGeometryType,
              dateAdded: new Date().toISOString()
            });
          }

          setImportStatus(
            mode === 'replace'
              ? `Couche remplacée avec succès ! (${analysis.nurseriesFound.length} pépinières chargées et affichées sur le géoportail)`
              : `Données fusionnées avec succès ! (${analysis.nurseriesFound.length} nouveaux points ajoutés et affichés sur le géoportail)`
          );
        } else {
          // Case B: General Vector Layer (Polygons, Lines, or other points)
          if (onAddCustomLayer) {
            const newLayer: CustomGeoJsonLayer = {
              id: `layer-${Date.now()}`,
              name: analysis.suggestedTitle,
              data: analysis.rawJson,
              color: GIS_LAYER_COLORS[customLayers.length % GIS_LAYER_COLORS.length],
              visible: true,
              featureCount: analysis.featureCount,
              geometryType: analysis.mainGeometryType,
              dateAdded: new Date().toISOString()
            };
            onAddCustomLayer(newLayer);
            setImportStatus(`Couche GeoJSON "${newLayer.name}" (${newLayer.featureCount} entités, ${newLayer.geometryType}) intégrée et affichée sur le géoportail !`);
          } else {
            setImportStatus(`Couche GeoJSON "${analysis.suggestedTitle}" (${analysis.featureCount} entités) traitée avec succès.`);
          }
        }
      } catch (err: any) {
        setImportError(`Erreur de lecture du fichier GeoJSON : ${err.message || 'Format invalide'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyStructure = () => {
    const text = `📂 BENIN-PEPI/
├── 📂 public/data/
│   ├── 📄 Commune_abomey.geojson
│   ├── 📄 departement_zou.geojson
│   ├── 📄 PEPI_BENIN.geojson
│   └── 📄 README.md
├── 📂 public/assets/pepinieres/
│   ├── 🖼️ pepiniere_eni.jpg
│   ├── 🖼️ pepiniere_teme.jpg
│   └── 📄 README.md
├── 📂 src/
└── 📄 package.json`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Gestionnaire des Couches SIG &amp; Médias
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Fichiers Cartographiques &amp; Ressources
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Retrouvez ici l'ensemble des fichiers GeoJSON, les répertoires d'images des pépinières et la documentation pour alimenter le géoportail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Action: Export PEPI_BENIN.geojson */}
          <button
            id="btn-export-pepi-geojson"
            onClick={handleDownloadGeoJSON}
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-98"
            title={isDownloadAllowed ? "Exporter les données pépinières en GeoJSON" : "Téléchargement soumis à autorisation de l'administrateur"}
          >
            {isDownloadAllowed ? (
              <Download className="w-4 h-4 text-emerald-200" />
            ) : (
              <Lock className="w-4 h-4 text-white" />
            )}
            <span>Exporter PEPI_BENIN.geojson</span>
          </button>
        </div>
      </div>

      {/* Admin Status Banner */}
      {!isAdmin ? (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Mode consultation publique : </span>
              <span>L'ajout, la modification ou la suppression de fichiers GeoJSON ainsi que le téléchargement des données brutes sont réservés aux administrateurs.</span>
            </div>
          </div>
          {onRequestAdminAuth && (
            <button
              onClick={() => onRequestAdminAuth('edit_data')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 transition cursor-pointer"
            >
              Connexion Administrateur
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>Mode Administrateur actif : Vous disposez des droits complets d'importation, modification et téléchargement des couches SIG.</span>
          </div>
          {onResetToDefaults && (
            <button
              onClick={onResetToDefaults}
              className="px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold transition cursor-pointer shrink-0 ml-3"
            >
              Réinitialiser couches par défaut
            </button>
          )}
        </div>
      )}

      {/* Success / Error Alerts */}
      {importStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
          {onNavigateToMap && (
            <button
              onClick={onNavigateToMap}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Voir sur le Géoportail</span>
            </button>
          )}
        </div>
      )}

      {importError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{importError}</span>
        </div>
      )}

      {/* Folder Structure Diagram (Faithful to Mockup #8 "Structures du dossier (fourni)") */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Tree */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">Arborescence cartographique du projet</h3>
            </div>
            <button
              onClick={copyStructure}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>

          <div className="font-mono text-xs bg-slate-900 text-emerald-300 p-5 rounded-2xl overflow-x-auto space-y-1 leading-relaxed shadow-inner">
            <div className="text-amber-400 font-bold">📂 BENIN-PEPI/</div>
            <div className="pl-4">├── 📂 <span className="text-white font-bold">public/data/</span> <span className="text-slate-400">&larr; Vos GeoJSON ici</span></div>
            <div className="pl-8">│   ├── 📄 <span className="text-yellow-300 font-bold">Commune_abomey.geojson</span> (Polygone Abomey)</div>
            <div className="pl-8">│   ├── 📄 <span className="text-yellow-300 font-bold">departement_zou.geojson</span> (Polygone Zou)</div>
            <div className="pl-8">│   ├── 📄 <span className="text-yellow-300 font-bold">PEPI_BENIN.geojson</span> (Points des pépinières)</div>
            <div className="pl-8">│   └── 📄 README.md (Documentation d'intégration)</div>
            <div className="pl-4">├── 📂 <span className="text-white font-bold">public/assets/pepinieres/</span> <span className="text-slate-400">&larr; Vos images ici</span></div>
            <div className="pl-8">│   ├── 🖼️ pepiniere_eni.jpg</div>
            <div className="pl-8">│   ├── 🖼️ pepiniere_teme.jpg</div>
            <div className="pl-8">│   └── 📄 README.md</div>
            <div className="pl-4">├── 📂 src/ (Composants React, Carte Leaflet, Styles)</div>
            <div className="pl-4">├── 📄 package.json</div>
            <div className="pl-4">└── 📄 README.md</div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 pt-2">
            <p className="font-semibold text-slate-800">
              💡 Comment alimenter le géoportail avec vos fichiers ?
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
              <li>Déposez vos fichiers <code className="bg-slate-100 px-1 rounded text-emerald-800 font-mono">.geojson</code> dans <code className="bg-slate-100 px-1 rounded text-emerald-800 font-mono">/public/data/</code>.</li>
              <li>Déposez vos photos dans <code className="bg-slate-100 px-1 rounded text-emerald-800 font-mono">/public/assets/pepinieres/</code>.</li>
              <li>Le géoportail chargera automatiquement vos tracés cartographiques au démarrage !</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Live GeoJSON Importer & Exporter */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Direct File Dropzone */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Gestion &amp; Injection des fichiers GeoJSON</span>
              </h3>
              {!isAdmin && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Lock className="w-3 h-3" />
                  <span>Admin requis</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              {isAdmin 
                ? "Déposez un fichier GeoJSON pour fusionner avec la base actuelle ou remplacer l'intégralité de la couche."
                : "Les opérations d'importation, d'ajout et de remplacement des données sont réservées à l'administrateur."}
            </p>

            {!isAdmin && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-amber-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Remplacement et ajout de données strictement réservés</h4>
                  <p className="text-[11px] text-slate-600">Conformément aux règles de sécurité, le remplacement du jeu de données et l'ajout de nouvelles pépinières sont réservés à l'administrateur dans l'Espace Administrateur.</p>
                </div>
              </div>
            )}

            {isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center">
                  <Upload className="w-6 h-6 text-emerald-700 mb-2" />
                  <span className="text-xs font-bold text-emerald-950">Fusionner avec l'existant</span>
                  <span className="text-[10px] text-emerald-700 mt-0.5">Ajoute les points aux pépinières</span>
                  <input
                    type="file"
                    accept=".geojson,.json"
                    onChange={(e) => handleFileUpload(e, 'merge')}
                    className="hidden"
                  />
                </label>

                <label className="border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center">
                  <Layers className="w-6 h-6 text-slate-700 mb-2" />
                  <span className="text-xs font-bold text-slate-900">Remplacer la couche</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Remplace la liste actuelle</span>
                  <input
                    type="file"
                    accept=".geojson,.json"
                    onChange={(e) => handleFileUpload(e, 'replace')}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Importation GeoJSON réservée à l'administrateur
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  La partie publique est conçue pour la consultation. Connectez-vous avec vos identifiants administrateur pour importer de nouveaux fichiers GeoJSON.
                </p>
                {onRequestAdminAuth && (
                  <button
                    onClick={() => onRequestAdminAuth('edit_data')}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Se connecter en tant qu'administrateur
                  </button>
                )}
              </div>
            )}

            {/* Sync from server file button */}
            {onSyncWithServerFile && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Fichier source : <code className="font-mono text-emerald-800">/public/data/PEPI_BENIN.geojson</code>
                </span>
                <button
                  type="button"
                  onClick={onSyncWithServerFile}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Recharge immédiatement le fichier GeoJSON de référence"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Recharger le fichier GeoJSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Files Download Links with Validation Protection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Fichiers cartographiques à télécharger</h3>
              {!isAdmin && (
                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Validation requise</span>
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleDownloadGeoJSON}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileCode2 className="w-4 h-4 text-emerald-700" />
                  <span>PEPI_BENIN.geojson (Points pépinières actuels)</span>
                </div>
                {isAdmin ? <Download className="w-4 h-4 text-slate-400" /> : <Lock className="w-4 h-4 text-amber-600" />}
              </button>

              <button
                onClick={handleDownloadAbomey}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileCode2 className="w-4 h-4 text-amber-600" />
                  <span>Commune_abomey.geojson (Polygone Abomey)</span>
                </div>
                {isAdmin ? <Download className="w-4 h-4 text-slate-400" /> : <Lock className="w-4 h-4 text-amber-600" />}
              </button>

              <button
                onClick={handleDownloadZou}
                className="w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileCode2 className="w-4 h-4 text-blue-600" />
                  <span>departement_zou.geojson (Polygone Département Zou)</span>
                </div>
                {isAdmin ? <Download className="w-4 h-4 text-slate-400" /> : <Lock className="w-4 h-4 text-amber-600" />}
              </button>

              <a
                href="/geoportail.html"
                download="geoportail.html"
                className="w-full p-3 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50 flex items-center justify-between text-xs font-bold text-emerald-950 transition cursor-pointer no-underline"
                title="Télécharger le fichier HTML complet autonome du géoportail (ouvrable directement dans le navigateur)"
              >
                <div className="flex items-center gap-2.5">
                  <FileCode2 className="w-4 h-4 text-emerald-700" />
                  <span>geoportail.html (Code HTML complet &amp; autonome du Géoportail)</span>
                </div>
                <Download className="w-4 h-4 text-emerald-700" />
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
