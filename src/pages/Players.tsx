import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { PlayerCard } from '@/components/players/PlayerCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Player } from '@/types';

const COLORS = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
  '#1abc9c', '#3498db', '#9b59b6', '#e91e63',
  '#ff5722', '#795548', '#607d8b', '#d4af37',
];

export const Players: React.FC = () => {
  const { league, players, standings, addPlayer, updatePlayer } = useLeagueStore();
  const { user } = useAuthStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(COLORS[0]);

  const sortedStandings = [...standings].sort((a, b) => b.totalPoint - a.totalPoint);
  const activePlayers = players.filter((p) => p.isActive);

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setEditName(player.name);
    setEditColor(player.color);
  };

  const handleSaveEdit = async () => {
    if (!league || !editingPlayer || !editName.trim()) return;
    setLoading(true);
    try {
      await updatePlayer(league.id, editingPlayer.id, { name: editName.trim(), color: editColor });
      setEditingPlayer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!league || !name.trim()) return;
    setLoading(true);
    try {
      await addPlayer(league.id, name.trim(), color);
      setName('');
      setShowAdd(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">メンバー</h1>
        <Button variant="gold" size="sm" onClick={() => setShowAdd(true)}>
          ＋ 追加
        </Button>
      </div>

      {activePlayers.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Users className="w-12 h-12 mb-3 mx-auto opacity-30" />
          <p className="text-sm">メンバーを追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedStandings.map((s, i) => {
            const player = players.find((p) => p.id === s.playerId && p.isActive);
            if (!player) return null;
            return <PlayerCard key={s.playerId} player={player} standing={s} rank={i} currentUserId={user?.uid} onEdit={() => handleOpenEdit(player)} />;
          })}
          {/* Players with no games yet */}
          {activePlayers
            .filter((p) => !sortedStandings.find((s) => s.playerId === p.id))
            .map((p) => (
              <PlayerCard key={p.id} player={p} currentUserId={user?.uid} onEdit={() => handleOpenEdit(p)} />
            ))}
        </div>
      )}

      {/* Edit player modal */}
      <Modal isOpen={!!editingPlayer} onClose={() => setEditingPlayer(null)} title="メンバーを編集">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60 block mb-2">名前</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              placeholder="プレイヤー名を入力"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-2">カラー</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setEditColor(c)}
                  className={`w-10 h-10 rounded-full border-2 transition-transform ${
                    editColor === c
                      ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setEditingPlayer(null)}>
              キャンセル
            </Button>
            <Button
              variant="gold"
              className="flex-1"
              onClick={handleSaveEdit}
              loading={loading}
              disabled={!editName.trim()}
            >
              保存する
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="メンバーを追加">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/60 block mb-2">名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="プレイヤー名を入力"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-2">カラー</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-2 transition-transform ${
                    color === c
                      ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowAdd(false)}>
              キャンセル
            </Button>
            <Button
              variant="gold"
              className="flex-1"
              onClick={handleAdd}
              loading={loading}
              disabled={!name.trim()}
            >
              追加する
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
