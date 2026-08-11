"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Headphones, Plus, Check, ChevronLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { FloatingNav } from '@/components/FloatingNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { CURATED_PODCASTS, PodcastFeed } from '@/data/podcasts';
import { useFeed, useSubscriptions, useEpisodeProgress, Episode } from '@/hooks/usePodcasts';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Podcasts() {
  const { user } = useAuth();
  const [activeFeed, setActiveFeed] = useState<PodcastFeed | null>(null);

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-24">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pt-6 md:pl-24 md:pr-8">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="type-mono-label text-muted-foreground">Listen · Deep</span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Podcasts
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Curated feeds from BBC, NPR, and independent voices. Follow, resume, and go deep.
            </p>
            <div className="rule-gold mt-4 max-w-[160px]" />
          </div>
          <Headphones className="hidden h-6 w-6 text-primary md:block" />
        </div>

        {!user && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              <Link href="/auth" className="text-primary underline underline-offset-2">Sign in</Link> to follow podcasts and resume where you left off.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeFeed ? (
            <FeedDetail
              key={activeFeed.feedUrl}
              feed={activeFeed}
              onBack={() => setActiveFeed(null)}
            />
          ) : (
            <BrowseGrid key="grid" onSelect={setActiveFeed} />
          )}
        </AnimatePresence>
      </main>

      <FloatingNav />
      <AudioPlayer />
    </div>
  );
}

function BrowseGrid({ onSelect }: { onSelect: (f: PodcastFeed) => void }) {
  const { subs, isSubscribed, subscribe, unsubscribe } = useSubscriptions();
  const { user } = useAuth();

  const followed = CURATED_PODCASTS.filter(p => isSubscribed(p.feedUrl));
  const discover = CURATED_PODCASTS.filter(p => !isSubscribed(p.feedUrl));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {user && followed.length > 0 && (
        <section className="mt-8">
          <SectionHead kicker={`Following · ${followed.length}`} title="Your Library" />
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {followed.map(p => (
              <PodcastCard
                key={p.feedUrl}
                podcast={p}
                subscribed
                onOpen={() => onSelect(p)}
                onToggle={() => unsubscribe(p.feedUrl)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <SectionHead kicker="Discover · 12" title="Curated" />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {(user ? discover : CURATED_PODCASTS).map(p => (
            <PodcastCard
              key={p.feedUrl}
              podcast={p}
              subscribed={isSubscribed(p.feedUrl)}
              onOpen={() => onSelect(p)}
              onToggle={() => {
                if (!user) { toast.error('Sign in to follow'); return; }
                isSubscribed(p.feedUrl)
                  ? unsubscribe(p.feedUrl)
                  : subscribe(p.feedUrl, p.title, p.image);
              }}
            />
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function PodcastCard({
  podcast, subscribed, onOpen, onToggle,
}: {
  podcast: PodcastFeed;
  subscribed: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  // Pull the authoritative artwork from the RSS channel — hardcoded URLs rot.
  const { data: feed } = useFeed(podcast.feedUrl);
  const image = feed?.image || podcast.image;

  return (
    <div className="card-lift group flex gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary/40">
      <button
        onClick={onOpen}
        className="press h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary"
      >
        <img
          src={image || '/favicon.png'}
          alt=""
          loading="lazy"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            if (!t.src.endsWith('/favicon.png')) t.src = '/favicon.png';
          }}
          className="h-full w-full object-cover"
        />
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        <button onClick={onOpen} className="text-left">
          <div className="type-mono-label text-primary/80">{podcast.category}</div>
          <h3 className="mt-1 truncate text-sm font-semibold text-foreground group-hover:text-primary">
            {podcast.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">{podcast.publisher}</p>
        </button>
        <div className="mt-auto flex justify-end pt-2">
          <Button
            size="sm"
            variant={subscribed ? 'secondary' : 'default'}
            onClick={onToggle}
            className="h-7 gap-1 px-2"
          >
            {subscribed ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span className="text-[11px]">{subscribed ? 'Following' : 'Follow'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <span className="type-mono-label text-muted-foreground">{kicker}</span>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
    </div>
  );
}

function FeedDetail({
  feed, onBack,
}: {
  feed: PodcastFeed;
  onBack: () => void;
}) {
  const { data, isLoading, error } = useFeed(feed.feedUrl);
  const { isSubscribed, subscribe, unsubscribe } = useSubscriptions();
  const subscribed = isSubscribed(feed.feedUrl);
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="mt-6"
    >
      <button
        onClick={onBack}
        className="press mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back to podcasts
      </button>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:flex-row">
        <img
          src={data?.image || feed.image || '/favicon.png'}
          alt=""
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            if (!t.src.endsWith('/favicon.png')) t.src = '/favicon.png';
          }}
          className="h-32 w-32 shrink-0 rounded-xl border border-border object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="type-mono-label text-primary/80">{feed.category}</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {feed.title}
          </h2>
          <p className="text-sm text-muted-foreground">{feed.publisher}</p>
          {data?.description && (
            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {data.description}
            </p>
          )}
          <div className="mt-4">
            <Button
              size="sm"
              variant={subscribed ? 'secondary' : 'default'}
              onClick={() => {
                if (!user) { toast.error('Sign in to follow'); return; }
                subscribed
                  ? unsubscribe(feed.feedUrl)
                  : subscribe(feed.feedUrl, feed.title, feed.image);
              }}
              className="gap-1"
            >
              {subscribed ? <><Check className="h-4 w-4" /> Following</> : <><Plus className="h-4 w-4" /> Follow</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <span className="type-mono-label text-muted-foreground">Episodes</span>
        {isLoading && (
          <div className="mt-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        )}
        {error && (
          <p className="mt-4 text-sm text-destructive">Couldn&apos;t load feed. Try again shortly.</p>
        )}
        {data && (
          <EpisodeList feedUrl={feed.feedUrl} episodes={data.episodes} podcastTitle={feed.title} image={feed.image} />
        )}
      </div>
    </motion.div>
  );
}

function EpisodeList({
  feedUrl, episodes, podcastTitle, image,
}: {
  feedUrl: string;
  episodes: Episode[];
  podcastTitle: string;
  image: string;
}) {
  return (
    <div className="mt-3 space-y-2">
      {episodes.map(ep => (
        <EpisodeRow key={ep.guid} episode={ep} feedUrl={feedUrl} podcastTitle={podcastTitle} image={image} />
      ))}
    </div>
  );
}

function EpisodeRow({
  episode, feedUrl, podcastTitle, image,
}: {
  episode: Episode;
  feedUrl: string;
  podcastTitle: string;
  image: string;
}) {
  const { progress, save } = useEpisodeProgress(feedUrl);
  const [playing, setPlaying] = useState(false);
  const audioRef = useState(() => (typeof Audio !== 'undefined' ? new Audio() : null))[0];
  const state = progress[episode.guid];

  const toggle = () => {
    if (!audioRef) return;
    if (playing) {
      audioRef.pause();
      save(episode.guid, audioRef.currentTime, false);
      setPlaying(false);
    } else {
      if (audioRef.src !== episode.audioUrl) {
        audioRef.src = episode.audioUrl;
        if (state?.position) audioRef.currentTime = state.position;
      }
      audioRef.play().then(() => setPlaying(true)).catch(() => toast.error('Playback failed'));
      audioRef.ontimeupdate = () => {
        if (Math.floor(audioRef.currentTime) % 10 === 0) {
          save(episode.guid, audioRef.currentTime, false);
        }
      };
      audioRef.onended = () => {
        save(episode.guid, 0, true);
        setPlaying(false);
      };
    }
  };

  const date = episode.pubDate ? new Date(episode.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className={cn(
      'card-lift group flex items-center gap-3 rounded-xl border border-border bg-card p-3',
      playing && 'border-primary/50'
    )}>
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause' : 'Play'}
        className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-foreground">{episode.title}</h4>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {date && <span>{date}</span>}
          {episode.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {episode.duration}
            </span>
          )}
          {state?.completed && <span className="text-primary">✓ Played</span>}
          {state?.position && !state.completed && (
            <span className="text-primary">Resume at {Math.floor(state.position / 60)}m</span>
          )}
        </div>
      </div>
    </div>
  );
}
