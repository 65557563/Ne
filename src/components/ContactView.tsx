import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  Building2, 
  Clock, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface ContactViewProps {
  onOpenAdminLogin: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onOpenAdminLogin }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: 'Demande de renseignement',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
          CONTACT & ASSISTANCE
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          Contactez l'équipe du projet BENIN-PEPI
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Pour toute demande d'information, signalement de nouvelle pépinière ou requête administrative concernant le géoportail du Département du Zou.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Information Cards */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span>Inspection Forestière du Zou</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">Direction Départementale</div>
                  <div>Quartier administratif, Abomey, République du Bénin</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href="tel:+22996576623" className="font-bold text-slate-800 hover:text-emerald-700 transition">
                  +229 96 57 66 23
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>contact@benin-pepi.bj</div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>Lundi &ndash; Vendredi : 08h00 &ndash; 17h30</div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Accès réservé aux administrateurs</span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Vous êtes technicien forestier ou gestionnaire agréé ? Accédez à l'espace d'administration sécurisé pour ajouter des pépinières ou importer des données GeoJSON.
            </p>
            <button
              onClick={onOpenAdminLogin}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs transition"
            >
              Se connecter à l'espace Admin &rarr;
            </button>
          </div>

        </div>

        {/* Right Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message envoyé avec succès !</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Merci d'avoir contacté l'équipe de coordination BENIN-PEPI. Votre message a été transmis aux techniciens du Zou.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ nom: '', email: '', sujet: 'Demande de renseignement', message: '' });
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Formulaire de contact</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nom & Prénom</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={e => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Koffi Mensah"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Adresse Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre.email@domaine.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Objet de la demande</label>
                  <select
                    value={formData.sujet}
                    onChange={e => setFormData({ ...formData, sujet: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Signalement d'une nouvelle pépinière">Signalement d'une nouvelle pépinière</option>
                    <option value="Demande d'accès aux données SIG brutes">Demande d'accès aux données SIG brutes</option>
                    <option value="Partenariat pépinière école / Reboisement">Partenariat pépinière école / Reboisement</option>
                    <option value="Autre demande">Autre demande</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Votre message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Précisez votre demande ou les détails de la pépinière..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer le message</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
