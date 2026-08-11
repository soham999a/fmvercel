"use client";

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { StationCard } from '@/components/StationCard';
import { Header } from '@/components/Header';
import { FloatingNav } from '@/components/FloatingNav';
import { AudioPlayer } from '@/components/AudioPlayer';

export default function Favorites() {
  const { favorites } = usePlayer();

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-24">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pt-6 md:pl-24 md:pr-8">
        <div>
          <span className="type-mono-label text-muted-foreground">Personal Library</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Saved Stations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'station' : 'stations'} in your library
          </p>
          <div className="rule-gold mt-4 max-w-[160px]" />
        </div>

        {favorites.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
          >
            {favorites.map((s, i) => (
              <StationCard key={s.id} station={s} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="mt-20 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border">
              <Heart className="h-6 w-6 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 text-lg font-medium text-foreground">Your library is empty</h2>
            <p className="mt-1 max-w-xs text-center text-sm text-muted-foreground">
              Save any station with the heart icon to build your personal broadcast library.
            </p>
          </div>
        )}
      </main>

      <FloatingNav />
      <AudioPlayer />
    </div>
  );
}
