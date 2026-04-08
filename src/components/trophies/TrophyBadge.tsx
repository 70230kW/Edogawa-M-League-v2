import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyDefinition, UnlockedTrophy } from '@/types';
import { RANK_META } from '@/utils/achievements';

interface TrophyBadgeProps {
  definition: TrophyDefinition;
  unlocked?: UnlockedTrophy;
  size?: 'sm' | 'md' | 'lg';
}

export const TrophyBadge: React.FC<TrophyBadgeProps> = ({
  definition,
  unlocked,
  size = 'md',
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const isUnlocked = !!unlocked;
  const meta = RANK_META[definition.rank];

  const emojiSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-5xl' : 'text-3xl';
  const nameSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-sm' : 'text-[10px]';
  const padding = size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3';

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={() => setShowDetail(true)}
        className={`flex flex-col items-center gap-1 ${padding} rounded-2xl border transition-all duration-200 w-full`}
        style={
          isUnlocked
            ? {
                background: meta.bg,
                borderColor: meta.border,
                boxShadow: meta.glow,
              }
            : {
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.06)',
              }
        }
      >
        <span
          className={`${emojiSize} leading-none`}
          style={{ filter: isUnlocked ? `drop-shadow(0 0 6px ${meta.color})` : 'grayscale(1) brightness(0.3)' }}
        >
          {definition.icon}
        </span>
        <p
          className={`${nameSize} font-medium text-center leading-tight line-clamp-2`}
          style={{ color: isUnlocked ? meta.color : 'rgba(255,255,255,0.2)' }}
        >
          {isUnlocked ? definition.name : '？？？'}
        </p>
      </motion.button>

      {/* 詳細モーダル */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              className="rounded-2xl p-6 max-w-xs w-full text-center space-y-3"
              style={{
                background: isUnlocked ? meta.bg : 'rgba(0,5,20,0.95)',
                border: `1px solid ${isUnlocked ? meta.border : 'rgba(255,255,255,0.1)'}`,
                boxShadow: isUnlocked ? meta.glow : 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-6xl block"
                style={{ filter: isUnlocked ? `drop-shadow(0 0 10px ${meta.color})` : 'grayscale(1) brightness(0.4)' }}
              >
                {definition.icon}
              </span>
              <div>
                <p className="text-xs font-bold tracking-wider" style={{ color: meta.color }}>
                  {meta.label}
                </p>
                <p className="text-white font-bold text-lg mt-1"
                   style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {isUnlocked ? definition.name : '未解除'}
                </p>
              </div>
              <p className="text-sm text-white/70">{definition.description}</p>
              {isUnlocked && (
                <p className="text-xs italic text-white/50 border-t border-white/10 pt-2">
                  「{definition.comment}」
                </p>
              )}
              {isUnlocked && unlocked?.unlockedAt && (
                <p className="text-xs" style={{ color: meta.color }}>
                  解除日: {unlocked.unlockedAt.toLocaleDateString('ja-JP')}
                </p>
              )}
              {definition.manual && !isUnlocked && (
                <p className="text-xs text-white/40">※ 自己申告で解除</p>
              )}
              <button
                className="text-xs text-white/30 mt-2"
                onClick={() => setShowDetail(false)}
              >
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
