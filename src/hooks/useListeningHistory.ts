import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RadioStation } from '@/types/radio';

/**
 * Records a listening-history row when a station starts playing,
 * and updates seconds_listened when it stops. Server-side rewards
 * will later validate these rows.
 */
export function useListeningHistory(station: RadioStation | null, isPlaying: boolean) {
  const { user } = useAuth();
  const rowIdRef = useRef<string | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!user || !station) return;
    const currentUser = user;
    const currentStation = station;

    let cancelled = false;

    async function start() {
      startRef.current = Date.now();
      const { data } = await supabase
        .from('listening_history')
        .insert({
          user_id: currentUser.id,
          station_id: currentStation.id,
          station_name: currentStation.name,
        })
        .select('id')
        .single();
      if (!cancelled) rowIdRef.current = data?.id ?? null;
    }

    if (isPlaying) start();

    return () => {
      cancelled = true;
      const id = rowIdRef.current;
      if (id && startRef.current) {
        const seconds = Math.round((Date.now() - startRef.current) / 1000);
        supabase
          .from('listening_history')
          .update({ seconds_listened: seconds })
          .eq('id', id)
          .then(() => {});
        rowIdRef.current = null;
        // Fire-and-forget: server-side awards points with anti-cheat cap.
        if (seconds >= 60) {
          supabase.rpc('award_listening', {
            _seconds: seconds,
            _station_name: station?.name ?? 'Unknown',
          }).then(() => {});
        }
      }
    };
  }, [user, station?.id, isPlaying]);
}
