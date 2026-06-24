import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Play } from 'lucide-react';
import { VaultProvider, useVault } from './contexts/VaultContext';
import { UIProvider, useUI } from './contexts/UIContext';
import { RestTimerProvider, useRestTimer } from './contexts/RestTimerContext';
import OnboardingScreen from './components/OnboardingScreen';
import AppHeader from './components/layout/AppHeader';
import BottomNav from './components/layout/BottomNav';
import RestTimerHUD from './components/layout/RestTimerHUD';
import ProfileSwitcher from './components/layout/ProfileSwitcher';
import OfflineBanner from './components/layout/OfflineBanner';
import ErrorBoundary from './components/shared/ErrorBoundary';
import Toast from './components/layout/Toast';
import TacticalCuesModal from './components/TacticalCuesModal';
import SettingsModal from './components/SettingsModal';
import AvatarCreator from './components/AvatarCreator';
import { setStorageItem } from './utils/storage';
import { useRestTimerPersistence } from './hooks/useRestTimerPersistence';

const HomeScreen = lazy(() => import('./features/home/HomeScreen'));
const WorkoutScreen = lazy(() => import('./features/workout/WorkoutScreen'));
const ProgressScreen = lazy(() => import('./features/progress/ProgressScreen'));
const ProfileScreen = lazy(() => import('./features/profile/ProfileScreen'));

function ScreenFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 border-2 border-volt-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const { activeProfile, storageSaveFailed, updateActiveProfile } = useVault();
  const {
    activeTab,
    setActiveTab,
    cuesModalState,
    setCuesModalState,
    avatarModalOpen,
    setAvatarModalOpen,
    settingsModalOpen,
    setSettingsModalOpen,
    triggerToast,
  } = useUI();
  const { timerActive } = useRestTimer();

  useRestTimerPersistence();

  const isOnboarding = activeProfile.name === 'NEW ATHLETE';

  return (
    <div className="min-h-dvh bg-ntc text-zinc-100 font-sans tracking-tight pb-28 relative overflow-x-hidden selection:bg-volt-500 selection:text-black">
      <OfflineBanner />
      {storageSaveFailed && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-rose-600 text-white text-xs font-semibold text-center px-4 py-2">
          Progress couldn&apos;t be saved — storage full or private browsing.
        </div>
      )}

      {isOnboarding ? (
        <OnboardingScreen updateActiveProfile={updateActiveProfile} />
      ) : (
        <>
          <AppHeader />
          <div className="max-w-4xl mx-auto px-4 pt-5">
            <ProfileSwitcher />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="pb-20"
              >
                <Suspense fallback={<ScreenFallback />}>
                  <ErrorBoundary screenName="Home">
                    {activeTab === 'home' && <HomeScreen />}
                  </ErrorBoundary>
                  <ErrorBoundary screenName="Workout">
                    {activeTab === 'workout' && <WorkoutScreen />}
                  </ErrorBoundary>
                  <ErrorBoundary screenName="Progress">
                    {activeTab === 'progress' && <ProgressScreen />}
                  </ErrorBoundary>
                  <ErrorBoundary screenName="Profile">
                    {activeTab === 'profile' && <ProfileScreen />}
                  </ErrorBoundary>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          <RestTimerHUD />

          {activeTab !== 'workout' && !timerActive && (
            <button
              onClick={() => setActiveTab('workout')}
              className="fixed bottom-24 right-5 z-40 bg-white hover:bg-zinc-100 text-black font-bold text-sm rounded-full px-6 py-3.5 flex items-center gap-2 shadow-lg min-h-[44px]"
            >
              <Play size={16} className="fill-current" /> Start
            </button>
          )}

          <BottomNav />
        </>
      )}

      <TacticalCuesModal
        isOpen={cuesModalState.isOpen}
        exerciseName={cuesModalState.exerciseName}
        category={cuesModalState.category}
        onClose={() => setCuesModalState({ ...cuesModalState, isOpen: false })}
      />

      <SettingsModal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />

      <AvatarCreator
        currentAvatarUrl={activeProfile.avatarUrl}
        onAvatarGenerated={(newUrl) => {
          updateActiveProfile((prev) => {
            if (newUrl.startsWith('data:') && newUrl.length > 200_000) {
              setStorageItem(`iron_mat_avatar_${prev.id}`, newUrl);
              return { ...prev, avatarUrl: `__avatar__:${prev.id}` };
            }
            return { ...prev, avatarUrl: newUrl };
          });
          triggerToast('Avatar updated.');
        }}
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
      />

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <VaultProvider>
        <UIProvider>
          <RestTimerProvider>
            <AppContent />
          </RestTimerProvider>
        </UIProvider>
      </VaultProvider>
    </MotionConfig>
  );
}
