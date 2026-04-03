import React from 'react';
import { motion } from 'framer-motion';
import { useTimelineStore } from '@/stores/useTimelineStore';

const EMOJIS = ['👍', '🎉', '😮', '😂', '👏'];

interface ReactionBarProps {
  reactions: Record<string, string[]>;
  currentUserId: string;
  leagueId: string;
  postId: string;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions,
  currentUserId,
  leagueId,
  postId,
}) => {
  const { toggleReaction } = useTimelineStore();

  const handleReact = async (emoji: string) => {
    if (navigator.vibrate) navigator.vibrate(8);
    await toggleReaction(leagueId, postId, emoji, currentUserId);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {EMOJIS.map((emoji) => {
        const users = reactions[emoji] ?? [];
        const hasReacted = users.includes(currentUserId);
        return (
          <motion.button
            key={emoji}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleReact(emoji)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-all ${
              hasReacted
                ? 'bg-accent/20 border-accent/50 text-accent'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            <span>{emoji}</span>
            {users.length > 0 && <span className="font-medium">{users.length}</span>}
          </motion.button>
        );
      })}
    </div>
  );
};
