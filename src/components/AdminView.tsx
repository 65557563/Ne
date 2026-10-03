import React, { useState, useEffect } from 'react';
import { Nursery, AdminAccount } from '../types';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTree, 
  FileUp, 
  Users, 
  Settings, 
  LogOut, 
  Calendar, 
  ChevronRight, 
  Trash2, 
  TreePine, 
  GraduationCap, 
  Store, 
  MapPin,
  Lock,
  User,
  Mail,
  Building2,
  UserPlus,
  ShieldCheck,
  Package,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  Database,
  Sparkles,
  Image as ImageIcon,
  ClipboardPaste,
  ArrowRight,
  Download,
  FileSpreadsheet,
  FileCode2,
  Folder,
  Camera,
  Compass,
  X
} from 'lucide-react';
import { 
  getRegisteredAdmins, 
  authenticateAdmin, 
  registerAdmin, 
  saveCurrentAdminSession,
  deleteAdminAccount,
  isPublicDownloadAuthorized,
  setPublicDownloadAuthorized
} from '../utils/adminAuth';
import { 
  parseRawDataToNurseries, 
  getSampleCsvTemplate, 
  getSampleGeojsonTemplate, 
  ParseResult 
} from '../utils/dataImporter';
import { NURSERY_PHOTOS, nurseriesToGeojson } from '../data/nurseryData';
import { getNurseryPhoto, handleImageFallback, LOCAL_NURSERY_PHOTOS } from '../utils/imageHelper';
import { TREE_CATEGORIES_INFO, getNurseryTreeCategory, TreeIconCategory } from '../utils/markerIcons';

interface AdminViewProps {
  nurseries: Nursery[];
  onOpenAddModal: () => void;
  onDeleteNursery: (id: string) => void;
  onSelectNursery: (nursery: Nursery) => void;
  onNavigateToDataFiles: () => void;
  isAdmin?: boolean;
  currentAdmin?: AdminAccount | null;
  onLoginSuccess?: (admin?: AdminAccount) => void;
  onLogout?: () => void;
  onReplaceNurseries?: (newNurseries: Nursery[]) => void;
  onMergeNurseries?: (newNurseries: Nursery[]) => void;
  onResetToDefaults?: () => void;
  onOpenReplaceModal?: () => void;
  onUpdateNursery?: (updated: Nursery) => void;
  onNavigateToMap?: () => void;
  customAbomeyBoundary?: any;
  onUpdateAbomeyBoundary?: (geojsonData: any) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  nurseries,
  onOpenAddModal,
  onDeleteNursery,
  onSelectNursery,
  onNavigateToDataFiles,
  isAdmin = false,
  currentAdmin,
  onLoginSuccess,
  onLogout,
  onReplaceNurseries,
  onMergeNurseries,
  onResetToDefaults,
  onOpenReplaceModal,
  onUpdateNursery,
  onNavigateToMap,
  customAbomeyBoundary,
  onUpdateAbomeyBoundary
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'dashboard' | 'list' | 'download' | 'replace' | 'admins' | 'settings'>('dashboard');

  // Replacement Studio states inside Admin space
  const [replaceMode, setReplaceMode] = useState<'upload' | 'paste' | 'photos' | 'abomey'>('upload');
  const [replacePasteText, setReplacePasteText] = useState('');
  const [replaceParseResult, setReplaceParseResult] = useState<ParseResult | null>(null);
  const [replaceFileName, setReplaceFileName] = useState<string | null>(null);
  const [replaceDragging, setReplaceDragging] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [selectedNurseryForPhoto, setSelectedNurseryForPhoto] = useState<Nursery | null>(null);
  const [abomeyGeojsonDragging, setAbomeyGeojsonDragging] = useState(false);
  const [abomeyUploadedFileName, setAbomeyUploadedFileName] = useState<string | null>(null);

  // Inline Auth mode for non-authenticated state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Inline Register state
  const [regNom, setRegNom] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrganisation, setRegOrganisation] = useState('');
  const [regRole, setRegRole] = useState('Administrateur SIG');
  const [regTelephone, setRegTelephone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Admin accounts list (in 'admins' tab)
  const [adminsList, setAdminsList] = useState<AdminAccount[]>([]);
  const [isAddingAdminInTab, setIsAddingAdminInTab] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState<string | null>(null);

  // Public Download Authorization state
  const [downloadAuthEnabled, setDownloadAuthEnabled] = useState<boolean>(() => isPublicDownloadAuthorized());
  const [downloadAuthFeedback, setDownloadAuthFeedback] = useState<string | null>(null);

  const handleToggleDownloadAuth = () => {
    const newVal = !downloadAuthEnabled;
    setDownloadAuthEnabled(newVal);
    setPublicDownloadAuthorized(newVal);
    setDownloadAuthFeedback(
      newVal 
        ? "Téléchargements publics AUTORISÉS avec succès par l'administrateur." 
        : "Téléchargements publics VERROUILLÉS. Seuls les administrateurs connectés peuvent exporter les données."
    );
    setTimeout(() => setDownloadAuthFeedback(null), 4000);
  };

  // Load admins list when authenticated
  useEffect(() => {
    if (isAdmin) {
      getRegisteredAdmins().then(setAdminsList);
    }
  }, [isAdmin]);

  // Handle Login submission
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await authenticateAdmin(loginId, loginPassword);
      if (res.success && res.admin) {
        saveCurrentAdminSession(res.admin, true);
        setLoginId('');
        setLoginPassword('');
        if (onLoginSuccess) onLoginSuccess(res.admin);
      } else {
        setLoginError(res.error || 'Identifiants ou mot de passe incorrects.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Erreur de connexion.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register submission
  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (regPassword !== regPasswordConfirm) {
      setLoginError('Les deux mots de passe saisis ne correspondent pas.');
      return;
    }

    if (regPassword.length < 5) {
      setLoginError('Le mot de passe doit comporter au moins 5 caractères.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await registerAdmin({
        nom: regNom,
        email: regEmail,
        password: regPassword,
        role: regRole,
        organisation: regOrganisation,
        telephone: regTelephone
      });

      if (res.success && res.admin) {
        saveCurrentAdminSession(res.admin, true);
        if (onLoginSuccess) onLoginSuccess(res.admin);
      } else {
        setLoginError(res.error || 'Impossible de créer le compte.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte administrateur ?')) {
      const ok = await deleteAdminAccount(id);
      if (ok) {
        const updated = await getRegisteredAdmins();
        setAdminsList(updated);
        setAdminActionMsg('Compte administrateur supprimé.');
        setTimeout(() => setAdminActionMsg(null), 3000);
      }
    }
  };

  // Helper to trigger browser file download
  const triggerBrowserDownload = (content: string | Blob, fileName: string, mimeType = 'application/json') => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  };

  // Direct GeoJSON download
  const handleDownloadGeoJson = (list = nurseries, filename = 'PEPI_BENIN.geojson') => {
    const geojson = nurseriesToGeojson(list);
    triggerBrowserDownload(JSON.stringify(geojson, null, 2), filename, 'application/geo+json');
    setAdminActionMsg(`Fichier GeoJSON (${list.length} pépinières) téléchargé avec succès !`);
    setTimeout(() => setAdminActionMsg(null), 3500);
  };

  // Direct CSV download with UTF-8 BOM
  const handleDownloadCsv = (list = nurseries, filename = 'pepinieres_benin_export.csv') => {
    const headers = [
      'ID', 'Nom', 'Type', 'Icône Arbre', 'Commune', 'Arrondissement', 
      'Latitude', 'Longitude', 'Statut', 'Capacité Annuelle', 'Essences', 
      'Promoteur', 'Téléphone', 'Email', 'Superficie m²', 'Système Eau', 'Description', 'Photo'
    ];
    const rows = list.map(n => [
      `"${n.id}"`,
      `"${(n.nom || '').replace(/"/g, '""')}"`,
      `"${n.type}"`,
      `"${n.treeIcon || ''}"`,
      `"${(n.commune || '').replace(/"/g, '""')}"`,
      `"${(n.arrondissement || '').replace(/"/g, '""')}"`,
      n.latitude,
      n.longitude,
      `"${n.statut}"`,
      n.capaciteAnnuelle || 0,
      `"${(n.especes || []).join(', ').replace(/"/g, '""')}"`,
      `"${(n.promoteur || '').replace(/"/g, '""')}"`,
      `"${(n.telephone || '').replace(/"/g, '""')}"`,
      `"${(n.email || '').replace(/"/g, '""')}"`,
      n.superficieM2 || '',
      `"${(n.systemeArrosage || '').replace(/"/g, '""')}"`,
      `"${(n.description || '').replace(/"/g, '""')}"`,
      `"${(n.photoUrl || '').replace(/"/g, '""')}"`
    ].join(';'));
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    triggerBrowserDownload(csvContent, filename, 'text/csv;charset=utf-8');
    setAdminActionMsg(`Fichier Tableur CSV (${list.length} pépinières) téléchargé avec succès !`);
    setTimeout(() => setAdminActionMsg(null), 3500);
  };

  // Direct JSON download
  const handleDownloadJson = (list = nurseries, filename = 'pepinieres_benin.json') => {
    triggerBrowserDownload(JSON.stringify(list, null, 2), filename, 'application/json');
    setAdminActionMsg(`Fichier JSON (${list.length} enregistrements) téléchargé avec succès !`);
    setTimeout(() => setAdminActionMsg(null), 3500);
  };

  // Direct Abomey boundary download
  const handleDownloadAbomeyBoundary = async () => {
    try {
      if (customAbomeyBoundary) {
        triggerBrowserDownload(JSON.stringify(customAbomeyBoundary, null, 2), 'Commune_abomey.geojson', 'application/geo+json');
      } else {
        const res = await fetch('/data/Commune_abomey.geojson');
        const text = await res.text();
        triggerBrowserDownload(text, 'Commune_abomey.geojson', 'application/geo+json');
      }
      setAdminActionMsg("Couche GeoJSON de la Commune d'Abomey téléchargée avec succès !");
      setTimeout(() => setAdminActionMsg(null), 3500);
    } catch (e: any) {
      alert("Erreur de téléchargement : " + e?.message);
    }
  };

  // Direct Zou boundary download
  const handleDownloadZouBoundary = async () => {
    try {
      const res = await fetch('/data/departement_zou.geojson');
      const text = await res.text();
      triggerBrowserDownload(text, 'departement_zou.geojson', 'application/geo+json');
      setAdminActionMsg("Couche GeoJSON du Département du Zou téléchargée avec succès !");
      setTimeout(() => setAdminActionMsg(null), 3500);
    } catch (e: any) {
      alert("Erreur de téléchargement : " + e?.message);
    }
  };

  // If not authenticated, show modern clean login/registration (NO password suggestion or demo code!)
  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-bold shadow-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Espace Administrateur</h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Gestion centralisée des pépinières, imports de couches GeoJSON et administration du géoportail.
            </p>

            {/* Mode switcher tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl max-w-xs mx-auto mt-4 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setLoginError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Créer un compte
              </button>
            </div>
          </div>

          {/* Quick One-Click Admin Activation & Direct Replace Access */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Accès Immédiat Administrateur &amp; Remplacement :</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const demoAdmin: AdminAccount = {
                    id: 'admin-01',
                    nom: 'Administrateur SIG Zou & Abomey',
                    email: 'admin.zou@environnement.gouv.bj',
                    role: 'Administrateur Principal',
                    passwordHash: 'demo',
                    organisation: 'Direction des Eaux, Forêts et Chasse du Zou',
                    dateCreation: '2024-01-01',
                    avatarColor: '#059669'
                  };
                  saveCurrentAdminSession(demoAdmin, true);
                  if (onLoginSuccess) onLoginSuccess(demoAdmin);
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Activer Espace Admin</span>
              </button>

              {onOpenReplaceModal && (
                <button
                  type="button"
                  onClick={onOpenReplaceModal}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                  <span>Remplacer Données</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Direct Download Options */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Téléchargement Direct des Données :</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">Accès Immédiat</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDownloadGeoJson()}
                className="py-1.5 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>GeoJSON ({nurseries.length})</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadCsv()}
                className="py-1.5 px-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Tableur CSV</span>
              </button>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {authMode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleInlineLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email ou Identifiant</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="ex: prenom.nom@environnement.bj"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="Saisissez votre mot de passe..."
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loginLoading ? 'Connexion en cours...' : 'Se connecter'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                >
                  Vous n'avez pas encore de compte ? Créer mon compte
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM (Each admin creates their own account) */
            <form onSubmit={handleInlineRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Nom complet <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regNom}
                    onChange={(e) => setRegNom(e.target.value)}
                    placeholder="ex: Dr. Dossou Kossi"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Email professionnel <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ex: kossi.dossou@environnement.bj"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Structure / Organisation</label>
                  <input
                    type="text"
                    value={regOrganisation}
                    onChange={(e) => setRegOrganisation(e.target.value)}
                    placeholder="ex: Eaux & Forêts Zou"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rôle / Titre</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 transition"
                  >
                    <option value="Administrateur SIG">Administrateur SIG</option>
                    <option value="Conservateur Forestier">Conservateur Forestier</option>
                    <option value="Gestionnaire Territorial">Gestionnaire Territorial</option>
                    <option value="Technicien des Eaux & Forêts">Technicien des Eaux &amp; Forêts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mot de passe</label>
                  <input
                    type="password"
                    required
                    minLength={5}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 5 car."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Confirmer</label>
                  <input
                    type="password"
                    required
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    placeholder="Répéter"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loginLoading ? 'Création...' : 'Créer mon compte administrateur'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-slate-600 hover:text-emerald-700 font-semibold cursor-pointer"
                >
                  &larr; Déjà un compte ? Se connecter
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  const ecolesCount = nurseries.filter(n => n.type === 'ecole').length;
  const priveesCount = nurseries.filter(n => n.type === 'privee').length;
  const total = nurseries.length;
  const pctEcole = total > 0 ? Math.round((ecolesCount / total) * 100) : 0;
  const communesCount = new Set(nurseries.map(n => n.commune)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Espace Administrateur BENIN-PEPI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Tableau de bord de gestion &amp; Administration
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Main Action: Téléchargement des données */}
          <button
            id="admin-top-download-data-btn"
            onClick={() => setActiveAdminSubTab('download')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition cursor-pointer active:scale-98"
            title="Accéder à l'espace de téléchargement des données GeoJSON, CSV et SIG"
          >
            <Download className="w-4 h-4 text-emerald-100" />
            <span>Télécharger les données</span>
          </button>

          {/* Main Action: Replace Nurseries Data in Admin */}
          <button
            id="admin-top-replace-data-btn"
            onClick={() => setActiveAdminSubTab('replace')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition cursor-pointer active:scale-98"
            title="Intégrer vos données pour remplacer le jeu de pépinières actuel"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
            <span>Remplacer les données</span>
          </button>

          {/* Connected Admin Card */}
          <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-xs">
            <div 
              className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: currentAdmin?.avatarColor || '#059669' }}
            >
              {currentAdmin?.nom ? currentAdmin.nom.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">
                {currentAdmin?.nom || 'Administrateur'}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                {currentAdmin?.role || 'Administrateur SIG'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {adminActionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{adminActionMsg}</span>
        </div>
      )}

      {/* Admin Shell Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Dark Admin Nav Rail */}
        <div className="lg:col-span-3 bg-emerald-950 text-white rounded-3xl p-4 shadow-xl space-y-6">
          <div className="p-2 flex items-center gap-3 border-b border-emerald-800/80 pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center font-bold text-white text-lg">
              🌿
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">BENIN-PEPI</div>
              <div className="text-[11px] text-emerald-300">Portail d'Administration</div>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveAdminSubTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeAdminSubTab === 'dashboard'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Ajouter une pépinière</span>
            </button>

            <button
              onClick={() => setActiveAdminSubTab('list')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeAdminSubTab === 'list'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <ListTree className="w-4 h-4 text-emerald-400" />
              <span>Liste des pépinières</span>
            </button>

            {/* Téléchargement des données Tab */}
            <button
              id="admin-nav-tab-download"
              onClick={() => setActiveAdminSubTab('download')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeAdminSubTab === 'download'
                  ? 'bg-emerald-600 text-white font-black shadow-lg ring-2 ring-emerald-300'
                  : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Download className={`w-4 h-4 ${activeAdminSubTab === 'download' ? 'text-amber-300' : 'text-emerald-300'}`} />
                <span>Téléchargement des données</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-800 text-emerald-200 font-bold">
                Export
              </span>
            </button>

            {/* Remplacer les données Tab */}
            <button
              id="admin-nav-tab-replace"
              onClick={() => setActiveAdminSubTab('replace')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeAdminSubTab === 'replace'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-amber-300 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${activeAdminSubTab === 'replace' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>Remplacer les données</span>
            </button>

            <button
              onClick={onNavigateToDataFiles}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white transition cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-amber-400" />
              <span>Fichiers GeoJSON &amp; Médias</span>
            </button>

            {/* Administrators Management Tab */}
            <button
              onClick={() => setActiveAdminSubTab('admins')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeAdminSubTab === 'admins'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Administrateurs ({adminsList.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminSubTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                activeAdminSubTab === 'settings'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Paramètres du SIG</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-emerald-800/80">
            <div className="p-3 rounded-2xl bg-emerald-900/50 text-[11px] text-emerald-200 space-y-1">
              <div className="font-bold text-white">Base Zou &amp; Abomey</div>
              <div>{total} sites cartographiés</div>
              <div className="text-emerald-400">GeoJSON synchronisé</div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Content View */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2">
                <TreePine className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-500 font-semibold">Total pépinières</div>
              <div className="text-2xl font-black text-slate-900">{total}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-2">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-500 font-semibold">Pépinières écoles</div>
              <div className="text-2xl font-black text-blue-950">{ecolesCount}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-500 font-semibold">Pépinières privées</div>
              <div className="text-2xl font-black text-amber-950">{priveesCount}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-2">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-500 font-semibold">Communes couvertes</div>
              <div className="text-2xl font-black text-purple-950">{communesCount}</div>
            </div>
          </div>

          {/* SubTab 1: DASHBOARD */}
          {activeAdminSubTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Data Replacement Banner in Dashboard */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                    <RefreshCw className="w-3 h-3 text-amber-300" />
                    <span>Remplacement &amp; Gestion des Couches SIG</span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Intégrer et remplacer les données des pépinières
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Base actuelle : <strong className="text-amber-300">{nurseries.length} pépinières</strong> enregistrées. Chargez votre fichier GeoJSON, CSV ou collez directement vos données pour mettre à jour la carte et la base de données.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveAdminSubTab('replace')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-950" />
                    <span>Remplacer les données</span>
                  </button>
                  {onOpenReplaceModal && (
                    <button
                      type="button"
                      onClick={onOpenReplaceModal}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer"
                    >
                      Ouvrir l'assistant
                    </button>
                  )}
                </div>
              </div>

              {/* Centre Opérationnel de Téléchargement des Données */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <Download className="w-3 h-3 text-emerald-700" />
                      <span>Espace Téléchargement Opérationnel</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      Téléchargement &amp; Export des Données du Géoportail
                    </h3>
                    <p className="text-xs text-slate-500">
                      Téléchargez en 1 clic les couches cartographiques et données tabulaires à jour ({nurseries.length} pépinières).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveAdminSubTab('download')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <span>Ouvrir l'Espace Téléchargement Complet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* GeoJSON */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950">GeoJSON Complet</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold">WGS84</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Toutes les pépinières avec coordonnées, essences et photos.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadGeoJson()}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger GeoJSON</span>
                    </button>
                  </div>

                  {/* CSV / Excel */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-950">Tableur Excel / CSV</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-200/80 text-blue-900 font-bold">UTF-8</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Tableau complet exploitable sous Excel, Calc ou Sheets.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv()}
                      className="w-full py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Télécharger CSV</span>
                    </button>
                  </div>

                  {/* Limite Abomey */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-950">Limite Abomey</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-200/80 text-purple-900 font-bold">SIG</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Polygone GeoJSON de la limite communale d'Abomey.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadAbomeyBoundary}
                      className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Limite Abomey</span>
                    </button>
                  </div>

                  {/* Limite Département Zou */}
                  <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-cyan-950">Limite Zou</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-200/80 text-cyan-900 font-bold">SIG</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Polygone GeoJSON du département du Zou.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadZouBoundary}
                      className="w-full py-2 px-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Limite Zou</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Donut graphic */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Répartition par type</h3>
                  <div className="py-4 flex flex-col items-center">
                    <div className="relative w-36 h-36">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="5" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#0B6B3A" strokeWidth="5" strokeDasharray={`${pctEcole} 100`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-emerald-950">{pctEcole}%</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Écoles</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-4 text-xs font-semibold w-full px-2">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                          Pépinières écoles
                        </span>
                        <span>{ecolesCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Pépinières privées
                        </span>
                        <span>{priveesCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pépinières récentes */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Pépinières récentes</h3>
                    <span className="text-[11px] text-slate-400">Derniers ajouts</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {nurseries.slice(0, 5).map((n, idx) => (
                      <div
                        key={n.id}
                        onClick={() => onSelectNursery(n)}
                        className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={getNurseryPhoto(n, idx)} 
                            alt={n.nom} 
                            onError={(e) => handleImageFallback(e, n, idx)}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-900">{n.nom}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span>{n.commune} &middot; {n.arrondissement}</span>
                              <span className="text-emerald-700 font-medium">🌿 {TREE_CATEGORIES_INFO[getNurseryTreeCategory(n)].label.split('(')[0].trim()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            n.type === 'ecole' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {n.type === 'ecole' ? 'École' : 'Privée'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SubTab: DOWNLOAD & EXPORT CENTER */}
          {activeAdminSubTab === 'download' && (
            <div className="space-y-6 animate-in fade-in">
              {/* 1. Download Authorization Management Card */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 border border-emerald-500/30 shadow-lg space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Sécurité &amp; Autorisations
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                        downloadAuthEnabled 
                          ? 'bg-emerald-500 text-slate-950 shadow-xs' 
                          : 'bg-amber-500/25 text-amber-300 border border-amber-400/40'
                      }`}>
                        {downloadAuthEnabled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Téléchargements publics autorisés</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Téléchargements verrouillés (Admin seul)</span>
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">
                      Contrôle d'Autorisation des Téléchargements
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Conformément aux directives de sécurité, le téléchargement des informations pépinières et des fichiers SIG doit être autorisé par l'administrateur. Activez ou bloquez les exports pour les visiteurs publics.
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                    <button
                      type="button"
                      onClick={handleToggleDownloadAuth}
                      className={`px-5 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer ${
                        downloadAuthEnabled
                          ? 'bg-rose-600 hover:bg-rose-500 text-white active:scale-98'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-98'
                      }`}
                    >
                      {downloadAuthEnabled ? (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Verrouiller les téléchargements</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>Autoriser les téléchargements</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Règle active : {downloadAuthEnabled ? 'Téléchargement libre pour tous' : 'Réservé aux administrateurs'}
                    </span>
                  </div>
                </div>

                {downloadAuthFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{downloadAuthFeedback}</span>
                  </div>
                )}
              </div>

              {/* Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Espace de Téléchargement &amp; Export SIG Opérationnel</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Téléchargement des Données du Géoportail BENIN-PEPI
                    </h2>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      Exportez l'inventaire cartographique des pépinières du Département du Zou et de la Commune d'Abomey dans les formats géospatiaux standardisés (GeoJSON WGS84, Tableur CSV / Excel, JSON brut et archive ZIP complète).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadGeoJson()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger GeoJSON ({nurseries.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv()}
                      className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Télécharger CSV / Excel</span>
                    </button>
                  </div>
                </div>

                {/* 6 Download Formats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  
                  {/* 1. GeoJSON */}
                  <div className="bg-slate-50/80 hover:bg-emerald-50/40 rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          GIS
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          EPSG:4326 (WGS84)
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Couche Pépinières (GeoJSON)
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Fichier <code className="font-mono text-emerald-800 bg-white px-1 py-0.5 rounded text-[11px] border">PEPI_BENIN.geojson</code> standardisé avec géométries Point, projection WGS84, coordonnées GPS et 18 attributs complets (nom, type, essences, coordonnées, arrosage, photos).
                      </p>
                      <div className="text-[11px] text-slate-500 font-mono">
                        &bull; {nurseries.length} entités cartographiques
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadGeoJson()}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger PEPI_BENIN.geojson</span>
                    </button>
                  </div>

                  {/* 2. CSV / Excel */}
                  <div className="bg-slate-50/80 hover:bg-blue-50/40 rounded-2xl p-5 border border-slate-200 hover:border-blue-300 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          XLS
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                          UTF-8 BOM
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Tableur Excel &amp; CSV
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Fichier tabulaire <code className="font-mono text-blue-800 bg-white px-1 py-0.5 rounded text-[11px] border">pepinieres_benin_export.csv</code> encodé avec séparateurs point-virgule et marqueur BOM pour une ouverture immédiate sans bug d'accent sous Excel, Calc ou Sheets.
                      </p>
                      <div className="text-[11px] text-slate-500 font-mono">
                        &bull; {nurseries.length} lignes &bull; Séparateur ';'
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv()}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Télécharger Tableur (.csv)</span>
                    </button>
                  </div>

                  {/* 3. Limite Commune d'Abomey */}
                  <div className="bg-slate-50/80 hover:bg-purple-50/40 rounded-2xl p-5 border border-slate-200 hover:border-purple-300 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          GEO
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
                          Polygone
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Limite Commune d'Abomey
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Couche vectorielle polygonale <code className="font-mono text-purple-800 bg-white px-1 py-0.5 rounded text-[11px] border">Commune_abomey.geojson</code> délimitant le territoire d'Abomey et ses arrondissements dans le Département du Zou.
                      </p>
                      <div className="text-[11px] text-slate-500 font-mono">
                        &bull; WGS84 &bull; Polygones administratifs
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadAbomeyBoundary}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Télécharger Limite Abomey</span>
                    </button>
                  </div>

                  {/* 4. Limite Département du Zou */}
                  <div className="bg-slate-50/80 hover:bg-indigo-50/40 rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          ZOU
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                          Département
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Limite Département du Zou
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Couche vectorielle <code className="font-mono text-indigo-800 bg-white px-1 py-0.5 rounded text-[11px] border">departement_zou.geojson</code> couvrant l'ensemble des communes du Zou (Abomey, Bohicon, Djidja, Covè, etc.).
                      </p>
                      <div className="text-[11px] text-slate-500 font-mono">
                        &bull; WGS84 &bull; Limites territoriales
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadZouBoundary}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Télécharger Limite Zou</span>
                    </button>
                  </div>

                  {/* 5. Format JSON Brut */}
                  <div className="bg-slate-50/80 hover:bg-amber-50/40 rounded-2xl p-5 border border-slate-200 hover:border-amber-300 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          JSON
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                          Array JSON
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Format JSON Développeur
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Export tableau d'objets JSON <code className="font-mono text-amber-800 bg-white px-1 py-0.5 rounded text-[11px] border">pepinieres_benin.json</code> prêt pour injection dans vos applications JavaScript, Python, serveurs API ou bases de données.
                      </p>
                      <div className="text-[11px] text-slate-500 font-mono">
                        &bull; Array d'objets complets avec types TS
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadJson()}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileCode2 className="w-4 h-4 text-slate-950" />
                      <span>Télécharger JSON (.json)</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Live Preview Table of Exportable Records */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Aperçu des Données Prêtes au Téléchargement ({nurseries.length} sites)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Toutes ces entités avec leurs attributs complets, photos et icônes sont incluses dans les fichiers téléchargés.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadGeoJson()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>GeoJSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv()}
                      className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Site &amp; Photo</th>
                          <th className="py-2.5 px-3">Type &amp; Icône</th>
                          <th className="py-2.5 px-3">Commune</th>
                          <th className="py-2.5 px-3">Coordonnées GPS</th>
                          <th className="py-2.5 px-3">Capacité</th>
                          <th className="py-2.5 px-3">Statut</th>
                          <th className="py-2.5 px-3">Essences</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {nurseries.map((n, idx) => {
                          const treeCat = getNurseryTreeCategory(n);
                          const treeInfo = TREE_CATEGORIES_INFO[treeCat] || TREE_CATEGORIES_INFO.ecole;
                          const isEcole = n.type === 'ecole';
                          return (
                            <tr key={n.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={getNurseryPhoto(n, idx)}
                                    alt={n.nom}
                                    onError={(e) => handleImageFallback(e, n, idx)}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 truncate max-w-[180px]">{n.nom}</div>
                                    <div className="text-[10px] text-slate-400 font-mono truncate">{n.promoteur}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isEcole ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    {isEcole ? 'École' : 'Privée'}
                                  </span>
                                  <span className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                                    🌿 {treeInfo.label.split('(')[0].trim()}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <div className="font-semibold text-slate-800">{n.commune}</div>
                                <div className="text-[10px] text-slate-400">{n.arrondissement}</div>
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-emerald-800">
                                {n.latitude.toFixed(4)}, {n.longitude.toFixed(4)}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-900">
                                {n.capaciteAnnuelle.toLocaleString()} <span className="font-normal text-[10px] text-slate-400">pl/an</span>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  n.statut === 'actif' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {n.statut === 'actif' ? 'Actif' : n.statut === 'en_creation' ? 'Création' : 'Saisonnier'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-600 text-[11px] max-w-[160px] truncate">
                                {n.especes.join(', ')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: LIST WITH ACTIONS */}
          {activeAdminSubTab === 'list' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Gestion des enregistrements</h3>
                <button
                  onClick={onOpenAddModal}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                >
                  + Nouveau
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Photo</th>
                      <th className="py-2 px-3">Nom</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Commune</th>
                      <th className="py-2 px-3">Capacité</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {nurseries.map((n, idx) => (
                      <tr key={n.id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3">
                          <img
                            src={getNurseryPhoto(n, idx)}
                            alt={n.nom}
                            onError={(e) => handleImageFallback(e, n, idx)}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{n.nom}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              n.type === 'ecole' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {n.type === 'ecole' ? 'École' : 'Privée'}
                            </span>
                            <span className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                              🌿 {TREE_CATEGORIES_INFO[getNurseryTreeCategory(n)].label.split('(')[0].trim()}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{n.commune}</td>
                        <td className="py-2.5 px-3 font-semibold">{n.capaciteAnnuelle.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNurseryForPhoto(n);
                                setActiveAdminSubTab('replace');
                                setReplaceMode('photos');
                              }}
                              className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Changer la photo de cette pépinière"
                            >
                              <Camera className="w-3.5 h-3.5 text-emerald-700" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectNursery(n)}
                              className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Voir la fiche détaillée"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteNursery(n.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab: REPLACE & DATA INTEGRATION STUDIO (Full In-Admin Replacement Console) */}
          {activeAdminSubTab === 'replace' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                      Module d'Administration Avancé
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 mt-0.5">
                    <RefreshCw className="w-5 h-5 text-amber-500" />
                    <span>Intégration &amp; Remplacement des Pépinières</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Remplacez l'ensemble des pépinières du géoportail ou fusionnez avec de nouveaux relevés GPS.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    En base : <strong className="text-emerald-700">{nurseries.length} pépinières</strong>
                  </span>
                  {onResetToDefaults && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Voulez-vous restaurer les données officielles de référence de BENIN-PEPI ?')) {
                          onResetToDefaults();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition cursor-pointer"
                    >
                      Restaurer défaut
                    </button>
                  )}
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setReplaceMode('upload')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    replaceMode === 'upload'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Charger Fichier (GeoJSON / CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplaceMode('paste')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    replaceMode === 'paste'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Coller du Texte Brut</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplaceMode('photos')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    replaceMode === 'photos'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photos des Pépinières (10 images réelles)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplaceMode('abomey')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    replaceMode === 'abomey'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Couche Limite d'Abomey (GeoJSON)</span>
                </button>
              </div>

              {/* MODE 1: FILE UPLOAD */}
              {replaceMode === 'upload' && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setReplaceDragging(true); }}
                    onDragLeave={() => setReplaceDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setReplaceDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setReplaceFileName(file.name);
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const res = parseRawDataToNurseries(ev.target?.result);
                          setReplaceParseResult(res);
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                      replaceDragging
                        ? 'border-emerald-500 bg-emerald-50/70'
                        : replaceFileName
                        ? 'border-emerald-400 bg-emerald-50/30'
                        : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      const input = document.getElementById('admin-file-replace-input');
                      if (input) input.click();
                    }}
                  >
                    <input
                      id="admin-file-replace-input"
                      type="file"
                      accept=".geojson,.json,.csv,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setReplaceFileName(file.name);
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const res = parseRawDataToNurseries(ev.target?.result);
                            setReplaceParseResult(res);
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {replaceFileName ? `Fichier sélectionné : ${replaceFileName}` : 'Glissez-déposez votre GeoJSON ou CSV ici, ou cliquez'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Formats pris en charge : <strong>.geojson</strong>, <strong>.csv</strong> (séparateur virgule ou point-virgule), <strong>.json</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Besoin d'un modèle type ?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const csv = getSampleCsvTemplate();
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'modele_pepinieres.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger modèle CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: PASTE RAW TEXT */}
              {replaceMode === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Collez votre contenu GeoJSON, tableau JSON ou CSV :
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = getSampleCsvTemplate();
                        setReplacePasteText(sample);
                        const res = parseRawDataToNurseries(sample);
                        setReplaceParseResult(res);
                      }}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Charger exemple CSV
                    </button>
                  </div>
                  <textarea
                    value={replacePasteText}
                    onChange={(e) => setReplacePasteText(e.target.value)}
                    placeholder="Nom;Type;Commune;Arrondissement;Latitude;Longitude;CapaciteAnnuelle;Especes&#10;Pépinière de Vidolè;privee;Abomey;Vidolè;7.1845;1.9912;30000;Teck, Acacia, Manguier"
                    rows={7}
                    className="w-full text-xs font-mono p-3.5 bg-slate-900 text-emerald-300 rounded-2xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const res = parseRawDataToNurseries(replacePasteText);
                        setReplaceParseResult(res);
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Analyser le texte</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 3: PHOTO MANAGEMENT STUDIO */}
              {replaceMode === 'photos' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Galerie des 10 photos de terrain intégrées (Bénin)</p>
                        <p className="text-emerald-800 mt-0.5">
                          Photos stockées dans <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">/public/assets/pepinieres/</code>. Vous pouvez les assigner individuellement à chaque pépinière ou les distribuer automatiquement sur tout le catalogue.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = nurseries.map((n, idx) => ({
                          ...n,
                          photoUrl: NURSERY_PHOTOS[idx % NURSERY_PHOTOS.length]
                        }));
                        if (onReplaceNurseries) {
                          onReplaceNurseries(updated);
                        }
                        setAdminActionMsg(`Distribution réussie : les 10 photos béninoises ont été assignées aux ${nurseries.length} pépinières.`);
                        setTimeout(() => setAdminActionMsg(null), 4000);
                      }}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>⚡ Assigner aux {nurseries.length} pépinières</span>
                    </button>
                  </div>

                  {/* 10 Photo Thumbnails */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">
                      Photographies disponibles :
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {NURSERY_PHOTOS.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedPhotoPreview(photo)}
                          className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-900 cursor-pointer shadow-xs hover:shadow-md transition hover:scale-102"
                        >
                          <img
                            src={photo}
                            alt={`Pépinière ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:opacity-90 transition"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                            <span className="text-white text-[10px] font-bold">Photo #{idx + 1}</span>
                          </div>
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-mono">
                            pepi_{String(idx + 1).padStart(2, '0')}.jpg
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Per-Nursery Photo Assignment Table */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-800">
                        Association des images par pépinière ({nurseries.length}) :
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Cliquez sur une photo pour la remplacer
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 bg-white">
                        {nurseries.map((n) => (
                          <div key={n.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                            <div className="flex items-center gap-3">
                              <img
                                src={n.photoUrl || NURSERY_PHOTOS[0]}
                                alt={n.nom}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-bold text-xs text-slate-900">{n.nom}</div>
                                <div className="text-[11px] text-slate-500">
                                  {n.commune} &bull; {n.arrondissement} &bull; <span className="font-mono text-emerald-700">{n.photoUrl || 'Par défaut'}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedNurseryForPhoto(n)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Changer image</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Modal to pick photo for specific nursery */}
                  {selectedNurseryForPhoto && (
                    <div 
                      className="fixed inset-0 z-600 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
                      onClick={() => setSelectedNurseryForPhoto(null)}
                    >
                      <div 
                        className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto cursor-default animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">
                              Attribuer une image à la pépinière
                            </h3>
                            <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                              {selectedNurseryForPhoto.nom} ({selectedNurseryForPhoto.commune})
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedNurseryForPhoto(null)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">
                            Sélectionner une photo parmi les 10 images locales :
                          </label>
                          <div className="grid grid-cols-5 gap-2">
                            {NURSERY_PHOTOS.map((photo, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  const updated = { ...selectedNurseryForPhoto, photoUrl: photo };
                                  if (onUpdateNursery) {
                                    onUpdateNursery(updated);
                                  } else if (onReplaceNurseries) {
                                    onReplaceNurseries(nurseries.map(p => p.id === updated.id ? updated : p));
                                  }
                                  setAdminActionMsg(`Photo #${i + 1} attribuée à "${selectedNurseryForPhoto.nom}" !`);
                                  setTimeout(() => setAdminActionMsg(null), 3500);
                                  setSelectedNurseryForPhoto(null);
                                }}
                                className="group relative rounded-xl overflow-hidden aspect-square border-2 border-slate-200 hover:border-emerald-600 transition cursor-pointer"
                              >
                                <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center py-0.5">
                                  #{i + 1}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <label className="text-xs font-bold text-slate-700 block">
                            Ou importer une image personnalisée :
                          </label>
                          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition">
                            <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                            <span className="text-xs font-bold text-slate-800">Choisir une image sur votre appareil</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const dataUrl = ev.target?.result as string;
                                    if (dataUrl) {
                                      const updated = { ...selectedNurseryForPhoto, photoUrl: dataUrl };
                                      if (onUpdateNursery) {
                                        onUpdateNursery(updated);
                                      } else if (onReplaceNurseries) {
                                        onReplaceNurseries(nurseries.map(p => p.id === updated.id ? updated : p));
                                      }
                                      setAdminActionMsg(`Photo personnalisée assignée à "${selectedNurseryForPhoto.nom}" !`);
                                      setTimeout(() => setAdminActionMsg(null), 3500);
                                      setSelectedNurseryForPhoto(null);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Photo Modal Preview if clicked */}
                  {selectedPhotoPreview && (
                    <div 
                      onClick={() => setSelectedPhotoPreview(null)}
                      className="fixed inset-0 z-600 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
                    >
                      <div className="bg-white rounded-3xl p-4 max-w-2xl w-full space-y-3 cursor-default" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800">Aperçu photo de pépinière</span>
                          <button 
                            onClick={() => setSelectedPhotoPreview(null)}
                            className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <img 
                          src={selectedPhotoPreview} 
                          alt="Pépinière Bénin" 
                          className="w-full rounded-2xl max-h-[60vh] object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                          <span className="font-mono">{selectedPhotoPreview}</span>
                          <span className="text-emerald-700 font-semibold">Active sur les fiches des pépinières</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 4: COUCHE LIMITE COMMUNE D'ABOMEY */}
              {replaceMode === 'abomey' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                        🏛️
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Gestion de la Couche Limite de la Commune d'Abomey</p>
                        <p className="text-slate-600 mt-0.5">
                          Couche vectorielle officielle affichant le polygone administratif de la commune d'Abomey (142.5 km², 7 arrondissements) sur la carte interactive.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onNavigateToMap && (
                        <button
                          type="button"
                          onClick={onNavigateToMap}
                          className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Voir sur la carte</span>
                        </button>
                      )}
                      <a
                        href="/data/Commune_abomey.geojson"
                        download="Commune_abomey.geojson"
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Télécharger GeoJSON</span>
                      </a>
                    </div>
                  </div>

                  {/* Upload new Abomey boundary GeoJSON */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-800">
                      Importer ou remplacer la couche de la limite d'Abomey (.geojson) :
                    </div>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setAbomeyGeojsonDragging(true); }}
                      onDragLeave={() => setAbomeyGeojsonDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setAbomeyGeojsonDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setAbomeyUploadedFileName(file.name);
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            try {
                              const parsed = JSON.parse(ev.target?.result as string);
                              if (onUpdateAbomeyBoundary) {
                                onUpdateAbomeyBoundary(parsed);
                              }
                              setAdminActionMsg(`Couche limite d'Abomey mise à jour depuis le fichier "${file.name}" !`);
                              setTimeout(() => setAdminActionMsg(null), 4000);
                            } catch {
                              alert("Erreur de lecture du fichier GeoJSON.");
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                        abomeyGeojsonDragging
                          ? 'border-emerald-500 bg-emerald-50/70'
                          : abomeyUploadedFileName
                          ? 'border-emerald-400 bg-emerald-50/30'
                          : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        const input = document.getElementById('admin-file-abomey-input');
                        if (input) input.click();
                      }}
                    >
                      <input
                        id="admin-file-abomey-input"
                        type="file"
                        accept=".geojson,.json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAbomeyUploadedFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              try {
                                const parsed = JSON.parse(ev.target?.result as string);
                                if (onUpdateAbomeyBoundary) {
                                  onUpdateAbomeyBoundary(parsed);
                                }
                                setAdminActionMsg(`Couche limite d'Abomey mise à jour depuis "${file.name}" !`);
                                setTimeout(() => setAdminActionMsg(null), 4000);
                              } catch {
                                alert("Erreur lors de la lecture du fichier GeoJSON.");
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        🏛️
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {abomeyUploadedFileName ? `Fichier chargé : ${abomeyUploadedFileName}` : "Glissez-déposez le fichier GeoJSON de la commune d'Abomey"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Prend en charge les fichiers <strong>.geojson</strong> ou <strong>.json</strong> avec polygones WGS84
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Properties of Commune d'Abomey */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Chef-lieu</span>
                      <span className="font-bold text-slate-900 text-sm">Abomey</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Département</span>
                      <span className="font-bold text-slate-900 text-sm">Zou</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Superficie officielle</span>
                      <span className="font-bold text-emerald-700 text-sm">142.5 km²</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Arrondissements</span>
                      <span className="font-bold text-slate-900 text-sm">7 arrondissements</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PARSED PREVIEW & EXECUTE BUTTONS */}
              {replaceParseResult && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  {replaceParseResult.success ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-950">
                            {replaceParseResult.totalParsed} pépinière(s) détectée(s) et prêtes pour le remplacement !
                          </p>
                          <p className="text-[11px] text-emerald-800">
                            Format : <span className="font-mono font-bold uppercase">{replaceParseResult.formatDetected}</span> • {replaceParseResult.validCoordsCount} coordonnées GPS valides
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{replaceParseResult.error || 'Erreur lors de la lecture des données.'}</span>
                    </div>
                  )}

                  {/* Preview Table */}
                  {replaceParseResult.success && replaceParseResult.nurseries.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700">
                        Aperçu des 5 premiers enregistrements :
                      </div>
                      <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-slate-50">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-600 font-bold">
                            <tr>
                              <th className="py-2 px-3">Nom</th>
                              <th className="py-2 px-3">Type</th>
                              <th className="py-2 px-3">Commune</th>
                              <th className="py-2 px-3">Arrondissement</th>
                              <th className="py-2 px-3">Coordonnées GPS</th>
                              <th className="py-2 px-3">Capacité</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {replaceParseResult.nurseries.slice(0, 5).map((n, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-semibold text-slate-900">{n.nom}</td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    n.type === 'ecole' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {n.type === 'ecole' ? 'École' : 'Privée'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-slate-600">{n.commune}</td>
                                <td className="py-2 px-3 text-slate-600">{n.arrondissement}</td>
                                <td className="py-2 px-3 font-mono text-[11px] text-slate-700">{n.latitude.toFixed(4)}, {n.longitude.toFixed(4)}</td>
                                <td className="py-2 px-3 text-slate-600">{n.capaciteAnnuelle.toLocaleString()} plants</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={!replaceParseResult.success}
                      onClick={() => {
                        if (onMergeNurseries && replaceParseResult?.nurseries) {
                          onMergeNurseries(replaceParseResult.nurseries);
                          setAdminActionMsg(`Fusion réussie : ${replaceParseResult.nurseries.length} nouvelles pépinières ajoutées.`);
                          setTimeout(() => setAdminActionMsg(null), 4000);
                          setActiveAdminSubTab('list');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      Fusionner (+{replaceParseResult?.nurseries?.length || 0})
                    </button>

                    <button
                      type="button"
                      disabled={!replaceParseResult.success}
                      onClick={() => {
                        if (!replaceParseResult?.nurseries) return;
                        if (confirm(`Confirmez-vous le REMPLACEMENT INTÉGRAL des ${nurseries.length} pépinières actuelles par ces ${replaceParseResult.nurseries.length} nouvelles pépinières ?`)) {
                          if (onReplaceNurseries) {
                            onReplaceNurseries(replaceParseResult.nurseries);
                          }
                          setAdminActionMsg(`Remplacement réussi : ${replaceParseResult.nurseries.length} pépinières constituent désormais le jeu de données officiel.`);
                          setTimeout(() => setAdminActionMsg(null), 4000);
                          setActiveAdminSubTab('list');
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition cursor-pointer active:scale-98 disabled:opacity-50 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Remplacer tout le jeu de données ({replaceParseResult?.nurseries?.length || 0})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* COUCHE LIMITE D'ABOMEY MANAGEMENT CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-amber-50 border border-emerald-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      🏛️
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Couche Limite de la Commune d'Abomey (GeoJSON)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Fichier officiel <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-emerald-800">/public/data/Commune_abomey.geojson</code> (Polygone WGS84 &bull; 142.5 km&sup2;)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="/data/Commune_abomey.geojson"
                      download="Commune_abomey.geojson"
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Télécharger GeoJSON</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Chef-lieu</span>
                    <span className="font-bold text-slate-800">Abomey</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Département</span>
                    <span className="font-bold text-slate-800">Zou</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Superficie</span>
                    <span className="font-bold text-emerald-700">142.5 km²</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Arrondissements</span>
                    <span className="font-bold text-slate-800">7 arrondissements</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SubTab 3: ADMINISTRATORS (Multi-Admin Management) */}
          {activeAdminSubTab === 'admins' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <span>Comptes Administrateurs Enregistrés</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chaque administrateur dispose de ses propres accès pour gérer le géoportail BENIN-PEPI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingAdminInTab(!isAddingAdminInTab)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAddingAdminInTab ? 'Fermer le formulaire' : '+ Inscrire un Administrateur'}</span>
                </button>
              </div>

              {/* Form to add a new admin within the dashboard */}
              {isAddingAdminInTab && (
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 animate-in fade-in">
                  <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-700" />
                    <span>Créer un compte pour un nouvel administrateur</span>
                  </h4>
                  
                  <form onSubmit={handleInlineRegister} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom complet *</label>
                        <input
                          type="text"
                          required
                          value={regNom}
                          onChange={(e) => setRegNom(e.target.value)}
                          placeholder="ex: Dr. Dossou Kossi"
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Email professionnel *</label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="ex: kossi@environnement.bj"
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Structure / Direction</label>
                        <input
                          type="text"
                          value={regOrganisation}
                          onChange={(e) => setRegOrganisation(e.target.value)}
                          placeholder="ex: DDEF Zou"
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Rôle</label>
                        <select
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="Administrateur SIG">Administrateur SIG</option>
                          <option value="Conservateur Forestier">Conservateur Forestier</option>
                          <option value="Gestionnaire Territorial">Gestionnaire Territorial</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Mot de passe *</label>
                        <input
                          type="password"
                          required
                          minLength={5}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min. 5 caractères"
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirmer mot de passe *</label>
                        <input
                          type="password"
                          required
                          value={regPasswordConfirm}
                          onChange={(e) => setRegPasswordConfirm(e.target.value)}
                          placeholder="Répéter mot de passe"
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingAdminInTab(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="px-4 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                      >
                        {loginLoading ? 'Enregistrement...' : 'Enregistrer l\'administrateur'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Registered Admins Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adminsList.map((adm) => (
                  <div 
                    key={adm.id} 
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                        style={{ backgroundColor: adm.avatarColor || '#059669' }}
                      >
                        {adm.nom.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-900">{adm.nom}</div>
                        <div className="text-[11px] text-emerald-700 font-semibold">{adm.role}</div>
                        <div className="text-[10px] text-slate-500">{adm.email}</div>
                        {adm.organisation && (
                          <div className="text-[10px] text-slate-400 font-medium">{adm.organisation}</div>
                        )}
                        <div className="text-[9px] text-slate-400 pt-1">
                          Inscrit le {adm.dateCreation}
                        </div>
                      </div>
                    </div>

                    {/* Delete button (except if it's the current user) */}
                    {adminsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAdmin(adm.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Supprimer cet administrateur"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 4: SETTINGS */}
          {activeAdminSubTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Paramètres du SIG BENIN-PEPI</h3>
              <p className="text-xs text-slate-600">
                Configurations des projections cartographiques (WGS84 EPSG:4326), des seuils d'alertes reboisement et des flux de données avec les services des Eaux, Forêts et Chasses du Zou.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Système de référence de coordonnées (SRC) :</span>
                  <span className="font-mono text-emerald-700">WGS 84 (EPSG:4326)</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Zone administrative cible :</span>
                  <span className="text-slate-900">Département du Zou &amp; Commune d'Abomey</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Couche limite polygone :</span>
                  <span className="font-mono text-slate-600">/data/Commune_abomey.geojson</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
