import React, { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatRelativeDate, formatTime } from '@/utils/dateUtils';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

interface CommentSectionProps {
  leagueId: string;
  postId: string;
}

function safeToDate(value: unknown): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof (value as any)?.toDate === 'function') return (value as any).toDate();
  if (typeof (value as any)?.seconds === 'number') return new Date((value as any).seconds * 1000);
  return new Date();
}

export const CommentSection: React.FC<CommentSectionProps> = ({ leagueId, postId }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'leagues', leagueId, 'timeline', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((d) => ({
          id: d.id,
          authorId: d.data().authorId ?? '',
          authorName: d.data().authorName ?? 'メンバー',
          content: d.data().content ?? '',
          createdAt: safeToDate(d.data().createdAt),
        }))
      );
    });
    return unsub;
  }, [leagueId, postId]);

  const handleSubmit = async () => {
    if (!inputText.trim() || loading || !user) return;
    setLoading(true);
    try {
      await addDoc(
        collection(db, 'leagues', leagueId, 'timeline', postId, 'comments'),
        {
          authorId: user.uid,
          authorName: user.displayName ?? user.email ?? 'メンバー',
          content: inputText.trim(),
          createdAt: serverTimestamp(),
        }
      );
      setInputText('');
    } catch (err) {
      console.error('Comment submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 pt-1 border-t border-white/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {comments.length > 0
          ? `コメントを見る（${comments.length}件）`
          : 'コメントを追加'}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-medium text-white/80">{c.authorName}</span>
                    <span className="text-[10px] text-white/30">
                      {formatRelativeDate(c.createdAt)} {formatTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{c.content}</p>
                </div>
              ))}

              <div className="flex gap-2 items-center">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="コメントを入力…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || loading}
                  className="p-2 rounded-xl bg-accent/20 border border-accent/40 text-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
