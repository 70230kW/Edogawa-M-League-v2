import React, { useState } from 'react';
import { Player } from '@/types';
import { SeatWind, WIND_LABELS, WIND_ORDER } from '@/utils/draftSession';

interface MahjongTableSeatProps {
  players: Player[];
  seatMap: Record<string, SeatWind>;
  onChange: (seatMap: Record<string, SeatWind>) => void;
}

export const MahjongTableSeat: React.FC<MahjongTableSeatProps> = ({
  players,
  seatMap,
  onChange,
}) => {
  const [selectingWind, setSelectingWind] = useState<SeatWind | null>(null);

  const windToPlayerId: Partial<Record<SeatWind, string>> = {};
  for (const [pid, wind] of Object.entries(seatMap)) {
    windToPlayerId[wind] = pid;
  }

  const getPlayerForWind = (wind: SeatWind): Player | undefined =>
    players.find((p) => windToPlayerId[wind] === p.id);

  const handleAssign = (wind: SeatWind, playerId: string) => {
    const newMap: Record<string, SeatWind> = {};
    for (const [pid, w] of Object.entries(seatMap)) {
      // 同プレイヤーの既存割り当てと、この座席の既存割り当ては除外してから再追加
      if (pid !== playerId && w !== wind) newMap[pid] = w;
    }
    newMap[playerId] = wind;
    onChange(newMap);
    setSelectingWind(null);
  };

  const handleClear = (wind: SeatWind) => {
    const newMap: Record<string, SeatWind> = {};
    for (const [pid, w] of Object.entries(seatMap)) {
      if (w !== wind) newMap[pid] = w;
    }
    onChange(newMap);
    setSelectingWind(null);
  };

  const SeatSlot = ({ wind }: { wind: SeatWind }) => {
    const player = getPlayerForWind(wind);
    const isSelecting = selectingWind === wind;
    return (
      <button
        onClick={() => setSelectingWind(isSelecting ? null : wind)}
        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl w-[76px] h-[76px] transition-all border ${
          isSelecting
            ? 'bg-accent/20 border-accent shadow-[0_0_10px_rgba(250,204,21,0.25)]'
            : player
            ? 'bg-accent/10 border-accent/40'
            : 'bg-white/5 border-dashed border-white/25'
        }`}
      >
        <span className="text-[10px] text-white/50 font-medium">{WIND_LABELS[wind]}家</span>
        {player ? (
          <>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: player.color }}
            >
              {player.name[0]}
            </div>
            <span className="text-[10px] text-white font-medium leading-tight truncate max-w-[60px] text-center">
              {player.name}
            </span>
          </>
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/30 text-xl">
            ?
          </div>
        )}
      </button>
    );
  };

  const assignedCount = Object.keys(seatMap).length;

  return (
    <div className="space-y-4">
      {/* 麻雀卓 */}
      <div className="flex flex-col items-center gap-2">
        <SeatSlot wind="north" />
        <div className="flex items-center gap-3">
          <SeatSlot wind="west" />
          <div className="w-[60px] h-[60px] rounded-full bg-emerald-900/40 border-2 border-emerald-700/40 flex items-center justify-center select-none shrink-0">
            <span className="text-xl">🀫</span>
          </div>
          <SeatSlot wind="east" />
        </div>
        <SeatSlot wind="south" />
      </div>

      {/* 割り当て進捗 */}
      <div className="flex justify-center gap-1.5">
        {WIND_ORDER.map((w) => (
          <div
            key={w}
            className={`w-2 h-2 rounded-full transition-colors ${
              windToPlayerId[w] ? 'bg-accent' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* プレイヤー選択パネル */}
      {selectingWind && (
        <div className="bg-white/5 border border-accent/30 rounded-xl p-3 space-y-2">
          <p className="text-xs text-accent font-medium">
            {WIND_LABELS[selectingWind]}家のプレイヤーを選択
          </p>
          <div className="grid grid-cols-2 gap-2">
            {players.map((p) => {
              const assignedWind = seatMap[p.id] as SeatWind | undefined;
              const isHere = assignedWind === selectingWind;
              const isElsewhere = assignedWind !== undefined && assignedWind !== selectingWind;
              return (
                <button
                  key={p.id}
                  onClick={() => !isElsewhere && handleAssign(selectingWind, p.id)}
                  disabled={isElsewhere}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
                    isHere
                      ? 'bg-accent/15 border-accent/50 text-accent'
                      : isElsewhere
                      ? 'bg-white/3 border-white/5 text-white/25 cursor-not-allowed'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 active:bg-white/15'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate flex-1">{p.name}</span>
                  {isElsewhere && assignedWind && (
                    <span className="text-[10px] text-white/30 shrink-0">
                      {WIND_LABELS[assignedWind]}家
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {windToPlayerId[selectingWind] && (
            <button
              onClick={() => handleClear(selectingWind)}
              className="w-full py-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors"
            >
              この座席を空にする
            </button>
          )}
        </div>
      )}

      <p className="text-[10px] text-white/25 text-center">
        座席をタップしてプレイヤーを割り当て
        {assignedCount > 0 && assignedCount < 4 && ` • あと${4 - assignedCount}席`}
      </p>
    </div>
  );
};
