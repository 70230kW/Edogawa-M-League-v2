import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Swords, Newspaper, Trophy, BarChart2, Users } from 'lucide-react';

const navItems = [
  { to: '/', label: 'ホーム', Icon: Home },
  { to: '/games', label: '対局', Icon: Swords },
  { to: '/timeline', label: 'TL', Icon: Newspaper },
  { to: '/trophies', label: 'トロフィー', Icon: Trophy },
  { to: '/stats', label: '統計', Icon: BarChart2 },
  { to: '/players', label: 'メンバー', Icon: Users },
];

export const BottomNav: React.FC = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: 'rgba(0, 5, 15, 0.95)',
        borderTopColor: 'rgba(0, 212, 255, 0.2)',
        boxShadow: '0 -1px 20px rgba(0, 212, 255, 0.06)',
      }}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 px-1 rounded-xl transition-all duration-200 relative"
          >
            {({ isActive }) => (
              <>
                <motion.span
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  className="flex items-center justify-center"
                >
                  <item.Icon
                    className="w-5 h-5"
                    style={{
                      color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.8))' : 'none',
                    }}
                  />
                </motion.span>
                <span
                  className="text-[8px] font-medium leading-tight text-center transition-colors"
                  style={{
                    color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                    fontFamily: isActive ? 'Rajdhani, sans-serif' : undefined,
                    textShadow: isActive ? '0 0 8px rgba(0, 212, 255, 0.6)' : 'none',
                  }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 h-0.5 w-6 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #0066ff, #00d4ff)' }}
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
