import React, { useState } from 'react';
import { Nursery, NurseryType } from '../types';
import { COMMUNES_ZOU } from '../data/nurseryData';
import { getNurseryPhoto, handleImageFallback } from '../utils/imageHelper';
import { TREE_CATEGORIES_INFO, getNurseryTreeCategory } from '../utils/markerIcons';
import { canDownloadNurseryData } from '../utils/adminAuth';
import { 
  Search, 
  Filter, 
  Download, 
  MapPin, 
  GraduationCap, 
  Store, 
  Compass, 
  Eye, 
  Table as TableIcon, 
  Grid, 
  Phone,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface NurseryListProps {
  nurseries: Nursery[];
  onSelectNursery: (nursery: Nursery) => void;
  onViewOnMap: (nursery: Nursery) => void;
  onExportGeoJSON: () => void;
  isAdmin?: boolean;
  onRequestAdminAuth?: (reason: 'download_geojson' | 'add_nursery') => void;
}

export const NurseryList: React.FC<NurseryListProps> = ({
  nurseries,
  onSelectNursery,
  onViewOnMap,
  onExportGeoJSON,
  isAdmin = false,
  onRequestAdminAuth
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | NurseryType>('all');
  const [selectedCommune, setSelectedCommune] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const isDownloadAllowed = canDownloadNurseryData(isAdmin);

  const handleExportClick = () => {
    if (isDownloadAllowed) {
      onExportGeoJSON();
    } else if (onRequestAdminAuth) {
      onRequestAdminAuth('download_geojson');
    }
  };

  const filtered = nurseries.filter((n) => {
    if (selectedType !== 'all' && n.type !== selectedType) return false;
    if (selectedCommune !== 'all' && n.commune.toLowerCase() !== selectedCommune.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = 
        n.nom.toLowerCase().includes(q) ||
        n.commune.toLowerCase().includes(q) ||
        n.arrondissement.toLowerCase().includes(q) ||
        n.promoteur.toLowerCase().includes(q) ||
        n.especes.some(e => e.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Répertoire des Pépinières
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Catalogue complet des sites scolaires et privés répertoriés dans le Zou et à Abomey
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportClick}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
              isDownloadAllowed
                ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900'
                : 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900'
            }`}
            title={
              isAdmin 
                ? "Télécharger le GeoJSON (Session Administrateur)" 
                : isDownloadAllowed
                  ? "Téléchargement autorisé par l'administrateur"
                  : "Le téléchargement des données doit être validé ou autorisé par l'administrateur"
            }
          >
            {isDownloadAllowed ? (
              <Download className="w-4 h-4 text-emerald-700" />
            ) : (
              <Lock className="w-4 h-4 text-amber-700" />
            )}
            <span>
              {isAdmin 
                ? 'Exporter GeoJSON' 
                : isDownloadAllowed 
                  ? 'Exporter GeoJSON (Autorisé)' 
                  : 'Exporter GeoJSON (Autorisation requise)'}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher nom, espèce, promoteur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toutes ({nurseries.length})
            </button>
            <button
              onClick={() => setSelectedType('ecole')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedType === 'ecole' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Écoles ({nurseries.filter(n => n.type === 'ecole').length})
            </button>
            <button
              onClick={() => setSelectedType('privee')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedType === 'privee' ? 'bg-amber-500 text-amber-950 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Privées ({nurseries.filter(n => n.type === 'privee').length})
            </button>
          </div>

          <select
            value={selectedCommune}
            onChange={(e) => setSelectedCommune(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden"
          >
            <option value="all">Toutes communes</option>
            {COMMUNES_ZOU.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              title="Vue Grille"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              title="Vue Tableau"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Results Count */}
      <div className="text-xs font-semibold text-slate-500 px-1 flex items-center justify-between">
        <span>{filtered.length} pépinière(s) trouvée(s)</span>
        {search && (
          <button onClick={() => setSearch('')} className="text-emerald-700 hover:underline">
            Effacer la recherche
          </button>
        )}
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((nursery, index) => {
            const isEcole = nursery.type === 'ecole';
            const treeCat = getNurseryTreeCategory(nursery);
            const treeInfo = TREE_CATEGORIES_INFO[treeCat] || TREE_CATEGORIES_INFO.ecole;
            return (
              <div
                key={nursery.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={getNurseryPhoto(nursery, index)}
                      alt={nursery.nom}
                      onError={(e) => handleImageFallback(e, nursery, index)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs ${
                        isEcole ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-amber-950'
                      }`}>
                        {isEcole ? <GraduationCap className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                        {isEcole ? 'École' : 'Privée'}
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/85 text-white backdrop-blur-xs border border-white/25 shadow-xs">
                        <img 
                          src={treeInfo.image} 
                          alt={treeInfo.label} 
                          className="w-3.5 h-3.5 rounded-full object-cover border border-white/40" 
                        />
                        <span>{treeInfo.label.split('(')[0].trim()}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-md text-xs font-bold">
                      {nursery.capaciteAnnuelle.toLocaleString()} plants
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{nursery.commune} &middot; {nursery.arrondissement}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {nursery.nom}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {nursery.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {nursery.especes.slice(0, 3).map((esp, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {esp}
                        </span>
                      ))}
                      {nursery.especes.length > 3 && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">
                          +{nursery.especes.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectNursery(nursery)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition text-center"
                  >
                    Détails
                  </button>

                  <button
                    onClick={() => onViewOnMap(nursery)}
                    className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Carte</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Pépinière</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Commune</th>
                  <th className="py-3 px-4">Promoteur</th>
                  <th className="py-3 px-4">Capacité</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((n) => {
                  const isEcole = n.type === 'ecole';
                  return (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={getNurseryPhoto(n)} 
                            alt={n.nom} 
                            onError={(e) => handleImageFallback(e, n)}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{n.nom}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {n.latitude.toFixed(3)}, {n.longitude.toFixed(3)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isEcole ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isEcole ? 'École' : 'Privée'}
                          </span>
                          <span className="text-[10px] text-slate-700 font-bold flex items-center gap-1.5">
                            <img 
                              src={TREE_CATEGORIES_INFO[getNurseryTreeCategory(n)].image} 
                              alt="Essence" 
                              className="w-4 h-4 rounded-full object-cover border border-slate-300 shadow-xs" 
                            />
                            <span>{TREE_CATEGORIES_INFO[getNurseryTreeCategory(n)].label.split('(')[0].trim()}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{n.commune}</div>
                        <div className="text-slate-400 text-[10px]">{n.arrondissement}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{n.promoteur}</div>
                        <div className="text-slate-400 text-[10px]">{n.telephone}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {n.capaciteAnnuelle.toLocaleString()} <span className="font-normal text-slate-400 text-[10px]">pl/an</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{n.statut}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectNursery(n)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                            title="Voir la fiche"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onViewOnMap(n)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                            title="Voir sur la carte"
                          >
                            <Compass className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
