import { useState, useEffect, useCallback } from 'react';
import { RadioStation } from '@/types/radio';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const LOCAL_KEY = 'fm-oldschool-favorites';

/**
 * Favorites hook: uses DB when signed in, localStorage otherwise.
 * On sign-in, migrates any local favorites into the DB (one-shot).
 */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<RadioStation[]>([]);

  // Load favorites (DB when signed in, else localStorage)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (user) {
        // Migrate local favorites once
        const localRaw = localStorage.getItem(LOCAL_KEY);
        if (localRaw) {
          try {
            const local: RadioStation[] = JSON.parse(localRaw);
            if (local.length) {
              await supabase.from('favorites').upsert(
                local.map((s) => ({
                  user_id: user.id,
                  station_id: s.id,
                  station: s as any,
                })) as any,
                { onConflict: 'user_id,station_id' } as any
              );
            }
            localStorage.removeItem(LOCAL_KEY);
          } catch {
            /* ignore */
          }
        }

        const { data } = await supabase
          .from('favorites')
          .select('station')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!cancelled) {
          setFavorites((data ?? []).map((r: any) => r.station as RadioStation));
        }
      } else {
        const stored = localStorage.getItem(LOCAL_KEY);
        if (stored && !cancelled) {
          try {
            setFavorites(JSON.parse(stored));
          } catch {
            setFavorites([]);
          }
        } else if (!cancelled) {
          setFavorites([]);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const persistLocal = (list: RadioStation[]) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  };

  const addFavorite = useCallback(
    async (station: RadioStation) => {
      setFavorites((prev) => {
        if (prev.some((s) => s.id === station.id)) return prev;
        const updated = [station, ...prev];
        if (!user) persistLocal(updated);
        return updated;
      });
      if (user) {
        await supabase.from('favorites').upsert(
          {
            user_id: user.id,
            station_id: station.id,
            station: station as any,
          },
          { onConflict: 'user_id,station_id' }
        );
      }
    },
    [user]
  );

  const removeFavorite = useCallback(
    async (stationId: string) => {
      setFavorites((prev) => {
        const updated = prev.filter((s) => s.id !== stationId);
        if (!user) persistLocal(updated);
        return updated;
      });
      if (user) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('station_id', stationId);
      }
    },
    [user]
  );

  const isFavorite = useCallback(
    (stationId: string) => favorites.some((s) => s.id === stationId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (station: RadioStation) => {
      if (isFavorite(station.id)) removeFavorite(station.id);
      else addFavorite(station);
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}
