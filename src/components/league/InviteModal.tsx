import React, { useState } from 'react';
import { Share2, Check, Copy, MessageSquare, RefreshCw } from 'lucide-react';
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  leagueId,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuthStore();

  const inviteUrl = inviteCode
    ? `${window.location.origin}/invite/${inviteCode}`
    : '';

  const generateInvite = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await addDoc(collection(db, 'leagues', leagueId, 'invites'), {
        leagueId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        usedBy: [],
        code,
      });
      setInviteCode(code);
    } finally {
      setGenerating(false);
    }
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToLine = () => {
    window.open(
      `https://line.me/R/msg/text/?${encodeURIComponent(`江戸川Mリーグに参加！\n${inviteUrl}`)}`,
      '_blank'
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="招待コード">
      <div className="space-y-4">
        {!inviteCode ? (
          <div className="text-center py-4">
            <p className="text-white/60 text-sm mb-4">
              招待コードを生成してメンバーを招待できます（7日間有効）
            </p>
            <Button variant="gold" onClick={generateInvite} loading={generating} size="lg">
              <Share2 className="w-4 h-4 mr-1.5" />招待コードを生成
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-xs text-white/40 mb-1">招待コード</p>
              <p className="text-3xl font-bold text-accent tracking-widest">{inviteCode}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-xs text-white/40 mb-1">招待URL</p>
              <p className="text-xs text-white/80 break-all">{inviteUrl}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={copyUrl}>
                {copied ? <><Check className="w-3.5 h-3.5 mr-1" />コピー済み</> : <><Copy className="w-3.5 h-3.5 mr-1" />URLをコピー</>}
              </Button>
              <Button
                variant="primary"
                onClick={shareToLine}
                className="bg-green-700 hover:bg-green-600"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1" />LINEで共有
              </Button>
            </div>

            <Button variant="ghost" className="w-full" onClick={generateInvite} loading={generating}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />新しいコードを生成
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
