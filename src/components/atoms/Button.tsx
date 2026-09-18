import React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'outline' | 'whatsapp' | 'danger' | 'success' | 'ghost' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[#e8b4b8] text-[#1a1418] hover:bg-[#d49a9e] hover:shadow-[0_8px_20px_rgba(232,180,184,0.4)] shadow-[0_4px_14px_rgba(232,180,184,0.3)]',
    outline:
      'bg-transparent border border-current hover:bg-[#e8b4b8]/15 text-inherit',
    whatsapp:
      'bg-[#25D366] text-white hover:bg-[#1da851] hover:shadow-[0_6px_20px_rgba(37,211,102,0.35)]',
    danger:
      'bg-[#dc3545] text-white hover:bg-[#c82333]',
    success:
      'bg-[#28a745] text-white hover:bg-[#218838]',
    ghost:
      'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-inherit',
    gold:
      'bg-[#FFD700] text-[#1a1418] hover:bg-[#e6c200] hover:shadow-[0_6px_20px_rgba(255,215,0,0.35)]',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-xs md:text-sm gap-1.5',
    md: 'px-6 py-2.5 text-sm md:text-base gap-2',
    lg: 'px-8 py-3.5 text-base md:text-lg gap-2.5',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
