import { motion } from 'framer-motion';
import { Radio, Loader2 } from 'lucide-react';
import { useStationsByRegion } from '@/hooks/useRadioStations';
import { StationCard } from './StationCard';
import { REGIONS } from '@/types/radio';

interface StationGridProps {
  regionId: string;
}

export function StationGrid({ regionId }: StationGridProps) {
  const { data: stations, isLoading, error } = useStationsByRegion(regionId);
  const region = REGIONS.find(r => r.id === regionId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-3 h-6 w-6 animate-spin text-primary" />
        <p className="type-mono-label text-muted-foreground">Loading stations</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Radio className="mb-3 h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">Failed to load stations</p>
      </div>
    );
  }

  if (!stations || stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Radio className="mb-3 h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">No stations found for {region?.name}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
    >
      {stations.map((station, index) => (
        <StationCard key={station.id} station={station} index={index} />
      ))}
    </motion.div>
  );
}
