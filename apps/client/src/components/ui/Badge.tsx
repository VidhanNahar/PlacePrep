import React from 'react';
import { clsx } from 'clsx';
import { DifficultyLevel, SelectionStatus, RoundType } from '@placeprep/shared';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'border border-slate-700 text-slate-300 bg-transparent',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    info: 'bg-sky-950/70 text-sky-300 border-sky-800/60',
    purple: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-sm px-3 py-1 rounded-full font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const DifficultyBadge: React.FC<{ difficulty: DifficultyLevel }> = ({ difficulty }) => {
  const map: Record<DifficultyLevel, { label: string; variant: BadgeProps['variant'] }> = {
    EASY: { label: 'Easy', variant: 'success' },
    MEDIUM: { label: 'Medium', variant: 'warning' },
    HARD: { label: 'Hard', variant: 'danger' },
    VERY_HARD: { label: 'Very Hard', variant: 'danger' },
  };

  const item = map[difficulty] || { label: difficulty, variant: 'default' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
};

export const OutcomeBadge: React.FC<{ outcome?: SelectionStatus | null }> = ({ outcome }) => {
  if (!outcome) return null;
  const map: Record<SelectionStatus, { label: string; variant: BadgeProps['variant'] }> = {
    SELECTED: { label: 'Selected', variant: 'success' },
    REJECTED: { label: 'Rejected', variant: 'danger' },
    WAITLISTED: { label: 'Waitlisted', variant: 'warning' },
    OPTED_OUT: { label: 'Opted Out', variant: 'default' },
  };

  const item = map[outcome] || { label: outcome, variant: 'default' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
};

export const RoundTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    ONLINE_ASSESSMENT: { label: 'Online Assessment', variant: 'info' },
    TECHNICAL: { label: 'Technical Round', variant: 'purple' },
    SYSTEM_DESIGN: { label: 'System Design', variant: 'purple' },
    MANAGERIAL: { label: 'Managerial', variant: 'warning' },
    HR: { label: 'HR / Behavioral', variant: 'success' },
    GROUP_DISCUSSION: { label: 'GD', variant: 'default' },
    TAKE_HOME_PROJECT: { label: 'Take Home Project', variant: 'info' },
    OTHER: { label: 'Interview', variant: 'default' },
  };

  const item = map[type] || { 
    label: type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()), 
    variant: 'purple' 
  };
  return <Badge variant={item.variant}>{item.label}</Badge>;
};
