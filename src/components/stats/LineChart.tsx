import React from 'react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { GameRecord, Player } from '@/types';

interface LineChartProps {
  games: GameRecord[];
  players: Player[];
}

function buildChartData(games: GameRecord[], players: Player[]) {
  const activePlayers = players.filter((p) => p.isActive);
  const cumulative: Record<string, number> = {};
  activePlayers.forEach((p) => (cumulative[p.id] = 0));

  return games
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((g, i) => {
      // Update cumulative for participants first
      for (const gp of g.players) {
        cumulative[gp.playerId] = Math.round(((cumulative[gp.playerId] ?? 0) + gp.point) * 10) / 10;
      }
      // Build row with ALL active players (participants get updated value, non-participants get previous value)
      const row: Record<string, any> = {
        game: `G${i + 1}`,
        label: g.date.slice(5).replace('-', '/'),
      };
      for (const p of activePlayers) {
        row[p.id] = cumulative[p.id];
      }
      return row;
    });
}

export const CumulativeLineChart: React.FC<LineChartProps> = ({ games, players }) => {
  const data = buildChartData(games, players);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        グラフデータがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ReLineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f1a0f',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: 'white',
          }}
          formatter={(value: number, name: string) => {
            const player = players.find((p) => p.id === name);
            const sign = value > 0 ? '+' : '';
            return [`${sign}${value.toFixed(1)}pt`, player?.name ?? name];
          }}
          labelFormatter={(label) => label}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}
          formatter={(value) => players.find((p) => p.id === value)?.name ?? value}
        />
        {players
          .filter((p) => p.isActive)
          .map((p) => (
            <Line
              key={p.id}
              type="monotone"
              dataKey={p.id}
              stroke={p.color}
              strokeWidth={2}
              dot={{ r: 3, fill: p.color }}
              name={p.id}
              connectNulls
            />
          ))}
      </ReLineChart>
    </ResponsiveContainer>
  );
};
