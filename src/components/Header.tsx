import React, { useState } from 'react';
import { ActiveTab, AdminAccount } from '../types';
import { Logo } from './Logo';
import { 
  Map, 
  Layers, 
  BarChart3, 
  PlusCircle, 
  ShieldCheck, 
  Home, 
  FolderDown, 
  Menu, 
  X, 
  Search, 
  User, 
  LogOut, 
  Info, 
  PhoneCall, 
  Lock, 
  RefreshCw, 
  Compass, 
  Laptop, 
  Link2 
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalNurseries: number;
  isAdmin: boolean;
  currentAdmin?: AdminAccount | null;
  onOpenLoginModal: () => void;
  onLogoutAdmin: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenLocalSetupModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalNurseries,
  isAdmin,
  currentAdmin,
  onOpenLoginModal,
  onLogoutAdmin,
  searchQuery,
  onSearchChange,
  onOpenLocalSetupModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home' as ActiveTab, label: 'Accueil' },
    { id: 'about' as ActiveTab, label: 'À propos' },
    { id: 'map' as ActiveTab, label: 'Carte' },
    { id: 'stats' as ActiveTab, label: 'Statistiques' },
    { id: 'ressources' as ActiveTab, label: 'Ressources' },
    { id: 'contact' as ActiveTab, label: 'Contact' }
  ];

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'map' && activeTab !== 'list') {
      setActiveTab('map');
    }
  };

  const isHome = activeTab === 'home';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-200 ${
      isHome 
        ? 'bg-slate-950/90 border-b border-emerald-950/60 text-white' 
        : 'bg-white/95 border-b border-slate-200/90 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleNav('home')}
            className="cursor-pointer shrink-0 transition hover:opacity-95"
            id="brand-logo"
          >
            <Logo size="md" white={isHome} />
          </div>

          {/* Nav Items matching mockup */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id || 
                (item.id === 'ressources' && activeTab === 'data_files') ||
                (item.id === 'carte' as any && activeTab === 'list');
              
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNav(item.id === 'ressources' ? 'data_files' : item.id)}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? isHome ? 'text-white font-bold' : 'text-emerald-800 font-bold'
                      : isHome ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-emerald-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.75 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search Pill from Mockup */}
          <form 
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative flex-1 max-w-xs lg:max-w-sm"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              placeholder="Rechercher une pépinière, une commune..."
              className={`w-full pl-4 pr-10 py-2 text-xs rounded-full transition shadow-xs ${
                isHome
                  ? 'bg-white text-slate-800 placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-400'
                  : 'bg-slate-100/90 text-slate-900 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600'
              }`}
            />
            <button
              type="submit"
              className="absolute right-3 text-slate-400 hover:text-emerald-600 transition"
              title="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Action: Connexion or Admin Tools */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {/* Direct Geoportal Access Button */}
            {activeTab !== 'map' && (
              <button
                onClick={() => handleNav('map')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
                  isHome
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
                title="Naviguer directement vers le géoportail cartographique"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Géoportail</span>
              </button>
            )}

            {/* Direct Link & Local Dossier Modal Trigger */}
            {onOpenLocalSetupModal && (
              <button
                onClick={onOpenLocalSetupModal}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition border cursor-pointer ${
                  isHome
                    ? 'bg-white/10 hover:bg-white/20 text-emerald-300 border-white/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
                title="Lien direct vers le géoportail et guide d'exécution du dossier en local"
              >
                <Laptop className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden md:inline">Lien &amp; Dossier Local</span>
              </button>
            )}

            {isAdmin ? (
              <div className="flex items-center gap-2">
                {/* Admin button linking to admin space */}
                <button
                  onClick={() => handleNav('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition shadow-xs cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                      : isHome
                        ? 'bg-emerald-900/70 text-emerald-200 border-emerald-500/40 hover:bg-emerald-800'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  }`}
                  title={currentAdmin?.email || 'Accéder à l\'Espace Administrateur'}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Espace Admin ({currentAdmin?.nom ? currentAdmin.nom.split(' ')[0] : 'Admin'})</span>
                </button>

                {/* Logout */}
                <button
                  onClick={onLogoutAdmin}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isHome 
                      ? 'text-white/70 hover:text-rose-400 hover:bg-white/10' 
                      : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title="Déconnexion Administrateur"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-connexion-header"
                onClick={onOpenLoginModal}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition hover:scale-102 active:scale-98 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Connexion Admin</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${
                isHome ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
              }`}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher une pépinière..."
              className="w-full pl-4 pr-10 py-2 text-xs rounded-full bg-slate-100 border border-slate-200"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Links */}
          <div className="space-y-1">
            {navLinks.map((item) => {
              const targetTab = item.id === 'ressources' ? 'data_files' : item.id;
              const isActive = activeTab === targetTab;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(targetTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Direct Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => handleNav('map')}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Compass className="w-4 h-4 text-emerald-200" />
              <span>Accéder au Géoportail Cartographique</span>
            </button>

            {onOpenLocalSetupModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLocalSetupModal();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Laptop className="w-4 h-4 text-emerald-600" />
                <span>Lien direct &amp; Exécution Locale</span>
              </button>
            )}

            {isAdmin ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Accéder à l'Espace Administrateur</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogoutAdmin();
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter ({currentAdmin?.nom || 'Admin'})</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoginModal();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <User className="w-4 h-4" />
                <span>Connexion Espace Admin</span>
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
