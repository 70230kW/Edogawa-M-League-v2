import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { TimelineFeed } from '@/components/timeline/TimelineFeed';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRealtimeTimeline } from '@/hooks/useRealtime';

export const Timeline: React.FC = () => {
  const { league } = useLeagueStore();
  const { addPost } = useTimelineStore();
  const { user } = useAuthStore();
  const [showPost, setShowPost] = useState(false);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const leagueId = league?.id ?? '';
  useRealtimeTimeline(leagueId);

  const handlePost = async () => {
    if (!user || !text.trim()) return;
    setPosting(true);
    try {
      await addPost(leagueId, {
        type: 'manual',
        content: text.trim(),
        triggeredBy: user.uid,
        meta: { authorId: user.uid },
      });
      setText('');
      setShowPost(false);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">タイムライン</h1>
        <Button variant="secondary" size="sm" onClick={() => setShowPost(true)}>
          <Pencil className="w-3.5 h-3.5 mr-1" />投稿
        </Button>
      </div>

      <TimelineFeed leagueId={leagueId} />

      <Modal isOpen={showPost} onClose={() => setShowPost(false)} title="投稿する">
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="コメントを入力…"
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent resize-none"
          />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowPost(false)}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handlePost}
              loading={posting}
              disabled={!text.trim()}
            >
              投稿する
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
