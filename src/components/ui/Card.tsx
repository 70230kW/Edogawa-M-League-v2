import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'gold' | 'red' | 'silver' | 'none';
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  glass = false,
}) => {
  const glowClasses = {
    gold: 'border-accent/40 shadow-[0_0_20px_rgba(212,175,55,0.25)]',
    red: 'border-danger/40 shadow-[0_0_20px_rgba(192,57,43,0.25)]',
    silver: 'border-white/30 shadow-[0_0_15px_rgba(192,192,192,0.2)]',
    none: 'border-white/10',
  };

  const glassClass = glass ? 'backdrop-blur-md bg-white/5' : 'bg-bg-card';

  return (
    <div
      className={`rounded-2xl border ${glowClasses[glow]} ${glassClass} ${className}`}
    >
      {children}
    </div>
  );
};
