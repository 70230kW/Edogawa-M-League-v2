import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { M_LEAGUE_SETTINGS } from '@/utils/pointCalc';

interface CreateLeagueProps {
  onCreated: (leagueId: string) => void;
}

export const CreateLeague: React.FC<CreateLeagueProps> = ({ onCreated }) => {
  const { createLeague } = useLeagueStore();
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      const id = await createLeague(name.trim(), description.trim(), user.uid);
      onCreated(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-2">
          <p className="text-5xl">🀄</p>
          <h1 className="text-2xl font-bold text-white">リーグを作成</h1>
          <p className="text-white/50 text-sm">
            仲間内のリーグを作成して対局を記録しましょう
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60 block mb-2">リーグ名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 2026年麻雀リーグ"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-2">説明（任意）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="リーグの説明を入力…"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/50 space-y-1">
            <p className="text-white/70 font-medium mb-1">デフォルト設定（Mリーグ準拠）</p>
            <p>原点: 25,000点 / 返し点: 30,000点</p>
            <p>順位点: +50 / +10 / −10 / −30</p>
            <p>オカ: 20pt / チョンボ: −20pt</p>
            <p className="text-white/30">※ 設定画面から変更できます</p>
          </div>

          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={handleCreate}
            loading={loading}
            disabled={!name.trim()}
          >
            🀄 リーグを作成する
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
