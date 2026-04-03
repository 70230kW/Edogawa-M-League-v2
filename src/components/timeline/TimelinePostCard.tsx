import React from 'react';
import { motion } from 'framer-motion';
import { TimelinePost, Player } from '@/types';
import { ReactionBar } from './ReactionBar';
import { formatRelativeDate, formatTime } from '@/utils/dateUtils';

interface TimelinePostCardProps {
  post: TimelinePost;
  players: Player[];
  currentUserId: string;
  leagueId: string;
}

export const TimelinePostCard: React.FC<TimelinePostCardProps> = ({
  post,
  players,
  currentUserId,
  leagueId,
}) => {
  const isDailyReport = post.type === 'daily_report';
  const isYakumanFlash = post.type === 'yakuman_flash';

  const cardClass = isDailyReport
    ? 'border-accent/40 bg-gradient-to-br from-accent/10 to-bg-card shadow-[0_0_20px_rgba(212,175,55,0.15)]'
    : isYakumanFlash
    ? 'border-danger/40 bg-gradient-to-br from-danger/10 to-bg-card shadow-[0_0_20px_rgba(192,57,43,0.15)]'
    : 'border-white/10 bg-bg-card';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 space-y-3 ${cardClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDailyReport && (
            <span className="text-xs bg-accent/20 border border-accent/40 text-accent px-2 py-0.5 rounded-full font-bold">
              📊 対局日報
            </span>
          )}
          {isYakumanFlash && (
            <span className="text-xs bg-danger/20 border border-danger/40 text-danger px-2 py-0.5 rounded-full font-bold">
              🀄 役満速報
            </span>
          )}
          {post.type === 'manual' && (
            <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
              投稿
            </span>
          )}
        </div>
        <p className="text-xs text-white/30">
          {formatRelativeDate(post.createdAt)} {formatTime(post.createdAt)}
        </p>
      </div>

      {/* Content */}
      <div className={`text-sm whitespace-pre-line leading-relaxed ${
        isDailyReport ? 'text-white/90' : isYakumanFlash ? 'text-white font-medium' : 'text-white/80'
      }`}>
        {isYakumanFlash && (
          <p className="text-danger text-2xl font-black mb-2">
            🀄{' '}
            {'yakumanList' in post.meta
              ? (post.meta as any).yakumanList?.join(' + ')
              : ''}
          </p>
        )}
        {post.content}
      </div>

      {/* Reactions */}
      <ReactionBar
        reactions={post.reactions}
        currentUserId={currentUserId}
        leagueId={leagueId}
        postId={post.id}
      />
    </motion.div>
  );
};
