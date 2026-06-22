import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles } from 'lucide-react';
import Button from './Button';

interface AchievementUnlockProps {
  isOpen: boolean;
  name: string;
  description: string;
  badgeColor?: string;
  onClose: () => void;
}

export default function AchievementUnlock({
  isOpen,
  name,
  description,
  badgeColor = 'from-amber-500 to-orange-500',
  onClose,
}: AchievementUnlockProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievement-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="fixed inset-x-4 bottom-28 sm:left-1/2 sm:-translate-x-1/2 sm:w-[min(92vw,400px)] z-[70] glass-card rounded-[var(--radius-xl)] p-6"
          >
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ rotate: -12, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className={`p-4 rounded-2xl bg-gradient-to-br ${badgeColor} shrink-0`}
              >
                <Award size={28} className="text-black" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={12} /> Achievement Unlocked
                </p>
                <h2
                  id="achievement-title"
                  className="font-bold text-white mt-1"
                  style={{ fontSize: 'var(--text-card-title)' }}
                >
                  {name}
                </h2>
                <p className="text-[var(--text-body)] text-zinc-400 mt-1">{description}</p>
              </div>
            </div>
            <Button fullWidth className="mt-5" onClick={onClose}>
              Claim +100 XP
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
