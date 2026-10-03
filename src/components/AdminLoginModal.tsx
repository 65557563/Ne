import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  KeyRound,
  Download,
  User,
  Mail,
  Building2,
  UserPlus,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { AdminAccount } from '../types';
import { authenticateAdmin, registerAdmin, saveCurrentAdminSession } from '../utils/adminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminAccount) => void;
  reason?: 'general' | 'download_geojson' | 'add_nursery' | 'edit_data';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  reason = 'general'
}) => {
  // Mode: 'login' (Se connecter) or 'register' (Créer un compte)
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regNom, setRegNom] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrganisation, setRegOrganisation] = useState('');
  const [regRole, setRegRole] = useState('Administrateur SIG');
  const [regTelephone, setRegTelephone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await authenticateAdmin(identifier, password);
      if (res.success && res.admin) {
        saveCurrentAdminSession(res.admin, rememberMe);
        onLoginSuccess(res.admin);
        onClose();
      } else {
        setError(res.error || 'Identifiants ou mot de passe invalides.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la tentative de connexion.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regPassword !== regPasswordConfirm) {
      setError('Les deux mots de passe saisis ne sont pas identiques.');
      return;
    }

    if (regPassword.length < 5) {
      setError('Le mot de passe doit comporter au moins 5 caractères.');
      return;
    }

    setLoading(true);
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
        setSuccessMsg(`Compte administrateur créé avec succès pour ${res.admin.nom} !`);
        setTimeout(() => {
          onLoginSuccess(res.admin!);
          onClose();
        }, 900);
      } else {
        setError(res.error || 'Impossible de créer le compte.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création du compte administrateur.');
    } finally {
      setLoading(false);
    }
  };

  const getReasonDetails = () => {
    switch (reason) {
      case 'download_geojson':
        return {
          icon: Download,
          badge: 'Validation de téléchargement',
          title: 'Accès restreint aux données SIG brutes',
          desc: "Le téléchargement ou l'exportation des fichiers GeoJSON nécessite une authentification administrateur."
        };
      case 'add_nursery':
        return {
          icon: KeyRound,
          badge: 'Autorisation requise',
          title: 'Ajout de pépinière géoréférencée',
          desc: "L'enregistrement d'une nouvelle pépinière et la capture de coordonnées par clic sur la carte sont réservés aux administrateurs."
        };
      case 'edit_data':
        return {
          icon: KeyRound,
          badge: 'Gestion des couches SIG',
          title: 'Modification des fichiers GeoJSON',
          desc: "L'importation ou le remplacement de fichiers GeoJSON dans le géoportail nécessite une session administrateur."
        };
      default:
        return {
          icon: ShieldCheck,
          badge: 'Espace Administrateur',
          title: mode === 'login' ? 'Connexion Espace Administrateur' : 'Création d\'un compte Administrateur',
          desc: mode === 'login' 
            ? 'Connectez-vous avec votre compte personnel pour gérer le géoportail BENIN-PEPI.'
            : 'Enregistrez votre profil d\'administrateur pour accéder aux fonctions de gestion et de cartographie.'
        };
    }
  };

  const details = getReasonDetails();
  const ReasonIcon = details.icon;

  return (
    <div className="fixed inset-0 z-500 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800/90 text-emerald-200 text-xs font-bold border border-emerald-600/40">
              <ReasonIcon className="w-3.5 h-3.5 text-emerald-300" />
              <span>{details.badge}</span>
            </span>
          </div>

          <h3 className="text-xl font-black text-white leading-tight">
            {mode === 'login' ? 'Connexion Administrateur' : 'Créer un compte Administrateur'}
          </h3>
          <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
            {mode === 'login'
              ? 'Chaque administrateur dispose de ses propres identifiants pour sécuriser le géoportail.'
              : 'Formulaire de création de compte pour les techniciens SIG, conservateurs et gestionnaires habilités.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-black/30 p-1 rounded-xl mt-4 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Créer un compte
            </button>
          </div>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            
            {/* Identifier / Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Email ou Identifiant Administrateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="ex: prenom.nom@environnement.bj"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Saisissez votre mot de passe..."
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Mémoriser ma session</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Créer un compte ?
              </button>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Vérification...' : 'Se connecter'}</span>
              </button>
            </div>

          </form>
        ) : (
          /* MODE 2: REGISTER FORM (Each admin creates their own account) */
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
            
            {/* Nom complet */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Nom complet de l'administrateur <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={regNom}
                  onChange={(e) => setRegNom(e.target.value)}
                  placeholder="ex: Dr. Dossou Kossi"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Email professionnel */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Email professionnel (servira d'identifiant) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ex: kossi.dossou@environnement.bj"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Structure / Organisation & Rôle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Structure / Organisation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regOrganisation}
                    onChange={(e) => setRegOrganisation(e.target.value)}
                    placeholder="ex: Eaux & Forêts Zou"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Rôle / Fonction
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                >
                  <option value="Administrateur SIG">Administrateur SIG</option>
                  <option value="Conservateur Forestier">Conservateur Forestier</option>
                  <option value="Gestionnaire Communal">Gestionnaire Communal</option>
                  <option value="Agent de Terrain">Agent de Terrain</option>
                  <option value="Responsable Projet Reforestation">Responsable Projet Reforestation</option>
                </select>
              </div>
            </div>

            {/* Téléphone optionnel */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Téléphone de contact
              </label>
              <input
                type="tel"
                value={regTelephone}
                onChange={(e) => setRegTelephone(e.target.value)}
                placeholder="+229 ..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Mot de passe et confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mot de passe <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 5 caractères"
                    required
                    minLength={5}
                    className="w-full pl-3 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Confirmer le mot de passe <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-xs text-slate-600 hover:text-emerald-700 font-semibold cursor-pointer"
              >
                &larr; Déjà un compte ? Se connecter
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Création...' : 'Créer mon compte'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
