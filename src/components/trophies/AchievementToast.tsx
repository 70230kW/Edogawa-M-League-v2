import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from '@/types';
import { TROPHY_DEFINITIONS } from '@/utils/achievements';
import { TrophyId } from '@/types';

interface AchievementToastProps {
  trophyIds: TrophyId[];
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  trophyIds,
  onClose,
}) => {
  useEffect(() => {
    if (trophyIds.length > 0) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [trophyIds, onClose]);

  const trophy = trophyIds[0] ? TROPHY_DEFINITIONS[trophyIds[0]] : null;

  return (
    <AnimatePresence>
      {trophy && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-accent/20 border border-accent/50 rounded-3xl backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.4)]"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl"
          >
            {trophy.emoji}
          </motion.span>
          <div>
            <p className="text-xs text-accent font-bold">実績解除！</p>
            <p className="text-white font-bold">{trophy.name}</p>
            <p className="text-white/60 text-xs">{trophy.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
