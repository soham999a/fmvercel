import { useQuery } from '@tanstack/react-query';
import { getSupabase, hasSupabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

export function useRecommendations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ai-insights', 'recommendations', user?.id],
    enabled: !!user && hasSupabase,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<{ recommendations: Recommendation[]; message?: string }> => {
      const supabase = getSupabase();
      if (!supabase) {
        return { recommendations: [], message: 'AI insights are unavailable right now — running in local mode.' };
      }
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { mode: 'recommendations' },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useWeeklyInsights() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ai-insights', 'weekly', user?.id],
    enabled: !!user && hasSupabase,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<WeeklyInsights> => {
      const supabase = getSupabase();
      if (!supabase) {
        return {
          totalMinutes: 0,
          totalMinutesMonth: 0,
          activeDays: 0,
          perDay: [],
          topStations: [],
          narrative: '',
        };
      }
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { mode: 'weekly' },
      });
      if (error) throw error;
      return data;
    },
  });
}
