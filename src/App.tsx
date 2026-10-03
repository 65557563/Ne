/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, Nursery, AdminAccount, CustomGeoJsonLayer } from './types';
import { INITIAL_NURSERIES, NURSERY_PHOTOS, geojsonToNurseries, nurseriesToGeojson } from './data/nurseryData';
import { getNurseryTreeCategory } from './utils/markerIcons';
import { getCurrentAdminSession, clearAdminSession, canDownloadNurseryData } from './utils/adminAuth';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { MapPortal } from './components/MapPortal';
import { NurseryList } from './components/NurseryList';
import { StatisticsView } from './components/StatisticsView';
import { DataFileManager } from './components/DataFileManager';
import { AdminView } from './components/AdminView';
import { AddNurseryModal } from './components/AddNurseryModal';
import { NurseryDetailModal } from './components/NurseryDetailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ReplaceDataModal } from './components/ReplaceDataModal';
import { LocalSetupModal } from './components/LocalSetupModal';
import { Logo } from './components/Logo';
import { ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'benin_pepi_nurseries_v1';
const HASH_KEY = 'benin_pepi_geojson_hash_v1';
const AUTH_KEY = 'benin_pepi_admin_auth';
const CUSTOM_DATA_KEY = 'benin_pepi_custom_data_v1';
const ABOMEY_BOUNDARY_KEY = 'benin_pepi_abomey_boundary_v1';

// Helper fast hash
function computeStringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

// URL Hash & Param Router for direct links (e.g. /#geoportail, /#map, ?tab=map)
function getInitialTab(): ActiveTab {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.toLowerCase().replace('#', '').trim();
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = (searchParams.get('tab') || searchParams.get('page') || '').toLowerCase().trim();

  if (hash === 'geoportail' || hash === 'map' || hash === 'carte' || tabParam === 'map' || tabParam === 'geoportail' || tabParam === 'carte') {
    return 'map';
  }
  if (hash === 'admin' || hash === 'connexion' || hash === 'login' || tabParam === 'admin') {
    return 'admin';
  }
  if (hash === 'ressources' || hash === 'donnees' || hash === 'data_files' || tabParam === 'ressources' || tabParam === 'data_files') {
    return 'ressources';
  }
  if (hash === 'stats' || hash === 'statistiques' || tabParam === 'stats') {
    return 'stats';
  }
  if (hash === 'about' || hash === 'a-propos' || tabParam === 'about') {
    return 'about';
  }
  if (hash === 'contact' || tabParam === 'contact') {
    return 'contact';
  }
  return 'home';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocalSetupModalOpen, setIsLocalSetupModalOpen] = useState(false);
  
  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(AUTH_KEY) === 'true' ||
        sessionStorage.getItem(AUTH_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    return getCurrentAdminSession();
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState<'general' | 'download_geojson' | 'add_nursery' | 'edit_data'>('general');

  // Custom Boundary GeoJSON for Commune d'Abomey
  const [customAbomeyBoundary, setCustomAbomeyBoundary] = useState<any>(() => {
    try {
      const stored = localStorage.getItem(ABOMEY_BOUNDARY_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Nursery Data with LocalStorage Persistence & Guaranteed Photo/Icon Normalization
  const [nurseries, setNurseries] = useState<Nursery[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize and repair any missing photos or missing tree icons from prior sessions
          return parsed.map((n: Nursery, idx: number) => {
            let photo = n.photoUrl?.trim();
            if (!photo || photo === '' || photo === 'undefined' || photo === 'null' || photo.includes('unsplash.com')) {
              photo = NURSERY_PHOTOS[idx % NURSERY_PHOTOS.length];
            }
            const treeIcon = n.treeIcon || getNurseryTreeCategory(n);
            return {
              ...n,
              photoUrl: photo,
              treeIcon
            };
          });
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    }
    return INITIAL_NURSERIES;
  });

  const [selectedNursery, setSelectedNursery] = useState<Nursery | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [addCoords, setAddCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync nurseries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nurseries));
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }
  }, [nurseries]);

  const handleUpdateAbomeyBoundary = (geojsonData: any) => {
    setCustomAbomeyBoundary(geojsonData);
    try {
      localStorage.setItem(ABOMEY_BOUNDARY_KEY, JSON.stringify(geojsonData));
    } catch (e) {
      console.warn('Error saving Abomey boundary to localStorage', e);
    }
    showToast("Couche de la limite d'Abomey mise à jour avec succès !");
  };

  const handleUpdateNursery = (updated: Nursery) => {
    setNurseries(prev => {
      const nextList = prev.map(p => p.id === updated.id ? updated : p);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
        localStorage.setItem(CUSTOM_DATA_KEY, 'true');
      } catch (e) {
        console.warn('Error saving nursery to localStorage', e);
      }
      return nextList;
    });
    if (selectedNursery?.id === updated.id) {
      setSelectedNursery(updated);
    }
    showToast(`Pépinière "${updated.nom}" mise à jour avec succès !`);
  };

  // Sync with file /data/PEPI_BENIN.geojson directly
  const syncWithServerFile = async (forced: boolean = false) => {
    try {
      const hasCustomData = localStorage.getItem(CUSTOM_DATA_KEY) === 'true';
      if (!forced && hasCustomData && localStorage.getItem(STORAGE_KEY)) {
        // User has already customized/replaced the dataset, do not overwrite automatically
        return false;
      }

      const res = await fetch(`/data/PEPI_BENIN.geojson?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fichier GeoJSON non accessible');
      const text = await res.text();
      const currentHash = computeStringHash(text);
      const storedHash = localStorage.getItem(HASH_KEY);

      if (forced || currentHash !== storedHash || !localStorage.getItem(STORAGE_KEY)) {
        const parsed = JSON.parse(text);
        const loaded = geojsonToNurseries(parsed);
        if (loaded.length > 0) {
          setNurseries(loaded);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
            localStorage.setItem(HASH_KEY, currentHash);
          } catch (e) {
            console.warn(e);
          }
          showToast(`Données GeoJSON synchronisées (${loaded.length} pépinières chargées).`);
          return true;
        }
      }
    } catch (err) {
      console.warn('Sync failed or file unchanged', err);
    }
    return false;
  };

  const handleReplaceNurseries = (newNurseries: Nursery[]) => {
    setNurseries(newNurseries);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNurseries));
      localStorage.setItem(CUSTOM_DATA_KEY, 'true');
    } catch (e) {
      console.warn(e);
    }
    setActiveTab('map');
    showToast(`Remplacement réussi : ${newNurseries.length} pépinières intégrées et affichées sur le géoportail !`);
  };

  const handleMergeNurseries = (newNurseries: Nursery[]) => {
    setNurseries(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const toAdd = newNurseries.filter(p => !existingIds.has(p.id));
      const merged = [...toAdd, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        localStorage.setItem(CUSTOM_DATA_KEY, 'true');
      } catch (e) {
        console.warn(e);
      }
      return merged;
    });
    setActiveTab('map');
    showToast(`Fusion réussie : ${newNurseries.length} nouvelles pépinières intégrées et affichées sur le géoportail !`);
  };

  // Custom GeoJSON Layers loaded dynamically onto the Geoportal
  const [customLayers, setCustomLayers] = useState<CustomGeoJsonLayer[]>(() => {
    try {
      const s = localStorage.getItem('benin_pepi_custom_layers_v1');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('benin_pepi_custom_layers_v1', JSON.stringify(customLayers));
    } catch (e) {
      console.warn(e);
    }
  }, [customLayers]);

  const handleAddCustomLayer = (layer: CustomGeoJsonLayer) => {
    setCustomLayers(prev => [layer, ...prev]);
    setActiveTab('map');
    showToast(`Couche GeoJSON "${layer.name}" (${layer.featureCount} entités) intégrée et affichée sur le géoportail !`);
  };

  const handleRemoveCustomLayer = (id: string) => {
    setCustomLayers(prev => prev.filter(l => l.id !== id));
    showToast('Couche GeoJSON retirée du géoportail.');
  };

  const handleToggleCustomLayer = (id: string) => {
    setCustomLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const handleUpdateCustomLayerColor = (id: string, color: string) => {
    setCustomLayers(prev => prev.map(l => l.id === id ? { ...l, color } : l));
  };

  // Attempt to fetch fresh GeoJSON on mount and check for file updates
  useEffect(() => {
    syncWithServerFile(false);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = (admin?: AdminAccount) => {
    setIsAdmin(true);
    if (admin) {
      setCurrentAdmin(admin);
      showToast(`Bienvenue, ${admin.nom} (Droits Administrateur activés)`);
    } else {
      const sess = getCurrentAdminSession();
      setCurrentAdmin(sess);
      showToast('Connexion réussie : Droits Administrateur activés');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentAdmin(null);
    clearAdminSession();
    showToast('Déconnexion effectuée. Mode consultation publique activé.');
  };

  const handleRequestAdminAuth = (reason: 'general' | 'download_geojson' | 'add_nursery' | 'edit_data') => {
    setLoginReason(reason);
    setIsLoginModalOpen(true);
  };

  // Nursery Management (Only Admin)
  const handleAddNursery = (newNursery: Nursery) => {
    setNurseries(prev => [newNursery, ...prev]);
    showToast(`La pépinière "${newNursery.nom}" a été enregistrée avec succès !`);
  };

  const handleDeleteNursery = (id: string) => {
    if (!isAdmin) {
      handleRequestAdminAuth('general');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette pépinière de la base de données ?')) {
      setNurseries(prev => prev.filter(n => n.id !== id));
      showToast('Pépinière supprimée de la base de données.');
    }
  };

  const handleImportNurseries = (imported: Nursery[], mode: 'replace' | 'merge') => {
    if (!isAdmin) {
      handleRequestAdminAuth('edit_data');
      return;
    }
    if (mode === 'replace') {
      setNurseries(imported);
      showToast(`${imported.length} pépinières importées (remplacement complet).`);
    } else {
      setNurseries(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const toAdd = imported.filter(p => !existingIds.has(p.id));
        return [...toAdd, ...prev];
      });
      showToast(`${imported.length} pépinières fusionnées.`);
    }
  };

  const handleExportGeoJSON = () => {
    if (!canDownloadNurseryData(isAdmin)) {
      handleRequestAdminAuth('download_geojson');
      return;
    }
    const geojson = nurseriesToGeojson(nurseries);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'PEPI_BENIN.geojson');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Fichier PEPI_BENIN.geojson téléchargé avec succès.');
  };

  const handleOpenAddModalWithCoords = (lat: number, lng: number) => {
    if (!isAdmin) {
      handleRequestAdminAuth('add_nursery');
      return;
    }
    setAddCoords({ lat, lng });
    setIsAddModalOpen(true);
  };

  const handleResetToDefaults = () => {
    if (!isAdmin) {
      handleRequestAdminAuth('edit_data');
      return;
    }
    if (confirm('Réinitialiser la base de données cartographique avec les pépinières officielles de référence ?')) {
      setNurseries(INITIAL_NURSERIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NURSERIES));
      localStorage.removeItem(CUSTOM_DATA_KEY);
      showToast('Couches réinitialisées avec succès.');
    }
  };

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const tab = getInitialTab();
      setActiveTab(tab);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const targetHash = tab === 'map' ? 'geoportail' : tab === 'home' ? '' : tab;
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash !== targetHash) {
        if (targetHash) {
          window.history.pushState(null, '', `#${targetHash}`);
        } else {
          window.history.pushState(null, '', window.location.pathname + window.location.search);
        }
      }
    }
  };

  const handleViewOnMap = (nursery: Nursery) => {
    setSelectedNursery(null);
    handleNavigate('map');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-600 bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-700/60 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header matching mockup */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'add') {
            if (!isAdmin) {
              handleRequestAdminAuth('add_nursery');
            } else {
              setAddCoords(null);
              setIsAddModalOpen(true);
            }
          } else {
            handleNavigate(tab);
          }
        }}
        totalNurseries={nurseries.length}
        isAdmin={isAdmin}
        currentAdmin={currentAdmin}
        onOpenLoginModal={() => handleRequestAdminAuth('general')}
        onLogoutAdmin={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenLocalSetupModal={() => setIsLocalSetupModalOpen(true)}
      />

      {/* Dynamic Content View */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            nurseries={nurseries}
            onNavigate={(tab) => {
              if (tab === 'add') {
                if (!isAdmin) {
                  handleRequestAdminAuth('add_nursery');
                } else {
                  handleNavigate('admin');
                }
              } else {
                handleNavigate(tab);
              }
            }}
            onSelectNursery={(n) => setSelectedNursery(n)}
            onOpenAboutModal={() => handleNavigate('about')}
            onOpenLoginModal={() => handleRequestAdminAuth('general')}
            onOpenLocalSetupModal={() => setIsLocalSetupModalOpen(true)}
          />
        )}

        {activeTab === 'about' && (
          <AboutView onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'contact' && (
          <ContactView onOpenAdminLogin={() => handleRequestAdminAuth('general')} />
        )}

        {activeTab === 'map' && (
          <MapPortal
            nurseries={nurseries}
            onSelectNursery={(n) => setSelectedNursery(n)}
            onOpenAddModalWithCoords={handleOpenAddModalWithCoords}
            onNavigateToAdmin={() => setActiveTab('admin')}
            isAdmin={isAdmin}
            onRequestAdminAuth={handleRequestAdminAuth}
            customAbomeyBoundary={customAbomeyBoundary}
            onUpdateAbomeyBoundary={handleUpdateAbomeyBoundary}
            customLayers={customLayers}
            onAddCustomLayer={handleAddCustomLayer}
            onRemoveCustomLayer={handleRemoveCustomLayer}
            onToggleCustomLayer={handleToggleCustomLayer}
            onUpdateCustomLayerColor={handleUpdateCustomLayerColor}
            onImportNurseries={(imported, mode) => {
              if (mode === 'replace') handleReplaceNurseries(imported);
              else handleMergeNurseries(imported);
            }}
          />
        )}

        {activeTab === 'list' && (
          <NurseryList
            nurseries={nurseries}
            onSelectNursery={(n) => setSelectedNursery(n)}
            onViewOnMap={handleViewOnMap}
            onExportGeoJSON={handleExportGeoJSON}
            isAdmin={isAdmin}
            onRequestAdminAuth={handleRequestAdminAuth}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsView
            nurseries={nurseries}
            onSelectNursery={(n) => setSelectedNursery(n)}
          />
        )}

        {(activeTab === 'data_files' || activeTab === 'ressources') && (
          <DataFileManager
            nurseries={nurseries}
            onImportNurseries={handleImportNurseries}
            isAdmin={isAdmin}
            onRequestAdminAuth={handleRequestAdminAuth}
            onResetToDefaults={handleResetToDefaults}
            onSyncWithServerFile={() => syncWithServerFile(true)}
            onAddCustomLayer={handleAddCustomLayer}
            onNavigateToMap={() => setActiveTab('map')}
            customLayers={customLayers}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            nurseries={nurseries}
            onOpenAddModal={() => {
              setAddCoords(null);
              setIsAddModalOpen(true);
            }}
            onDeleteNursery={handleDeleteNursery}
            onSelectNursery={(n) => setSelectedNursery(n)}
            onNavigateToDataFiles={() => setActiveTab('data_files')}
            onNavigateToMap={() => setActiveTab('map')}
            isAdmin={isAdmin}
            currentAdmin={currentAdmin}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onReplaceNurseries={handleReplaceNurseries}
            onMergeNurseries={handleMergeNurseries}
            onResetToDefaults={handleResetToDefaults}
            onOpenReplaceModal={() => setIsReplaceModalOpen(true)}
            onUpdateNursery={handleUpdateNursery}
            customAbomeyBoundary={customAbomeyBoundary}
            onUpdateAbomeyBoundary={handleUpdateAbomeyBoundary}
          />
        )}
      </main>

      {/* Admin Login & Validation Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        reason={loginReason}
      />

      {/* Replace & Import Nursery Data Modal (Strictly Admin only) */}
      <ReplaceDataModal
        isOpen={isReplaceModalOpen && isAdmin}
        onClose={() => setIsReplaceModalOpen(false)}
        currentNurseriesCount={nurseries.length}
        onReplaceData={handleReplaceNurseries}
        onMergeData={handleMergeNurseries}
        isAdmin={isAdmin}
        onRequestAdmin={() => handleRequestAdminAuth('edit_data')}
      />

      {/* Add Nursery Modal (Only accessible for authenticated Admin) */}
      <AddNurseryModal
        isOpen={isAddModalOpen && isAdmin}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddCoords(null);
        }}
        onAddNursery={handleAddNursery}
        initialCoords={addCoords}
      />

      {/* Nursery Detail Modal (Publicly accessible with photo changer) */}
      <NurseryDetailModal
        nursery={selectedNursery}
        onClose={() => setSelectedNursery(null)}
        onViewOnMap={handleViewOnMap}
        onUpdateNursery={handleUpdateNursery}
        isAdmin={isAdmin}
      />

      {/* Local Setup & Direct Link Guide Modal */}
      <LocalSetupModal
        isOpen={isLocalSetupModalOpen}
        onClose={() => setIsLocalSetupModalOpen(false)}
        onNavigateToMap={() => handleNavigate('map')}
      />

      {/* Footer matching mockup "propo acceul.png" */}
      {activeTab !== 'map' && (
        <footer className="bg-slate-950 text-slate-400 text-xs border-t-2 border-emerald-600 py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <Logo size="md" white showSlogan />
                <p className="text-[11px] text-slate-500 max-w-md">
                  Plateforme cartographique officielle pour le suivi sylvicole et agroforestier du Département du Zou et de la Commune d'Abomey.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-5 text-slate-300 text-xs font-semibold">
                <button
                  onClick={() => handleNavigate('home')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  Accueil
                </button>
                <button
                  onClick={() => handleNavigate('about')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  À propos
                </button>
                <button
                  onClick={() => handleNavigate('map')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Géoportail</span>
                </button>
                <button
                  onClick={() => setIsLocalSetupModalOpen(true)}
                  className="text-amber-300 hover:text-amber-200 transition cursor-pointer"
                >
                  Lien &amp; Dossier Local
                </button>
                <button
                  onClick={() => handleNavigate('stats')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  Statistiques
                </button>
                <button
                  onClick={() => handleNavigate('data_files')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  Ressources GeoJSON
                </button>
                <button
                  onClick={() => handleNavigate('contact')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  Contact
                </button>
                <button
                  onClick={() => {
                    if (isAdmin) {
                      handleNavigate('admin');
                    } else {
                      handleRequestAdminAuth('general');
                    }
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAdmin ? 'Espace Admin' : 'Connexion Admin'}</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span>&copy; 2025&ndash;2026 BENIN-PEPI. Tous droits réservés.</span>
                <span>&middot;</span>
                <button onClick={() => handleNavigate('about')} className="hover:text-slate-300 cursor-pointer">Mentions légales</button>
                <span>&middot;</span>
                <button onClick={() => handleNavigate('contact')} className="hover:text-slate-300 cursor-pointer">Contact</button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLocalSetupModalOpen(true)}
                  className="text-emerald-400 hover:underline cursor-pointer font-mono"
                >
                  Guide local (npm run dev)
                </button>
                <span>&middot;</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-emerald-400 font-semibold border border-slate-800">
                  <span>🇧🇯</span>
                  <span>République du Bénin</span>
                </span>
                <span className="text-slate-600 font-mono">EPSG:4326 (WGS84)</span>
              </div>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
