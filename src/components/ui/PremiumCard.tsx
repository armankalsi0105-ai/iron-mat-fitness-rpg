import React from 'react';
import { motion } from 'motion/react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  animate?: boolean;
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const variantMap = {
  default: 'bg-zinc-950/90 border border-white/[0.06] shadow-[var(--shadow-card)]',
  glass: 'glass-card',
  gradient: 'gradient-mesh-amber border border-white/[0.08] shadow-[var(--shadow-elevated)]',
  elevated: 'bg-[var(--color-surface-elevated)] border border-white/[0.08] shadow-[var(--shadow-elevated)]',
};

export default function PremiumCard({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  animate = true,
}: PremiumCardProps) {
  const base = `rounded-[var(--radius-lg)] overflow-hidden relative ${paddingMap[padding]} ${variantMap[variant]} ${className}`;

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        className={`${base} text-left w-full cursor-pointer transition-colors hover:border-white/[0.12]`}
        whileTap={{ scale: 0.985 }}
        initial={animate ? { opacity: 0, y: 12 } : false}
        animate={animate ? { opacity: 1, y: 0 } : false}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div
      className={base}
      initial={animate ? { opacity: 0, y: 12 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
