import React from 'react';
import { BarChart2, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { TimelinePost, Player } from '@/types';
import { ReactionBar } from './ReactionBar';
import { CommentSection } from './CommentSection';
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
  const isSessionReport = post.type === 'session_report';
  const isYakumanFlash = post.type === 'yakuman_flash';
  const isChonboFlash = post.type === 'chonbo_flash';

  // 手動投稿の場合: 連携済みプレイヤーを triggeredBy から特定
  const linkedPlayer = post.type === 'manual'
    ? players.find((p) => p.linkedUserId === post.triggeredBy)
    : null;

  const cardClass = isDailyReport || isSessionReport
    ? 'border-accent/40 bg-gradient-to-br from-accent/10 to-bg-card shadow-[0_0_20px_rgba(212,175,55,0.15)]'
    : isYakumanFlash
    ? 'border-danger/40 bg-gradient-to-br from-danger/10 to-bg-card shadow-[0_0_20px_rgba(192,57,43,0.15)]'
    : 'border-white/10 bg-bg-card';

  const chonboCardStyle = isChonboFlash
    ? { background: 'rgba(255, 50, 50, 0.1)', borderColor: 'rgba(255, 50, 50, 0.3)' }
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 space-y-3 ${isChonboFlash ? '' : cardClass}`}
      style={chonboCardStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDailyReport && (
            <span className="text-xs bg-accent/20 border border-accent/40 text-accent px-2 py-0.5 rounded-full font-bold">
              <BarChart2 className="w-3 h-3 inline mr-1" />対局日報
            </span>
          )}
          {isSessionReport && (
            <span className="text-xs bg-accent/20 border border-accent/40 text-accent px-2 py-0.5 rounded-full font-bold">
              <BarChart2 className="w-3 h-3 inline mr-1" />セッション結果
            </span>
          )}
          {isYakumanFlash && (
            <span className="text-xs bg-danger/20 border border-danger/40 text-danger px-2 py-0.5 rounded-full font-bold">
              <Trophy className="w-3 h-3 inline mr-1" />役満速報
            </span>
          )}
          {isChonboFlash && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(255,50,50,0.2)', border: '1px solid rgba(255,50,50,0.4)', color: 'rgb(255,80,80)' }}
            >
              <Zap className="w-3 h-3 inline mr-1" />チョンボ速報
            </span>
          )}
          {post.type === 'manual' && (
            <span className="flex items-center gap-1 text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
              {linkedPlayer ? (
                <>
                  <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {linkedPlayer.name}
                </>
              ) : (
                '投稿'
              )}
            </span>
          )}
        </div>
        <p className="text-xs text-white/30">
          {formatRelativeDate(post.createdAt)} {formatTime(post.createdAt)}
        </p>
      </div>

      {/* Content */}
      <div className={`text-sm whitespace-pre-line leading-relaxed ${
        isDailyReport || isSessionReport
          ? 'text-white/90'
          : isYakumanFlash
          ? 'text-white font-medium'
          : isChonboFlash
          ? 'text-white/90'
          : 'text-white/80'
      }`}>
        {isYakumanFlash && (
          <p className="text-danger text-2xl font-black mb-2 flex items-center gap-2">
            <Trophy className="w-6 h-6 flex-shrink-0" />
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
        players={players}
      />

      {/* Comments */}
      <CommentSection leagueId={leagueId} postId={post.id} />
    </motion.div>
  );
};
