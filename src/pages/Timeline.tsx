import React, { useState } from 'react';
import { Pencil, Eye, Edit3 } from 'lucide-react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { TimelineFeed } from '@/components/timeline/TimelineFeed';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRealtimeTimeline } from '@/hooks/useRealtime';

// Simple markdown renderer (supports **bold**, *italic*, # heading, - list, > quote)
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

function MarkdownPreview({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="text-sm text-white/80 leading-relaxed space-y-1 min-h-[100px]">
      {lines.map((line, i) => {
        const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const sizes = [
            'text-base font-bold text-white',
            'text-sm font-bold text-white/90',
            'text-sm font-semibold text-white/80',
          ];
          return <p key={i} className={sizes[level - 1]}>{renderInline(headingMatch[2])}</p>;
        }
        if (line.startsWith('> ')) {
          return (
            <p key={i} className="border-l-2 border-accent/50 pl-3 text-white/60 italic">
              {renderInline(line.slice(2))}
            </p>
          );
        }
        if (/^[-*]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-accent flex-shrink-0 mt-0.5">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

export const Timeline: React.FC = () => {
  const { league } = useLeagueStore();
  const { addPost } = useTimelineStore();
  const { user } = useAuthStore();
  const [showPost, setShowPost] = useState(false);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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
      setPreviewMode(false);
      setShowPost(false);
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    setShowPost(false);
    setPreviewMode(false);
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

      <Modal isOpen={showPost} onClose={handleClose} title="投稿する">
        <div className="space-y-3">
          {/* Edit / Preview toggle */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setPreviewMode(false)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !previewMode ? 'bg-accent/20 text-accent' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Edit3 className="w-3 h-3" />編集
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                previewMode ? 'bg-accent/20 text-accent' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Eye className="w-3 h-3" />プレビュー
            </button>
          </div>

          {previewMode ? (
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-h-[100px]">
              {text.trim() ? (
                <MarkdownPreview text={text} />
              ) : (
                <p className="text-white/30 text-sm italic">プレビューがここに表示されます</p>
              )}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`コメントを入力…\n\n**太字** *斜体* # 見出し\n- リスト > 引用`}
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-accent resize-none text-sm"
            />
          )}

          <p className="text-[10px] text-white/25">
            **太字** · *斜体* · # 見出し · - リスト · &gt; 引用
          </p>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={handleClose}>
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
