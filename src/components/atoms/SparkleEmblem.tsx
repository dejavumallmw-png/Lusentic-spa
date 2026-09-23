import React from 'react';

interface SparkleEmblemProps {
  size?: 'sm' | 'md' | 'lg';
  customLogo?: string;
  className?: string;
}

export const SparkleEmblem: React.FC<SparkleEmblemProps> = ({
  size = 'sm',
  customLogo,
  className = '',
}) => {
  if (customLogo) {
    if (size === 'sm') {
      return (
        <div className={`w-9 h-9 rounded-full overflow-hidden border border-[#e8b4b8]/70 shadow-sm shrink-0 bg-white/10 flex items-center justify-center ${className}`}>
          <img src={customLogo} alt="Lusentic Spa Logo" className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#d49a9e]/20 via-[#e8b4b8]/30 to-transparent flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#e8b4b8] shadow-xl shadow-[#d49a9e]/25 bg-white/10 flex items-center justify-center">
            <img src={customLogo} alt="Lusentic Spa Logo" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] flex items-center justify-center shadow-sm shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#1a1418]">
          <path
            d="M50 8 C50 32 32 50 8 50 C32 50 50 68 50 92 C50 68 68 50 92 50 C68 50 50 32 50 8 Z"
            fill="currentColor"
          />
          <path
            d="M78 18 C78 24 74 28 68 28 C74 28 78 32 78 38 C78 32 82 28 88 28 C82 28 78 24 78 18 Z"
            fill="#FFD700"
          />
          <circle cx="26" cy="74" r="5" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#d49a9e]/20 via-[#e8b4b8]/30 to-transparent flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#d49a9e] to-[#e8b4b8] flex items-center justify-center shadow-xl shadow-[#d49a9e]/25">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 sm:w-12 sm:h-12 text-[#1a1418]">
            <path
              d="M50 8 C50 32 32 50 8 50 C32 50 50 68 50 92 C50 68 68 50 92 50 C68 50 50 32 50 8 Z"
              fill="currentColor"
            />
            <path
              d="M78 18 C78 24 74 28 68 28 C74 28 78 32 78 38 C78 32 82 28 88 28 C82 28 78 24 78 18 Z"
              fill="#FFD700"
            />
            <circle cx="26" cy="74" r="5" fill="none" stroke="currentColor" strokeWidth="3.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
