import { useState, useEffect, useCallback } from 'react';
import { RadioStation } from '@/types/radio';
import { useAuth } from './useAuth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const LOCAL_KEY = 'fm-oldschool-favorites';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<RadioStation[]>([]);

  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem(LOCAL_KEY);
      try {
        setFavorites(stored ? JSON.parse(stored) : []);
      } catch {
        setFavorites([]);
      }
      return;
    }

    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs
        .map((d) => ({
          station: d.data().station as RadioStation,
          createdAt: d.data().createdAt as string,
        }))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        .map((item) => item.station);
      setFavorites(items);
    }, (err) => {
      console.warn('Favorites listener error:', err);
    });

    // Migrate local favorites to Firestore once
    const localRaw = localStorage.getItem(LOCAL_KEY);
    if (localRaw) {
      try {
        const local: RadioStation[] = JSON.parse(localRaw);
        if (local.length) {
          const batch = writeBatch(db);
          local.forEach((s) => {
            const ref = doc(collection(db, 'favorites'));
            batch.set(ref, {
              userId: user.uid,
              stationId: s.id,
              station: s,
              createdAt: new Date().toISOString(),
            });
          });
          batch.commit().then(() => localStorage.removeItem(LOCAL_KEY));
        } else {
          localStorage.removeItem(LOCAL_KEY);
        }
      } catch {
        localStorage.removeItem(LOCAL_KEY);
      }
    }

    return () => unsubscribe();
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
        await addDoc(collection(db, 'favorites'), {
          userId: user.uid,
          stationId: station.id,
          station,
          createdAt: new Date().toISOString(),
        });
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
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', user.uid),
          where('stationId', '==', stationId)
        );
        const snap = await getDocs(q);
        snap.forEach((d) => deleteDoc(d.ref));
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
