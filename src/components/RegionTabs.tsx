import { motion } from 'framer-motion';
import { REGIONS, Region } from '@/types/radio';
import { cn } from '@/lib/utils';

interface Props {
  selectedRegion: string;
  onSelectRegion: (id: string) => void;
}

export function RegionTabs({ selectedRegion, onSelectRegion }: Props) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Regions">
      {REGIONS.map((r) => (
        <RegionTab
          key={r.id}
          region={r}
          isSelected={selectedRegion === r.id}
          onClick={() => onSelectRegion(r.id)}
        />
      ))}
    </div>
  );
}

function RegionTab({ region, isSelected, onClick }: { region: Region; isSelected: boolean; onClick: () => void; }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={onClick}
      className={cn(
        'press relative flex items-baseline gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-colors duration-micro ease-matrix',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
      )}
    >
      <span className={cn('type-mono-label', isSelected ? 'opacity-90' : 'opacity-60')}>{region.code}</span>
      <span>{region.name}</span>
      {isSelected && (
        <motion.span
          layoutId="region-underline"
          className="absolute inset-x-4 -bottom-1 h-px bg-primary"
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </button>
  );
}
