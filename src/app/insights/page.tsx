"use client";

import { motion } from 'framer-motion';
import { Sparkles, Clock, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { FloatingNav } from '@/components/FloatingNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useWeeklyInsights } from '@/hooks/useAiInsights';
import { useAuth } from '@/hooks/useAuth';

export default function Insights() {
  const { user } = useAuth();
  const { data, isLoading, error } = useWeeklyInsights();

  const maxMinutes = data ? Math.max(1, ...data.perDay.map(d => d.minutes)) : 1;

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-24">
      <Header />
      <main className="mx-auto max-w-4xl px-4 pt-6 md:pl-24 md:pr-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="type-mono-label text-primary">Weekly Report</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Your Listening Insights
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-crafted narrative built from your last seven days on air.
        </p>
        <div className="rule-gold mt-4 max-w-[160px]" />

        {!user && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              <Link href="/auth" className="text-primary underline underline-offset-2">Sign in</Link> to unlock personalised weekly insights.
            </p>
          </div>
        )}

        {user && isLoading && (
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Analysing your week…
          </div>
        )}

        {user && error && (
          <div className="mt-8 rounded-2xl border border-destructive/40 bg-card p-5 text-sm text-destructive">
            Couldn&apos;t build your report. Try again shortly.
          </div>
        )}

        {user && data && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8 space-y-6"
          >
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Stat icon={<Clock className="h-4 w-4" />} label="Minutes this week" value={data.totalMinutes} />
              <Stat icon={<Calendar className="h-4 w-4" />} label="Active days" value={data.activeDays} suffix="/ 7" />
              <Stat icon={<Sparkles className="h-4 w-4" />} label="Minutes · 30d" value={data.totalMinutesMonth} />
            </div>

            {/* Bar chart */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <span className="type-mono-label text-muted-foreground">Daily · Minutes</span>
              <div className="mt-4 flex h-40 items-end gap-2">
                {data.perDay.map(d => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t bg-primary/80"
                        style={{ height: `${(d.minutes / maxMinutes) * 100}%` }}
                        title={`${d.minutes} min`}
                      />
                    </div>
                    <span className="type-mono-label text-muted-foreground" style={{ fontSize: 9 }}>
                      {new Date(d.day).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top stations */}
            {data.topStations.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <span className="type-mono-label text-muted-foreground">Top stations</span>
                <div className="mt-3 space-y-2">
                  {data.topStations.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="type-mono-label w-6 text-primary tabular">{String(i + 1).padStart(2, '0')}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{s.name}</div>
                        <div className="mt-1 h-1 rounded bg-secondary">
                          <div
                            className="h-full rounded bg-primary"
                            style={{ width: `${(s.minutes / data.topStations[0].minutes) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="type-mono-label tabular text-muted-foreground">{s.minutes}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI narrative */}
            <div className="rounded-2xl border border-primary/30 bg-card p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="type-mono-label text-primary">AI Companion</span>
              </div>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {data.narrative}
              </div>
            </div>
          </motion.div>
        )}
      </main>
      <FloatingNav />
      <AudioPlayer />
    </div>
  );
}

function Stat({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="type-mono-label">{label}</span></div>
      <div className="mt-2 text-2xl font-semibold tabular text-foreground">
        {value}{suffix && <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}
