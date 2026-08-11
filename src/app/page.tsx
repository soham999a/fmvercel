"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Header } from '@/components/Header';
import { FloatingNav } from '@/components/FloatingNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SearchBar } from '@/components/SearchBar';
import { RegionTabs } from '@/components/RegionTabs';
import { StationGrid } from '@/components/StationGrid';
import { WorldMap } from '@/components/WorldMap';
import { LiveStats } from '@/components/LiveStats';
import { MatrixWave } from '@/components/MatrixWave';
import { ListenerFigure } from '@/components/ListenerFigure';
import { AiRecommendations } from '@/components/AiRecommendations';
import { StationCard } from '@/components/StationCard';
import { REGIONS } from '@/types/radio';
import { useEditorsPicks } from '@/hooks/useRadioStations';

const Index = () => {
  const [selectedRegion, setSelectedRegion] = useState('india');
  const region = REGIONS.find(r => r.id === selectedRegion);
  const { data: editorsPicks } = useEditorsPicks();

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-24">
      <Header />

      <main className="mx-auto max-w-6xl px-4 md:pl-24 md:pr-8">
        {/* ================= HERO — Live Radio Universe ================= */}
        <section className="relative rounded-3xl border border-border bg-card mt-6">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div className="matrix-grid absolute inset-0" />
            <MatrixWave />
          </div>

          <div className="relative px-6 py-10 md:px-12 md:py-16">
            {/* MATRIX metaphor — dotted listener figure, top-right */}
            <ListenerFigure
              className="pointer-events-none absolute right-4 top-6 hidden h-40 w-40 text-primary md:block lg:right-8 lg:top-8 lg:h-52 lg:w-52"
            />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-2">
                <span className="live-dot" />
                <span className="type-mono-label text-primary">Live Radio Universe</span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
                Every station,
                <br />
                <span className="text-primary">precisely tuned.</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                An intelligent global audio system — 110+ verified stations across 7 regions, streaming with mathematical precision.
              </p>

              {/* Search */}
              <div className="mt-6 max-w-xl">
                <SearchBar />
              </div>
            </motion.div>

            {/* Rule + Stats */}
            <div className="mt-10">
              <div className="rule-gold mb-6" />
              <LiveStats />
            </div>
          </div>
        </section>

        {/* ================= REGION EXPLORER ================= */}
        <section className="mt-10">
          <SectionHeader kicker="System · 01" title="Global Discovery">
            Rotate through regions. Every dot is a live broadcast cluster.
          </SectionHeader>
          <div className="mt-4">
            <WorldMap selectedRegion={selectedRegion} onSelect={setSelectedRegion} />
          </div>
        </section>

        {/* ================= STATIONS BY REGION ================= */}
        <section className="mt-10">
          <SectionHeader kicker={`System · 02 · ${region?.code ?? ''}`} title={`${region?.name ?? ''} Stations`}>
            Curated + verified. Live broadcasts, precision metadata.
          </SectionHeader>

          <div className="mt-4">
            <RegionTabs selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} />
          </div>
          <div className="mt-4">
            <StationGrid regionId={selectedRegion} />
          </div>
        </section>

        {/* ================= AI RECOMMENDATIONS ================= */}
        <section className="mt-12">
          <SectionHeader kicker="System · 03 · AI" title="Tuned for you">
            Recommendations from your listening history, curated by our AI companion.
          </SectionHeader>
          <div className="mt-4">
            <AiRecommendations />
          </div>
        </section>

        {/* ================= EDITOR'S PICKS ================= */}
        <section className="mt-12">
          <SectionHeader kicker="System · 04" title="Editor's Picks" icon={<Star className="h-3.5 w-3.5" strokeWidth={2} />}>
            Ten broadcasts hand-selected for craft, taste and signal.
          </SectionHeader>

          {editorsPicks && editorsPicks.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {editorsPicks.slice(0, 10).map((s, i) => (
                <StationCard key={s.id} station={s} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>

      <FloatingNav />
      <AudioPlayer />
    </div>
  );
};

function SectionHeader({
  kicker, title, children, icon
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <span className="type-mono-label text-muted-foreground">{kicker}</span>
      </div>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        {title}
      </h2>
      {children && <p className="mt-1 text-sm text-muted-foreground">{children}</p>}
    </div>
  );
}

export default Index;
