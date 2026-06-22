import React from 'react';
import {
  Sparkles,
  Dumbbell,
  TrendingUp,
  Calendar,
  User,
  LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

export type TabId = 'home' | 'workout' | 'progress' | 'calendar' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Sparkles },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'progress', label: 'Metrics', icon: TrendingUp },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[var(--glass-bg)] backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto h-[72px] px-2 flex justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isSel ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-h-[44px] min-w-[44px] transition-colors cursor-pointer ${
                isSel ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {isSel && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute top-1.5 w-8 h-1 rounded-full bg-amber-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={20} strokeWidth={isSel ? 2.5 : 2} />
              <span className="text-[9px] font-bold tracking-wider uppercase">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
