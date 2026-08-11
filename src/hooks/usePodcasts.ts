import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Episode {
  guid: string;
  title: string;
  pubDate: string;
  duration: string;
  description: string;
  audioUrl: string;
}

export interface Feed {
  title: string;
  description: string;
  image: string | null;
  episodes: Episode[];
}

export function useFeed(feedUrl: string | null) {
  return useQuery({
    queryKey: ['podcast-feed', feedUrl],
    enabled: !!feedUrl,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Feed> => {
      const { data, error } = await supabase.functions.invoke('parse-rss', {
        body: { url: feedUrl },
      });
      if (error) throw error;
      return data as Feed;
    },
  });
}

export interface Subscription {
  id: string;
  feed_url: string;
  title: string;
  image_url: string | null;
}

export function useSubscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) { setSubs([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('podcast_subscriptions')
      .select('id, feed_url, title, image_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setSubs((data ?? []) as Subscription[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user?.id]);

  const subscribe = async (feed_url: string, title: string, image_url: string | null) => {
    if (!user) return;
    await supabase.from('podcast_subscriptions').upsert(
      { user_id: user.id, feed_url, title, image_url },
      { onConflict: 'user_id,feed_url' }
    );
    refresh();
  };

  const unsubscribe = async (feed_url: string) => {
    if (!user) return;
    await supabase.from('podcast_subscriptions')
      .delete().eq('user_id', user.id).eq('feed_url', feed_url);
    refresh();
  };

  const isSubscribed = (feed_url: string) => subs.some(s => s.feed_url === feed_url);

  return { subs, loading, subscribe, unsubscribe, isSubscribed, refresh };
}

export function useEpisodeProgress(feedUrl: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, { position: number; completed: boolean }>>({});

  useEffect(() => {
    if (!user || !feedUrl) return;
    supabase
      .from('podcast_episode_progress')
      .select('episode_guid, position_seconds, completed')
      .eq('user_id', user.id)
      .eq('feed_url', feedUrl)
      .then(({ data }) => {
        const map: Record<string, { position: number; completed: boolean }> = {};
        (data ?? []).forEach((r: any) => {
          map[r.episode_guid] = { position: r.position_seconds, completed: r.completed };
        });
        setProgress(map);
      });
  }, [user?.id, feedUrl]);

  const save = async (episode_guid: string, position: number, completed = false) => {
    if (!user) return;
    await supabase.from('podcast_episode_progress').upsert(
      {
        user_id: user.id,
        feed_url: feedUrl,
        episode_guid,
        position_seconds: Math.floor(position),
        completed,
      },
      { onConflict: 'user_id,episode_guid' }
    );
    setProgress(p => ({ ...p, [episode_guid]: { position, completed } }));
  };

  return { progress, save };
}
