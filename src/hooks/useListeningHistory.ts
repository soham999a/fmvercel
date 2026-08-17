import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { RadioStation } from '@/types/radio';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

/**
 * Records listening history. Awards 1 point per minute of listening.
 * Checks every 10 seconds and awards incrementally.
 * Also manages streaks and achievements.
 */
export function useListeningHistory(station: RadioStation | null, isPlaying: boolean) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const rowRef = useRef<string | null>(null);
  const startRef = useRef<number>(0);
  const stationRef = useRef<RadioStation | null>(null);
  const lastAwardedMinuteRef = useRef(0);

  useEffect(() => {
    if (!uid || !station || !isPlaying) return;

    let cancelled = false;
    let tickInterval: ReturnType<typeof setInterval> | null = null;
    stationRef.current = station;
    lastAwardedMinuteRef.current = 0;

    const createRow = async () => {
      try {
        startRef.current = Date.now();
        const docRef = await addDoc(collection(db, 'listening_history'), {
          userId: uid,
          stationId: station.id,
          stationName: station.name,
          secondsListened: 0,
          startedAt: new Date().toISOString(),
        });
        if (!cancelled) rowRef.current = docRef.id;
      } catch (e) {
        console.warn('Failed to create listening_history row:', e);
      }
    };

    const awardTick = async () => {
      if (cancelled) return;
      const elapsed = Math.round((Date.now() - startRef.current) / 1000);
      const currentMinute = Math.floor(elapsed / 60);

      // Award 1 point for each new minute of listening
      if (currentMinute <= lastAwardedMinuteRef.current) return;
      if (currentMinute <= 0) return;

      const pointsToAward = currentMinute - lastAwardedMinuteRef.current;
      lastAwardedMinuteRef.current = currentMinute;

      try {
        const stName = stationRef.current?.name ?? 'Unknown';

        // Award points — 1 per minute
        await addDoc(collection(db, 'points_ledger'), {
          userId: uid,
          delta: pointsToAward,
          reason: 'listening',
          metadata: { station: stName, minutes: currentMinute },
          createdAt: new Date().toISOString(),
        });

        // Update streak
        await updateStreak(uid);

        // First tune achievement
        await checkAchievement(uid, 'first_tune', 'First Tune', 'Played your first station');

        // Century club achievement (100+ total points)
        await checkCenturyClub(uid);
      } catch (e) {
        console.warn('Failed to award points:', e);
      }
    };

    createRow().then(() => {
      if (!cancelled) {
        tickInterval = setInterval(awardTick, 10000);
      }
    });

    return () => {
      cancelled = true;
      if (tickInterval) clearInterval(tickInterval);

      const id = rowRef.current;
      if (id && startRef.current) {
        const seconds = Math.round((Date.now() - startRef.current) / 1000);
        if (seconds >= 2) {
          updateDoc(doc(db, 'listening_history', id), { secondsListened: seconds }).catch(() => {});
        }
        rowRef.current = null;
      }
    };
  }, [uid, station?.id, isPlaying]);
}

async function updateStreak(uid: string) {
  const today = new Date().toISOString().slice(0, 10);
  const streakQ = query(collection(db, 'streaks'), where('userId', '==', uid));
  const streakSnap = await getDocs(streakQ);

  if (streakSnap.empty) {
    await addDoc(collection(db, 'streaks'), {
      userId: uid,
      currentStreak: 1,
      longestStreak: 1,
      lastListenedDate: today,
    });
  } else {
    const streakDoc = streakSnap.docs[0];
    const sd = streakDoc.data();
    const lastDate = sd.lastListenedDate as string | null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let newStreak = sd.currentStreak ?? 0;
    if (lastDate === today) {
      // Already counted today
    } else if (lastDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    await updateDoc(doc(db, 'streaks', streakDoc.id), {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, sd.longestStreak ?? 0),
      lastListenedDate: today,
    });
  }
}

async function checkAchievement(uid: string, code: string, title: string, description: string) {
  const q = query(
    collection(db, 'achievements'),
    where('userId', '==', uid),
    where('code', '==', code)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    await addDoc(collection(db, 'achievements'), {
      userId: uid,
      code,
      title,
      description,
      earnedAt: new Date().toISOString(),
    });
  }
}

async function checkCenturyClub(uid: string) {
  const hasQ = query(
    collection(db, 'achievements'),
    where('userId', '==', uid),
    where('code', '==', 'century_club')
  );
  const hasSnap = await getDocs(hasQ);
  if (!hasSnap.empty) return;

  const ledgerQ = query(collection(db, 'points_ledger'), where('userId', '==', uid));
  const ledgerSnap = await getDocs(ledgerQ);
  const totalPts = ledgerSnap.docs.reduce((s, d) => s + (d.data().delta || 0), 0);

  if (totalPts >= 100) {
    await addDoc(collection(db, 'points_ledger'), {
      userId: uid,
      delta: 25,
      reason: 'century_club',
      metadata: { milestone: true },
      createdAt: new Date().toISOString(),
    });
    await addDoc(collection(db, 'achievements'), {
      userId: uid,
      code: 'century_club',
      title: 'Century Club',
      description: 'Earned 100 points',
      earnedAt: new Date().toISOString(),
    });
  }
}
