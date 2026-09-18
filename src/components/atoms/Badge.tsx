import React from 'react';
import clsx from 'clsx';
import { BookingStatus } from '../../types';

interface BadgeProps {
  status?: BookingStatus;
  variant?: 'status' | 'gold' | 'discount' | 'neutral' | 'category';
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'status',
  children,
  className,
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-xs font-semibold';

  if (status) {
    const statusStyles: Record<BookingStatus, string> = {
      pending: 'bg-[#fff3cd] text-[#856404] border border-[#ffeeba]',
      confirmed: 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]',
      completed: 'bg-[#cce5ff] text-[#004085] border border-[#b8daff]',
      cancelled: 'bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]',
    };

    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-full capitalize font-medium',
          sizeClass,
          statusStyles[status],
          className
        )}
      >
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            status === 'pending' && 'bg-[#856404]',
            status === 'confirmed' && 'bg-[#155724]',
            status === 'completed' && 'bg-[#004085]',
            status === 'cancelled' && 'bg-[#721c24]'
          )}
        />
        {children || status}
      </span>
    );
  }

  if (variant === 'gold') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 rounded-full bg-[#fff8db] dark:bg-[#3a301a] text-[#996500] dark:text-[#ffd700] border border-[#ffd700]/50 font-semibold',
          sizeClass,
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === 'discount') {
    return (
      <span
        className={clsx(
          'inline-flex items-center justify-center rounded-full bg-[#e8b4b8] text-[#1a1418] font-bold shadow-md',
          className
        )}
      >
        {children}
      </span>
    );
  }

  if (variant === 'category') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 rounded-full bg-[#f5edea] dark:bg-[#2d2228] text-[#d49a9e] text-xs font-medium px-3 py-1',
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 text-inherit font-medium',
        sizeClass,
        className
      )}
    >
      {children}
    </span>
  );
};
