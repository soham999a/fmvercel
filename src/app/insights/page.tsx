"use client";

import { motion } from 'framer-motion';
import { Sparkles, Clock, Calendar, Radio, Play, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { FloatingNav } from '@/components/FloatingNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useWeeklyInsights } from '@/hooks/useAiInsights';
import { useAuth } from '@/hooks/useAuth';
import { usePlayer } from '@/contexts/PlayerContext';

export default function Insights() {
  const { user } = useAuth();
  const { data, isLoading, error } = useWeeklyInsights();
  const player = usePlayer();
  const isListening = player.isPlaying && !!player.currentStation;
  const maxMinutes = data ? Math.max(1, ...data.perDay.map(d => d.minutes)) : 1;

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-24">
      <Header />
      <main className="mx-auto max-w-4xl px-4 pt-6 md:pl-24 md:pr-8">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="type-mono-label text-primary">Insights · Live</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Your Listening Insights
        </h1>
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          Your weekly listening report, updated in real-time as you tune in.
        </p>
        <div className="rule-gold mt-4 max-w-[160px]" />

        {/* Live indicator */}
        {user && isListening && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="live-dot" />
                <span className="type-mono-label text-primary">Tracking live</span>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {player.currentStation?.name} — insights update as you listen
              </p>
            </div>
          </motion.div>
        )}

        {!user && (
          <div className="mt-8 rounded-2xl border border-primary/30 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Unlock your weekly insights</p>
                <p className="text-xs text-muted-foreground">Sign in to see your listening stats, top stations, and personalised narrative.</p>
              </div>
            </div>
            <Link
              href="/auth"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in to view insights
            </Link>
          </div>
        )}

        {user && isLoading && (
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading your listening data…
          </div>
        )}

        {user && error && (
          <div className="mt-8 rounded-2xl border border-destructive/40 bg-card p-5 text-sm text-destructive">
            Couldn&apos;t load your insights. The data will update when you start listening.
          </div>
        )}

        {user && data && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8 space-y-6"
          >
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="This week"
                value={data.totalMinutes}
                suffix="min"
                accent={data.totalMinutes > 0}
              />
              <StatCard
                icon={<Calendar className="h-4 w-4" />}
                label="Active days"
                value={data.activeDays}
                suffix="/ 7"
                accent={data.activeDays > 0}
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="This month"
                value={data.totalMinutesMonth}
                suffix="min"
                accent={data.totalMinutesMonth > 0}
              />
            </div>

            {/* Bar chart */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="type-mono-label text-muted-foreground">Daily listening · minutes</span>
                <span className="type-mono-label text-primary">{data.totalMinutes} min this week</span>
              </div>
              <div className="mt-4 flex h-40 items-end gap-1.5">
                {data.perDay.map(d => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t bg-primary/80 transition-all duration-500"
                        style={{
                          height: `${d.minutes > 0 ? Math.max((d.minutes / maxMinutes) * 100, 8) : 4}%`,
                          opacity: d.minutes > 0 ? 1 : 0.3,
                        }}
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
                <span className="type-mono-label text-muted-foreground">Top stations this week</span>
                <div className="mt-3 space-y-3">
                  {data.topStations.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular">
                        {String(i + 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{s.name}</div>
                        <div className="mt-1 h-1.5 rounded-full bg-secondary">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(s.minutes / data.topStations[0].minutes) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                      <span className="type-mono-label tabular text-muted-foreground">{s.minutes}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Narrative */}
            {data.narrative && (
              <div className="rounded-2xl border border-primary/30 bg-card p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="type-mono-label text-primary">Your listening story</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {data.narrative}
                </p>
              </div>
            )}

            {/* Empty state when no data */}
            {data.totalMinutes === 0 && data.topStations.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <Play className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <h3 className="mt-3 text-sm font-medium text-foreground">No listening data yet</h3>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Play some stations — your weekly insights will build automatically as you listen.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Play className="h-3 w-3" />
                  Start listening
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </main>
      <FloatingNav />
      <AudioPlayer />
    </div>
  );
}

function StatCard({
  icon, label, value, suffix, accent,
}: { icon: React.ReactNode; label: string; value: number; suffix?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-card p-4 ${accent ? 'border-primary/40' : 'border-border'}`}>
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="type-mono-label">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold tabular text-foreground">
        {value}
        {suffix && <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}
