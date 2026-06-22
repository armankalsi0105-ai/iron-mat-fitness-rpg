import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

const variantMap: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[var(--shadow-glow)] hover:from-amber-400 hover:to-orange-400',
  secondary:
    'bg-white/[0.06] border border-white/[0.1] text-white hover:bg-white/[0.1] hover:border-white/[0.15]',
  ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.05]',
  danger: 'bg-rose-500/90 text-white hover:bg-rose-400',
  success: 'bg-emerald-500/90 text-black hover:bg-emerald-400',
};

const sizeMap: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs min-h-[36px]',
  md: 'px-4 py-3 text-sm min-h-[44px]',
  lg: 'px-6 py-4 text-base min-h-[52px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`btn-premium touch-target inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantMap[variant]} ${sizeMap[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </motion.button>
  );
}
