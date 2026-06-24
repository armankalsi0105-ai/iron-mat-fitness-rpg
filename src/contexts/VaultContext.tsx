import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AthleteProfile } from '../types';
import {
  VaultState,
  createEmptyProfile,
  loadVault,
  persistVault,
  updateProfileInVault,
} from '../services/vaultService';
import { detectMissedWorkouts } from '../services/insightsService';

interface VaultContextValue {
  vault: VaultState;
  activeProfile: AthleteProfile;
  storageSaveFailed: boolean;
  updateActiveProfile: (updater: (prev: AthleteProfile) => AthleteProfile) => void;
  flushVault: () => void;
  setCurrentProfileId: (id: string) => void;
  createProfile: (name: string) => void;
  deleteProfile: (id: string) => void;
  addBodyWeight: (weight: number) => void;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [vault, setVault] = useState<VaultState>(loadVault);
  const [storageSaveFailed, setStorageSaveFailed] = useState(false);

  const activeProfile = useMemo(
    () => vault.profiles.find((p) => p.id === vault.currentProfileId) ?? vault.profiles[0],
    [vault]
  );

  // Debounce writes so rapid updates (logging a set fires several state updates)
  // collapse into a single localStorage write, while a synchronous flush on
  // tab-hide/unload guarantees nothing is lost.
  const latestVaultRef = useRef(vault);
  latestVaultRef.current = vault;
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushVault = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    const ok = persistVault(latestVaultRef.current);
    setStorageSaveFailed(!ok);
  }, []);

  useEffect(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flushVault, 400);
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, [vault, flushVault]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushVault();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flushVault);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flushVault);
      flushVault();
    };
  }, [flushVault]);

  useEffect(() => {
    setVault((prev) => {
      const profile = prev.profiles.find((p) => p.id === prev.currentProfileId);
      if (!profile) return prev;
      const migrated = detectMissedWorkouts(profile);
      if (migrated === profile) return prev;
      return updateProfileInVault(prev, profile.id, () => migrated);
    });
  }, []);

  const updateActiveProfile = useCallback((updater: (prev: AthleteProfile) => AthleteProfile) => {
    setVault((prev) => updateProfileInVault(prev, prev.currentProfileId, updater));
  }, []);

  const setCurrentProfileId = useCallback((id: string) => {
    setVault((prev) => ({ ...prev, currentProfileId: id }));
  }, []);

  const createProfile = useCallback((name: string) => {
    const fresh = createEmptyProfile(name);
    setVault((prev) => ({
      profiles: [...prev.profiles, fresh],
      currentProfileId: fresh.id,
    }));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setVault((prev) => {
      if (prev.profiles.length <= 1) return prev;
      const filtered = prev.profiles.filter((p) => p.id !== id);
      return {
        profiles: filtered,
        currentProfileId: prev.currentProfileId === id ? filtered[0].id : prev.currentProfileId,
      };
    });
  }, []);

  const addBodyWeight = useCallback((weight: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    updateActiveProfile((prev) => ({
      ...prev,
      weight,
      bodyWeightLogs: [...(prev.bodyWeightLogs ?? []), { date: todayStr, weight }],
    }));
  }, [updateActiveProfile]);

  const value = useMemo(
    () => ({
      vault,
      activeProfile,
      storageSaveFailed,
      updateActiveProfile,
      flushVault,
      setCurrentProfileId,
      createProfile,
      deleteProfile,
      addBodyWeight,
    }),
    [vault, activeProfile, storageSaveFailed, updateActiveProfile, flushVault, setCurrentProfileId, createProfile, deleteProfile, addBodyWeight]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within VaultProvider');
  return ctx;
}
