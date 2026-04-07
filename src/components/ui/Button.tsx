import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none';

  const variants: Record<string, string> = {
    primary: 'text-white border border-accent/30',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/15',
    danger: 'bg-danger hover:bg-danger-light text-white border border-danger-light/30',
    ghost: 'bg-transparent hover:bg-white/8 text-white/70 hover:text-white',
    gold: 'text-black font-bold border border-gold/50',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)', boxShadow: '0 0 15px rgba(0,212,255,0.2)' },
    secondary: {},
    danger: {},
    ghost: {},
    gold: { background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', boxShadow: '0 0 15px rgba(255,215,0,0.3)' },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      style={variantStyles[variant]}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          処理中…
        </span>
      ) : children}
    </motion.button>
  );
};
