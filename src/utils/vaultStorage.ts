import { AthleteProfile } from '../types';
import { getStorageItem, setStorageItem } from './storage';

const AVATAR_REF_PREFIX = '__avatar__:';
const AVATAR_SIZE_WARN = 200_000;

export function avatarStorageKey(profileId: string): string {
  return `iron_mat_avatar_${profileId}`;
}

function stripLargeAvatars(profiles: AthleteProfile[]): AthleteProfile[] {
  return profiles.map((p) => {
    if (p.avatarUrl?.startsWith('data:') && p.avatarUrl.length > AVATAR_SIZE_WARN) {
      setStorageItem(avatarStorageKey(p.id), p.avatarUrl);
      return { ...p, avatarUrl: `${AVATAR_REF_PREFIX}${p.id}` };
    }
    return p;
  });
}

function resolveAvatarRefs(profiles: AthleteProfile[]): AthleteProfile[] {
  return profiles.map((p) => {
    if (p.avatarUrl?.startsWith(AVATAR_REF_PREFIX)) {
      const id = p.avatarUrl.slice(AVATAR_REF_PREFIX.length);
      const stored = getStorageItem(avatarStorageKey(id));
      if (stored) return { ...p, avatarUrl: stored };
    }
    return p;
  });
}

export function loadVaultFromStorage(): {
  profiles: AthleteProfile[];
  currentProfileId: string;
} | null {
  const saved = getStorageItem('iron_mat_vault_v3');
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    if (parsed && Array.isArray(parsed.profiles) && parsed.currentProfileId) {
      return {
        ...parsed,
        profiles: resolveAvatarRefs(parsed.profiles),
      };
    }
  } catch (e) {
    console.error('Failed loading local athlete ledger', e);
  }
  return null;
}

export function saveVaultToStorage(vault: {
  profiles: AthleteProfile[];
  currentProfileId: string;
}): boolean {
  const stripped = stripLargeAvatars(vault.profiles);
  return setStorageItem('iron_mat_vault_v3', JSON.stringify({ ...vault, profiles: stripped }));
}
