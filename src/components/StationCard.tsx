import { motion } from 'framer-motion';
import { Play, Pause, Heart, Radio, Loader2, Share2 } from 'lucide-react';
import { RadioStation } from '@/types/radio';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StationCardProps {
  station: RadioStation;
  index?: number;
}

/**
 * MATRIX-style station card.
 * Rigorously engineered: monospaced metrics, hairline dividers, no decoration.
 */
export function StationCard({ station, index = 0 }: StationCardProps) {
  const { play, pause, isPlaying, currentStation, isLoading, isFavorite, toggleFavorite } = usePlayer();

  const isCurrentStation = currentStation?.id === station.id;
  const isCurrentlyPlaying = isCurrentStation && isPlaying;
  const isCurrentlyLoading = isCurrentStation && isLoading;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentlyPlaying) pause();
    else play(station);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(station);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?station=${encodeURIComponent(station.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: station.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch { /* user cancelled */ }
  };

  const primaryTag = station.tags?.split(',')[0]?.trim();
  const bitrate = station.bitrate || 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: Math.min(index * 0.03, 0.3) }}
      onClick={handlePlayClick}
      className={cn(
        'card-lift group relative cursor-pointer border bg-card px-4 py-4 transition-colors duration-component ease-matrix',
        'rounded-lg',
        isCurrentStation ? 'border-primary/60' : 'border-border hover:border-primary/40'
      )}
    >
      {/* Top row: artwork + name */}
      <div className="flex items-start gap-3">
        {/* Artwork tile */}
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-border/60 bg-secondary">
          <img
            src={station.favicon || '/favicon.png'}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              if (!t.src.endsWith('/favicon.png')) t.src = '/favicon.png';
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[14px] font-medium leading-tight text-foreground">
              {station.name}
            </h3>
            {isCurrentStation && (
              <span className="flex items-center gap-1.5 pt-0.5">
                <span className="live-dot" />
                <span className="type-mono-label text-primary">On Air</span>
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {station.country}
            {station.language ? ` · ${station.language.split(',')[0]}` : ''}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-border/70" />

      {/* Metrics row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Metric label="Genre" value={primaryTag || '—'} />
          <Metric label="Kbps"  value={bitrate ? String(bitrate) : '—'} tabular />
          <Metric label="Votes" value={station.votes ? formatNumber(station.votes) : '—'} tabular />
        </div>

        <div className="flex items-center gap-1">
          <IconBtn
            label="Share"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          </IconBtn>
          <IconBtn
            label={isFavorite(station.id) ? 'Remove from favourites' : 'Save to favourites'}
            onClick={handleFavoriteClick}
            active={isFavorite(station.id)}
          >
            <Heart
              className={cn('h-3.5 w-3.5', isFavorite(station.id) && 'fill-primary text-primary')}
              strokeWidth={1.8}
            />
          </IconBtn>
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
            className={cn(
              'press ml-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-micro ease-matrix',
              isCurrentStation
                ? 'bg-primary text-primary-foreground'
                : 'bg-foreground text-background hover:bg-primary hover:text-primary-foreground'
            )}
          >
            {isCurrentlyLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isCurrentlyPlaying ? (
              <Pause className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <Play className="ml-0.5 h-3.5 w-3.5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function Metric({ label, value, tabular }: { label: string; value: string; tabular?: boolean }) {
  return (
    <div className="flex flex-col leading-none">
      <span className="type-mono-label text-muted-foreground">{label}</span>
      <span className={cn('mt-1 text-[11px] font-medium text-foreground/90', tabular && 'tabular')}>
        {value}
      </span>
    </div>
  );
}

function IconBtn({
  children, label, onClick, active
}: {
  children: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'press flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors duration-micro ease-matrix hover:bg-secondary hover:text-foreground',
        active && 'text-primary'
      )}
    >
      {children}
    </button>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
