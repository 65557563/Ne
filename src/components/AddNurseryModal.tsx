import React, { useState } from 'react';
import { Nursery, NurseryType, NurseryStatus, TreeIconCategory } from '../types';
import { COMMUNES_ZOU, ESPECES_COURANTES, NURSERY_PHOTOS } from '../data/nurseryData';
import { TREE_CATEGORIES_INFO, TREE_ECOLE_SVG, TREE_PRIVEE_SVG } from '../utils/markerIcons';
import { LOCAL_NURSERY_PHOTOS, handleImageFallback } from '../utils/imageHelper';
import { 
  X, 
  MapPin, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  FileText, 
  Sparkles, 
  Sprout, 
  Phone, 
  User, 
  Building2 
} from 'lucide-react';

interface AddNurseryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNursery: (nursery: Nursery) => void;
  initialCoords?: { lat: number; lng: number } | null;
}

export const AddNurseryModal: React.FC<AddNurseryModalProps> = ({
  isOpen,
  onClose,
  onAddNursery,
  initialCoords
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'generales' | 'localisation' | 'photos' | 'autres'>('generales');

  const [nom, setNom] = useState('');
  const [type, setType] = useState<NurseryType>('ecole');
  const [commune, setCommune] = useState('Abomey');
  const [arrondissement, setArrondissement] = useState('Vidolè');
  const [promoteur, setPromoteur] = useState('');
  const [telephone, setTelephone] = useState('+229 ');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  
  // Coordinates
  const [latitude, setLatitude] = useState(initialCoords?.lat || 7.1850);
  const [longitude, setLongitude] = useState(initialCoords?.lng || 1.9950);

  // Other infos
  const [capaciteAnnuelle, setCapaciteAnnuelle] = useState(15000);
  const [statut, setStatut] = useState<NurseryStatus>('actif');
  const [systemeArrosage, setSystemeArrosage] = useState('Forage');
  const [selectedEspeces, setSelectedEspeces] = useState<string[]>([
    'Acacia auriculiformis',
    'Teck (Tectona grandis)',
    'Manguier greffé'
  ]);
  const [photoUrl, setPhotoUrl] = useState(LOCAL_NURSERY_PHOTOS[0]);
  const [treeIcon, setTreeIcon] = useState<TreeIconCategory>('ecole');

  const toggleEspece = (espece: string) => {
    if (selectedEspeces.includes(espece)) {
      setSelectedEspeces(selectedEspeces.filter(e => e !== espece));
    } else {
      setSelectedEspeces([...selectedEspeces, espece]);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local object URL or read as base64 data URL so it persists
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotoUrl(String(ev.target.result));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      alert('Veuillez renseigner le nom de la pépinière.');
      return;
    }

    const newNursery: Nursery = {
      id: `pepi-${Date.now()}`,
      nom: nom.trim(),
      type,
      treeIcon,
      commune,
      arrondissement,
      promoteur: promoteur.trim() || 'Non renseigné',
      telephone: telephone.trim(),
      email: email.trim() || undefined,
      description: description.trim() || 'Nouvelle pépinière enregistrée dans le géoportail BENIN-PEPI.',
      capaciteAnnuelle: Number(capaciteAnnuelle) || 5000,
      especes: selectedEspeces.length > 0 ? selectedEspeces : ['Acacia', 'Teck'],
      statut,
      latitude: Number(latitude),
      longitude: Number(longitude),
      photoUrl,
      dateCreation: new Date().toISOString().split('T')[0],
      superficieM2: 1000,
      systemeArrosage
    };

    onAddNursery(newNursery);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-500 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              🌱
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">5. Ajouter une pépinière</h2>
              <p className="text-xs text-slate-500">Enregistrer un nouveau site forestier ou scolaire dans le Zou</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Inspired by Mockup #5 left sidebar) */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('generales')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'generales'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Informations générales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('localisation')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'localisation'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Localisation GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'photos'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photos & Visuel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('autres')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'autres'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Espèces & Capacité</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: INFORMATIONS GÉNÉRALES */}
          {activeTab === 'generales' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-8 space-y-4">
                {/* Nom */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nom de la pépinière <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pépinière de l'ENI Abomey"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                {/* Type de pépinière */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Type de pépinière <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                      type === 'ecole' 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="nurseryType"
                        checked={type === 'ecole'}
                        onChange={() => setType('ecole')}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: TREE_ECOLE_SVG }} />
                      <span className="text-xs sm:text-sm">Pépinière École</span>
                    </label>

                    <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                      type === 'privee' 
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-500' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="nurseryType"
                        checked={type === 'privee'}
                        onChange={() => {
                          setType('privee');
                          if (treeIcon === 'ecole') setTreeIcon('privee');
                        }}
                        className="w-4 h-4 text-amber-500"
                      />
                      <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: TREE_PRIVEE_SVG }} />
                      <span className="text-xs sm:text-sm">Pépinière Privée</span>
                    </label>
                  </div>
                </div>

                {/* Icône d'arbre sur la carte */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">
                      Icône d'Arbre sur la carte SIG
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold">8 modèles disponibles</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(TREE_CATEGORIES_INFO) as TreeIconCategory[]).map((catKey) => {
                      const cat = TREE_CATEGORIES_INFO[catKey];
                      const isSelected = treeIcon === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setTreeIcon(catKey)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition text-center cursor-pointer ${
                            isSelected 
                              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500' 
                              : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                        >
                          <div 
                            className="w-6 h-6 flex items-center justify-center shrink-0"
                            dangerouslySetInnerHTML={{ __html: cat.svg }}
                          />
                          <span className="text-[10px] font-bold text-slate-800 leading-tight">
                            {cat.label.split('(')[0].trim()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Commune & Arrondissement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Commune <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                    >
                      {COMMUNES_ZOU.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Arrondissement <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Vidolè, Djègbé, Bohicon 1..."
                      value={arrondissement}
                      onChange={(e) => setArrondissement(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Promoteur & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Promoteur / Responsable
                    </label>
                    <input
                      type="text"
                      placeholder="Nom du responsable ou club"
                      value={promoteur}
                      onChange={(e) => setPromoteur(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Téléphone de contact
                    </label>
                    <input
                      type="tel"
                      placeholder="+229 97 00 00 00"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Description & activités
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Objectifs de la pépinière, plants disponibles, conditions d'approvisionnement..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

              </div>

              {/* Right preview column (as shown in Mockup #5) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Icône de la pépinière */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    Icône attribuée sur la carte :
                  </span>
                  <div className="flex items-center justify-around py-2">
                    <div className={`p-3 rounded-xl flex flex-col items-center gap-1.5 ${type === 'ecole' ? 'bg-emerald-100 ring-2 ring-emerald-600' : 'opacity-40'}`}>
                      <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: TREE_ECOLE_SVG }} />
                      <span className="text-[11px] font-bold text-emerald-900">École</span>
                    </div>

                    <div className={`p-3 rounded-xl flex flex-col items-center gap-1.5 ${type === 'privee' ? 'bg-amber-100 ring-2 ring-amber-500' : 'opacity-40'}`}>
                      <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: TREE_PRIVEE_SVG }} />
                      <span className="text-[11px] font-bold text-amber-950">Privée</span>
                    </div>
                  </div>
                </div>

                {/* Visual Thumbnail */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Aperçu de la photo :
                  </span>
                  <div className="h-32 rounded-xl overflow-hidden bg-slate-200">
                    <img
                      src={photoUrl}
                      alt="Prévisualisation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('photos')}
                    className="text-xs font-semibold text-emerald-700 hover:underline block text-center w-full"
                  >
                    Changer la photo &rarr;
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LOCALISATION GPS */}
          {activeTab === 'localisation' && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Position géographique (Système WGS84)</strong>
                  <p className="mt-0.5 text-emerald-800">
                    Vous pouvez ajuster les coordonnées manuellement ou cliquer directement sur la carte interactive du géoportail pour pré-remplir ces valeurs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Latitude (Nord)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Zou / Abomey ~ 7.15 à 7.30</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Longitude (Est)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Zou / Abomey ~ 1.95 à 2.25</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Quick center on Abomey town hall
                    setLatitude(7.1845);
                    setLongitude(1.9912);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Positionner au centre d'Abomey (Détokpo / Vidolè)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTOS & VISUELS */}
          {activeTab === 'photos' && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div className="text-xs text-slate-600">
                Vous pouvez sélectionner une photo depuis votre appareil ou renseigner un chemin dans <code className="bg-slate-100 text-emerald-800 px-1 py-0.5 rounded font-mono">/public/assets/pepinieres/</code>.
              </div>

              {/* Built-in Bénin Photos Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Sélectionner parmi les photos réelles de pépinières du Bénin :
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {NURSERY_PHOTOS.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(photo)}
                      className={`group relative rounded-xl overflow-hidden aspect-4/3 border-2 transition cursor-pointer ${
                        photoUrl === photo ? 'border-emerald-600 ring-2 ring-emerald-500' : 'border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center py-0.5">
                        #{idx + 1}
                      </span>
                      {photoUrl === photo && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Drag & Drop Box (as shown in Mockup #5) */}
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 hover:bg-emerald-50/40 transition">
                <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Ou importer une photo depuis votre appareil</span>
                <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ou URL / Chemin relatif de l'image
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="/assets/pepinieres/photo.jpg ou https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {photoUrl && (
                <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <img src={photoUrl} alt="Aperçu" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUTRES INFORMATIONS & ESPÈCES */}
          {activeTab === 'autres' && (
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Capacité annuelle (Nombre de plants / an)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={capaciteAnnuelle}
                    onChange={(e) => setCapaciteAnnuelle(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Système d'arrosage
                  </label>
                  <select
                    value={systemeArrosage}
                    onChange={(e) => setSystemeArrosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="Forage">Forage (solaire ou électrique)</option>
                    <option value="Puits tubé / motopompe">Puits tubé / motopompe</option>
                    <option value="Goutte-à-goutte">Goutte-à-goutte</option>
                    <option value="Manuel (arrosage traditionnel)">Manuel (arrosage traditionnel)</option>
                    <option value="Retenue collinaire / fleuve">Retenue collinaire / fleuve</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Statut de la pépinière
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'actif' as NurseryStatus, label: 'Actif', desc: 'En pleine production' },
                    { id: 'en_creation' as NurseryStatus, label: 'En création', desc: 'Projet en cours' },
                    { id: 'saisonnier' as NurseryStatus, label: 'Saisonnier', desc: 'Période de semis' }
                  ].map((s) => (
                    <label
                      key={s.id}
                      className={`p-3 rounded-xl border cursor-pointer text-center transition ${
                        statut === s.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="statutSelect"
                        checked={statut === s.id}
                        onChange={() => setStatut(s.id)}
                        className="hidden"
                      />
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[10px] text-slate-500">{s.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sélection des espèces produites */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Espèces d'arbres produites (sélectionnez toutes les espèces cultivées) :
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  {ESPECES_COURANTES.map((espece) => {
                    const isSelected = selectedEspeces.includes(espece);
                    return (
                      <button
                        key={espece}
                        type="button"
                        onClick={() => toggleEspece(espece)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{espece}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              id="modal-btn-submit-nursery"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-md transition hover:scale-101 active:scale-98"
            >
              Enregistrer la pépinière
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
