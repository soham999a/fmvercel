import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<{ recommendations: Recommendation[]; message?: string }> => {
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
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<WeeklyInsights> => {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { mode: 'weekly' },
      });
      if (error) throw error;
      return data;
    },
  });
}
