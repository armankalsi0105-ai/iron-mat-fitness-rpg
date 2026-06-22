import React, { useState, useMemo, useCallback } from 'react';
import {
  Play, Pause, Check, ChevronDown, ChevronUp, Flame,
  CheckCircle2, Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterProfile, WorkoutDay } from '../types';
import { WARM_UPS } from '../data';
import PremiumCard from './ui/PremiumCard';
import SectionHeader from './ui/SectionHeader';
import Button from './ui/Button';
import CelebrationModal from './ui/CelebrationModal';
import ExerciseCard from './ui/ExerciseCard';

interface WorkoutScreenProps {
  activeProfile: CharacterProfile;
  currentDay: string;
  setCurrentDay: (day: string) => void;
  activeWorkout: WorkoutDay;
  updateActiveProfile: (updater: (prev: CharacterProfile) => CharacterProfile) => void;
  triggerToast: (msg: string) => void;
  checkedWarmups: Record<string, boolean>;
  setCheckedWarmups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isWarmupOpen: boolean;
  setIsWarmupOpen: (open: boolean) => void;
  warmupTimerActive: boolean;
  setWarmupTimerActive: (active: boolean) => void;
  warmupTimeRemaining: number;
  setWarmupTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  setTimerRemaining: (val: number) => void;
  setTimerMax: (val: number) => void;
  setTimerRunning: (val: boolean) => void;
  isSynthRunning: boolean;
  setIsSynthRunning: (running: boolean) => void;
  synthTrack: string;
  setSynthTrack: (track: string) => void;
  synthVolume: number;
  setSynthVolume: (vol: number) => void;
  handleInitSynthAudio: () => void;
  handleStopSynthAudio: () => void;
  setCuesModalState: (state: { isOpen: boolean; exerciseName: string; category: string }) => void;
  getBadgeIconComponent: (icon: string, size?: number) => React.ReactNode;
  programStarted: boolean;
  daysUntilStart: number;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WorkoutScreen({
  activeProfile,
  currentDay,
  setCurrentDay,
  activeWorkout,
  updateActiveProfile,
  triggerToast,
  checkedWarmups,
  setCheckedWarmups,
  isWarmupOpen,
  setIsWarmupOpen,
  setTimerRemaining,
  setTimerMax,
  setTimerRunning,
  isSynthRunning,
  synthTrack,
  setSynthTrack,
  handleInitSynthAudio,
  handleStopSynthAudio,
  setCuesModalState,
  programStarted,
  daysUntilStart,
}: WorkoutScreenProps) {
  const [expandedExercise, setExpandedExercise] = useState<number | null>(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const activeProtocol = WARM_UPS[activeWorkout.tag] || { title: '', focus: '', routine: [] };
  const currentWarmups = activeProtocol.routine;

  const totalSets = useMemo(
    () => activeWorkout.exercises?.reduce((sum, ex) => sum + ex.sets, 0) || 0,
    [activeWorkout]
  );

  const completedSetsCount = useMemo(
    () =>
      Object.keys(activeProfile.completedSets || {}).filter((k) =>
        k.startsWith(currentDay)
      ).length,
    [activeProfile.completedSets, currentDay]
  );

  const progressPct = totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;
  const isComplete = totalSets > 0 && completedSetsCount >= totalSets;

  const handleToggleWarmup = (item: string) => {
    if (!programStarted) {
      triggerToast('Warm-ups unlock when the program starts.');
      return;
    }
    const nextCheck = { ...checkedWarmups, [item]: !checkedWarmups[item] };
    setCheckedWarmups(nextCheck);
    updateActiveProfile((prev) => ({
      ...prev,
      xp: Math.max(0, (prev.xp || 0) + (!checkedWarmups[item] ? 5 : -5)),
      warmupsCompleted: (prev.warmupsCompleted || 0) + (!checkedWarmups[item] ? 1 : -1),
    }));
    if (!checkedWarmups[item]) triggerToast('+5 XP · Warm-up done');
  };

  const handleToggleSetComplete = useCallback(
    (exIdx: number, sIdx: number) => {
      if (!programStarted) {
        triggerToast('Set logging unlocks when the program starts.');
        return;
      }
      const key = `${currentDay}-${exIdx}-${sIdx}`;
      const alreadyDone = !!activeProfile.completedSets[key];
      const exercise = activeWorkout.exercises[exIdx];

      updateActiveProfile((prev) => {
        const nextSets = { ...prev.completedSets, [key]: !alreadyDone };
        const savedWeight = parseFloat(prev.savedWeights[exercise.name] || '0') || 0;
        const exerciseXp = 20 + Math.floor(savedWeight * 0.1);
        const finalXpChange = !alreadyDone ? exerciseXp : -exerciseXp;

        const category = exercise.category;
        const nextAttrXp = { ...prev.attrXp };
        const nextAttributes = { ...prev.attributes };
        let finalAttrXp = (nextAttrXp[category] || 0) + (!alreadyDone ? 10 : -10);
        if (finalAttrXp >= 100) {
          finalAttrXp -= 100;
          nextAttributes[category] = (nextAttributes[category] || 1) + 1;
        } else if (finalAttrXp < 0) finalAttrXp = 0;
        nextAttrXp[category] = finalAttrXp;

        return {
          ...prev,
          xp: Math.max(0, (prev.xp || 0) + finalXpChange),
          completedSets: nextSets,
          totalReps:
            (prev.totalReps || 0) +
            (() => {
              const m = exercise.spec.match(/[×x]\s*(\d+)/i);
              const reps = m ? parseInt(m[1], 10) : 10;
              return !alreadyDone ? reps : -reps;
            })(),
          attrXp: nextAttrXp,
          attributes: nextAttributes,
        };
      });

      if (!alreadyDone) {
        triggerToast('Set logged · Rest timer started');
        setTimerMax(90);
        setTimerRemaining(90);
        setTimerRunning(true);

        const newCompleted =
          Object.keys({ ...activeProfile.completedSets, [key]: true }).filter((k) =>
            k.startsWith(currentDay)
          ).length + (alreadyDone ? 0 : 1);

        if (newCompleted >= totalSets) {
          setTimeout(() => setShowCelebration(true), 400);
        }
      }
    },
    [
      programStarted,
      currentDay,
      activeProfile.completedSets,
      activeWorkout,
      updateActiveProfile,
      triggerToast,
      setTimerMax,
      setTimerRemaining,
      setTimerRunning,
      totalSets,
    ]
  );

  const logAllRemaining = () => {
    if (!programStarted) return;

    let loggedCount = 0;
    updateActiveProfile((prev) => {
      const nextSets = { ...prev.completedSets };
      let xpChange = 0;
      let repsChange = 0;
      const nextAttrXp = { ...prev.attrXp };
      const nextAttributes = { ...prev.attributes };

      activeWorkout.exercises?.forEach((exercise, exIdx) => {
        for (let sIdx = 0; sIdx < exercise.sets; sIdx++) {
          const key = `${currentDay}-${exIdx}-${sIdx}`;
          if (nextSets[key]) continue;

          nextSets[key] = true;
          loggedCount += 1;

          const savedWeight = parseFloat(prev.savedWeights[exercise.name] || '0') || 0;
          xpChange += 20 + Math.floor(savedWeight * 0.1);

          const repMatch = exercise.spec.match(/[×x]\s*(\d+)/i);
          repsChange += repMatch ? parseInt(repMatch[1], 10) : 10;

          const category = exercise.category;
          let attrXp = (nextAttrXp[category] || 0) + 10;
          if (attrXp >= 100) {
            attrXp -= 100;
            nextAttributes[category] = (nextAttributes[category] || 1) + 1;
          }
          nextAttrXp[category] = attrXp;
        }
      });

      if (loggedCount === 0) return prev;

      return {
        ...prev,
        completedSets: nextSets,
        xp: Math.max(0, (prev.xp || 0) + xpChange),
        totalReps: (prev.totalReps || 0) + repsChange,
        attrXp: nextAttrXp,
        attributes: nextAttributes,
      };
    });

    if (loggedCount > 0) {
      triggerToast(`Logged ${loggedCount} sets`);
      setTimerMax(90);
      setTimerRemaining(90);
      setTimerRunning(true);
      setTimeout(() => setShowCelebration(true), 400);
    } else {
      triggerToast('All sets already logged');
    }
  };

  return (
    <div className="space-y-4 pb-32 tab-content-enter">
      {!programStarted && (
        <PremiumCard variant="gradient" padding="md" className="border-amber-500/20">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-400">Preview mode</p>
              <p className="text-[12px] text-zinc-400">
                Starts in {daysUntilStart} day{daysUntilStart !== 1 ? 's' : ''} — browse the plan now
              </p>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Progress header + day picker */}
      <PremiumCard variant="glass" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
              {activeWorkout.tag}
            </span>
            <h2 className="text-section font-bold text-white">{activeWorkout.title}</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-400 tabular-nums">{progressPct}%</p>
            <p className="text-[10px] text-zinc-500">
              {completedSetsCount}/{totalSets} sets
            </p>
          </div>
        </div>
        <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setCurrentDay(day)}
              className={`shrink-0 min-w-[44px] min-h-[44px] px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentDay === day
                  ? 'bg-amber-500 text-black'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </PremiumCard>

      {/* Warm-up — compact */}
      {currentWarmups.length > 0 && (
        <PremiumCard variant="default" padding="md">
          <button
            type="button"
            onClick={() => setIsWarmupOpen(!isWarmupOpen)}
            className="w-full flex justify-between items-center touch-target cursor-pointer"
          >
            <SectionHeader
              title="Warm-Up"
              subtitle={activeProtocol.focus}
              icon={Flame}
              className="mb-0 text-left"
            />
            {isWarmupOpen ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
          </button>
          <AnimatePresence>
            {isWarmupOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 mt-4 pt-4 border-t border-white/[0.06]">
                  {currentWarmups.map((w, idx) => {
                    const checkKey = `${currentDay}-${idx}`;
                    const isChecked = !!checkedWarmups[checkKey];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleWarmup(checkKey)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer touch-target min-h-[52px] text-left ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-black/30 border-white/[0.06] hover:border-white/[0.1]'
                        }`}
                      >
                        <span
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-amber-500 text-black' : 'bg-zinc-900 border border-white/[0.08]'
                          }`}
                        >
                          {isChecked ? <Check size={18} strokeWidth={3} /> : null}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${isChecked ? 'text-zinc-500 line-through' : 'text-white'}`}>
                            {w.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate">{w.duration} · {w.cue}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PremiumCard>
      )}

      {/* Exercises */}
      <div className="space-y-3">
        {activeWorkout.exercises?.map((ex, exIdx) => {
          const setsDone = Array.from({ length: ex.sets }).filter(
            (_, sIdx) => activeProfile.completedSets[`${currentDay}-${exIdx}-${sIdx}`]
          ).length;

          return (
            <div key={exIdx}>
            <ExerciseCard
              exercise={ex}
              setsDone={setsDone}
              savedWeight={activeProfile.savedWeights[ex.name] || ''}
              isExpanded={expandedExercise === exIdx}
              onToggleExpand={() =>
                setExpandedExercise(expandedExercise === exIdx ? null : exIdx)
              }
              onWeightChange={(val) =>
                updateActiveProfile((prev) => ({
                  ...prev,
                  savedWeights: { ...prev.savedWeights, [ex.name]: val },
                }))
              }
              onSetToggle={(sIdx) => handleToggleSetComplete(exIdx, sIdx)}
              onOpenCues={() =>
                setCuesModalState({
                  isOpen: true,
                  exerciseName: ex.name,
                  category: ex.category,
                })
              }
              isSetDone={(sIdx) =>
                !!activeProfile.completedSets[`${currentDay}-${exIdx}-${sIdx}`]
              }
            />
            </div>
          );
        })}
      </div>

      {/* Breathing synth — compact */}
      <PremiumCard variant="default" padding="md">
        <p className="text-[11px] text-zinc-500 mb-3">Rhythm synth for rest periods</p>
        <div className="flex flex-wrap gap-2 items-center">
          {['focus', 'combat', 'chill'].map((track) => (
            <button
              key={track}
              type="button"
              onClick={() => setSynthTrack(track)}
              className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase min-h-[44px] cursor-pointer ${
                synthTrack === track ? 'bg-amber-500 text-black' : 'bg-white/[0.04] text-zinc-400'
              }`}
            >
              {track}
            </button>
          ))}
          <Button
            variant={isSynthRunning ? 'danger' : 'secondary'}
            size="sm"
            icon={isSynthRunning ? <Pause size={14} /> : <Play size={14} />}
            onClick={() => (isSynthRunning ? handleStopSynthAudio() : handleInitSynthAudio())}
          >
            {isSynthRunning ? 'Stop' : 'Play'}
          </Button>
        </div>
      </PremiumCard>

      {/* Sticky primary actions */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 px-4 pb-2 pointer-events-none">
        <div className="max-w-4xl mx-auto flex gap-2 pointer-events-auto">
          {programStarted && !isComplete && (
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={logAllRemaining}
            >
              Finish All
            </Button>
          )}
          <Button
            size="lg"
            className="flex-[2]"
            icon={<CheckCircle2 size={20} />}
            onClick={() => {
              if (isComplete) setShowCelebration(true);
              else triggerToast(`${totalSets - completedSetsCount} sets remaining`);
            }}
          >
            {isComplete ? 'Workout Complete!' : `${progressPct}% Done`}
          </Button>
        </div>
      </div>

      <CelebrationModal
        isOpen={showCelebration}
        title="Session Crushed!"
        subtitle="Workout Complete"
        message={`You logged ${completedSetsCount} sets on ${activeWorkout.title}. Recovery starts now.`}
        onClose={() => setShowCelebration(false)}
        primaryAction={{
          label: 'View Progress',
          onClick: () => setShowCelebration(false),
        }}
      />
    </div>
  );
}
