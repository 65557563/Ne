import React from 'react';
import { Nursery } from '../types';
import { 
  TreePine, 
  GraduationCap, 
  Store, 
  MapPin, 
  Sprout, 
  TrendingUp, 
  BarChart, 
  Award,
  Users
} from 'lucide-react';

interface StatisticsViewProps {
  nurseries: Nursery[];
  onSelectNursery: (nursery: Nursery) => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  nurseries,
  onSelectNursery
}) => {
  const total = nurseries.length;
  const ecoles = nurseries.filter(n => n.type === 'ecole').length;
  const privees = nurseries.filter(n => n.type === 'privee').length;
  const pctEcole = total > 0 ? Math.round((ecoles / total) * 100) : 0;
  const pctPrivee = 100 - pctEcole;

  const totalPlants = nurseries.reduce((acc, n) => acc + (n.capaciteAnnuelle || 0), 0);
  
  // Breakdown by commune
  const communeMap: Record<string, number> = {};
  nurseries.forEach(n => {
    communeMap[n.commune] = (communeMap[n.commune] || 0) + 1;
  });
  const communesSorted = Object.entries(communeMap).sort((a, b) => b[1] - a[1]);

  // Breakdown by species
  const speciesMap: Record<string, number> = {};
  nurseries.forEach(n => {
    n.especes.forEach(sp => {
      speciesMap[sp] = (speciesMap[sp] || 0) + 1;
    });
  });
  const speciesSorted = Object.entries(speciesMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Statistiques & Indicateurs Sylvicoles
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Analyse spatiale et capacitaire des pépinières du Département du Zou et de la commune d'Abomey
        </p>
      </div>

      {/* KPI Cards (Faithful to Mockup #4 Tableau de bord) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total pépinières */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <TreePine className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Total pépinières</div>
            <div className="text-3xl font-black text-slate-900 mt-0.5">{total}</div>
            <div className="text-[11px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
              <span>Dans le Zou</span>
            </div>
          </div>
        </div>

        {/* Pépinières écoles */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Pépinières écoles</div>
            <div className="text-3xl font-black text-blue-950 mt-0.5">{ecoles}</div>
            <div className="text-[11px] text-blue-700 font-bold mt-0.5">
              {pctEcole}% de l'ensemble
            </div>
          </div>
        </div>

        {/* Pépinières privées */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Pépinières privées</div>
            <div className="text-3xl font-black text-amber-950 mt-0.5">{privees}</div>
            <div className="text-[11px] text-amber-700 font-bold mt-0.5">
              {pctPrivee}% de l'ensemble
            </div>
          </div>
        </div>

        {/* Communes couvertes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Communes couvertes</div>
            <div className="text-3xl font-black text-purple-950 mt-0.5">{communesSorted.length}</div>
            <div className="text-[11px] text-purple-700 font-bold mt-0.5">
              Plateau d'Abomey & Zou
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart: Répartition par type (as shown in Mockup #4) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Répartition par type</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution entre écoles et exploitations privées</p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center">
            {/* Donut graphic representation */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="5"
                />
                {/* School circle segment */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#0B6B3A"
                  strokeWidth="5"
                  strokeDasharray={`${pctEcole} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Central text percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-emerald-950">{pctEcole}%</span>
                <span className="text-[11px] text-slate-500 font-bold">Écoles</span>
              </div>
            </div>

            {/* Legend underneath */}
            <div className="flex items-center justify-center gap-6 mt-6 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-700" />
                <span>Pépinières écoles ({ecoles})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <span>Pépinières privées ({privees})</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
            <span className="font-semibold">Capacité globale cumulée :</span>
            <span className="font-black text-sm">{totalPlants.toLocaleString()} plants/an</span>
          </div>
        </div>

        {/* Breakdown by Commune Bar Charts */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Densité par Commune (Département du Zou)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Nombre de pépinières géo-référencées par collectivité</p>
          </div>

          <div className="space-y-3 pt-2">
            {communesSorted.map(([commune, count]) => {
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={commune} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{commune}</span>
                    <span className="text-slate-500 font-mono">{count} pépinière(s) &middot; {percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top tree species badge cloud */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Essences arboricoles les plus produites dans le Zou
            </h4>
            <div className="flex flex-wrap gap-2">
              {speciesSorted.map(([sp, count]) => (
                <span
                  key={sp}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 transition flex items-center gap-1.5"
                >
                  <span>🌿 {sp}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-slate-500 text-[10px] font-bold">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
