import React from 'react';
import {
  RadarChart as ReRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Standing, Player } from '@/types';

interface RadarChartProps {
  standings: Standing[];
  players: Player[];
  selectedPlayerIds: string[];
}

const MAX_VALUES = {
  top1Rate: 100,
  avgRankScore: 100,
  lastAvoidRate: 100,
  top2Rate: 100,
  gamesNorm: 100,
};

export const PlayerRadarChart: React.FC<RadarChartProps> = ({
  standings,
  players,
  selectedPlayerIds,
}) => {
  const hasData = selectedPlayerIds.length > 0 && selectedPlayerIds.some((id) => standings.some((s) => s.playerId === id));

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-60 text-white/30 text-sm">
        データがありません
      </div>
    );
  }

  const maxGames = Math.max(...standings.map((s) => s.totalGames), 1);

  const dimensions = [
    { key: 'top1Rate', label: '1位率' },
    { key: 'top2Rate', label: 'トップ2率' },
    { key: 'lastAvoidRate', label: 'ラス回避率' },
    { key: 'avgRankScore', label: '平均順位スコア' },
    { key: 'gamesNorm', label: '対局数' },
  ];

  const data = dimensions.map((dim) => {
    const entry: Record<string, any> = { dim: dim.label };
    for (const id of selectedPlayerIds) {
      const s = standings.find((st) => st.playerId === id);
      if (!s) continue;
      if (dim.key === 'top1Rate') entry[id] = s.top1Rate;
      else if (dim.key === 'top2Rate') entry[id] = s.top2Rate;
      else if (dim.key === 'lastAvoidRate') entry[id] = 100 - s.lastRate;
      else if (dim.key === 'avgRankScore') entry[id] = Math.max(0, ((4 - s.avgRank) / 3) * 100);
      else if (dim.key === 'gamesNorm') entry[id] = (s.totalGames / maxGames) * 100;
    }
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ReRadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis
          dataKey="dim"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
        />
        {selectedPlayerIds.map((id) => {
          const player = players.find((p) => p.id === id);
          return (
            <Radar
              key={id}
              name={player?.name ?? id}
              dataKey={id}
              stroke={player?.color ?? '#d4af37'}
              fill={player?.color ?? '#d4af37'}
              fillOpacity={0.15}
            />
          );
        })}
        <Legend
          wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  );
};
