import React, { useMemo, useState } from 'react';
import { Check, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVault } from '../../contexts/VaultContext';
import { useRestTimer } from '../../contexts/RestTimerContext';
import { useUI } from '../../contexts/UIContext';
import { useWorkoutDay } from '../../hooks/useWorkoutDay';
import { WARM_UPS } from '../../data';
import NumpadBottomSheet from '../../components/NumpadBottomSheet';
import WorkoutCompletionSheet, { CompletionData } from '../../components/workout/WorkoutCompletionSheet';
import { computeStreak, getTodayISO, makeSetKey } from '../../utils/workoutDates';
import { lightTap } from '../../utils/haptics';
import {
  getPreviousPerformance,
  logSet,
  suggestWeight,
} from '../../services/progressionService';
import { computeWorkoutVolume, getPRsAchievedToday, maybeUpdatePRFromExercise } from '../../services/prService';
import { syncStructuredGoals } from '../../services/goalService';
import { suggestNextWorkoutDay } from '../../services/insightsService';
import {
  clearWorkoutSession,
  findCurrentIndices,
  saveWorkoutSession,
} from '../../services/workoutSessionService';
import { AthleteProfile, Exercise } from '../../types';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';

export default function WorkoutScreen() {
  const { activeProfile, updateActiveProfile } = useVault();
  const {
    triggerToast,
    setCuesModalState,
    setActiveTab,
  } = useUI();
  const { startRestTimer } = useRestTimer();
  const { currentDay, setCurrentDay, activeWorkout, days } = useWorkoutDay(activeProfile);

  const [checkedWarmups, setCheckedWarmups] = useState<Record<string, boolean>>({});
  const [isWarmupOpen, setIsWarmupOpen] = useState(true);
  const [numpadOpenFor, setNumpadOpenFor] = useState<string | null>(null);
  const [numpadValue, setNumpadValue] = useState('');
  const [numpadMode, setNumpadMode] = useState<'weight' | 'reps'>('weight');
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [swapForIdx, setSwapForIdx] = useState<number | null>(null);

  const todayISO = getTodayISO();
  const setKeyPrefix = `${todayISO}-${currentDay}`;

  const totalSets = activeWorkout.exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = Object.keys(activeProfile.completedSets).filter((k) =>
    k.startsWith(setKeyPrefix)
  ).length;
  const completionPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  const currentExerciseIdx = useMemo(() => {
    return findCurrentIndices(activeProfile, activeWorkout, currentDay).exerciseIdx;
  }, [activeWorkout, activeProfile.completedSets, todayISO, currentDay, activeProfile]);

  const isWorkoutFullyComplete = (sets: Record<string, boolean>) =>
    activeWorkout.exercises.every((ex, exIdx) =>
      Array.from({ length: ex.sets }).every(
        (_, sIdx) => !!sets[makeSetKey(todayISO, currentDay, exIdx, sIdx)]
      )
    );

  const handleToggleSetComplete = (exIdx: number, sIdx: number) => {
    const ex = activeWorkout.exercises[exIdx];
    const key = makeSetKey(todayISO, currentDay, exIdx, sIdx);
    const alreadyDone = !!activeProfile.completedSets[key];

    if (!alreadyDone) {
      const nextSets = { ...activeProfile.completedSets, [key]: true };
      const justFinished = isWorkoutFullyComplete(nextSets);
      let projected = activeProfile.completedWorkouts ?? [];
      const hasToday = projected.some((w) => w.date === todayISO);
      if (justFinished && !hasToday) {
        projected = [...projected, { date: todayISO, dayName: currentDay }];
      }
      const projectedStreak = computeStreak(projected);
      const weight = parseFloat(activeProfile.savedWeights[ex.name] || '0') || 0;
      const reps = parseInt(activeProfile.workoutSession?.savedReps?.[ex.name] || '8', 10) || 8;

      updateActiveProfile((prev) => {
        let nextWorkouts = prev.completedWorkouts ?? [];
        let lastActiveDate = prev.lastActiveDate || '';
        const session = prev.workoutSession;
        const startedAt = session?.startedAt ?? new Date().toISOString();
        const durationMs = Date.now() - new Date(startedAt).getTime();

        if (justFinished && !nextWorkouts.some((w) => w.date === todayISO)) {
          const vol = computeWorkoutVolume(
            { ...prev, completedSets: nextSets },
            todayISO,
            currentDay
          );
          nextWorkouts = [
            ...nextWorkouts,
            {
              date: todayISO,
              dayName: currentDay,
              durationMs,
              volumeLoad: vol.volumeLoad,
              count: vol.totalSets,
            },
          ];
          lastActiveDate = todayISO;
        }

        let next: AthleteProfile = {
          ...prev,
          completedSets: nextSets,
          completedWorkouts: nextWorkouts,
          lastActiveDate,
          streak: computeStreak(nextWorkouts),
        };
        next = logSet(next, {
          date: todayISO,
          exercise: ex.name,
          setIdx: sIdx,
          weight: ex.bodyweight ? reps : weight,
          reps,
          completed: true,
        });
        if (ex.bodyweight) {
          next = maybeUpdatePRFromExercise(next, ex.name, reps, reps);
        } else if (weight > 0) {
          next = maybeUpdatePRFromExercise(next, ex.name, weight, reps);
        }
        next = { ...next, structuredGoals: syncStructuredGoals(next) };
        if (justFinished) next = clearWorkoutSession(next);
        else {
          next = saveWorkoutSession(next, {
            day: currentDay,
            exerciseIdx: exIdx,
            setIdx: sIdx,
            startedAt,
            restTimer: { remaining: 90, max: 90, running: true },
          });
        }
        return next;
      });

      lightTap();
      triggerToast('Set logged — rest timer started');
      startRestTimer(90);

      if (justFinished) {
        const vol = computeWorkoutVolume(
          { ...activeProfile, completedSets: nextSets },
          todayISO,
          currentDay
        );
        const session = activeProfile.workoutSession;
        setCompletionData({
          title: activeWorkout.title,
          durationMs: session?.startedAt
            ? Date.now() - new Date(session.startedAt).getTime()
            : 0,
          totalSets: vol.totalSets,
          totalReps: vol.totalReps,
          volumeLoad: vol.volumeLoad,
          streak: projectedStreak,
          prsAchieved: getPRsAchievedToday({
            ...activeProfile,
            completedSets: nextSets,
          }),
          nextWorkoutDay: suggestNextWorkoutDay(
            projected,
            days,
            currentDay
          ),
        });
      }
      return;
    }

    updateActiveProfile((prev) => ({
      ...prev,
      completedSets: { ...prev.completedSets, [key]: false },
    }));
  };

  const activeProtocol = WARM_UPS[activeWorkout.tag] || { title: '', focus: '', routine: [] };
  const noteKey = `${todayISO}-${currentDay}`;

  const openNumpad = (exName: string, mode: 'weight' | 'reps') => {
    setNumpadMode(mode);
    if (mode === 'reps') {
      setNumpadValue(activeProfile.workoutSession?.savedReps?.[exName] || '');
    } else {
      setNumpadValue(activeProfile.savedWeights[exName] || '');
    }
    setNumpadOpenFor(exName);
  };

  const currentEx = currentExerciseIdx >= 0 ? activeWorkout.exercises[currentExerciseIdx] : null;

  const buildSwapExercise = (altName: string, original: Exercise): Exercise | null => {
    const entry = EXERCISE_LIBRARY[altName];
    if (!entry) return null;
    const bodyweight = entry.equipment.some((e) => /bodyweight|pull-up/i.test(e)) && !entry.equipment.includes('Barbell');
    return {
      name: entry.name,
      spec: original.spec,
      category: entry.category,
      sets: original.sets,
      bodyweight: bodyweight || original.bodyweight,
    };
  };

  const handleSwapExercise = (exIdx: number, altName: string) => {
    const original = activeWorkout.exercises[exIdx];
    const replacement = buildSwapExercise(altName, original);
    if (!replacement) return;
    const swapKey = `${currentDay}-${exIdx}`;
    updateActiveProfile((prev) => ({
      ...prev,
      exerciseSwaps: { ...(prev.exerciseSwaps ?? {}), [swapKey]: replacement },
    }));
    setSwapForIdx(null);
    triggerToast(`Swapped to ${replacement.name}`);
  };

  return (
    <div className="space-y-5 pb-32">
      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-zinc-500">{completionPct}% complete</span>
          <span className="text-xs text-volt-500 font-bold">
            {doneSets}/{totalSets} sets
          </span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-volt-500 transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => {
                setCurrentDay(day);
                updateActiveProfile((prev) => saveWorkoutSession(prev, { day }));
              }}
              className={`py-2.5 px-3 rounded-lg font-semibold text-xs flex-1 min-w-[44px] min-h-[44px] ${
                currentDay === day ? 'bg-white text-black' : 'text-zinc-400'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4">
        <span className="text-xs text-volt-500 uppercase">{activeWorkout.tag}</span>
        <h2 className="text-xl font-black text-white">{activeWorkout.title}</h2>
        {currentEx && (
          <p className="text-sm text-zinc-400 mt-2">
            Current: {currentEx.name}
          </p>
        )}
      </div>

      {activeProtocol.routine.length > 0 && (
        <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4">
          <button
            type="button"
            onClick={() => setIsWarmupOpen(!isWarmupOpen)}
            className="w-full flex justify-between items-center min-h-[44px]"
          >
            <h3 className="text-sm font-bold text-white">Warm-up</h3>
            <span className="text-xs text-zinc-500">{isWarmupOpen ? 'Hide' : 'Show'}</span>
          </button>
          <AnimatePresence>
            {isWarmupOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-3 space-y-2 overflow-hidden">
                {activeProtocol.routine.map((w, idx) => {
                  const ck = `${currentDay}-${idx}`;
                  const checked = !!checkedWarmups[ck];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCheckedWarmups({ ...checkedWarmups, [ck]: !checked })}
                      className="w-full flex items-center gap-3 bg-ntc p-3 rounded-xl border border-ntc-border text-left min-h-[44px]"
                    >
                      <span
                        className={`h-6 w-6 rounded-md flex items-center justify-center border ${
                          checked ? 'bg-volt-500 border-volt-500 text-black' : 'border-zinc-700'
                        }`}
                      >
                        {checked && <Check size={12} />}
                      </span>
                      <span className={`text-sm ${checked ? 'line-through text-zinc-600' : 'text-white'}`}>
                        {w.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {activeWorkout.exercises.map((ex, exIdx) => {
        const suggestion = suggestWeight(activeProfile, ex.name);
        const prevPerf = getPreviousPerformance(activeProfile, ex.name);
        const isCurrent = exIdx === currentExerciseIdx;

        return (
          <div
            key={exIdx}
            id={`exercise-${exIdx}`}
            className={`bg-ntc-elevated border rounded-2xl p-4 ${
              isCurrent ? 'border-volt-500/50 ring-1 ring-volt-500/20' : 'border-ntc-border'
            }`}
          >
            <div className="flex justify-between items-start gap-2 mb-3">
              <div>
                <h4 className="text-lg font-black text-white">{ex.name}</h4>
                <p className="text-xs text-zinc-500">
                  {ex.sets} × {ex.spec}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {(EXERCISE_LIBRARY[ex.name]?.alternatives.length ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setSwapForIdx(swapForIdx === exIdx ? null : exIdx)}
                    className="px-3 py-2 rounded-full border border-ntc-border text-xs text-zinc-400 min-h-[44px]"
                    aria-label={`Swap ${ex.name} for alternative`}
                    aria-expanded={swapForIdx === exIdx}
                  >
                    <RefreshCw size={14} className="inline mr-1" />
                    Swap
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setCuesModalState({ isOpen: true, exerciseName: ex.name, category: ex.category })
                  }
                  className="px-3 py-2 rounded-full border border-ntc-border text-xs text-zinc-400 min-h-[44px]"
                >
                  <Info size={14} className="inline mr-1" />
                  Cues
                </button>
              </div>
            </div>

            {swapForIdx === exIdx && (
              <div className="mb-3 flex flex-wrap gap-2">
                {EXERCISE_LIBRARY[ex.name]?.alternatives.map((alt) => (
                  <button
                    key={alt}
                    type="button"
                    onClick={() => handleSwapExercise(exIdx, alt)}
                    className="px-3 py-2 rounded-full bg-ntc border border-volt-500/30 text-xs text-white min-h-[44px] hover:border-volt-500"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              {!ex.bodyweight ? (
                <button
                  type="button"
                  onClick={() => openNumpad(ex.name, 'weight')}
                  className="bg-ntc border border-ntc-border rounded-xl p-3 text-left min-h-[44px]"
                >
                  <span className="text-[10px] text-zinc-500 block">Weight</span>
                  <span className="font-bold text-white">
                    {activeProfile.savedWeights[ex.name]
                      ? `${activeProfile.savedWeights[ex.name]} lbs`
                      : 'Tap to log'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openNumpad(ex.name, 'reps')}
                  className="bg-ntc border border-ntc-border rounded-xl p-3 text-left min-h-[44px]"
                >
                  <span className="text-[10px] text-zinc-500 block">Reps / sec</span>
                  <span className="font-bold text-white">
                    {activeProfile.workoutSession?.savedReps?.[ex.name] || 'Tap to log'}
                  </span>
                </button>
              )}
              <div className="bg-ntc border border-ntc-border rounded-xl p-3">
                <span className="text-[10px] text-zinc-500 block">Suggested</span>
                <span className="font-bold text-volt-500">
                  {suggestion.weight > 0 ? `${suggestion.weight} lbs` : '—'}
                </span>
                <span className="text-[10px] text-zinc-600 block">{suggestion.reason}</span>
              </div>
            </div>

            {prevPerf && (
              <p className="text-xs text-zinc-500 mb-3">
                Previous: {prevPerf.weight} {ex.bodyweight ? 'reps' : 'lbs'} on {prevPerf.date}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {Array.from({ length: ex.sets }).map((_, sIdx) => {
                const done = !!activeProfile.completedSets[makeSetKey(todayISO, currentDay, exIdx, sIdx)];
                return (
                  <button
                    key={sIdx}
                    onClick={() => handleToggleSetComplete(exIdx, sIdx)}
                    aria-label={`Set ${sIdx + 1}${done ? ' completed' : ''} — ${ex.name}`}
                    aria-pressed={done}
                    className={`h-11 w-11 rounded-full border font-bold text-xs min-h-[44px] min-w-[44px] ${
                      done
                        ? 'bg-volt-500/20 border-volt-500 text-volt-500'
                        : isCurrent
                          ? 'bg-volt-500/10 border-volt-500/40 text-white'
                          : 'bg-ntc border-ntc-border text-zinc-400'
                    }`}
                  >
                    {done ? '✓' : sIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4">
        <label className="text-xs text-zinc-500 block mb-2">Workout notes</label>
        <textarea
          value={noteDraft || activeProfile.workoutNotes?.[noteKey] || ''}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => {
            if (noteDraft) {
              updateActiveProfile((prev) => ({
                ...prev,
                workoutNotes: { ...(prev.workoutNotes ?? {}), [noteKey]: noteDraft },
              }));
            }
          }}
          placeholder="How did it feel?"
          className="w-full bg-ntc border border-ntc-border rounded-xl p-3 text-sm text-white min-h-[80px]"
        />
      </div>

      {currentEx && (
        <div className="fixed bottom-[calc(68px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 px-4">
          <div className="max-w-4xl mx-auto bg-ntc-elevated border border-volt-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg">
            <div className="min-w-0">
              <p className="text-[10px] text-volt-500 uppercase font-semibold">Active set</p>
              <p className="text-sm font-bold text-white truncate">{currentEx.name}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const { setIdx } = findCurrentIndices(activeProfile, activeWorkout, currentDay);
                handleToggleSetComplete(currentExerciseIdx, setIdx);
              }}
              className="shrink-0 px-5 py-3 bg-volt-500 text-black font-bold rounded-full min-h-[44px] text-sm"
            >
              Log set
            </button>
          </div>
        </div>
      )}

      <NumpadBottomSheet
        isOpen={numpadOpenFor !== null}
        onClose={() => setNumpadOpenFor(null)}
        title={numpadOpenFor ? `${numpadMode === 'reps' ? 'REPS' : 'WEIGHT'} — ${numpadOpenFor}` : 'LOG'}
        mode={numpadMode}
        value={numpadValue}
        onValueChange={setNumpadValue}
        onSave={() => {
          if (!numpadOpenFor) return;
          if (numpadMode === 'reps') {
            const reps = parseInt(numpadValue, 10);
            updateActiveProfile((prev) => {
              let next = saveWorkoutSession(prev, {
                day: currentDay,
                savedReps: {
                  ...(prev.workoutSession?.savedReps ?? {}),
                  [numpadOpenFor]: numpadValue,
                },
              });
              if (!isNaN(reps) && reps > 0) next = maybeUpdatePRFromExercise(next, numpadOpenFor, reps, reps);
              return next;
            });
            if (!isNaN(reps) && reps > 0) triggerToast(`Logged ${numpadValue} reps`);
          } else {
            const wt = parseFloat(numpadValue);
            updateActiveProfile((prev) => {
              let next = {
                ...prev,
                savedWeights: { ...prev.savedWeights, [numpadOpenFor]: numpadValue },
              };
              if (!isNaN(wt) && wt > 0) next = maybeUpdatePRFromExercise(next, numpadOpenFor, wt);
              return saveWorkoutSession(next, { day: currentDay });
            });
            if (!isNaN(wt) && wt > 0) triggerToast(`Weight logged: ${numpadValue} lbs`);
          }
        }}
      />

      <AnimatePresence>
        {completionData && (
          <WorkoutCompletionSheet
            data={completionData}
            onDone={() => setCompletionData(null)}
            onNextWorkout={() => {
              setCurrentDay(completionData.nextWorkoutDay);
              setCompletionData(null);
              setActiveTab('home');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
