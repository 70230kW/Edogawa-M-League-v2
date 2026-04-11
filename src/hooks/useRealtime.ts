import { useEffect } from 'react';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { useGameStore } from '@/stores/useGameStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useSessionStore } from '@/stores/useSessionStore';

export function useRealtimeStandings(leagueId: string, seasonId: string) {
  const subscribeStandings = useLeagueStore((s) => s.subscribeStandings);
  useEffect(() => {
    if (!leagueId || !seasonId) return;
    return subscribeStandings(leagueId, seasonId);
  }, [leagueId, seasonId, subscribeStandings]);
}

export function useRealtimeGames(leagueId: string, seasonId: string) {
  const subscribeGames = useGameStore((s) => s.subscribeGames);
  useEffect(() => {
    if (!leagueId || !seasonId) return;
    return subscribeGames(leagueId, seasonId);
  }, [leagueId, seasonId, subscribeGames]);
}

export function useRealtimeTimeline(leagueId: string) {
  const subscribePosts = useTimelineStore((s) => s.subscribePosts);
  useEffect(() => {
    if (!leagueId) return;
    return subscribePosts(leagueId);
  }, [leagueId, subscribePosts]);
}

export function useRealtimeSessions(leagueId: string, seasonId: string) {
  const subscribeSessions = useSessionStore((s) => s.subscribeSessions);
  useEffect(() => {
    if (!leagueId || !seasonId) return;
    return subscribeSessions(leagueId, seasonId);
  }, [leagueId, seasonId, subscribeSessions]);
}
