import React, { useState, useRef } from 'react';
import { Nursery } from '../types';
import { 
  parseRawDataToNurseries, 
  getSampleCsvTemplate, 
  getSampleGeojsonTemplate, 
  ParseResult 
} from '../utils/dataImporter';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  FileCode2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Database, 
  RefreshCw, 
  PlusCircle, 
  Download, 
  Eye, 
  MapPin, 
  Layers, 
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ClipboardPaste
} from 'lucide-react';

interface ReplaceDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNurseriesCount: number;
  onReplaceData: (newNurseries: Nursery[]) => void;
  onMergeData: (newNurseries: Nursery[]) => void;
  isAdmin?: boolean;
  onRequestAdmin?: () => void;
}

export const ReplaceDataModal: React.FC<ReplaceDataModalProps> = ({
  isOpen,
  onClose,
  currentNurseriesCount,
  onReplaceData,
  onMergeData,
  isAdmin = false,
  onRequestAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'templates'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewLimit, setPreviewLimit] = useState(5);
  const [bypassAdminAuth, setBypassAdminAuth] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const res = parseRawDataToNurseries(text);
      setParseResult(res);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleParsePastedText = () => {
    if (!pasteContent.trim()) {
      setParseResult({
        success: false,
        nurseries: [],
        formatDetected: 'unknown',
        totalParsed: 0,
        validCoordsCount: 0,
        error: 'Veuillez coller du texte CSV, JSON ou GeoJSON avant de tester.'
      });
      return;
    }
    const res = parseRawDataToNurseries(pasteContent);
    setParseResult(res);
  };

  const handleLoadSample = (type: 'csv' | 'geojson') => {
    const content = type === 'csv' ? getSampleCsvTemplate() : getSampleGeojsonTemplate();
    setPasteContent(content);
    setActiveTab('paste');
    const res = parseRawDataToNurseries(content);
    setParseResult(res);
    setFileName(`exemple_modele.${type}`);
  };

  const handleDownloadTemplate = (type: 'csv' | 'geojson') => {
    const content = type === 'csv' ? getSampleCsvTemplate() : getSampleGeojsonTemplate();
    const blob = new Blob([content], { type: type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'csv' ? 'modele_pepinieres_benin.csv' : 'modele_pepinieres_benin.geojson';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const executeAction = (action: 'replace' | 'merge') => {
    if (!parseResult || !parseResult.success || parseResult.nurseries.length === 0) return;

    if (!isAdmin && !bypassAdminAuth) {
      if (onRequestAdmin) {
        onRequestAdmin();
        return;
      }
    }

    if (action === 'replace') {
      onReplaceData(parseResult.nurseries);
    } else {
      onMergeData(parseResult.nurseries);
    }
    onClose();
  };

  const isAuthorized = isAdmin || bypassAdminAuth;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-700/50">
                  Gestionnaire de Données
                </span>
                <span className="text-xs text-emerald-200/80">
                  Actuel : <strong className="text-white">{currentNurseriesCount} pépinières</strong>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Intégrer &amp; Remplacer les Données des Pépinières
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Charger un fichier (GeoJSON / CSV)</span>
            </button>

            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Coller du texte / Données brutes</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'templates'
                  ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Modèles &amp; Exemples</span>
            </button>
          </div>

          {/* Quick Bypass Toggle if not admin */}
          {!isAdmin && (
            <label className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80 cursor-pointer">
              <input 
                type="checkbox" 
                checked={bypassAdminAuth} 
                onChange={(e) => setBypassAdminAuth(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Autoriser le remplacement immédiat</span>
            </label>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 grow">
          
          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]'
                    : fileName
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".geojson,.json,.csv,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {fileName ? `Fichier sélectionné : ${fileName}` : 'Glissez-déposez votre fichier ici, ou cliquez pour parcourir'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Formats acceptés : <strong>.geojson</strong>, <strong>.json</strong> (tableau ou FeatureCollection), <strong>.csv</strong> (séparateur virgule ou point-virgule)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full font-medium">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Détection automatique des coordonnées, noms, communes et espèces</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Collez vos données (GeoJSON, CSV ou tableau JSON) :
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('csv')}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Charger exemple CSV
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('geojson')}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Charger exemple GeoJSON
                  </button>
                </div>
              </div>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Exemple CSV :&#10;Nom;Type;Commune;Arrondissement;Latitude;Longitude;CapaciteAnnuelle;Especes&#10;Pépinière de Vidolè;privee;Abomey;Vidolè;7.1845;1.9912;30000;Teck, Acacia, Manguier"
                rows={7}
                className="w-full text-xs font-mono p-3.5 bg-slate-900 text-emerald-300 rounded-2xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Analyser les données collées</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Templates & Guidance */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CSV Template */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-sm font-bold">Modèle Tableur Excel / CSV</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Format tabulaire prêt pour Microsoft Excel, LibreOffice ou Google Sheets. Contient les colonnes pré-configurées (Nom, Type, Commune, Arrondissement, Coordonnées, etc.).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadTemplate('csv')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger CSV</span>
                    </button>
                    <button
                      onClick={() => handleLoadSample('csv')}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Tester en ligne
                    </button>
                  </div>
                </div>

                {/* GeoJSON Template */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-800">
                      <FileCode2 className="w-5 h-5 text-blue-600" />
                      <h4 className="text-sm font-bold">Modèle GeoJSON (SIG / QGIS)</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Format standardisé WGS84 (EPSG:4326) avec géométries Point [Longitude, Latitude] et propriétés riches pour intégration directe dans QGIS ou ArcGIS.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadTemplate('geojson')}
                      className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger GeoJSON</span>
                    </button>
                    <button
                      onClick={() => handleLoadSample('geojson')}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Tester en ligne
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat assistance card */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Vous avez déjà une liste ou un fichier de pépinières ?</p>
                  <p className="text-amber-800 leading-relaxed">
                    Vous pouvez simplement copier-coller votre liste de pépinières ou vos données directement dans notre discussion de chat. Nous nous chargeons de les formater et de les intégrer de façon permanente dans le code source de l'application !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PARSING FEEDBACK & PREVIEW SECTION */}
          {parseResult && (
            <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in">
              {/* Status Header */}
              {parseResult.success ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        {parseResult.totalParsed} pépinière(s) détectée(s) avec succès !
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Format : <span className="font-mono font-semibold uppercase">{parseResult.formatDetected}</span> • {parseResult.validCoordsCount} coordonnées GPS valides
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900">
                      Prêt pour remplacement
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Erreur d'analyse des données</p>
                    <p className="text-rose-700 mt-0.5">{parseResult.error || 'Impossible d\'extraire les pépinières du contenu fourni.'}</p>
                  </div>
                </div>
              )}

              {/* Data Preview Table */}
              {parseResult.success && parseResult.nurseries.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Aperçu des données ({Math.min(previewLimit, parseResult.nurseries.length)} sur {parseResult.nurseries.length}) :</span>
                    {parseResult.nurseries.length > 5 && (
                      <button
                        onClick={() => setPreviewLimit(prev => (prev === 5 ? parseResult.nurseries.length : 5))}
                        className="text-emerald-700 hover:underline cursor-pointer"
                      >
                        {previewLimit === 5 ? `Afficher toutes (${parseResult.nurseries.length})` : 'Réduire à 5'}
                      </button>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="py-2.5 px-3">Nom</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Commune</th>
                          <th className="py-2.5 px-3">Arrondissement</th>
                          <th className="py-2.5 px-3">Coordonnées GPS</th>
                          <th className="py-2.5 px-3">Capacité</th>
                          <th className="py-2.5 px-3">Espèces</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parseResult.nurseries.slice(0, previewLimit).map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-2 px-3 font-semibold text-slate-900 max-w-[180px] truncate" title={item.nom}>
                              {item.nom}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.type === 'ecole' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.type === 'ecole' ? 'Scolaire' : 'Privée'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600">{item.commune}</td>
                            <td className="py-2 px-3 text-slate-600">{item.arrondissement}</td>
                            <td className="py-2 px-3 text-slate-700 font-mono text-[11px]">
                              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                            </td>
                            <td className="py-2 px-3 text-slate-600 font-medium">
                              {item.capaciteAnnuelle.toLocaleString()} plants
                            </td>
                            <td className="py-2 px-3 text-slate-500 max-w-[200px] truncate" title={item.especes.join(', ')}>
                              {item.especes.join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {parseResult?.success ? (
              <span className="text-emerald-800 font-semibold">
                Prêt : {parseResult.nurseries.length} nouvelles pépinières prêtes à remplacer le jeu actuel.
              </span>
            ) : (
              <span>Chargez ou collez vos données pour débloquer les actions de remplacement.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Annuler
            </button>

            {/* Merge Action */}
            <button
              onClick={() => executeAction('merge')}
              disabled={!parseResult?.success}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                parseResult?.success
                  ? 'bg-slate-800 hover:bg-slate-900 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
              title="Ajoute les nouveaux sites à ceux existants"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Fusionner (+{parseResult?.nurseries?.length || 0})</span>
            </button>

            {/* Primary Action: REPLACE ALL */}
            <button
              onClick={() => executeAction('replace')}
              disabled={!parseResult?.success}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md ${
                parseResult?.success
                  ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-98'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
              title="Supprime les pépinières actuelles et installe le nouveau lot"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Remplacer tout le jeu de données ({parseResult?.nurseries?.length || 0})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
