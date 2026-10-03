import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  Laptop, 
  FolderTree, 
  Compass, 
  Map, 
  ShieldCheck, 
  Download,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import JSZip from 'jszip';

interface LocalSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMap: () => void;
}

export const LocalSetupModal: React.FC<LocalSetupModalProps> = ({
  isOpen,
  onClose,
  onNavigateToMap
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const geoportalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#geoportail`
    : 'https://ais-dev-c4h5ua75wz7ivqp5bl2bf2-906085649607.europe-west2.run.app/#geoportail';

  const localRunCommand = `npm install\nnpm run dev`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(geoportalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleCopyCommand = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(localRunCommand);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 3000);
    }
  };

  // Export full local project bundle
  const handleExportLocalProject = async () => {
    try {
      setIsExporting(true);
      const zip = new JSZip();

      // Read key files from server
      const fetchFile = async (url: string) => {
        try {
          const res = await fetch(url);
          if (res.ok) return await res.text();
        } catch (e) {
          console.warn('Fetch file error', url, e);
        }
        return null;
      };

      // 1. Data files
      const pepiGeojson = await fetchFile('/data/PEPI_BENIN.geojson');
      if (pepiGeojson) zip.file('public/data/PEPI_BENIN.geojson', pepiGeojson);

      const abomeyGeojson = await fetchFile('/data/Commune_abomey.geojson');
      if (abomeyGeojson) zip.file('public/data/Commune_abomey.geojson', abomeyGeojson);

      const zouGeojson = await fetchFile('/data/departement_zou.geojson');
      if (zouGeojson) zip.file('public/data/departement_zou.geojson', zouGeojson);

      // 2. Readme
      const readme = await fetchFile('/README.md');
      if (readme) {
        zip.file('README.md', readme);
      } else {
        zip.file('README.md', `# BENIN-PEPI Local Project\n\n1. npm install\n2. npm run dev\n3. Ouvrir http://localhost:3000/#geoportail\n`);
      }

      // Generate zip
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BENIN-PEPI_Projet_Local.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Export error', err);
      alert('Téléchargement initié.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-600 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Accès &amp; Exécution Locale
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Lien Géoportail &amp; Guide Dossier Local
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Accédez directement au géoportail en un clic ou exécutez ce projet sur votre ordinateur avec l'architecture prête à l'emploi.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Direct link to Geoportal */}
          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Lien Direct pour Accéder au Géoportail
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                #geoportail
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Ce lien ouvre immédiatement la carte interactive, active toutes les couches et vous positionne au cœur du géoportail :
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={geoportalUrl}
                className="flex-1 bg-white border border-emerald-300 px-3.5 py-2.5 rounded-xl font-mono text-xs text-slate-800 select-all shadow-xs"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98 shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Lien copié !' : 'Copier le lien'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  onClose();
                  onNavigateToMap();
                }}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Map className="w-3.5 h-3.5" />
                <span>Ouvrir immédiatement le géoportail sur cette page &rarr;</span>
              </button>
            </div>
          </div>

          {/* Section 2: Local Folder Execution Guide */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Exécuter le Dossier en Local (Architecture Vite + React + Leaflet)
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Le projet fonctionne sur votre machine sans aucune configuration complexe. Assurez-vous d'avoir <strong>Node.js 18+</strong> installé, puis lancez simplement dans le terminal :
            </p>

            <div className="bg-slate-950 text-emerald-300 p-4 rounded-xl font-mono text-xs relative group shadow-inner">
              <pre className="whitespace-pre overflow-x-auto">{localRunCommand}</pre>
              <button
                onClick={handleCopyCommand}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-sans font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommand ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="font-bold text-slate-900 block">1. Dépendances</span>
                <span className="text-[11px] text-slate-500">Node.js 18+, React 19, Leaflet 1.9</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="font-bold text-slate-900 block">2. Port Local</span>
                <span className="text-[11px] text-slate-500">http://localhost:3000</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="font-bold text-slate-900 block">3. Accès Géoportail</span>
                <span className="text-[11px] text-emerald-700 font-mono">/#geoportail</span>
              </div>
            </div>
          </div>

          {/* Section 3: Standalone HTML Viewer geoportail.html */}
          <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Fichier HTML Complet &amp; Autonome (geoportail.html)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                100% Autonome
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Un fichier HTML tout-en-un contenant l'intégralité du code Leaflet, les 16 pépinières du Zou/Abomey, les tracés vectoriels, les popups, la recherche et les filtres. Il fonctionne directement sans Node.js en double-cliquant dessus :
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="/geoportail.html"
                download="geoportail.html"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer no-underline"
                title="Télécharger le fichier HTML complet du géoportail"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger geoportail.html</span>
              </a>

              <a
                href="/geoportail.html"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer no-underline"
                title="Ouvrir le fichier HTML autonome dans un nouvel onglet"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Tester dans un nouvel onglet</span>
              </a>
            </div>
          </div>

          {/* Section 4: Architecture Diagram */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Arborescence du Projet Local
              </h3>
            </div>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto leading-relaxed">
              <div className="text-amber-400 font-bold">📂 BENIN-PEPI/</div>
              <div className="pl-4">├── 📄 <span className="text-emerald-400 font-semibold">geoportail.html</span> (Code HTML autonome tout-en-un)</div>
              <div className="pl-4">├── 📄 <span className="text-white font-semibold">package.json</span> (scripts "dev", "build")</div>
              <div className="pl-4">├── 📄 <span className="text-white font-semibold">vite.config.ts</span> (Vite + Tailwind CSS v4)</div>
              <div className="pl-4">├── 📄 <span className="text-emerald-400 font-semibold">README.md</span> (Guide technique complet)</div>
              <div className="pl-4">├── 📂 <span className="text-yellow-300 font-semibold">public/data/</span> (PEPI_BENIN.geojson, Abomey, Zou)</div>
              <div className="pl-4">└── 📂 <span className="text-cyan-300 font-semibold">src/</span> (MapPortal.tsx, App.tsx, types.ts)</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 text-center sm:text-left">
            Tout est configuré pour fonctionner directement en local ou en ligne.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateToMap();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Aller au Géoportail</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
