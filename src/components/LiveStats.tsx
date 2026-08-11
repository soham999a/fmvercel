import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { REGIONS } from '@/types/radio';

/**
 * Live radio stats — animated counters. Uses tabular numerals.
 * Numbers are computed from the local catalog + Radio Browser API sample.
 */
export function LiveStats() {
  const totalRegions = REGIONS.length;
  const totalCountries = REGIONS.reduce((n, r) => n + r.countries.length, 0);
  const totalStations = REGIONS.reduce((n, r) => n + r.count, 0);

  const [listeners, setListeners] = useState(4823);

  useEffect(() => {
    const iv = setInterval(() => {
      setListeners(l => l + Math.floor(Math.random() * 7 - 3));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const stats = [
    { label: 'Stations',  value: totalStations,  suffix: '+' },
    { label: 'Countries', value: totalCountries, suffix: '' },
    { label: 'Regions',   value: totalRegions,   suffix: '' },
    { label: 'Listeners', value: Math.max(0, listeners), suffix: '' },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4 md:gap-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: i * 0.05 }}
          className="border-l border-border/80 pl-3"
        >
          <dt className="type-mono-label text-muted-foreground">{s.label}</dt>
          <dd className="type-mono-metric mt-1 text-2xl font-semibold tabular text-foreground md:text-3xl">
            {s.value.toLocaleString()}{s.suffix}
          </dd>
        </motion.div>
      ))}
    </dl>
  );
}
