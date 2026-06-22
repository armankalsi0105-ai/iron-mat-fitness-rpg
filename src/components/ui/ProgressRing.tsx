import React from 'react';
import { motion } from 'motion/react';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function ProgressRing({
  value,
  max = 100,
  size = 96,
  strokeWidth = 7,
  color = '#f59e0b',
  trackColor = '#18181b',
  label,
  sublabel,
  children,
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-1">
        {children ?? (
          <>
            {label && (
              <span className="text-xl font-bold text-white tabular-nums leading-none">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-1">
                {sublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
