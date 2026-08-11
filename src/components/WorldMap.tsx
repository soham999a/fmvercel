import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { REGIONS } from '@/types/radio';
import { cn } from '@/lib/utils';

/**
 * Realistic world map using natural earth topojson (all countries).
 * Region dots overlaid at approximate geographic centroids.
 */

// jsdelivr-hosted, widely-used topojson for react-simple-maps.
const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const REGION_COORDS: Record<string, [number, number]> = {
  india:        [78, 22],
  us:           [-98, 39],
  europe:       [10, 50],
  apac:         [120, 20],
  australia:    [134, -25],
  southamerica: [-60, -15],
  africa:       [20, 5],
};

interface Props {
  selectedRegion: string;
  onSelect: (regionId: string) => void;
}

export function WorldMap({ selectedRegion, onSelect }: Props) {
  const regions = useMemo(() => REGIONS, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <div className="type-mono-label text-muted-foreground">World Map</div>
          <h3 className="mt-1 text-sm font-medium text-foreground">
            Select a region on the globe
          </h3>
        </div>
        <div className="type-mono-label text-muted-foreground">7 regions · live</div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-background/40">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155 }}
          width={900}
          height={440}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: 'hsl(var(--foreground) / 0.08)',
                      stroke: 'hsl(var(--foreground) / 0.15)',
                      strokeWidth: 0.4,
                      outline: 'none',
                    },
                    hover: {
                      fill: 'hsl(var(--primary) / 0.15)',
                      outline: 'none',
                    },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {regions.map((r) => {
            const coords = REGION_COORDS[r.id];
            if (!coords) return null;
            const active = r.id === selectedRegion;
            return (
              <Marker
                key={r.id}
                coordinates={coords}
                onClick={() => onSelect(r.id)}
                style={{ default: { cursor: 'pointer' } }}
              >
                {active && (
                  <motion.circle
                    r={10}
                    fill="hsl(var(--primary))"
                    opacity={0.25}
                    animate={{ r: [8, 16, 8], opacity: [0.35, 0, 0.35] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
                <circle
                  r={active ? 5 : 3.5}
                  fill={active ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                  stroke="hsl(var(--background))"
                  strokeWidth={1}
                  opacity={active ? 1 : 0.75}
                />
                <text
                  y={-10}
                  textAnchor="middle"
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    pointerEvents: 'none',
                  }}
                  fill={active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                >
                  {r.code}
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Region chips */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {regions.map((r) => (
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
