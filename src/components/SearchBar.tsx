import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Radio, Loader2, Clock } from 'lucide-react';
import { useSearchStations } from '@/hooks/useRadioStations';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';

const RECENT_KEY = 'hertz-recent-searches';
const POPULAR = ['Bollywood', 'Jazz', 'BBC', 'Lo-fi', 'News', 'Bengali', 'NPR', 'Rock', 'Classical'];

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = useSearchStations(query);
  const { play } = usePlayer();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const commitRecent = (q: string) => {
    if (!q.trim()) return;
    const next = [q, ...recent.filter(r => r !== q)].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* noop */ }
  };

  const handleSelect = (station: NonNullable<typeof results>[number]) => {
    commitRecent(query);
    play(station);
    setQuery('');
    setIsOpen(false);
  };

  const handleQuick = (term: string) => {
    setQuery(term);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className={cn(
        'flex items-center gap-3 border border-border bg-card px-4 transition-colors duration-micro ease-matrix',
        'h-12 rounded-lg',
        isOpen && 'border-primary/60'
      )}>
        <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.8} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search stations, genres, countries…"
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            aria-label="Clear search"
            className="press text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <kbd className="type-mono-label hidden rounded border border-border bg-secondary px-1.5 py-0.5 text-muted-foreground md:inline">⌘K</kbd>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-x-0 top-full z-50 mt-2 max-h-[420px] overflow-y-auto rounded-lg border border-border bg-card shadow-[0_20px_60px_-20px_hsl(0_0%_0%/0.5)]"
          >
            {query.length < 2 ? (
              <div className="p-4">
                {recent.length > 0 && (
                  <>
                    <div className="type-mono-label mb-3 flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" strokeWidth={1.8} />
                      Recent
                    </div>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {recent.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleQuick(r)}
                          className="press rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-primary/60"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <div className="type-mono-label mb-3 text-muted-foreground">Popular searches</div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleQuick(p)}
                      className="press rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-foreground hover:border-primary/60"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : results && results.length > 0 ? (
              <ul>
                {results.slice(0, 8).map((station) => (
                  <li key={station.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(station)}
                      className="flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors duration-micro ease-matrix hover:bg-secondary/60"
                    >
                      <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded border border-border bg-secondary">
                        {station.favicon ? (
                          <img src={station.favicon} alt="" className="h-full w-full object-cover" onError={(e) => {(e.currentTarget as HTMLImageElement).style.display='none';}} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Radio className="h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{station.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {station.country}{station.tags ? ` · ${station.tags.split(',')[0]}` : ''}
                        </p>
                      </div>
                      <span className="type-mono-label text-muted-foreground">{station.bitrate ? `${station.bitrate}` : '—'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Radio className="mb-2 h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
                <p className="text-sm text-muted-foreground">No stations match "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
