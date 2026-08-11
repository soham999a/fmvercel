"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { FloatingNav } from '@/components/FloatingNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { WorldMap } from '@/components/WorldMap';
import { StationGrid } from '@/components/StationGrid';
import { REGIONS } from '@/types/radio';

export default function Regions() {
  const [selectedRegion, setSelectedRegion] = useState('india');
  const region = REGIONS.find(r => r.id === selectedRegion);

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-24">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pt-6 md:pl-24 md:pr-8">
        <div>
          <span className="type-mono-label text-muted-foreground">Explore</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            World Regions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seven regions · {REGIONS.reduce((n, r) => n + r.countries.length, 0)} countries · 110+ curated stations
          </p>
          <div className="rule-gold mt-4 max-w-[160px]" />
        </div>

        <div className="mt-6">
          <WorldMap selectedRegion={selectedRegion} onSelect={setSelectedRegion} />
        </div>

        <div className="mt-10">
          <div className="flex items-baseline gap-3">
            <span className="type-mono-label text-primary">{region?.code}</span>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{region?.name}</h2>
            <span className="type-mono-label ml-auto text-muted-foreground">
              {region?.count} stations
            </span>
          </div>
          <div className="mt-4">
            <StationGrid regionId={selectedRegion} />
          </div>
        </div>
      </main>

      <FloatingNav />
      <AudioPlayer />
    </div>
  );
}
