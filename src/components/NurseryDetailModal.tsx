import React, { useState } from 'react';
import { Nursery, TreeIconCategory } from '../types';
import { NURSERY_PHOTOS } from '../data/nurseryData';
import { TREE_CATEGORIES_INFO, getNurseryTreeCategory } from '../utils/markerIcons';
import { getNurseryPhoto, handleImageFallback, LOCAL_NURSERY_PHOTOS } from '../utils/imageHelper';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap, 
  Store, 
  Calendar, 
  Sprout, 
  Compass, 
  CheckCircle2, 
  Droplet,
  Maximize2,
  Table,
  Code2,
  Copy,
  Check,
  FileJson,
  Camera,
  Upload,
  Image as ImageIcon,
  TreePine
} from 'lucide-react';

interface NurseryDetailModalProps {
  nursery: Nursery | null;
  onClose: () => void;
  onViewOnMap: (nursery: Nursery) => void;
  onUpdateNursery?: (updated: Nursery) => void;
  isAdmin?: boolean;
}

export const NurseryDetailModal: React.FC<NurseryDetailModalProps> = ({
  nursery,
  onClose,
  onViewOnMap,
  onUpdateNursery,
  isAdmin = false
}) => {
  const [showRawGeojson, setShowRawGeojson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [photoSavedToast, setPhotoSavedToast] = useState(false);

  if (!nursery) return null;

  const isEcole = nursery.type === 'ecole';
  const treeCat = getNurseryTreeCategory(nursery);
  const treeInfo = TREE_CATEGORIES_INFO[treeCat] || TREE_CATEGORIES_INFO.ecole;

  const handleSelectPhoto = (newPhotoUrl: string) => {
    if (!newPhotoUrl) return;
    const updated: Nursery = {
      ...nursery,
      photoUrl: newPhotoUrl
    };
    if (onUpdateNursery) {
      onUpdateNursery(updated);
    }
    setPhotoSavedToast(true);
    setTimeout(() => setPhotoSavedToast(false), 2500);
    setShowPhotoPicker(false);
  };

  const handleSelectTreeIcon = (iconCat: TreeIconCategory) => {
    const updated: Nursery = {
      ...nursery,
      treeIcon: iconCat
    };
    if (onUpdateNursery) {
      onUpdateNursery(updated);
    }
    setPhotoSavedToast(true);
    setTimeout(() => setPhotoSavedToast(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          handleSelectPhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const allProperties: Record<string, any> = {
    id: nursery.id,
    nom: nursery.nom,
    type: nursery.type,
    commune: nursery.commune,
    arrondissement: nursery.arrondissement,
    promoteur: nursery.promoteur,
    telephone: nursery.telephone,
    email: nursery.email || '',
    capaciteAnnuelle: nursery.capaciteAnnuelle,
    superficieM2: nursery.superficieM2 || 0,
    systemeArrosage: nursery.systemeArrosage || '',
    especes: nursery.especes,
    statut: nursery.statut,
    dateCreation: nursery.dateCreation || '',
    latitude: nursery.latitude,
    longitude: nursery.longitude,
    crs: 'EPSG:4326 (WGS84)',
    ...(nursery.rawProperties || {})
  };

  const handleCopyJson = () => {
    const geojsonSnippet = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [nursery.longitude, nursery.latitude]
      },
      properties: allProperties
    };
    navigator.clipboard.writeText(JSON.stringify(geojsonSnippet, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-500 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cover Photo */}
        <div className="relative h-56 bg-slate-800 overflow-hidden">
          <img
            src={getNurseryPhoto(nursery)}
            alt={nursery.nom}
            onError={(e) => handleImageFallback(e, nursery)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on Cover */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
              isEcole ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-amber-950'
            }`}>
              {isEcole ? <GraduationCap className="w-4 h-4" /> : <Store className="w-4 h-4" />}
              {isEcole ? 'Pépinière École' : 'Pépinière Privée'}
            </span>

            {/* Tree Icon Badge with realistic image */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-white backdrop-blur-md border border-white/20 shadow-md">
              <img 
                src={treeInfo.image} 
                alt={treeInfo.label} 
                className="w-4 h-4 rounded-full object-cover border border-white/40" 
              />
              <span>{treeInfo.label.split('(')[0].trim()}</span>
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
              {nursery.statut === 'actif' ? 'En activité' : nursery.statut === 'en_creation' ? 'En création' : 'Saisonnier'}
            </span>
          </div>

          {/* Quick Change Photo Button on Cover */}
          <button
            onClick={() => setShowPhotoPicker(true)}
            className="absolute top-4 right-14 px-2.5 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-white/20 shadow-md"
            title="Modifier ou choisir l'image de cette pépinière"
          >
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span>Changer la photo</span>
          </button>

          {photoSavedToast && (
            <div className="absolute top-14 right-4 z-20 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Photo mise à jour !</span>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-1 text-xs text-emerald-300 font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{nursery.commune} &middot; {nursery.arrondissement} (Zou, Bénin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight">
              {nursery.nom}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Key Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="text-[11px] font-semibold text-emerald-800">Capacité annuelle</div>
              <div className="text-lg font-black text-emerald-950 mt-0.5">
                {nursery.capaciteAnnuelle.toLocaleString()} <span className="text-xs font-normal text-slate-500">plants</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-600">Système d'eau</div>
              <div className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate">{nursery.systemeArrosage || 'Forage'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-slate-600">Coordonnées GPS</div>
              <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                {nursery.latitude.toFixed(4)}, {nursery.longitude.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Présentation du site
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed">
              {nursery.description}
            </p>
          </div>

          {/* Cultivated Species */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Espèces et essences produites</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {nursery.especes.map((esp, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                >
                  🌱 {esp}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Contact & Promoteur
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Promoteur / Responsable :</span>
                <span className="font-bold text-slate-900">{nursery.promoteur}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Téléphone :</span>
                <a
                  href={`tel:${nursery.telephone.replace(/\s+/g, '')}`}
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{nursery.telephone}</span>
                </a>
              </div>
              {nursery.email && (
                <div className="col-span-2">
                  <span className="text-slate-500 block">Email :</span>
                  <a
                    href={`mailto:${nursery.email}`}
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{nursery.email}</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Complete GeoJSON Properties Inspector */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Attributs GeoJSON complets (SIG WGS84)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRawGeojson(!showRawGeojson)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 transition flex items-center gap-1"
                >
                  <Code2 className="w-3 h-3 text-emerald-400" />
                  <span>{showRawGeojson ? 'Voir tableau' : 'Voir JSON brut'}</span>
                </button>

                <button
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copié' : 'Copier JSON'}</span>
                </button>
              </div>
            </div>

            {showRawGeojson ? (
              <pre className="p-3 bg-black/50 text-emerald-300 font-mono text-[10px] rounded-xl overflow-auto max-h-48 border border-white/10">
                {JSON.stringify({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [nursery.longitude, nursery.latitude]
                  },
                  properties: allProperties
                }, null, 2)}
              </pre>
            ) : (
              <div className="max-h-48 overflow-auto rounded-xl border border-white/10 bg-white/5">
                <table className="w-full text-left text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="bg-white/10 text-slate-300 font-bold border-b border-white/10">
                      <th className="py-1.5 px-2.5 w-1/3">Champ GeoJSON</th>
                      <th className="py-1.5 px-2.5">Valeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[10px]">
                    {Object.entries(allProperties).map(([key, val]) => (
                      <tr key={key} className="hover:bg-white/5">
                        <td className="py-1 px-2.5 text-emerald-300 font-semibold">{key}</td>
                        <td className="py-1 px-2.5 text-slate-200 break-words">
                          {Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <button
            onClick={() => setShowPhotoPicker(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-700" />
            <span>Changer l'image</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Fermer
            </button>

            <button
              onClick={() => {
                onViewOnMap(nursery);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Localiser sur la carte interactive &rarr;</span>
            </button>
          </div>
        </div>

      </div>

      {/* PHOTO SELECTION MODAL */}
      {showPhotoPicker && (
        <div 
          className="fixed inset-0 z-600 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowPhotoPicker(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto cursor-default animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  📸
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Sélectionner l'image de la pépinière
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {nursery.nom}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Option 1: Built-in 10 Real Benin Nursery Photos */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                Option 1 : Choisir parmi les 10 photos locales du Bénin
              </label>
              <div className="grid grid-cols-5 gap-2">
                {NURSERY_PHOTOS.map((photo, i) => {
                  const isCurrent = nursery.photoUrl === photo;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectPhoto(photo)}
                      className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition cursor-pointer ${
                        isCurrent ? 'border-emerald-600 ring-2 ring-emerald-500' : 'border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <img 
                        src={photo} 
                        alt={`Photo ${i + 1}`} 
                        onError={(e) => handleImageFallback(e, nursery, i)}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center py-0.5">
                        #{i + 1}
                      </span>
                      {isCurrent && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 2: Upload photo from device */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                Option 2 : Importer depuis votre appareil (PC / Téléphone)
              </label>
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition">
                <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Cliquer pour choisir un fichier photo</span>
                <span className="text-[10px] text-slate-500">JPG, PNG, WebP (enregistré automatiquement)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Option 3: Custom URL or relative path */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                Option 3 : Renseigner une URL d'image en ligne
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  placeholder="https://... ou /assets/pepinieres/mon_image.jpg"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customPhotoInput.trim()) {
                      handleSelectPhoto(customPhotoInput.trim());
                    }
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Appliquer
                </button>
              </div>
            </div>

            {/* Option 4: Modifier l'Icône d'Arbre sur la carte SIG */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Option 4 : Modifier l'Icône d'Arbre sur la carte SIG
                </label>
                <span className="text-[10px] text-emerald-700 font-bold">Actuel : {treeInfo.label.split('(')[0].trim()}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(TREE_CATEGORIES_INFO) as TreeIconCategory[]).map((catKey) => {
                  const cat = TREE_CATEGORIES_INFO[catKey];
                  const isCurrentIcon = (nursery.treeIcon || treeCat) === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => handleSelectTreeIcon(catKey)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
                        isCurrentIcon 
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500' 
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white shadow-xs shrink-0 bg-slate-900">
                        <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-white rounded-full px-0.5 shadow-xs leading-none">
                          {cat.badge}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 leading-tight">
                        {cat.label.split('(')[0].trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      </div>
  );
};
