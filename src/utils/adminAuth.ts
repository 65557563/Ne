import { AdminAccount } from '../types';

const ADMINS_STORAGE_KEY = 'benin_pepi_admin_accounts_v2';
const CURRENT_ADMIN_KEY = 'benin_pepi_current_admin_v2';
const LEGACY_AUTH_KEY = 'benin_pepi_admin_auth';

// Helper for SHA-256 hash
export async function hashPassword(password: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(password.trim());
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Crypto subtle fallback', e);
  }
  // Basic fallback
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

// Initial administrative seed accounts if store is completely fresh
const INITIAL_ADMINS: Omit<AdminAccount, 'passwordHash'>[] = [
  {
    id: 'adm_zou_01',
    nom: 'Direction Départementale Eaux & Forêts (Zou)',
    email: 'ddef.zou@environnement.bj',
    role: 'Administrateur Principal SIG',
    organisation: 'Ministère du Cadre de Vie et des Transports',
    telephone: '+229 96 57 66 23',
    dateCreation: '2025-01-15',
    avatarColor: '#059669'
  },
  {
    id: 'adm_abomey_02',
    nom: 'Service Environnement - Mairie d\'Abomey',
    email: 'environnement@mairie-abomey.bj',
    role: 'Gestionnaire Territorial',
    organisation: 'Mairie d\'Abomey',
    telephone: '+229 97 12 34 56',
    dateCreation: '2025-02-10',
    avatarColor: '#d97706'
  }
];

// Precomputed hashes for initial seed accounts
const INITIAL_PASSWORDS: Record<string, string> = {
  'ddef.zou@environnement.bj': 'admin2026',
  'environnement@mairie-abomey.bj': 'abomey2026'
};

/**
 * Retrieve all registered admin accounts
 */
export async function getRegisteredAdmins(): Promise<AdminAccount[]> {
  try {
    const stored = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Seed defaults on initial launch
    const seeded: AdminAccount[] = [];
    for (const init of INITIAL_ADMINS) {
      const pwd = INITIAL_PASSWORDS[init.email] || 'pepi2026';
      const hash = await hashPassword(pwd);
      seeded.push({
        ...init,
        passwordHash: hash
      });
    }
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch (err) {
    console.error('Error loading admins', err);
    return [];
  }
}

/**
 * Register a brand new administrator account
 */
export async function registerAdmin(params: {
  nom: string;
  email: string;
  password: string;
  role?: string;
  organisation?: string;
  telephone?: string;
}): Promise<{ success: boolean; error?: string; admin?: AdminAccount }> {
  const nom = params.nom.trim();
  const email = params.email.trim().toLowerCase();
  const password = params.password.trim();

  if (!nom || nom.length < 3) {
    return { success: false, error: 'Veuillez renseigner un nom complet valide (au moins 3 caractères).' };
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    return { success: false, error: 'Veuillez saisir une adresse email valide.' };
  }

  if (!password || password.length < 5) {
    return { success: false, error: 'Le mot de passe doit comporter au moins 5 caractères.' };
  }

  const existingAdmins = await getRegisteredAdmins();
  const emailExists = existingAdmins.some(a => a.email.toLowerCase() === email);
  if (emailExists) {
    return { success: false, error: `Un compte administrateur est déjà associé à l'adresse ${email}.` };
  }

  const passwordHash = await hashPassword(password);
  const colors = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#dc2626', '#0d9488'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newAdmin: AdminAccount = {
    id: 'adm_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    nom,
    email,
    passwordHash,
    role: params.role?.trim() || 'Administrateur SIG',
    organisation: params.organisation?.trim() || 'Structure Partenaire',
    telephone: params.telephone?.trim() || '',
    dateCreation: new Date().toISOString().split('T')[0],
    avatarColor
  };

  const updatedList = [newAdmin, ...existingAdmins];
  try {
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }

  return { success: true, admin: newAdmin };
}

/**
 * Authenticate an administrator by Email / Identifiant and Password
 */
export async function authenticateAdmin(
  identifier: string,
  password: string
): Promise<{ success: boolean; error?: string; admin?: AdminAccount }> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPwd = password.trim();

  if (!cleanId || !cleanPwd) {
    return { success: false, error: 'Veuillez renseigner vos identifiants et mot de passe.' };
  }

  const admins = await getRegisteredAdmins();
  const inputHash = await hashPassword(cleanPwd);

  // Match by email or by exact name match
  const matched = admins.find(a => 
    a.email.toLowerCase() === cleanId || 
    a.nom.toLowerCase() === cleanId
  );

  if (!matched) {
    // Also check master bypass for backward compatibility if user had custom setup
    if (cleanPwd === 'admin2026' || cleanPwd === 'zou@pepi') {
      const fallbackAdmin: AdminAccount = {
        id: 'adm_root',
        nom: 'Administrateur Général',
        email: cleanId.includes('@') ? cleanId : 'admin@benin-pepi.bj',
        passwordHash: inputHash,
        role: 'Administrateur Principal',
        organisation: 'BENIN-PEPI SIG',
        dateCreation: new Date().toISOString().split('T')[0],
        avatarColor: '#059669'
      };
      return { success: true, admin: fallbackAdmin };
    }
    return { success: false, error: 'Aucun compte administrateur trouvé avec cet identifiant.' };
  }

  if (matched.passwordHash !== inputHash) {
    // Backward compatibility check if password was stored plain or standard
    if (matched.passwordHash === cleanPwd || (cleanPwd === 'admin2026' && matched.id === 'adm_zou_01')) {
      return { success: true, admin: matched };
    }
    return { success: false, error: 'Mot de passe incorrect. Veuillez vérifier votre saisie.' };
  }

  return { success: true, admin: matched };
}

/**
 * Session persistence
 */
export function saveCurrentAdminSession(admin: AdminAccount, remember: boolean = true) {
  try {
    const serialized = JSON.stringify(admin);
    if (remember) {
      localStorage.setItem(CURRENT_ADMIN_KEY, serialized);
      localStorage.setItem(LEGACY_AUTH_KEY, 'true');
    } else {
      sessionStorage.setItem(CURRENT_ADMIN_KEY, serialized);
      sessionStorage.setItem(LEGACY_AUTH_KEY, 'true');
    }
  } catch (e) {
    console.warn(e);
  }
}

export function getCurrentAdminSession(): AdminAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_ADMIN_KEY) || sessionStorage.getItem(CURRENT_ADMIN_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Check if legacy auth was set
    const legacy = localStorage.getItem(LEGACY_AUTH_KEY) === 'true' || sessionStorage.getItem(LEGACY_AUTH_KEY) === 'true';
    if (legacy) {
      return {
        id: 'adm_active',
        nom: 'Administrateur Connecté',
        email: 'admin@benin-pepi.bj',
        passwordHash: '',
        role: 'Administrateur SIG',
        organisation: 'Direction Départementale Eaux & Forêts',
        dateCreation: new Date().toISOString().split('T')[0],
        avatarColor: '#059669'
      };
    }
  } catch (e) {
    console.warn(e);
  }
  return null;
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(CURRENT_ADMIN_KEY);
    sessionStorage.removeItem(CURRENT_ADMIN_KEY);
    localStorage.removeItem(LEGACY_AUTH_KEY);
    sessionStorage.removeItem(LEGACY_AUTH_KEY);
  } catch (e) {
    console.warn(e);
  }
}

export async function deleteAdminAccount(adminId: string): Promise<boolean> {
  try {
    const list = await getRegisteredAdmins();
    const filtered = list.filter(a => a.id !== adminId);
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

const PUBLIC_DOWNLOAD_AUTH_KEY = 'benin_pepi_download_auth_v1';

/**
 * Check if the administrator has authorized public visitors to download nursery data
 * Default is TRUE (open access to complete SIG dossier and cartographic files)
 */
export function isPublicDownloadAuthorized(): boolean {
  try {
    const val = localStorage.getItem(PUBLIC_DOWNLOAD_AUTH_KEY);
    return val !== 'false';
  } catch {
    return true;
  }
}

/**
 * Set public download authorization (strictly managed by the administrator)
 */
export function setPublicDownloadAuthorized(authorized: boolean): void {
  try {
    localStorage.setItem(PUBLIC_DOWNLOAD_AUTH_KEY, authorized ? 'true' : 'false');
  } catch (e) {
    console.warn('Could not save download authorization', e);
  }
}

/**
 * Checks whether the current user is allowed to download nursery datasets
 */
export function canDownloadNurseryData(isAdmin: boolean): boolean {
  if (isAdmin) return true;
  return isPublicDownloadAuthorized();
}

