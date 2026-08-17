import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

export interface Recommendation {
  name: string;
  country: string;
  genre: string;
  reason: string;
}

export interface WeeklyInsights {
  totalMinutes: number;
  totalMinutesMonth: number;
  activeDays: number;
  perDay: { day: string; minutes: number }[];
  topStations: { name: string; minutes: number }[];
  narrative: string;
}

interface HistoryRow {
  stationName: string;
  secondsListened: number;
  startedAt: string;
}

function computeRecommendations(history: HistoryRow[]): { recommendations: Recommendation[]; message?: string } {
  const stationCounts: Record<string, { name: string; count: number }> = {};
  history.forEach((h) => {
    const key = h.stationName || 'Unknown';
    if (!stationCounts[key]) stationCounts[key] = { name: key, count: 0 };
    stationCounts[key].count += 1;
  });
  const sorted = Object.values(stationCounts).sort((a, b) => b.count - a.count);
  if (sorted.length === 0) {
    return { recommendations: [], message: 'Listen to a few stations to unlock personalised recommendations.' };
  }
  return {
    recommendations: sorted.slice(0, 6).map((s) => ({
      name: s.name,
      country: '',
      genre: 'Radio',
      reason: `Based on your listening history (${s.count} sessions)`,
    })),
  };
}

function computeWeeklyInsights(history: HistoryRow[]): WeeklyInsights {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const weekEntries = history.filter((h) => new Date(h.startedAt) >= weekAgo);
  const monthEntries = history.filter((h) => new Date(h.startedAt) >= monthAgo);

  const totalMinutesWeek = Math.round(weekEntries.reduce((s, h) => s + (h.secondsListened || 0), 0) / 60);
  const totalMinutesMonth = Math.round(monthEntries.reduce((s, h) => s + (h.secondsListened || 0), 0) / 60);

  const dayMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  weekEntries.forEach((h) => {
    const day = h.startedAt?.slice(0, 10);
    if (day && dayMap[day] !== undefined) {
      dayMap[day] += (h.secondsListened || 0) / 60;
    }
  });
  const perDay = Object.entries(dayMap).map(([day, minutes]) => ({
    day,
    minutes: Math.round(minutes),
  }));

  const stationMinutes: Record<string, number> = {};
  weekEntries.forEach((h) => {
    const name = h.stationName || 'Unknown';
    stationMinutes[name] = (stationMinutes[name] || 0) + (h.secondsListened || 0) / 60;
  });
  const topStations = Object.entries(stationMinutes)
    .map(([name, minutes]) => ({ name, minutes: Math.round(minutes) }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  const activeDays = perDay.filter((d) => d.minutes > 0).length;

  let narrative = '';
  if (totalMinutesWeek === 0) {
    narrative = 'Start listening to stations this week to see your insights.';
  } else {
    narrative = `You listened for ${totalMinutesWeek} minutes across ${activeDays} days this week.`;
    if (topStations.length > 0) {
      narrative += ` Your top station was ${topStations[0].name} with ${topStations[0].minutes} minutes.`;
    }
    if (totalMinutesMonth > totalMinutesWeek) {
      narrative += ` Over the past 30 days, you've logged ${totalMinutesMonth} minutes total.`;
    }
  }

  return { totalMinutes: totalMinutesWeek, totalMinutesMonth, activeDays, perDay, topStations, narrative };
}

export function useRecommendations() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [data, setData] = useState<{ recommendations: Recommendation[]; message?: string }>({
    recommendations: [],
    message: 'Listening to stations…',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) { setIsLoading(false); setData({ recommendations: [], message: 'Sign in to get recommendations.' }); return; }
    setIsLoading(true);

    const q = query(collection(db, 'listening_history'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const history = snap.docs.map((d) => d.data() as HistoryRow);
      setData(computeRecommendations(history));
      setIsLoading(false);
    }, (err) => {
      console.warn('Recommendations listener error:', err);
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { data, isLoading, error };
}

export function useWeeklyInsights() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [data, setData] = useState<WeeklyInsights>({
    totalMinutes: 0,
    totalMinutesMonth: 0,
    activeDays: 0,
    perDay: [],
    topStations: [],
    narrative: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) { setIsLoading(false); return; }
    setIsLoading(true);

    const q = query(collection(db, 'listening_history'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const history = snap.docs.map((d) => d.data() as HistoryRow);
      setData(computeWeeklyInsights(history));
      setIsLoading(false);
    }, (err) => {
      console.warn('Insights listener error:', err);
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { data, isLoading, error };
}
