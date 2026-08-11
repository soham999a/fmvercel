import { motion } from 'framer-motion';
import { REGIONS } from '@/types/radio';
import { cn } from '@/lib/utils';

interface Props {
  selectedRegion: string;
  onSelect: (regionId: string) => void;
}

/**
 * Region Explorer — MATRIX-style world map with dot-marked regions.
 * SVG world silhouette + primary-colored dot per region.
 * Not a full interactive globe (Phase 5), but engineered and clickable.
 */
export function RegionExplorer({ selectedRegion, onSelect }: Props) {
  // Rough dot positions on a 100x50 viewbox (equirectangular-ish)
  const dots: Record<string, { x: number; y: number }> = {
    india:        { x: 68, y: 26 },
    us:           { x: 22, y: 20 },
    europe:       { x: 50, y: 15 },
    apac:         { x: 80, y: 22 },
    australia:    { x: 84, y: 37 },
    southamerica: { x: 32, y: 36 },
    africa:       { x: 53, y: 30 },
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <div className="type-mono-label text-muted-foreground">Region Explorer</div>
          <h3 className="mt-1 text-sm font-medium text-foreground">Select a region on the map</h3>
        </div>
        <div className="type-mono-label text-muted-foreground">7 regions · live</div>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 100 50"
          preserveAspectRatio="xMidYMid meet"
          className="h-auto w-full"
        >
          {/* Faint grid backdrop */}
          <defs>
            <pattern id="grid-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.25" fill="hsl(var(--foreground))" opacity="0.06" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="50" fill="url(#grid-dots)" />

          {/* Simplified continent silhouettes */}
          <g fill="hsl(var(--foreground))" opacity="0.08">
            {/* North America */}
            <path d="M8 12 Q18 8 26 12 L28 22 Q22 28 14 26 L10 20 Z" />
            {/* South America */}
            <path d="M28 30 Q34 30 34 36 L32 44 Q28 44 26 40 Z" />
            {/* Europe */}
            <path d="M46 12 Q54 10 54 18 L50 20 Q46 18 46 14 Z" />
            {/* Africa */}
            <path d="M48 22 Q56 22 58 32 L54 40 Q50 40 48 34 Z" />
            {/* Asia */}
            <path d="M56 10 Q78 8 84 16 L80 24 Q68 28 60 22 L56 16 Z" />
            {/* India subcontinent nudge */}
            <path d="M64 22 Q70 22 70 28 L66 30 Q64 28 64 24 Z" />
            {/* Australia */}
            <path d="M80 34 Q88 34 88 40 L84 42 Q80 40 80 36 Z" />
          </g>

          {/* Region dots */}
          {REGIONS.map((r) => {
            const dot = dots[r.id];
            if (!dot) return null;
            const isActive = r.id === selectedRegion;
            return (
              <g key={r.id} onClick={() => onSelect(r.id)} className="cursor-pointer">
                {isActive && (
                  <motion.circle
                    cx={dot.x}
                    cy={dot.y}
                    r={2.5}
                    fill="hsl(var(--primary))"
                    opacity="0.3"
                    animate={{ r: [2, 4, 2], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={isActive ? 1.4 : 1}
                  fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                  opacity={isActive ? 1 : 0.6}
                  className="transition-all duration-component ease-matrix"
                />
                <text
                  x={dot.x}
                  y={dot.y - 2}
                  textAnchor="middle"
                  fontSize="1.6"
                  fontFamily="Sora, sans-serif"
                  className="pointer-events-none select-none"
                  fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                >
                  {r.code}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Region chips below */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {REGIONS.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className={cn(
              'press rounded-full border px-3 py-1 text-xs transition-colors duration-micro ease-matrix',
              selectedRegion === r.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
            )}
          >
            <span className="type-mono-label mr-1.5 opacity-70">{r.code}</span>
            {r.name}
          </button>
        ))}
      </div>
    </div>
  );
}
