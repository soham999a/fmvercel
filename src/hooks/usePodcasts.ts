import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
} from 'firebase/firestore';

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

async function fetchRssViaService(feedUrl: string): Promise<Feed> {
  const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
  if (!res.ok) throw new Error(`Feed fetch failed (${res.status})`);
  const json = await res.json();
  if (json.status !== 'ok') throw new Error(json.message || 'Feed could not be parsed');
  const items: any[] = json.items ?? [];
  return {
    title: json.feed?.title ?? '',
    description: json.feed?.description ?? '',
    image: json.feed?.image ?? null,
    episodes: items
      .map((item) => ({
        guid: String(item.guid ?? item.link ?? item.title),
        title: item.title ?? '',
        pubDate: item.pubDate ?? '',
        duration: item['itunes:duration'] ?? item.duration ?? '',
        description: item.description ?? '',
        audioUrl: item.enclosure?.link ?? item.link ?? '',
      }))
      .filter((ep) => ep.audioUrl),
  };
}

export function useFeed(feedUrl: string | null) {
  return useQuery({
    queryKey: ['podcast-feed', feedUrl],
    enabled: !!feedUrl,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Feed> => {
      if (!feedUrl) throw new Error('No feed URL');
      return fetchRssViaService(feedUrl);
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
    const q = query(
      collection(db, 'podcast_subscriptions'),
      where('userId', '==', user.uid)
    );
    const snap = await getDocs(q);
    setSubs(
      snap.docs.map((d) => ({
        id: d.id,
        feed_url: d.data().feedUrl,
        title: d.data().title,
        image_url: d.data().imageUrl ?? null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [user?.uid]);

  const subscribe = async (feedUrl: string, title: string, imageUrl: string | null) => {
    if (!user) return;
    await addDoc(collection(db, 'podcast_subscriptions'), {
      userId: user.uid,
      feedUrl,
      title,
      imageUrl,
      createdAt: new Date().toISOString(),
    });
    refresh();
  };

  const unsubscribe = async (feedUrl: string) => {
    if (!user) return;
    const q = query(
      collection(db, 'podcast_subscriptions'),
      where('userId', '==', user.uid),
      where('feedUrl', '==', feedUrl)
    );
    const snap = await getDocs(q);
    snap.forEach((d) => deleteDoc(d.ref));
    refresh();
  };

  const isSubscribed = (feedUrl: string) => subs.some((s) => s.feed_url === feedUrl);

  return { subs, loading, subscribe, unsubscribe, isSubscribed, refresh };
}

export function useEpisodeProgress(feedUrl: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, { position: number; completed: boolean }>>({});

  useEffect(() => {
    if (!user || !feedUrl) return;
    const load = async () => {
      const q = query(
        collection(db, 'podcast_episode_progress'),
        where('userId', '==', user.uid),
        where('feedUrl', '==', feedUrl)
      );
      const snap = await getDocs(q);
      const map: Record<string, { position: number; completed: boolean }> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        map[data.episodeGuid] = { position: data.positionSeconds, completed: data.completed };
      });
      setProgress(map);
    };
    load();
  }, [user?.uid, feedUrl]);

  const save = async (episodeGuid: string, position: number, completed = false) => {
    if (!user) return;
    const key = `${user.uid}_${feedUrl}_${episodeGuid}`;
    await setDoc(doc(db, 'podcast_episode_progress', key), {
      userId: user.uid,
      feedUrl,
      episodeGuid,
      positionSeconds: Math.floor(position),
      completed,
      updatedAt: new Date().toISOString(),
    });
    setProgress((p) => ({ ...p, [episodeGuid]: { position, completed } }));
  };

  return { progress, save };
}
