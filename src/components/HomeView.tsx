import React, { useState } from 'react';
import { ActiveTab, Nursery } from '../types';
import { 
  Sprout, 
  TreePine, 
  MapPin, 
  Compass, 
  ArrowRight,
  TrendingUp,
  Users,
  Store,
  Play,
  Leaf,
  Shield,
  Map as MapIcon,
  RefreshCw,
  Package,
  Download,
  Link2,
  Copy,
  Check,
  Laptop
} from 'lucide-react';

interface HomeViewProps {
  nurseries: Nursery[];
  onNavigate: (tab: ActiveTab) => void;
  onSelectNursery?: (nursery: Nursery) => void;
  onOpenAboutModal?: () => void;
  onOpenLoginModal?: () => void;
  onOpenLocalSetupModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  nurseries,
  onNavigate,
  onOpenAboutModal,
  onOpenLocalSetupModal
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const totalCount = nurseries.length > 0 ? nurseries.length : 250;

  const geoportalFullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#geoportail`
    : 'https://ais-dev-c4h5ua75wz7ivqp5bl2bf2-906085649607.europe-west2.run.app/#geoportail';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(geoportalFullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* =========================================================================
          HERO SECTION - EXACT MATCH TO "propo acceul.png"
      ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#031c12] via-[#05291b] to-[#031d13] text-white min-h-[620px] lg:min-h-[680px] flex items-center">
        
        {/* Background photo with deep green nursery plantation overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        
        {/* Subtle radial ambient glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Eyebrow, Main Title, Description, 4 Badges, 2 CTA buttons */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Eyebrow: OBSERVER • LOCALISER • VALORISER */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3cd070]">
                <Leaf className="w-4 h-4 fill-[#3cd070] text-[#3cd070] shrink-0" />
                <span>OBSERVER &bull; LOCALISER &bull; VALORISER</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                Les pépinières, <br />
                au cœur d'un{' '}
                <span className="text-[#3cd070] inline-flex items-center gap-2">
                  avenir vert
                  <span className="text-3xl sm:text-4xl lg:text-5xl">🍃</span>
                </span>
              </h1>

              {/* Paragraph */}
              <p className="text-slate-200/90 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                BENIN-PEPI est un géoportail qui référence et valorise les pépinières scolaires et privées du Bénin. Il facilite la localisation, la gestion et le suivi de ces espaces essentiels pour la reforestation, l'agriculture durable et la préservation de notre environnement.
              </p>

              {/* 4 Feature Badges in a Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                
                {/* 1. Localisation précise */}
                <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/80 text-white flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Compass className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-white leading-tight">
                    Localisation précise des pépinières
                  </span>
                </div>

                {/* 2. Gestion durable */}
                <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/80 text-white flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-white leading-tight">
                    Gestion durable des ressources
                  </span>
                </div>

                {/* 3. Soutien à la reforestation */}
                <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/80 text-white flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Sprout className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-white leading-tight">
                    Soutien à la reforestation
                  </span>
                </div>

                {/* 4. Un environnement plus vert pour demain */}
                <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/80 text-white flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-semibold text-white leading-tight">
                    Un environnement plus vert pour demain
                  </span>
                </div>

              </div>

              {/* Primary CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  id="hero-btn-map"
                  onClick={() => onNavigate('map')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#008751] hover:bg-[#007043] text-white font-bold text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <MapIcon className="w-4 h-4" />
                  <span>Accéder au géoportail</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-btn-discover"
                  onClick={() => {
                    if (onOpenAboutModal) onOpenAboutModal();
                    else onNavigate('about');
                  }}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-black/40 hover:bg-black/60 text-white font-semibold text-sm border border-white/20 transition-all active:scale-98 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                  </div>
                  <span>Découvrir le projet</span>
                </button>
              </div>

              {/* Direct Geoportal Link & Local Architecture Quick Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div 
                  onClick={() => onNavigate('map')}
                  className="flex-1 flex items-center gap-2 bg-emerald-950/70 hover:bg-emerald-950/90 border border-emerald-500/30 px-3.5 py-2.5 rounded-2xl text-xs text-white transition cursor-pointer"
                  title="Cliquer pour naviguer directement vers le géoportail"
                >
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0 animate-spin-slow" />
                  <span className="text-[11px] text-emerald-200 font-semibold">Lien Géoportail :</span>
                  <code className="font-mono text-amber-300 text-[11px] font-bold">#geoportail</code>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink();
                    }}
                    className="ml-auto px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-[11px] flex items-center gap-1 transition cursor-pointer"
                    title="Copier l'URL complète vers le géoportail"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                {onOpenLocalSetupModal && (
                  <button
                    type="button"
                    onClick={onOpenLocalSetupModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/20 text-xs font-bold transition cursor-pointer"
                    title="Guide d'installation et architecture pour exécuter le dossier en local"
                  >
                    <Laptop className="w-4 h-4 text-emerald-400" />
                    <span>Dossier en Local (Guide)</span>
                  </button>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Realistic Visual with Forester holding seedling + Zou map silhouette */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                
                {/* Main Card with the hands holding seedling and forester */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-4/5 bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=900&q=85"
                    alt="Pépiniériste au Bénin tenant un jeune plant en pot"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Forester vest badge simulation */}
                  <div className="absolute top-4 right-4 bg-emerald-950/90 border border-emerald-500/40 text-white rounded-2xl p-2.5 shadow-xl flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-amber-300 text-sm">
                      🌱
                    </div>
                    <div>
                      <div className="font-extrabold text-[11px] leading-none text-white tracking-wide">BENIN-PEPI</div>
                      <div className="text-[9px] text-emerald-300 mt-0.5">ZOU &bull; ABOMEY</div>
                    </div>
                  </div>

                  {/* Overlay Silhouette map of Zou with markers (as shown in mockup) */}
                  <div className="absolute top-12 left-4 w-32 sm:w-36 bg-emerald-900/85 backdrop-blur-md rounded-2xl p-2.5 border border-emerald-400/40 shadow-xl">
                    <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider text-center border-b border-emerald-700/60 pb-1 mb-1.5 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      <span>Carte du Zou</span>
                    </div>
                    <div className="relative h-28 bg-emerald-950/60 rounded-xl overflow-hidden flex items-center justify-center border border-emerald-800">
                      {/* Stylized polygon shape of Zou */}
                      <svg viewBox="0 0 100 120" className="w-24 h-24 text-emerald-600">
                        <polygon points="30,10 70,5 90,30 85,75 60,110 35,115 15,80 20,40" fill="currentColor" fillOpacity="0.4" stroke="#34d399" strokeWidth="2" />
                        {/* Tree marker pins inside the map */}
                        <circle cx="45" cy="45" r="4" fill="#10b981" />
                        <circle cx="65" cy="35" r="3.5" fill="#f59e0b" />
                        <circle cx="35" cy="70" r="3.5" fill="#10b981" />
                        <circle cx="55" cy="80" r="4" fill="#f59e0b" />
                        <circle cx="50" cy="60" r="4.5" fill="#10b981" />
                      </svg>
                      <span className="absolute bottom-1 right-2 text-[9px] font-bold text-white bg-black/60 px-1.5 rounded">
                        Abomey
                      </span>
                    </div>
                  </div>

                  {/* Slogan banner faithful to mockup */}
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <div className="inline-block bg-black/70 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/15 shadow-lg">
                      <p className="text-white text-sm sm:text-base italic font-serif font-bold text-emerald-100 tracking-wide drop-shadow-md">
                        « Des pépinières aujourd'hui, une forêt demain ! »
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION: "À PROPOS DE BENIN-PEPI" (FAITHFUL TO MOCKUP)
      ========================================================================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Heading, description, button */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#008751] block">
                À PROPOS DE BENIN-PEPI
              </span>
              
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Un outil géospatial au service des pépinières du Bénin
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                BENIN-PEPI est un géoportail moderne qui centralise et sécurise les informations sur les pépinières scolaires et privées du Bénin, avec un focus particulier sur le département du Zou et la commune d'Abomey. Grâce aux technologies géospatiales, il permet une meilleure planification, un suivi efficace et une gestion durable des ressources forestières et environnementales.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer"
                >
                  <span>En savoir plus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: 4 Cards in 2x2 Grid (Faithful to Mockup) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Pépinières scolaires */}
              <div className="p-6 rounded-2xl border border-slate-100 bg-[#f8faf9] hover:bg-white hover:shadow-md transition">
                <div className="w-12 h-12 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                  <TreePine className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Pépinières scolaires
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Soutenir les initiatives éducatives pour une éducation verte et durable.
                </p>
              </div>

              {/* Card 2: Pépinières privées */}
              <div className="p-6 rounded-2xl border border-slate-100 bg-[#f8faf9] hover:bg-white hover:shadow-md transition">
                <div className="w-12 h-12 rounded-full bg-[#f59e0b] text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Pépinières privées
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Accompagner les acteurs privés dans la production de plants de qualité.
                </p>
              </div>

              {/* Card 3: Géolocalisation */}
              <div className="p-6 rounded-2xl border border-slate-100 bg-[#f8faf9] hover:bg-white hover:shadow-md transition">
                <div className="w-12 h-12 rounded-full bg-[#047857] text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Géolocalisation
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Accès rapide aux informations avec une carte interactive.
                </p>
              </div>

              {/* Card 4: Gestion & suivi */}
              <div className="p-6 rounded-2xl border border-slate-100 bg-[#f8faf9] hover:bg-white hover:shadow-md transition">
                <div className="w-12 h-12 rounded-full bg-[#22c55e] text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Gestion &amp; suivi
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Des données fiables pour une meilleure prise de décision.
                </p>
              </div>

            </div>

          </div>

          {/* =========================================================================
              KEY STATISTICAL INDICATORS BAR (MINT CARDS MATCHING MOCKUP)
          ========================================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            
            {/* Stat 1: +250 Pépinières recensées */}
            <div className="bg-[#eaf5ef] rounded-2xl p-5 flex items-center gap-4 border border-[#d6ebd9] transition hover:shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  + {totalCount > 250 ? totalCount : 250}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Pépinières recensées
                </div>
                <div className="text-[11px] text-slate-500">
                  Écoles et privées
                </div>
              </div>
            </div>

            {/* Stat 2: 07 Arrondissements */}
            <div className="bg-[#eaf5ef] rounded-2xl p-5 flex items-center gap-4 border border-[#d6ebd9] transition hover:shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  07
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Arrondissements
                </div>
                <div className="text-[11px] text-slate-500">
                  (Commune d'Abomey)
                </div>
              </div>
            </div>

            {/* Stat 3: 01 Département */}
            <div className="bg-[#eaf5ef] rounded-2xl p-5 flex items-center gap-4 border border-[#d6ebd9] transition hover:shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  01
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Département
                </div>
                <div className="text-[11px] text-slate-500">
                  (Le Zou)
                </div>
              </div>
            </div>

            {/* Stat 4: 100% Engagement */}
            <div className="bg-[#eaf5ef] rounded-2xl p-5 flex items-center gap-4 border border-[#d6ebd9] transition hover:shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#008751] text-white flex items-center justify-center shrink-0 shadow-xs">
                <TreePine className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  100%
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Engagement
                </div>
                <div className="text-[11px] text-slate-500">
                  pour un Bénin plus vert
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          SLOGAN BANNER & THEMATIC BADGES (EXACT MOCKUP STRIP)
      ========================================================================= */}
      <section className="relative overflow-hidden bg-[#031d13] text-white py-12 border-t-2 border-emerald-600">
        
        {/* Background lush greenery photo with dark overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1600&q=80')`
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left Quote with orange underline */}
            <div className="text-center md:text-left">
              <p className="text-lg sm:text-xl font-serif italic text-white font-medium">
                « Chaque <span className="underline decoration-[#f59e0b] decoration-3 font-semibold">plant aujourd'hui</span>, est une richesse pour demain. »
              </p>
            </div>

            {/* Right Thematic Badges (4 pills: Environnement, Communautés, Agriculture durable, Sécurité alimentaire) */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
              
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 text-white">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Environnement</span>
              </div>

              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 text-white">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Communautés</span>
              </div>

              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 text-white">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <span>Agriculture durable</span>
              </div>

              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 text-white">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sécurité alimentaire</span>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
