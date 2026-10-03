import React, { useState } from 'react';
import { GeoJSONFeatureDetails, Nursery } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  MapPin, 
  Table, 
  Code2, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Layers, 
  FileJson,
  Maximize2,
  Droplets,
  Sprout,
  Phone,
  Mail,
  User,
  Calendar,
  Compass
} from 'lucide-react';

interface GeoJSONInspectorProps {
  featureDetails: GeoJSONFeatureDetails | null;
  onClose: () => void;
  onSelectNurseryFull?: (nursery: Nursery) => void;
  nurseryRef?: Nursery | null;
}

export const GeoJSONInspector: React.FC<GeoJSONInspectorProps> = ({
  featureDetails,
  onClose,
  onSelectNurseryFull,
  nurseryRef
}) => {
  const [activeTab, setActiveTab] = useState<'attributes' | 'raw' | 'summary'>('attributes');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  if (!featureDetails) return null;

  const { title, layerName, geometryType, coordinatesFormatted, properties, rawFeature } = featureDetails;

  const entries = Object.entries(properties || {});
  const filteredEntries = entries.filter(([key, val]) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return key.toLowerCase().includes(term) || String(val).toLowerCase().includes(term);
  });

  const handleCopyJson = () => {
    const content = JSON.stringify(rawFeature || { properties, geometry: { type: geometryType, coordinates: coordinatesFormatted } }, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSnippet = () => {
    const content = JSON.stringify({
      type: "Feature",
      geometry: rawFeature?.geometry || { type: geometryType, coordinates: coordinatesFormatted },
      properties: properties
    }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_geojson.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Helper to nicely format values
  const formatValue = (key: string, val: any) => {
    if (val === null || val === undefined) return <span className="text-slate-400 italic">null</span>;
    if (typeof val === 'boolean') return <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${val ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{String(val)}</span>;
    if (Array.isArray(val)) {
      return (
        <div className="flex flex-wrap gap-1">
          {val.map((item, idx) => (
            <span key={idx} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-medium">
              {String(item)}
            </span>
          ))}
        </div>
      );
    }
    if (typeof val === 'object') {
      return <pre className="text-[10px] bg-slate-100 p-1 rounded font-mono max-h-24 overflow-auto">{JSON.stringify(val, null, 2)}</pre>;
    }
    if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
      if (val.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        return (
          <div className="space-y-1">
            <a href={val} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline text-[11px] truncate block max-w-xs">{val}</a>
            <img src={val} alt="Aperçu" className="h-16 rounded border border-slate-200 object-cover" />
          </div>
        );
      }
      return (
        <a href={val} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium">
          <span>{val}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    if (key.toLowerCase().includes('capacite') || key.toLowerCase().includes('superficie')) {
      return <span className="font-bold text-slate-900 font-mono">{Number(val).toLocaleString()}</span>;
    }
    return <span className="text-slate-800 break-words">{String(val)}</span>;
  };

  return (
    <div className="absolute top-4 right-4 z-500 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5.5rem)] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{layerName}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {geometryType}
            </span>
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
            {title}
          </h3>
          {coordinatesFormatted && (
            <div className="text-[11px] text-emerald-300/90 font-mono flex items-center gap-1">
              <Compass className="w-3 h-3" />
              <span>{coordinatesFormatted}</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-4 pt-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('attributes')}
            className={`px-3 py-2 rounded-t-xl transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'attributes'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Attributs GeoJSON ({entries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-2 rounded-t-xl transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'raw'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code JSON Brut</span>
          </button>
        </div>

        <div className="flex items-center gap-1 pb-1">
          <button
            onClick={handleCopyJson}
            title="Copier les attributs au format JSON"
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-200/60 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownloadSnippet}
            title="Télécharger l'entité GeoJSON"
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-200/60 transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {activeTab === 'attributes' && (
          <div className="space-y-3">
            
            {/* Quick Attribute Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrer parmi les propriétés du GeoJSON..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Complete Attributes Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2 px-3 w-1/3">Propriété (Clé)</th>
                    <th className="py-2 px-3">Valeur extraite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-slate-400 italic">
                        Aucune propriété correspondante.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map(([key, val]) => (
                      <tr key={key} className="hover:bg-emerald-50/40 transition">
                        <td className="py-2 px-3 font-mono font-bold text-slate-700 bg-slate-50/50 align-top break-all">
                          {key}
                        </td>
                        <td className="py-2 px-3 align-top font-sans text-slate-900">
                          {formatValue(key, val)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
              <FileJson className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Toutes les métadonnées déclarées dans l'objet <code className="font-mono text-emerald-800 font-bold">properties</code> du GeoJSON sont restituées en temps réel sans troncature.
              </span>
            </div>

          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Objet GeoJSON complet :</span>
              <button
                onClick={handleCopyJson}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copié !' : 'Copier JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-2xl overflow-auto max-h-[340px] leading-relaxed border border-slate-800">
              {JSON.stringify(rawFeature || { properties, geometry: { type: geometryType, coordinates: coordinatesFormatted } }, null, 2)}
            </pre>
          </div>
        )}

      </div>

      {/* Footer with action */}
      {nurseryRef && onSelectNurseryFull && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 font-medium truncate">
            {nurseryRef.commune} ({nurseryRef.arrondissement})
          </span>
          <button
            onClick={() => onSelectNurseryFull(nurseryRef)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fiche complète &rarr;</span>
          </button>
        </div>
      )}

    </div>
  );
};
