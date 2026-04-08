import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementStore } from '@/stores/useAchievementStore';
import { RANK_META } from '@/utils/achievements';

export const AchievementToast: React.FC = () => {
  const { toastQueue, dismissToast } = useAchievementStore();
  const current = toastQueue[0];

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(dismissToast, 3000);
    return () => clearTimeout(timer);
  }, [current?.trophy.id]);

  const rankMeta = current ? RANK_META[current.trophy.rank] : null;

  return (
    <AnimatePresence mode="wait">
      {current && rankMeta && (
        <motion.div
          key={current.trophy.id}
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 z-[100] cursor-pointer"
          style={{ x: '-50%' }}
          onClick={dismissToast}
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-md min-w-[280px] max-w-[360px]"
            style={{
              background: rankMeta.bg,
              border: `1px solid ${rankMeta.border}`,
              boxShadow: rankMeta.glow,
            }}
          >
            {/* アイコン */}
            <motion.span
              className="text-4xl flex-shrink-0"
              animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {current.trophy.icon}
            </motion.span>

            {/* テキスト */}
            <div className="min-w-0">
              <p
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: rankMeta.color, fontFamily: 'Rajdhani, sans-serif' }}
              >
                🏆 実績解除！ — {current.playerName}
              </p>
              <p
                className="font-bold text-white text-base leading-tight"
                style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: `0 0 8px ${rankMeta.color}` }}
              >
                {current.trophy.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {current.trophy.description}
              </p>
            </div>
          </div>

          {/* プログレスバー（3秒） */}
          <motion.div
            className="h-0.5 rounded-full mt-1 mx-1"
            style={{ background: rankMeta.color }}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
