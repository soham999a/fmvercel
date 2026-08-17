import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string | null;
  earned_at: string;
}

export interface LedgerEntry {
  id: string;
  delta: number;
  reason: string;
  created_at: string;
  metadata: any;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_listened_date: string | null;
}

export function useRewards() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0, last_listened_date: null });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time ledger listener
  useEffect(() => {
    if (!uid) { setLedger([]); setIsLoading(false); return; }
    setIsLoading(true);

    const q = query(collection(db, 'points_ledger'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const entries = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            delta: data.delta ?? 0,
            reason: data.reason ?? '',
            created_at: data.createdAt ?? '',
            metadata: data.metadata ?? null,
          };
        })
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
        .slice(0, 100);
      setLedger(entries);
      setIsLoading(false);
    }, (err) => {
      console.warn('Ledger listener error:', err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  // Real-time streak listener
  useEffect(() => {
    if (!uid) { setStreak({ current_streak: 0, longest_streak: 0, last_listened_date: null }); return; }

    const q = query(collection(db, 'streaks'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setStreak({ current_streak: 0, longest_streak: 0, last_listened_date: null });
      } else {
        const data = snap.docs[0].data();
        setStreak({
          current_streak: data.currentStreak ?? 0,
          longest_streak: data.longestStreak ?? 0,
          last_listened_date: data.lastListenedDate ?? null,
        });
      }
    }, (err) => {
      console.warn('Streak listener error:', err);
    });

    return () => unsubscribe();
  }, [uid]);

  // Real-time achievements listener
  useEffect(() => {
    if (!uid) { setAchievements([]); return; }

    const q = query(collection(db, 'achievements'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const achs = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            code: data.code ?? '',
            title: data.title ?? '',
            description: data.description ?? null,
            earned_at: data.earnedAt ?? '',
          };
        })
        .sort((a, b) => (b.earned_at || '').localeCompare(a.earned_at || ''));
      setAchievements(achs);
    }, (err) => {
      console.warn('Achievements listener error:', err);
    });

    return () => unsubscribe();
  }, [uid]);

  const totalPoints = ledger.reduce((s, r) => s + r.delta, 0);
  const level = Math.floor(totalPoints / 100) + 1;
  const progress = totalPoints - (level - 1) * 100;

  return {
    isLoading,
    ledger,
    streak,
    achievements,
    totalPoints,
    level,
    nextLevelAt: level * 100,
    progressInLevel: progress,
  };
}
