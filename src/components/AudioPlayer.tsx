import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X, Loader2, ChevronUp, ChevronDown, Moon, Sliders, Car, Cast } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { EQ_BANDS } from '@/hooks/useAudioPlayer';
import { useChromecast } from '@/hooks/useChromecast';
import { toast } from 'sonner';

/**
 * Persistent player — mini pill by default, expandable to full-screen module.
 * Phase 6: 5-band EQ (Web Audio), Car Mode, Chromecast.
 */
export function AudioPlayer() {
  const {
    currentStation, isPlaying, isLoading, volume,
    togglePlayPause, setVolume, stop,
    eqEnabled, eqGains, eqUnavailable, toggleEq, setEqGain,
  } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [sleepMin, setSleepMin] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [carMode, setCarMode] = useState(false);
  const [showEq, setShowEq] = useState(false);
  const cc = useChromecast();

  useEffect(() => {
    if (!sleepMin || !currentStation) return;
    setRemaining(sleepMin * 60);
    const iv = setInterval(() => {
      setRemaining(r => {
        if (r === null) return null;
        if (r <= 1) { stop(); return null; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleepMin, currentStation?.id]);

  if (!currentStation) return null;

  const streamUrl = currentStation.url_resolved || currentStation.url;

  const handleCast = async () => {
    if (!cc.available) { toast.error('Chromecast unavailable on this device'); return; }
    await cc.cast(streamUrl, currentStation.name, currentStation.favicon || `${window.location.origin}/favicon.png`);
  };

  return (
    <>
      {/* MINI PLAYER */}
      <AnimatePresence>
        {!expanded && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-0 bottom-[calc(4.5rem_+_env(safe-area-inset-bottom))] z-40 mx-auto max-w-md px-4 md:bottom-4 md:left-24 md:right-4 md:max-w-none md:mx-0 md:pl-0"
          >
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card/95 px-3 py-2 backdrop-blur">
              <button
                type="button"
                onClick={() => setExpanded(true)}
                aria-label="Expand player"
                className="press flex flex-1 items-center gap-3 text-left"
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                  <img
                    src={currentStation.favicon || '/favicon.png'}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (!t.src.endsWith('/favicon.png')) t.src = '/favicon.png';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="live-dot" />
                    <span className="type-mono-label text-primary">Live</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium leading-tight text-foreground">{currentStation.name}</p>
                </div>
                <ChevronUp className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
              </button>

              <PlayPauseBtn playing={isPlaying} loading={isLoading} onClick={togglePlayPause} />
              <button
                type="button"
                onClick={stop}
                aria-label="Stop"
                className="press flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPANDED IMMERSIVE PLAYER */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={cn('fixed inset-0 z-50 overflow-auto', carMode ? 'bg-black text-white' : 'bg-background')}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className={cn('mx-auto flex min-h-full flex-col px-6 pb-[calc(2.5rem_+_env(safe-area-inset-bottom))] pt-6', carMode ? 'max-w-full' : 'max-w-3xl')}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Collapse player"
                  className="press flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <span className="type-mono-label text-primary">Broadcasting Live</span>
                </div>
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop"
                  className="press flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>

              {/* Artwork */}
              <div className="mt-8 flex flex-1 flex-col items-center justify-center">
                <motion.div
                  animate={isPlaying ? { y: [0, -6, 0] } : { y: 0 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className={cn(
                    'relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary',
                    carMode ? 'max-w-[420px]' : 'max-w-[280px]'
                  )}
                >
                  <img
                    src={currentStation.favicon || '/favicon.png'}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (!t.src.endsWith('/favicon.png')) t.src = '/favicon.png';
                    }}
                  />
                </motion.div>

                <div className="mt-8 max-w-md text-center">
                  <h2 className={cn('font-semibold tracking-tight', carMode ? 'text-4xl' : 'text-2xl text-foreground')}>{currentStation.name}</h2>
                  <p className={cn('mt-2', carMode ? 'text-lg text-white/70' : 'text-sm text-muted-foreground')}>
                    {currentStation.country}{currentStation.language ? ` · ${currentStation.language.split(',')[0]}` : ''}
                    {currentStation.bitrate ? ` · ${currentStation.bitrate} kbps` : ''}
                  </p>
                </div>

                {/* Waveform */}
                {!carMode && (
                  <div className="mt-6 flex h-10 w-full max-w-md items-end justify-center gap-0.5">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] rounded-full bg-primary/60"
                        animate={isPlaying ? { height: [`${20 + Math.random() * 60}%`, `${20 + Math.random() * 60}%`] } : { height: '20%' }}
                        transition={{ duration: 0.5 + Math.random() * 0.4, repeat: Infinity, repeatType: 'mirror', delay: i * 0.02, ease: 'easeInOut' }}
                        style={{ height: '20%' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="mt-6 flex items-center justify-center gap-6">
                <PlayPauseBtn playing={isPlaying} loading={isLoading} onClick={togglePlayPause} large={!carMode} carMode={carMode} />
              </div>

              {/* Bottom: volume + sleep + tools */}
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                    aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                    className="press text-muted-foreground hover:text-foreground"
                  >
                    {volume === 0 ? <VolumeX className="h-4 w-4" strokeWidth={1.8} /> : <Volume2 className="h-4 w-4" strokeWidth={1.8} />}
                  </button>
                  <Slider
                    value={[volume * 100]}
                    onValueChange={([v]) => setVolume(v / 100)}
                    max={100}
                    step={1}
                    aria-label="Volume"
                    className="flex-1"
                  />
                  <span className="type-mono-label w-8 text-right text-muted-foreground">{Math.round(volume * 100)}</span>
                </div>

                {/* Sleep timer */}
                <div className="flex flex-wrap items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                  <span className="type-mono-label text-muted-foreground">Sleep</span>
                  <div className="flex gap-1">
                    {[0, 15, 30, 60].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSleepMin(m === 0 ? null : m)}
                        className={cn(
                          'press rounded-full border px-2.5 py-0.5 text-[11px] tabular transition-colors duration-micro ease-matrix',
                          (m === 0 && sleepMin === null) || sleepMin === m
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {m === 0 ? 'Off' : `${m}m`}
                      </button>
                    ))}
                  </div>
                  {remaining !== null && (
                    <span className="type-mono-label ml-auto text-primary tabular">{formatTime(remaining)}</span>
                  )}
                </div>

                {/* Tool row: EQ, Car Mode, Cast */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                  <div className="flex flex-wrap gap-2">
                    <ToolButton active={showEq} onClick={() => setShowEq(v => !v)} icon={<Sliders className="h-3.5 w-3.5" />} label="EQ" />
                    <ToolButton active={carMode} onClick={() => setCarMode(v => !v)} icon={<Car className="h-3.5 w-3.5" />} label="Car Mode" />
                    <ToolButton
                      active={cc.connected}
                      disabled={!cc.available}
                      onClick={handleCast}
                      icon={<Cast className="h-3.5 w-3.5" />}
                      label={cc.connected ? 'Casting' : 'Cast'}
                    />
                  </div>
                </div>

                {/* EQ panel */}
                {showEq && (
                  <div className="rounded-xl border border-border bg-card/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="type-mono-label text-muted-foreground">5-band Equalizer</span>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={eqEnabled}
                          onChange={(e) => toggleEq(e.target.checked)}
                          disabled={eqUnavailable}
                        />
                        {eqEnabled ? 'On' : 'Off'}
                      </label>
                    </div>
                    {eqUnavailable && (
                      <p className="mt-2 text-[11px] text-destructive/80">
                        This stream blocks Web Audio processing (no CORS). EQ can't be applied.
                      </p>
                    )}
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {EQ_BANDS.map((freq, i) => (
                        <div key={freq} className="flex flex-col items-center gap-2">
                          <input
                            type="range"
                            min={-12}
                            max={12}
                            step={1}
                            value={eqGains[i] ?? 0}
                            onChange={(e) => setEqGain(i, Number(e.target.value))}
                            disabled={!eqEnabled || eqUnavailable}
                            className="h-24 accent-primary [writing-mode:vertical-lr] [direction:rtl]"
                          />
                          <span className="type-mono-label tabular text-primary">{eqGains[i] > 0 ? '+' : ''}{eqGains[i] ?? 0}dB</span>
                          <span className="type-mono-label text-muted-foreground" style={{ fontSize: 9 }}>
                            {freq >= 1000 ? `${freq / 1000}k` : freq}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ToolButton({
  icon, label, onClick, active, disabled,
}: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'press inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] transition-colors duration-micro ease-matrix',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:text-foreground disabled:opacity-40'
      )}
    >
      {icon}
      <span className="type-mono-label">{label}</span>
    </button>
  );
}

function PlayPauseBtn({ playing, loading, onClick, large, carMode }: { playing: boolean; loading: boolean; onClick: () => void; large?: boolean; carMode?: boolean }) {
  const size = carMode ? 'h-24 w-24' : large ? 'h-16 w-16' : 'h-9 w-9';
  const icon = carMode ? 'h-10 w-10' : large ? 'h-6 w-6' : 'h-4 w-4';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={playing ? 'Pause' : 'Play'}
      className={cn('press flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-micro ease-matrix', size)}
    >
      {loading ? <Loader2 className={cn(icon, 'animate-spin')} /> : playing ? <Pause className={icon} strokeWidth={2} /> : <Play className={cn(icon, 'ml-1')} strokeWidth={2} />}
    </button>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
