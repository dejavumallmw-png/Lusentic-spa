import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  variant?: 'default' | 'gold' | 'pink' | 'green';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'border-[var(--border-light)]',
    gold: 'border-[#FFD700]/30 bg-amber-50/20 dark:bg-amber-950/10',
    pink: 'border-[#e8b4b8]/40 bg-[#fbf5f6] dark:bg-[#251b22]',
    green: 'border-green-300/40 bg-emerald-50/20 dark:bg-emerald-950/10',
  };

  return (
    <div
      className={`min-h-[140px] p-5 rounded-[20px] bg-[var(--bg-card)] border shadow-[var(--shadow)] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 ${variantStyles[variant]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">
          {title}
        </span>
        <div className="p-2.5 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e]">
          {icon}
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
            {subtitle && <span>{subtitle}</span>}
            {trend && <span className="text-[#28a745] font-semibold">{trend}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
