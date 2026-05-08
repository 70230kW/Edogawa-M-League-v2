import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function deleteTimelinePostsByGameId(leagueId: string, gameId: string): Promise<void> {
  const q = query(
    collection(db, 'leagues', leagueId, 'timeline'),
    where('meta.gameId', '==', gameId)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function deleteTimelinePostsBySessionId(leagueId: string, sessionId: string): Promise<void> {
  const q = query(
    collection(db, 'leagues', leagueId, 'timeline'),
    where('meta.sessionId', '==', sessionId)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
