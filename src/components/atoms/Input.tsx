import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  icon,
  iconPosition = 'left',
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-wide uppercase text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          className={clsx(
            'w-full h-[44px] px-4 rounded-[16px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e1e1e] text-[var(--text-primary)] text-sm transition-all outline-none',
            'focus:border-[#e8b4b8] focus:ring-2 focus:ring-[#e8b4b8]/30 dark:focus:ring-[#e8b4b8]/20',
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
            className
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="absolute right-3.5 text-gray-400 pointer-events-none flex items-center">
            {icon}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};
