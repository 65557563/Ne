import React from 'react';
import { ActiveTab } from '../types';
import { 
  TreePine, 
  MapPin, 
  Compass, 
  CheckCircle2, 
  Award, 
  GraduationCap, 
  Store, 
  Globe2, 
  FileCode2, 
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Tag,
  Layers,
  Sparkles
} from 'lucide-react';

interface AboutViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
          <Globe2 className="w-3.5 h-3.5" />
          <span>À propos du projet</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Un outil géospatial au service des pépinières du Bénin
        </h1>
        <p className="text-base text-slate-600 mt-3 leading-relaxed">
          BENIN-PEPI centralise, sécurise et valorise les informations géographiques sur les pépinières écoles et privées du Département du Zou et de la commune d'Abomey.
        </p>
      </div>

      {/* Official Project Résumé / Scientific Abstract Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-700/50 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Résumé Scientifique &amp; Note de Cadrage</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            Conception et mise en place d'un géoportail des pépinières écoles et privées dans le département du Zou : cas de la commune d'Abomey, République du Bénin
          </h2>

          <div className="border-l-4 border-[#3cd070] pl-4 sm:pl-6 my-4 py-1">
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed text-justify font-normal">
              Dans un contexte mondial marqué par l'urgence de la restauration des écosystèmes, les pépinières constituent des infrastructures stratégiques pour la production de plants forestiers et la réussite des campagnes de reboisement. Au Bénin, et plus particulièrement dans le département du Zou, les pépinières écoles et privées jouent un rôle central dans cet approvisionnement, mais leur gestion demeure entravée par la dispersion des données, l'absence de base centralisée et les difficultés de localisation et de suivi. Ce travail, intitulé « Conception et mise en place d'un géoportail des pépinières écoles et privées dans le département du Zou : cas de la commune d'Abomey, République du Bénin », vise à concevoir un outil numérique interactif permettant de centraliser, spatialiser et diffuser ces informations, afin d'appuyer la planification et la prise de décision des acteurs de la filière. La démarche a combiné une recherche documentaire et des travaux de terrain menés dans la commune d'Abomey, retenue comme périmètre d'étude au sein du département du Zou : géolocalisation, caractérisation des pépinières (statut, espèces, capacités, équipements, sources d'eau) et traitement géomatique structuré, de la modélisation d'une base de données géospatiale jusqu'aux analyses spatiales de répartition, de densité et d'accessibilité à l'échelle communale. L'ensemble a débouché sur un géoportail web offrant navigation cartographique, recherche, filtres par type ou espèce, consultation de fiches attributaires et de photographies, et production de cartes thématiques. Les pépinières recensées à Abomey présentent une répartition inégale selon les quartiers et arrondissements, certains secteurs de la commune restant nettement moins couverts que d'autres en infrastructures de production. En rendant cette information accessible à l'administration forestière, à la mairie d'Abomey, aux établissements scolaires, aux promoteurs privés et aux porteurs de projets de reboisement, le géoportail constitue un outil concret d'appui à la gouvernance des ressources végétales, transposable par la suite aux autres communes du département du Zou.
            </p>
          </div>

          {/* Mots-clés */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 mr-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Mots-clés :</span>
            </span>
            {['géoportail', 'pépinières écoles', 'pépinières privées', 'SIG', 'base de données géospatiale', 'analyse spatiale', 'webmapping', 'Abomey'].map((kw) => (
              <span 
                key={kw} 
                className="bg-black/50 border border-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-[11px] font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Cartographie &amp; Géolocalisation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Localisation précise par coordonnées GPS WGS84 de l'ensemble des sites de production sylvicole, avec délimitation des frontières administratives d'Abomey et du Zou.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Pépinières École</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Encadrement des initiatives pédagogiques au sein des collèges, lycées et écoles de formation (ex: ENI Abomey) pour transmettre aux apprenants la culture de l'arbre et du reboisement.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Pépinières Privées</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Valorisation des producteurs agroforestiers locaux, fourniture de plants fruitiers greffés et d'essences de bois d'œuvre pour les projets de reforestation.
          </p>
        </div>

      </div>

      {/* Context & Technical Standards */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900">
            Objectifs environnementaux et sylvicoles
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            La République du Bénin s'est engagée dans d'ambitieux programmes de restauration du couvert végétal. BENIN-PEPI répond au besoin des planificateurs, ONG, administration forestière et collectivités territoriales en fournissant un inventaire exhaustif et actualisé en temps réel.
          </p>

          <ul className="space-y-2 text-xs font-semibold text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Référencement standardisé au format GeoJSON (EPSG:4326)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Suivi capacitaire annuel des plants produits par essence</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Accès public sécurisé en lecture seule et espace administrateur dédié</span>
            </li>
          </ul>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('map')}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Explorer la carte interactive &rarr;
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-emerald-400 font-bold">
            <span>Données &amp; Spécifications SIG</span>
            <span>v1.0 Bénin</span>
          </div>
          <div className="space-y-2 text-slate-300">
            <div><strong className="text-amber-300">Département :</strong> Zou (9 Communes)</div>
            <div><strong className="text-amber-300">Commune pilote :</strong> Abomey (7 Arrondissements)</div>
            <div><strong className="text-amber-300">Catégories :</strong> Pépinières École &amp; Pépinières Privées</div>
            <div><strong className="text-amber-300">Projection :</strong> WGS 84 / Geographic (EPSG:4326)</div>
            <div><strong className="text-amber-300">Couches :</strong> PEPI_BENIN.geojson, Commune_abomey.geojson, departement_zou.geojson</div>
            <div><strong className="text-amber-300">Fonds de carte :</strong> Imagerie Satellite, OpenStreetMap, Relief Topo</div>
          </div>
        </div>
      </div>

    </div>
  );
};

