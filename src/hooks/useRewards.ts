import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  const uid = user?.id;

  const ledger = useQuery({
    queryKey: ['rewards', 'ledger', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_ledger')
        .select('id, delta, reason, created_at, metadata')
        .eq('user_id', uid!)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LedgerEntry[];
    },
  });

  const streak = useQuery({
    queryKey: ['rewards', 'streak', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from('streaks')
        .select('current_streak, longest_streak, last_listened_date')
        .eq('user_id', uid!)
        .maybeSingle();
      return (data ?? { current_streak: 0, longest_streak: 0, last_listened_date: null }) as Streak;
    },
  });

  const achievements = useQuery({
    queryKey: ['rewards', 'achievements', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from('achievements')
        .select('id, code, title, description, earned_at')
        .eq('user_id', uid!)
        .order('earned_at', { ascending: false });
      return (data ?? []) as Achievement[];
    },
  });

  const totalPoints = (ledger.data ?? []).reduce((s, r) => s + r.delta, 0);
  const level = Math.floor(totalPoints / 100) + 1;
  const nextLevelAt = level * 100;
  const progress = totalPoints - (level - 1) * 100;

  return {
    isLoading: ledger.isLoading || streak.isLoading || achievements.isLoading,
    ledger: ledger.data ?? [],
    streak: streak.data ?? { current_streak: 0, longest_streak: 0, last_listened_date: null },
    achievements: achievements.data ?? [],
    totalPoints,
    level,
    nextLevelAt,
    progressInLevel: progress,
  };
}
