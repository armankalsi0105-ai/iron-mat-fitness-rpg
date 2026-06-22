import React, { useState, useMemo } from 'react';
import {
  Trophy, Sparkles, MessageSquare, Send, Play, ChevronRight,
  Activity, Target, Zap, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterProfile } from '../types';
import { ACHIEVEMENTS } from '../data';
import PremiumCard from './ui/PremiumCard';
import ProgressRing from './ui/ProgressRing';
import StreakCard from './ui/StreakCard';
import LevelRing from './ui/LevelRing';
import WeeklyProgress from './ui/WeeklyProgress';
import {
  getTimeAwareGreeting,
  formatDisplayName,
  getWeeklyProgress,
  getNextAchievement,
  getReadinessFeedback,
  getRitualRecoveryBoost,
} from '../lib/homeUtils';
import { getWeeklyTrainingScore, getDashboardScores } from '../lib/athleteMetrics';
import ScoreRing from './ui/ScoreRing';
import SectionHeader from './ui/SectionHeader';
import FormattedCoachText, { stripCoachMarkdown } from './ui/FormattedCoachText';

interface HomeScreenProps {
  activeProfile: CharacterProfile;
  resolvedRank: string;
  triggerToast: (msg: string) => void;
  setActiveTab: (tab: 'home' | 'workout' | 'progress' | 'calendar' | 'profile') => void;
  todayWorkout: { title: string; tag: string; exerciseCount?: number };
  programStarted: boolean;
  daysUntilStart: number;
  readinessScore: number;
  quotes: string[];
  quoteIdx: number;
  setQuoteIdx: React.Dispatch<React.SetStateAction<number>>;
  updateActiveProfile: (updater: (prev: CharacterProfile) => CharacterProfile) => void;
  coachInput: string;
  setCoachInput: (val: string) => void;
  coachHistory: { role: 'user' | 'assistant'; text: string }[];
  setCoachHistory: React.Dispatch<React.SetStateAction<{ role: 'user' | 'assistant'; text: string }[]>>;
  coachLoading: boolean;
  setCoachLoading: (val: boolean) => void;
  handleSendCoachMessage: () => Promise<void>;
  getBadgeIconComponent: (icon: string, size?: number) => React.ReactNode;
}

export default function HomeScreen({
  activeProfile,
  resolvedRank,
  triggerToast,
  setActiveTab,
  todayWorkout,
  programStarted,
  daysUntilStart,
  readinessScore,
  quotes,
  quoteIdx,
  setQuoteIdx,
  updateActiveProfile,
  coachInput,
  setCoachInput,
  coachHistory,
  coachLoading,
  handleSendCoachMessage,
  getBadgeIconComponent,
}: HomeScreenProps) {
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isCoachExpanded, setIsCoachExpanded] = useState(false);

  const greeting = getTimeAwareGreeting();
  const displayName = formatDisplayName(activeProfile.name);
  const weeklyData = useMemo(() => getWeeklyProgress(activeProfile), [activeProfile]);
  const nextAchievement = useMemo(() => getNextAchievement(activeProfile), [activeProfile]);
  const ritualBoost = getRitualRecoveryBoost(activeProfile);
  const adjustedReadiness = Math.min(100, readinessScore + ritualBoost);
  const readinessFeedback = getReadinessFeedback(adjustedReadiness);
  const weeklyTrainingScore = useMemo(
    () => getWeeklyTrainingScore(activeProfile),
    [activeProfile]
  );
  const dashboardScores = useMemo(
    () => getDashboardScores(activeProfile),
    [activeProfile]
  );

  const suggestedPrompts = [
    'Form cues for double-leg takedowns?',
    'In-season protein guide?',
    'Build grip endurance safely?',
  ];

  const tagColors: Record<string, string> = {
    PULL: 'from-blue-500/20 to-cyan-500/10 text-cyan-300',
    PUSH: 'from-rose-500/20 to-orange-500/10 text-rose-300',
    LEGS: 'from-violet-500/20 to-purple-500/10 text-violet-300',
    ATHLETIC: 'from-emerald-500/20 to-teal-500/10 text-emerald-300',
    REST: 'from-zinc-500/20 to-zinc-600/10 text-zinc-400',
  };
  const tagStyle = tagColors[todayWorkout.tag] || tagColors.ATHLETIC;

  return (
    <div className="space-y-4 pb-2 stagger-children">

      {/* ── Hero Greeting ── */}
      <header className="pt-1 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 text-[var(--text-caption)] font-semibold text-amber-500/90 uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {resolvedRank}
          </span>
          <h1
            className="font-bold text-white tracking-tight leading-[1.1]"
            style={{ fontSize: 'var(--text-hero)' }}
          >
            {greeting},{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              {displayName}
            </span>
          </h1>
          <p className="text-[var(--text-body)] text-zinc-400 mt-2">
            {activeProfile.sport || 'Athlete'} · {activeProfile.wrestlingPhase || 'Training'} phase
          </p>
        </motion.div>
      </header>

      {/* ── Streak + Level ── */}
      <div className="flex gap-3">
        <StreakCard streak={activeProfile.streak || 0} />
        <LevelRing
          level={activeProfile.level}
          xp={activeProfile.xp}
          xpToNext={activeProfile.xpToNext}
          rank={resolvedRank}
        />
      </div>

      {/* ── Today's Workout — Dominant Card ── */}
      <PremiumCard variant="gradient" padding="lg" className="gradient-mesh-workout">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r ${tagStyle} border border-white/[0.06]`}>
                {programStarted ? "Today's Session" : 'Day 1 Preview'}
              </span>
              {!programStarted && daysUntilStart > 0 && (
                <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1">
                  <Calendar size={12} />
                  Starts in {daysUntilStart} day{daysUntilStart !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                {todayWorkout.tag}
              </span>
              {todayWorkout.exerciseCount != null && (
                <span className="text-sm font-bold text-zinc-300 tabular-nums">
                  {todayWorkout.exerciseCount} exercises
                </span>
              )}
            </div>
          </div>

          <h2
            className="font-bold text-white tracking-tight leading-tight mb-2"
            style={{ fontSize: 'var(--text-section)' }}
          >
            {todayWorkout.title}
          </h2>
          <p className="text-[var(--text-body)] text-zinc-400 leading-relaxed max-w-md">
            {programStarted
              ? 'Your session is loaded and ready. One tap to start logging sets.'
              : 'Preview tomorrow\'s Day 1 workout and dial in your warm-up before launch.'}
          </p>
        </div>
      </PremiumCard>

      {/* ── Quick Start — Primary CTA ── */}
      <motion.button
        type="button"
        onClick={() => setActiveTab('workout')}
        className="btn-premium touch-target w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[var(--radius-lg)] bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-lg shadow-[var(--shadow-glow)] animate-pulse-glow cursor-pointer"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <Play size={22} fill="currentColor" />
        {programStarted ? 'Quick Start Workout' : 'Preview Workout'}
        <ChevronRight size={20} strokeWidth={2.5} />
      </motion.button>

      {/* ── Training scores row ── */}
      <PremiumCard variant="glass" padding="md">
        <SectionHeader
          title="Today's Pulse"
          subtitle="Recovery · training · wrestling readiness"
          icon={Activity}
          className="mb-3"
        />
        <div className="grid grid-cols-3 gap-2 justify-items-center">
          <ScoreRing score={adjustedReadiness} label="Recovery" size={64} />
          <ScoreRing score={weeklyTrainingScore} label="Training" size={64} trend={5} />
          <ScoreRing score={dashboardScores.wrestling} label="Wrestling" size={64} trend={3} />
        </div>
      </PremiumCard>

      {/* ── Readiness + Weekly Progress ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PremiumCard variant="glass" padding="md">
          <div className="flex items-center gap-4">
            <ProgressRing
              value={adjustedReadiness}
              size={88}
              strokeWidth={6}
              color={readinessFeedback.stroke}
              trackColor="rgba(255,255,255,0.06)"
            >
              <span className="text-xl font-bold text-white tabular-nums">{adjustedReadiness}</span>
              <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Readiness</span>
            </ProgressRing>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className={readinessFeedback.color} />
                <span className={`text-sm font-bold ${readinessFeedback.color}`}>
                  {readinessFeedback.label}
                </span>
              </div>
              <p className="text-[12px] text-zinc-400 leading-snug">
                {readinessFeedback.description}
              </p>
              {ritualBoost > 0 && (
                <p className="text-[10px] text-emerald-500/80 mt-2 font-medium">
                  +{ritualBoost}% from daily rituals
                </p>
              )}
            </div>
          </div>
        </PremiumCard>

        <WeeklyProgress data={weeklyData} programStarted={programStarted} />
      </div>

      {/* ── Next Achievement Teaser ── */}
      {nextAchievement && (
        <PremiumCard variant="elevated" padding="md">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${nextAchievement.achievement.badgeColor} ${nextAchievement.achievement.textColor} shadow-lg shrink-0`}>
              {getBadgeIconComponent(nextAchievement.achievement.badgeIcon, 20)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">
                Next Milestone
              </p>
              <p className="text-[var(--text-card-title)] font-bold text-white truncate">
                {nextAchievement.achievement.name}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${nextAchievement.progress}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  />
                </div>
                <span className="text-[11px] font-bold text-zinc-400 tabular-nums shrink-0">
                  {nextAchievement.current}/{nextAchievement.target}
                </span>
              </div>
            </div>
            <Target size={18} className="text-zinc-600 shrink-0" />
          </div>
        </PremiumCard>
      )}

      {/* ── Coach Tip Card (compact → expandable) ── */}
      <PremiumCard variant="default" padding="md">
        <button
          type="button"
          onClick={() => setIsCoachExpanded(!isCoachExpanded)}
          className="w-full flex items-center justify-between gap-3 text-left cursor-pointer touch-target"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-amber-500/80 uppercase tracking-wider">
                Coach Tip
              </p>
              <p className="text-[var(--text-body)] text-zinc-300 truncate">
                {(() => {
                  const preview = stripCoachMarkdown(coachHistory[coachHistory.length - 1]?.text ?? '');
                  if (!preview) return 'Ask your coach anything…';
                  return preview.length > 80 ? `${preview.slice(0, 80)}…` : preview;
                })()}
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className={`text-zinc-500 shrink-0 transition-transform ${isCoachExpanded ? 'rotate-90' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isCoachExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-4">
                <div className="h-[180px] overflow-y-auto bg-black/30 border border-white/[0.04] rounded-2xl p-3 space-y-2.5 flex flex-col no-scrollbar">
                  {coachHistory.map((m, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[90%] rounded-xl px-3 py-2.5 text-[13px] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-amber-500/10 border border-amber-500/20 text-zinc-100 self-end'
                          : 'bg-zinc-900/80 border border-white/[0.04] text-zinc-300 self-start'
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                        {m.role === 'user' ? 'You' : 'Coach'}
                      </span>
                      {m.role === 'assistant' ? (
                        <FormattedCoachText text={m.text} variant="chat" />
                      ) : (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      )}
                    </div>
                  ))}
                  {coachLoading && (
                    <div className="bg-zinc-900/60 text-zinc-400 rounded-xl px-3 py-2 text-xs self-start flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                      Thinking…
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoachInput(p)}
                      className="text-[11px] font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] px-3 py-2 rounded-lg border border-white/[0.06] transition cursor-pointer touch-target"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask your coach anything…"
                    value={coachInput}
                    onChange={(e) => setCoachInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendCoachMessage();
                    }}
                    className="flex-1 bg-zinc-900/80 border border-white/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-white min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={handleSendCoachMessage}
                    disabled={coachLoading}
                    className="touch-target px-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0 btn-premium"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PremiumCard>

      {/* ── Motivational Quote ── */}
      <PremiumCard variant="glass" padding="md">
        <div className="flex items-start gap-3">
          <MessageSquare size={16} className="text-amber-500/60 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[var(--text-body)] font-medium text-zinc-200 italic leading-snug">
              "{quotes[quoteIdx]}"
            </p>
            <button
              type="button"
              onClick={() => setQuoteIdx((quoteIdx + 1) % quotes.length)}
              className="text-[11px] font-semibold text-amber-500 hover:text-amber-400 mt-3 transition cursor-pointer touch-target"
            >
              Next quote →
            </button>
          </div>
        </div>
      </PremiumCard>

      {/* ── Achievements (collapsible) ── */}
      <PremiumCard variant="default" padding="md">
        <button
          type="button"
          onClick={() => setIsAchievementsOpen(!isAchievementsOpen)}
          className="w-full flex justify-between items-center cursor-pointer touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
              <Trophy size={18} />
            </div>
            <div className="text-left">
              <p className="text-[var(--text-card-title)] font-bold text-white">Achievements</p>
              <p className="text-[12px] text-zinc-500">
                {activeProfile.achievements?.length || 0} of {ACHIEVEMENTS.length} unlocked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500/50" />
            <ChevronRight
              size={18}
              className={`text-zinc-500 transition-transform ${isAchievementsOpen ? 'rotate-90' : ''}`}
            />
          </div>
        </button>

        <AnimatePresence>
          {isAchievementsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-white/[0.06] pt-4 mt-4">
                {ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = activeProfile.achievements?.includes(ach.id);
                  const isShowcased = activeProfile.badgeShowcase === ach.id;

                  return (
                    <button
                      key={ach.id}
                      type="button"
                      onClick={() => {
                        if (!isUnlocked) {
                          triggerToast(`Locked: ${ach.description}`);
                          return;
                        }
                        updateActiveProfile((prev) => ({
                          ...prev,
                          badgeShowcase: prev.badgeShowcase === ach.id ? '' : ach.id,
                        }));
                        triggerToast(
                          isShowcased ? 'Badge removed from showcase.' : `Showcasing: ${ach.badgeName}`
                        );
                      }}
                      className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 text-left cursor-pointer touch-target ${
                        isUnlocked
                          ? isShowcased
                            ? 'bg-amber-500/10 border-amber-400/40 scale-[1.02]'
                            : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                          : 'bg-transparent border-white/[0.03] opacity-40'
                      }`}
                    >
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${ach.badgeColor} ${ach.textColor} w-fit`}>
                        {getBadgeIconComponent(ach.badgeIcon, 14)}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-white leading-tight">{ach.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">{ach.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PremiumCard>
    </div>
  );
}
