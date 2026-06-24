import { useEffect, useRef } from 'react';
import { useVault } from '../contexts/VaultContext';
import { useRestTimer } from '../contexts/RestTimerContext';
import { saveWorkoutSession } from '../services/workoutSessionService';
import { getTodayISO } from '../utils/workoutDates';

/** Restore rest timer from vault on load and persist pause/dismiss state back to the session. */
export function useRestTimerPersistence() {
  const { activeProfile, updateActiveProfile } = useVault();
  const {
    timerActive,
    timerRunning,
    timerRemaining,
    timerMax,
    restoreRestTimer,
  } = useRestTimer();
  const restoredForProfileRef = useRef<string | null>(null);

  const session = activeProfile.workoutSession;
  const todayISO = getTodayISO();
  const hasTodaySession = session?.date === todayISO;

  // Restore timer HUD once per profile when the app loads with a saved session.
  useEffect(() => {
    if (!hasTodaySession || !session?.restTimer) return;
    if (restoredForProfileRef.current === activeProfile.id) return;
    restoredForProfileRef.current = activeProfile.id;
    restoreRestTimer(
      session.restTimer.remaining,
      session.restTimer.max,
      session.restTimer.running
    );
  }, [
    activeProfile.id,
    hasTodaySession,
    session?.date,
    session?.restTimer,
    restoreRestTimer,
  ]);

  // Persist pause/resume and dismiss to vault (not every tick).
  useEffect(() => {
    if (!hasTodaySession || !session) return;

    if (!timerActive) {
      if (session.restTimer) {
        updateActiveProfile((prev) =>
          saveWorkoutSession(prev, { day: session.day, restTimer: undefined })
        );
      }
      return;
    }

    const existing = session.restTimer;
    if (
      existing?.remaining === timerRemaining &&
      existing?.max === timerMax &&
      existing?.running === timerRunning
    ) {
      return;
    }

    updateActiveProfile((prev) =>
      saveWorkoutSession(prev, {
        day: session.day,
        restTimer: { remaining: timerRemaining, max: timerMax, running: timerRunning },
      })
    );
  }, [
    hasTodaySession,
    session?.day,
    session?.restTimer,
    timerActive,
    timerRunning,
    timerRemaining,
    timerMax,
    updateActiveProfile,
  ]);

  // Snapshot remaining seconds before tab close / refresh.
  useEffect(() => {
    const persistRemaining = () => {
      if (!hasTodaySession || !session || !timerActive) return;
      updateActiveProfile((prev) =>
        saveWorkoutSession(prev, {
          day: session.day,
          restTimer: { remaining: timerRemaining, max: timerMax, running: timerRunning },
        })
      );
    };

    const onHide = () => {
      if (document.visibilityState === 'hidden') persistRemaining();
    };

    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', persistRemaining);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', persistRemaining);
    };
  }, [
    hasTodaySession,
    session?.day,
    timerActive,
    timerRemaining,
    timerMax,
    timerRunning,
    updateActiveProfile,
  ]);
}
