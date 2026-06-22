import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X } from 'lucide-react';
import Button from './Button';

interface CelebrationModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  message?: string;
  onClose: () => void;
  primaryAction?: { label: string; onClick: () => void };
}

export default function CelebrationModal({
  isOpen,
  title,
  subtitle,
  message,
  onClose,
  primaryAction,
}: CelebrationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="celebration-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[min(92vw,380px)] glass-card rounded-[var(--radius-xl)] p-6 text-center"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 touch-target p-2 text-zinc-500 hover:text-white rounded-lg"
              aria-label="Close celebration"
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-[var(--shadow-glow)]"
            >
              <Trophy size={28} className="text-black" />
            </motion.div>

            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">
              {subtitle || 'Session Complete'}
            </p>
            <h2
              id="celebration-title"
              className="font-bold text-white mb-2"
              style={{ fontSize: 'var(--text-section)' }}
            >
              {title}
            </h2>
            {message && (
              <p className="text-[var(--text-body)] text-zinc-400 mb-6">{message}</p>
            )}

            <div className="flex flex-col gap-2">
              {primaryAction && (
                <Button fullWidth onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              )}
              <Button variant="secondary" fullWidth onClick={onClose}>
                Continue
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
