import React, { useState } from 'react';
import { Nursery } from '../types';
import { canDownloadNurseryData } from '../utils/adminAuth';
import { 
  Table, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Search, 
  Download, 
  MapPin, 
  Maximize2,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Lock
} from 'lucide-react';

interface AttributeTableDrawerProps {
  nurseries: Nursery[];
  isOpen: boolean;
  onToggle: () => void;
  onSelectNursery: (nursery: Nursery) => void;
  onZoomToNursery: (nursery: Nursery) => void;
  isAdmin?: boolean;
  onRequestAdminAuth?: (reason: 'download_geojson') => void;
}

export const AttributeTableDrawer: React.FC<AttributeTableDrawerProps> = ({
  nurseries,
  isOpen,
  onToggle,
  onSelectNursery,
  onZoomToNursery,
  isAdmin = false,
  onRequestAdminAuth
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ecole' | 'privee'>('all');

  const isDownloadAllowed = canDownloadNurseryData(isAdmin);

  const filtered = nurseries.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      n.nom.toLowerCase().includes(s) ||
      n.commune.toLowerCase().includes(s) ||
      n.arrondissement.toLowerCase().includes(s) ||
      n.promoteur.toLowerCase().includes(s) ||
      n.especes.some(e => e.toLowerCase().includes(s))
    );
  });

  const exportCSV = () => {
    if (!isDownloadAllowed) {
      if (onRequestAdminAuth) onRequestAdminAuth('download_geojson');
      return;
    }
    const headers = ["ID", "Nom", "Type", "Commune", "Arrondissement", "Promoteur", "Telephone", "Email", "CapaciteAnnuelle", "SuperficieM2", "SystemeArrosage", "Latitude", "Longitude", "Especes"];
    const rows = filtered.map(n => [
      n.id,
      `"${n.nom.replace(/"/g, '""')}"`,
      n.type,
      n.commune,
      n.arrondissement,
      `"${n.promoteur.replace(/"/g, '""')}"`,
      n.telephone,
      n.email || '',
      n.capaciteAnnuelle,
      n.superficieM2 || 0,
      `"${(n.systemeArrosage || '').replace(/"/g, '""')}"`,
      n.latitude,
      n.longitude,
      `"${n.especes.join('; ')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BENIN_PEPI_table_attributaire_${filtered.length}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-400 bg-white/95 backdrop-blur-md border-t border-slate-300 shadow-2xl transition-all duration-300 flex flex-col font-sans">
      
      {/* Top Header Bar / Toggle Strip */}
      <div className="px-4 py-2 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition font-bold"
          >
            <Table className="w-4 h-4" />
            <span>Table attributaire GeoJSON</span>
            <span className="bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {filtered.length} entités
            </span>
          </button>

          {isOpen && (
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <span className="text-[11px] text-slate-400">Système géodésique :</span>
              <span className="text-[11px] font-mono text-amber-300">WGS84 / EPSG:4326</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              onClick={exportCSV}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isDownloadAllowed
                  ? 'bg-white/10 hover:bg-white/20 text-slate-200'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30'
              }`}
              title={
                isDownloadAllowed 
                  ? 'Exporter les entités au format CSV' 
                  : 'Téléchargement soumis à autorisation de l\'administrateur'
              }
            >
              {isDownloadAllowed ? (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isDownloadAllowed ? 'Exporter CSV' : 'CSV (Autorisation requise)'}</span>
            </button>
          )}

          <button
            onClick={onToggle}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition flex items-center gap-1"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span className="text-[11px]">{isOpen ? 'Réduire' : 'Afficher la table'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Table Content */}
      {isOpen && (
        <div className="flex flex-col h-64 max-h-[40vh] bg-white">
          
          {/* Filter sub-bar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par attribut (nom, commune, essence, promoteur)..."
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Type :</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
              >
                <option value="all">Tous ({nurseries.length})</option>
                <option value="ecole">Pépinières Écoles</option>
                <option value="privee">Pépinières Privées</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
              <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200 z-10 shadow-xs">
                <tr>
                  <th className="py-2 px-3">Actions</th>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Nom du site</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Commune</th>
                  <th className="py-2 px-3">Arrondissement</th>
                  <th className="py-2 px-3 text-right">Capacité (plants/an)</th>
                  <th className="py-2 px-3 text-right">Superficie (m²)</th>
                  <th className="py-2 px-3">Système d'eau</th>
                  <th className="py-2 px-3">Essences principales</th>
                  <th className="py-2 px-3">Promoteur / Contact</th>
                  <th className="py-2 px-3 font-mono">Coordonnées (Lat, Lng)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((n) => (
                  <tr 
                    key={n.id} 
                    className="hover:bg-emerald-50/60 transition group cursor-pointer"
                    onClick={() => onZoomToNursery(n)}
                  >
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onZoomToNursery(n);
                          }}
                          title="Centrer la carte sur cette pépinière"
                          className="p-1 rounded bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition"
                        >
                          <MapPin className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectNursery(n);
                          }}
                          title="Ouvrir la fiche complète"
                          className="p-1 rounded bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-500">{n.id}</td>
                    <td className="py-1.5 px-3 font-bold text-slate-900 group-hover:text-emerald-800">{n.nom}</td>
                    <td className="py-1.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        n.type === 'ecole' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {n.type === 'ecole' ? 'École' : 'Privée'}
                      </span>
                    </td>
                    <td className="py-1.5 px-3">{n.commune}</td>
                    <td className="py-1.5 px-3">{n.arrondissement}</td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-800">
                      {n.capaciteAnnuelle.toLocaleString()}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-600">
                      {n.superficieM2 ? n.superficieM2.toLocaleString() : '-'}
                    </td>
                    <td className="py-1.5 px-3 text-slate-600">{n.systemeArrosage || '-'}</td>
                    <td className="py-1.5 px-3 max-w-[200px] truncate" title={n.especes.join(', ')}>
                      {n.especes.join(', ')}
                    </td>
                    <td className="py-1.5 px-3 text-slate-600">
                      <div className="font-semibold text-slate-800">{n.promoteur}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{n.telephone}</div>
                    </td>
                    <td className="py-1.5 px-3 font-mono text-[10px] text-slate-600">
                      {n.latitude.toFixed(4)}, {n.longitude.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
