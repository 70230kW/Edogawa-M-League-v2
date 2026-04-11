import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { Player } from '@/types';

const EMOJIS = ['👍', '🎉', '😮', '😂', '👏'];

interface ReactionBarProps {
  reactions: Record<string, string[]>;
  currentUserId: string;
  leagueId: string;
  postId: string;
  players: Player[];
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions,
  currentUserId,
  leagueId,
  postId,
  players,
}) => {
  const { toggleReaction } = useTimelineStore();
  const [activeEmoji, setActiveEmoji] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveEmoji(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReact = async (emoji: string) => {
    if (navigator.vibrate) navigator.vibrate(8);
    await toggleReaction(leagueId, postId, emoji, currentUserId);
  };

  const getPlayerName = (userId: string): string => {
    const player = players.find((p) => p.id === userId);
    return player?.name ?? 'メンバー';
  };

  return (
    <div className="flex items-center gap-2 flex-wrap relative" ref={containerRef}>
      {EMOJIS.map((emoji) => {
        const users = reactions[emoji] ?? [];
        const hasReacted = users.includes(currentUserId);
        const isActive = activeEmoji === emoji;

        return (
          <div key={emoji} className="relative">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                if (users.length > 0) {
                  setActiveEmoji(isActive ? null : emoji);
                } else {
                  handleReact(emoji);
                }
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-all ${
                hasReacted
                  ? 'bg-accent/20 border-accent/50 text-accent'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              <span>{emoji}</span>
              {users.length > 0 && <span className="font-medium">{users.length}</span>}
            </motion.button>

            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 z-50 bg-bg-card border border-white/20 rounded-xl px-3 py-2 shadow-xl min-w-[140px]"
                >
                  <p className="text-[10px] text-white/40 mb-2">{emoji} リアクション</p>
                  <div className="space-y-1 mb-2">
                    {users.map((uid) => (
                      <p key={uid} className="text-sm text-white/80 font-medium">
                        {getPlayerName(uid)}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      handleReact(emoji);
                      setActiveEmoji(null);
                    }}
                    className={`w-full text-xs py-1 rounded-lg border transition-all ${
                      hasReacted
                        ? 'border-accent/40 text-accent/70 hover:bg-accent/10'
                        : 'border-white/20 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {hasReacted ? '取り消す' : 'リアクションする'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
