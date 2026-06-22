import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-4 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Icon size={18} aria-hidden />
          </div>
        )}
        <div className="min-w-0">
          <h2
            className="font-bold text-white tracking-tight"
            style={{ fontSize: 'var(--text-section)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-[var(--text-body)] text-zinc-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
