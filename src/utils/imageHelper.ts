import { Nursery } from '../types';

export const LOCAL_NURSERY_PHOTOS = [
  '/assets/pepinieres/pepi_01.jpg',
  '/assets/pepinieres/pepi_02.jpg',
  '/assets/pepinieres/pepi_03.jpg',
  '/assets/pepinieres/pepi_04.jpg',
  '/assets/pepinieres/pepi_05.jpg',
  '/assets/pepinieres/pepi_06.jpg',
  '/assets/pepinieres/pepi_07.jpg',
  '/assets/pepinieres/pepi_08.jpg',
  '/assets/pepinieres/pepi_09.jpg',
  '/assets/pepinieres/pepi_10.jpg'
];

/**
 * Generates an elegant SVG data URI as ultimate foolproof fallback
 * If an image fails or network is offline, this is guaranteed to render.
 */
export function generateSvgPlaceholder(title: string, subtitle: string, color = '#059669'): string {
  const cleanTitle = (title || 'Pépinière').substring(0, 24).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cleanSubtitle = (subtitle || 'Bénin').substring(0, 28).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#022c22"/>
        <stop offset="50%" stop-color="#064e3b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)"/>
    <circle cx="300" cy="160" r="70" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2"/>
    <g transform="translate(265, 125) scale(1.8)">
      <path d="M19 8 C16 4 10 4 7 8 C10 9 14 9 19 9 Z" fill="#34d399"/>
      <path d="M19 8 C22 4 28 4 31 8 C28 9 24 9 19 9 Z" fill="#34d399"/>
      <path d="M19 8 L19 28" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
      <circle cx="19" cy="8" r="3" fill="#6ee7b7"/>
    </g>
    <text x="300" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${cleanTitle}
    </text>
    <text x="300" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#a7f3d0" text-anchor="middle">
      ${cleanSubtitle}
    </text>
    <rect x="200" y="330" width="200" height="28" rx="14" fill="#047857" fill-opacity="0.6" stroke="#10b981" stroke-width="1"/>
    <text x="300" y="349" font-family="monospace" font-size="11" font-weight="bold" fill="#ecfdf5" text-anchor="middle">
      BENIN-PEPI &bull; TERRAIN
    </text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns a guaranteed valid, non-broken photo URL for any nursery.
 * Cycles deterministically through the 10 real nursery photos if missing or invalid.
 */
export function getNurseryPhoto(nursery?: Partial<Nursery> | null, index = 0): string {
  if (!nursery) {
    return LOCAL_NURSERY_PHOTOS[index % LOCAL_NURSERY_PHOTOS.length];
  }

  const raw = nursery.photoUrl?.trim();
  if (
    raw && 
    raw !== '' && 
    raw !== 'undefined' && 
    raw !== 'null' && 
    !raw.includes('unsplash.com') // avoid blocked/unreliable external stock photos
  ) {
    return raw;
  }

  // Derive stable index from ID or name if numeric index not provided
  let pickIndex = index;
  if (nursery.id) {
    const num = parseInt(nursery.id.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      pickIndex = num - 1;
    } else {
      let hash = 0;
      for (let i = 0; i < (nursery.id.length || 0); i++) {
        hash = (hash * 31 + nursery.id.charCodeAt(i)) % 1000;
      }
      pickIndex = Math.abs(hash);
    }
  }

  return LOCAL_NURSERY_PHOTOS[pickIndex % LOCAL_NURSERY_PHOTOS.length];
}

/**
 * Error handler for HTML <img> tags to safely fallback to a local photo
 * or inline SVG placeholder without ever showing a broken image icon.
 */
export function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  nursery?: Partial<Nursery> | null,
  fallbackIndex = 0
): void {
  const target = e.currentTarget;
  const primaryFallback = LOCAL_NURSERY_PHOTOS[fallbackIndex % LOCAL_NURSERY_PHOTOS.length];

  // If already tried primary local photo and it still failed, fallback to guaranteed SVG data URL
  if (target.src.endsWith(primaryFallback) || target.src === primaryFallback) {
    target.src = generateSvgPlaceholder(
      nursery?.nom || 'Pépinière du Bénin',
      `${nursery?.commune || 'Zou'} &bull; ${nursery?.arrondissement || 'Bénin'}`
    );
    return;
  }

  target.src = primaryFallback;
}
