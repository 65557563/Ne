import L from 'leaflet';
import { Nursery, NurseryType } from '../types';

export type TreeIconCategory = 
  | 'ecole' 
  | 'privee' 
  | 'teck' 
  | 'fruitier' 
  | 'palmier' 
  | 'acacia' 
  | 'baobab' 
  | 'jeune_plant';

// 1. Pépinière École (Forestier & Pédagogique) - Deep green with graduate white leaf
export const TREE_ECOLE_SVG = `
<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
  <circle cx="19" cy="19" r="18" fill="#FFFFFF" fill-opacity="0.9" stroke="#059669" stroke-width="1.5" />
  <!-- Tree Crown -->
  <circle cx="19" cy="14" r="9" fill="#047857" />
  <circle cx="13" cy="16" r="6.5" fill="#10B981" />
  <circle cx="25" cy="16" r="6.5" fill="#065F46" />
  <circle cx="19" cy="10" r="6" fill="#34D399" opacity="0.8" />
  <!-- Trunk -->
  <path d="M17 21 L17 31 C17 31.8 17.8 32.5 19 32.5 C20.2 32.5 21 31.8 21 31 L21 21 Z" fill="#78350F" />
  <!-- Graduation / Book White Badge -->
  <path d="M19 9 L24 12 L19 15 L14 12 Z" fill="#FFFFFF" />
  <path d="M22 14.5 V17 C22 18 19 19.5 19 19.5 C19 19.5 16 18 16 17 V14.5" stroke="#FFFFFF" stroke-width="1.2" fill="none" />
</svg>
`;

// 2. Pépinière Privée (Commerciale & GIE) - Golden amber with star
export const TREE_PRIVEE_SVG = `
<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
  <circle cx="19" cy="19" r="18" fill="#FFFFFF" fill-opacity="0.9" stroke="#D97706" stroke-width="1.5" />
  <!-- Tree Crown Orange/Ambre -->
  <circle cx="19" cy="14" r="9" fill="#F59E0B" />
  <circle cx="13" cy="16" r="6.5" fill="#FBBF24" />
  <circle cx="25" cy="16" r="6.5" fill="#B45309" />
  <circle cx="19" cy="10" r="6" fill="#FCD34D" opacity="0.8" />
  <!-- Trunk -->
  <path d="M17 21 L17 31 C17 31.8 17.8 32.5 19 32.5 C20.2 32.5 21 31.8 21 31 L21 21 Z" fill="#78350F" />
  <!-- Golden Store / Commercial Sprout -->
  <circle cx="19" cy="13" r="3" fill="#FFFBEB" stroke="#92400E" stroke-width="1" />
</svg>
`;

// 3. Teck & Bois d'Œuvre (Tectona grandis, Eucalyptus, Khaya) - Conical / Triangular tall forestry tree
export const TREE_TECK_SVG = `
<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
  <circle cx="19" cy="19" r="18" fill="#FFFFFF" fill-opacity="0.9" stroke="#0F766E" stroke-width="1.5" />
  <!-- Layered Conical Crown -->
  <polygon points="19,5 28,15 10,15" fill="#0D9488" />
  <polygon points="19,10 29,20 9,20" fill="#0F766E" />
  <polygon points="19,15 31,26 7,26" fill="#115E59" />
  <!-- Trunk -->
  <path d="M17 26 L17 33 C17 33.5 17.8 34 19 34 C20.2 34 21 33.5 21 33 L21 26 Z" fill="#451A03" />
  <circle cx="19" cy="15" r="2.2" fill="#99F6E4" />
</svg>
`;

// 4. Arbres Fruitiers (Manguier greffé, Agrumes, Oranger, Avocatier) - Lush rounded tree with fruit dots
export const TREE_FRUITIER_SVG = `
<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
  <circle cx="19" cy="19" r="18" fill="#FFFFFF" fill-opacity="0.9" stroke="#E11D48" stroke-width="1.5" />
  <!-- Lush Dome Crown -->
  <ellipse cx="19" cy="14" rx="11" ry="9" fill="#15803D" />
  <circle cx="13" cy="14" r="6" fill="#22C55E" />
  <circle cx="25" cy="14" r="6" fill="#166534" />
  <ellipse cx="19" cy="10" rx="7" ry="5" fill="#4ADE80" opacity="0.7" />
  <!-- Trunk -->
  <path d="M17.5 21 L17 32 C17 32.5 17.8 33 19 33 C20.2 33 21 32.5 21 32 L20.5 21 Z" fill="#713F12" />
  <!-- Fruits (Mangoes / Oranges) -->
  <circle cx="15" cy="11" r="2.2" fill="#FB923C" stroke="#EA580C" stroke-width="0.6" />
  <circle cx="23" cy="12" r="2.2" fill="#FACC15" stroke="#CA8A04" stroke-width="0.6" />
  <circle cx="18" cy="16" r="2.2" fill="#FB923C" stroke="#EA580C" stroke-width="0.6" />
  <circle cx="12" cy="17" r="1.8" fill="#F87171" stroke="#DC2626" stroke-width="0.6" />
  <circle cx="25" cy="17" r="1.8" fill="#FB923C" stroke="#EA580C" stroke-width="0.6" />
</svg>
`;

// 5. Palmiers & Agroforesterie (Palmier à huile, Rônier) - Distinct tropical palm fronds
export const TREE_PALMIER_SVG = `
<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
  <circle cx="19" cy="19" r="18" fill="#FFFFFF" fill-opacity="0.9" stroke="#CA8A04" stroke-width="1.5" />
  <!-- Curved Palm Trunk -->
  <path d="M17.5 33 C18 25 18 20 20 15 L21.5 15 C19.5 20 19.5 25 20 33 Z" fill="#854D0E" />
  <!-- Palm Fronds -->
  <path d="M19 14 C15 10 9 10 6 13 C9 14 13 14 19 14 Z" fill="#15803D" />
  <path d="M19 14 C23 10 29 10 32 13 C29 14 25 14 19 14 Z" fill="#15803D" />
  <path d="M19 14 C17 8 13 5 11 6 C12 8 15 10 19 14 Z" fill="#22C55E" />
  <path d="M19 14 C21 8 25 5 27 6 C26 8 23 10 19 14 Z" fill="#16A34A" />
  <path d="M19 14 C19 7 19 4 19 4 C19 4 20 7 19 14 Z" fill="#4ADE80" />
  <!-- Palm Fruit cluster -->
  <circle cx="18" cy="16" r="1.8" fill="#DC2626" />
  <circle cx="20.5" cy="16" r="1.8" fill="#F97316" />
</svg>
`;

// 6. Acacia & Reboisement Rapide (Acacia auriculiformis) - Umbrella layered crown
export const TREE_ACACIA_SVG = `
<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
  <circle cx="19" cy="19" r="18" fill="#FFFFFF" fill-opacity="0.9" stroke="#65A30D" stroke-width="1.5" />
  <!-- Umbrella Canopy Flat Layer -->
  <ellipse cx="19" cy="9" rx="12" ry="4" fill="#65A30D" />
  <ellipse cx="19" cy="14" rx="10" ry="3.5" fill="#4D7C0F" />
  <ellipse cx="19" cy="18" rx="7" ry="2.8" fill="#3F6212" />
  <!-- Branching Trunk -->
  <path d="M19 32 L19 22 L14 14" stroke="#713F12" stroke-width="2" stroke-linecap="round" />
  <path d="M19 22 L24 14" stroke="#713F12" stroke-width="2" stroke-linecap="round" />
  <path d="M19 18 L19 10" stroke="#713F12" stroke-width="1.8" stroke-linecap="round" />
</svg>
`;

// 7. Baobab & Essences Indigènes (Adansonia digitata, Néré, Moringa) - Giant massive trunk with spread top
export const TREE_BAOBAB_SVG = `
<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
  <circle cx="19" cy="19" r="18" fill="#FFFFFF" fill-opacity="0.9" stroke="#9A3412" stroke-width="1.5" />
  <!-- Wide Baobab Trunk -->
  <path d="M13 33 C14 26 15 20 14 17 L24 17 C23 20 24 26 25 33 Z" fill="#78350F" />
  <!-- Massive Roots flair -->
  <path d="M11 33 L14 30 L24 30 L27 33 Z" fill="#592507" />
  <!-- Spreading crown branches -->
  <ellipse cx="19" cy="11" rx="13" ry="5.5" fill="#15803D" />
  <circle cx="10" cy="12" r="4.5" fill="#166534" />
  <circle cx="28" cy="12" r="4.5" fill="#15803D" />
  <circle cx="19" cy="8" r="4.5" fill="#22C55E" />
</svg>
`;

// 8. Jeune Plant & Semis (Pépinière en création) - Tender sprout emerging from fertile earth
export const TREE_JEUNE_PLANT_SVG = `
<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md">
  <circle cx="19" cy="19" r="18" fill="#FFFFFF" fill-opacity="0.9" stroke="#84CC16" stroke-width="1.5" />
  <!-- Earth Mound / Pot -->
  <path d="M10 27 C10 25 14 24 19 24 C24 24 28 25 28 27 L26 33 L12 33 Z" fill="#78350F" />
  <!-- Sprout Stem -->
  <path d="M19 25 C19 18 17 14 15 11" stroke="#65A30D" stroke-width="2.5" stroke-linecap="round" fill="none" />
  <!-- Leaves -->
  <path d="M15 11 C11 11 10 7 13 5 C16 7 17 9 15 11 Z" fill="#84CC16" />
  <path d="M17 14 C21 14 23 10 20 8 C18 10 18 12 17 14 Z" fill="#4ADE80" />
</svg>
`;

export interface TreeCategoryDetails {
  label: string;
  description: string;
  color: string;
  svg: string;
  image: string;
  badge: string;
}

export const REALISTIC_TREE_IMAGES: Record<TreeIconCategory, string> = {
  ecole: '/assets/trees/tree_ecole.jpg',
  privee: '/assets/trees/tree_privee.jpg',
  teck: '/assets/trees/tree_teck.jpg',
  fruitier: '/assets/trees/tree_fruitier.jpg',
  palmier: '/assets/trees/tree_palmier.jpg',
  acacia: '/assets/trees/tree_acacia.jpg',
  baobab: '/assets/trees/tree_baobab.jpg',
  jeune_plant: '/assets/trees/tree_jeune_plant.jpg',
};

export const TREE_CATEGORIES_INFO: Record<TreeIconCategory, TreeCategoryDetails> = {
  ecole: {
    label: 'Pépinière École (Scolaire)',
    description: 'Établissement scolaire & reboisement pédagogique',
    color: '#059669',
    svg: TREE_ECOLE_SVG,
    image: '/assets/trees/tree_ecole.jpg',
    badge: '🎓'
  },
  privee: {
    label: 'Pépinière Privée (Commerciale)',
    description: 'Exploitation commerciale, GIE & pépiniéristes',
    color: '#D97706',
    svg: TREE_PRIVEE_SVG,
    image: '/assets/trees/tree_privee.jpg',
    badge: '🏪'
  },
  teck: {
    label: "Bois d'Œuvre (Teck & Eucalyptus)",
    description: 'Tectona grandis, Eucalyptus, Khaya, Gmelina',
    color: '#0D9488',
    svg: TREE_TECK_SVG,
    image: '/assets/trees/tree_teck.jpg',
    badge: '🌲'
  },
  fruitier: {
    label: 'Arbres Fruitiers (Manguier & Agrumes)',
    description: 'Manguier greffé, Agrumes, Avocatier, Goyavier',
    color: '#E11D48',
    svg: TREE_FRUITIER_SVG,
    image: '/assets/trees/tree_fruitier.jpg',
    badge: '🥭'
  },
  palmier: {
    label: 'Palmiers & Agroforesterie',
    description: 'Palmier à huile sélectionné, Rônier, Palmacées',
    color: '#CA8A04',
    svg: TREE_PALMIER_SVG,
    image: '/assets/trees/tree_palmier.jpg',
    badge: '🌴'
  },
  acacia: {
    label: 'Acacia & Reboisement rapide',
    description: 'Acacia auriculiformis, bois d’énergie, brise-vents',
    color: '#65A30D',
    svg: TREE_ACACIA_SVG,
    image: '/assets/trees/tree_acacia.jpg',
    badge: '🌿'
  },
  baobab: {
    label: 'Baobab & Essences Indigènes',
    description: 'Adansonia digitata, Néré, Moringa, Cailcédrat',
    color: '#9A3412',
    svg: TREE_BAOBAB_SVG,
    image: '/assets/trees/tree_baobab.jpg',
    badge: '🌳'
  },
  jeune_plant: {
    label: 'Jeunes Plants & En Création',
    description: 'Sites en phase d’installation ou semis',
    color: '#84CC16',
    svg: TREE_JEUNE_PLANT_SVG,
    image: '/assets/trees/tree_jeune_plant.jpg',
    badge: '🌱'
  }
};

/**
 * Identifies the tree category for a nursery based on species, type and status
 */
export function getNurseryTreeCategory(nursery: Nursery | { type?: NurseryType; especes?: string[]; statut?: string; nom?: string; treeIcon?: TreeIconCategory }): TreeIconCategory {
  if (nursery.treeIcon && TREE_CATEGORIES_INFO[nursery.treeIcon]) {
    return nursery.treeIcon;
  }

  if (nursery.statut === 'en_creation') {
    return 'jeune_plant';
  }

  const allText = [
    ...(Array.isArray(nursery.especes) ? nursery.especes : []),
    nursery.nom || ''
  ].join(' ').toLowerCase();

  // 1. Palmier
  if (allText.includes('palmier') || allText.includes('rônier') || allText.includes('ronier') || allText.includes('palmac')) {
    return 'palmier';
  }

  // 2. Fruitier
  if (
    allText.includes('manguier') || 
    allText.includes('agrume') || 
    allText.includes('orange') || 
    allText.includes('citron') || 
    allText.includes('avocat') || 
    allText.includes('papaye') || 
    allText.includes('goyav') ||
    allText.includes('anacard') ||
    allText.includes('fruit')
  ) {
    return 'fruitier';
  }

  // 3. Teck & Timber
  if (
    allText.includes('teck') || 
    allText.includes('tectona') || 
    allText.includes('eucalyptus') || 
    allText.includes('khaya') || 
    allText.includes('gmelina') ||
    allText.includes('caïlcédrat') ||
    allText.includes('cailcedrat')
  ) {
    return 'teck';
  }

  // 4. Baobab & Indigenous
  if (allText.includes('baobab') || allText.includes('néré') || allText.includes('nere') || allText.includes('moringa')) {
    return 'baobab';
  }

  // 5. Acacia
  if (allText.includes('acacia')) {
    return 'acacia';
  }

  // 6. Fallback based on nursery type
  if (nursery.type === 'ecole') {
    return 'ecole';
  }

  return 'privee';
}

/**
 * Creates custom div icon with realistic tree icon or real nursery photo for each nursery
 */
export function createNurseryIcon(
  nurseryOrType: Nursery | NurseryType, 
  isSelected = false,
  mode: 'realistic_tree' | 'photo' = 'realistic_tree'
): L.DivIcon {
  let category: TreeIconCategory = 'ecole';
  let photoUrl: string | undefined;
  let nurseryName: string = 'Pépinière';

  if (typeof nurseryOrType === 'string') {
    category = nurseryOrType === 'ecole' ? 'ecole' : 'privee';
  } else {
    category = getNurseryTreeCategory(nurseryOrType);
    photoUrl = nurseryOrType.photoUrl;
    nurseryName = nurseryOrType.nom || 'Pépinière';
  }

  const info = TREE_CATEGORIES_INFO[category] || TREE_CATEGORIES_INFO.ecole;
  const markerImg = (mode === 'photo' && photoUrl) ? photoUrl : (info.image || '/assets/trees/tree_ecole.jpg');
  
  const size = isSelected ? 48 : 40;
  const totalHeight = size + 14;
  const pulseBorder = isSelected 
    ? 'scale-115 drop-shadow-2xl z-50' 
    : 'hover:scale-115 hover:drop-shadow-xl transition-transform';

  const ringStyle = isSelected
    ? `box-shadow: 0 0 0 3px #10B981, 0 8px 20px rgba(0,0,0,0.5);`
    : `box-shadow: 0 0 0 2px #FFFFFF, 0 4px 12px rgba(0,0,0,0.4);`;

  return L.divIcon({
    className: 'custom-realistic-tree-marker',
    html: `
      <div 
        class="pepi-realistic-pin group relative flex flex-col items-center cursor-pointer select-none transition-transform duration-200 ${pulseBorder}" 
        style="width: ${size}px; height: ${totalHeight}px;"
        title="${nurseryName} - ${info.label}"
      >
        <!-- Realistic Circular Pin Head with real photo / tree image -->
        <div 
          class="relative rounded-full overflow-hidden border-2 border-white transition-all duration-200 bg-slate-900"
          style="width: ${size}px; height: ${size}px; ${ringStyle}"
        >
          <img 
            src="${markerImg}" 
            alt="${nurseryName}" 
            class="w-full h-full object-cover rounded-full" 
            onerror="this.onerror=null; this.src='${info.image}';" 
          />
          <!-- Realistic Glass/Gloss Reflection -->
          <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-black/25 via-transparent to-white/40 pointer-events-none"></div>
        </div>

        <!-- Realistic Needle / Pointer Tip -->
        <div 
          class="w-0 h-0 -mt-[1px] border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[9px]"
          style="border-top-color: ${info.color}; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.35));"
        ></div>

        <!-- Ground Contact Shadow -->
        <div class="w-4 h-1.5 bg-black/35 rounded-full blur-[1px] mt-0.5 pointer-events-none"></div>

        <!-- Category Badge at top right -->
        <div 
          class="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-md border-1.5 border-white font-bold leading-none"
          style="background-color: ${info.color}; color: #ffffff;"
          title="${info.label}"
        >
          ${info.badge}
        </div>
      </div>
    `,
    iconSize: [size, totalHeight],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 10)]
  });
}
