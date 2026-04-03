import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', label: 'ホーム', emoji: '🏠' },
  { to: '/games', label: '対局', emoji: '🎮' },
  { to: '/timeline', label: 'タイム\nライン', emoji: '📰' },
  { to: '/stats', label: '統計', emoji: '📊' },
  { to: '/players', label: 'メンバー', emoji: '👥' },
];

export const BottomNav: React.FC = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card/90 backdrop-blur-md border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 px-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-accent' : 'text-white/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.span
                  className="text-2xl leading-none"
                  animate={{ scale: isActive ? 1.1 : 1 }}
                >
                  {item.emoji}
                </motion.span>
                <span className="text-[9px] font-medium leading-tight text-center whitespace-pre-line">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 h-0.5 w-8 bg-accent rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
