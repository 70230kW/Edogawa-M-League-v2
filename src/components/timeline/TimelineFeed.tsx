import React, { useEffect, useRef } from 'react';
import { Newspaper } from 'lucide-react';
import { TimelinePostCard } from './TimelinePostCard';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Skeleton } from '@/components/ui/Skeleton';

interface TimelineFeedProps {
  leagueId: string;
}

export const TimelineFeed: React.FC<TimelineFeedProps> = ({ leagueId }) => {
  const { posts, loading, hasMore, loadMorePosts } = useTimelineStore();
  const { players } = useLeagueStore();
  const { user } = useAuthStore();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMorePosts(leagueId);
        }
      },
      { threshold: 0.5 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, leagueId]);

  if (posts.length === 0 && loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-32" count={3} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        <Newspaper className="w-12 h-12 mb-3 mx-auto opacity-30" />
        <p className="text-sm">タイムラインがまだありません</p>
        <p className="text-xs mt-1">対局を締めると日報が投稿されます</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <TimelinePostCard
          key={post.id}
          post={post}
          players={players}
          currentUserId={user?.uid ?? ''}
          leagueId={leagueId}
        />
      ))}

      <div ref={loaderRef} className="py-4 text-center">
        {loading && <p className="text-white/30 text-sm">読み込み中…</p>}
        {!hasMore && posts.length > 0 && (
          <p className="text-white/20 text-xs">すべて読み込み済み</p>
        )}
      </div>
    </div>
  );
};
