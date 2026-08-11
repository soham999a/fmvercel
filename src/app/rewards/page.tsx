"use client";

import { motion } from 'framer-motion';
import { Award, Flame, Trophy, Sparkles, Gift, Lock } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { FloatingNav } from '@/components/FloatingNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useAuth } from '@/hooks/useAuth';
import { useRewards } from '@/hooks/useRewards';

export default function Rewards() {
  const { user, loading } = useAuth();
  const r = useRewards();

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-24">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-6 md:pl-24 md:pr-8">
        <div>
          <span className="type-mono-label text-muted-foreground">System · 04 · Rewards</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Wallet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Earn points for every minute of verified listening. Build streaks. Unlock achievements.
          </p>
          <div className="rule-gold mt-4 max-w-[160px]" />
        </div>

        {!loading && !user && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            <Lock className="mb-2 h-5 w-5 text-primary" />
            <Link href="/auth" className="text-primary underline underline-offset-2">Sign in</Link> to
            track your listening rewards and streaks.
          </div>
        )}

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {/* Progress ring */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:col-span-1">
              <div className="matrix-grid absolute inset-0 opacity-40" />
              <div className="relative flex flex-col items-center">
                <ProgressRing value={r.progressInLevel} max={100} />
                <div className="mt-4 text-center">
                  <div className="type-mono-label text-muted-foreground">Level {r.level}</div>
                  <div className="mt-1 text-3xl font-semibold tabular text-foreground">
                    {r.totalPoints}<span className="ml-1 text-sm text-muted-foreground">pts</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {100 - r.progressInLevel} pts to Level {r.level + 1}
                  </div>
                </div>
              </div>
            </div>

            {/* Streak */}
            <StatCard
              icon={<Flame className="h-4 w-4" />}
              label="Current streak"
              value={`${r.streak.current_streak} ${r.streak.current_streak === 1 ? 'day' : 'days'}`}
              hint={`Longest · ${r.streak.longest_streak}`}
            />
            {/* Achievements count */}
            <StatCard
              icon={<Trophy className="h-4 w-4" />}
              label="Achievements"
              value={String(r.achievements.length)}
              hint="Milestones earned"
            />

            {/* Achievements list */}
            <section className="md:col-span-3">
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="type-mono-label text-muted-foreground">Milestones</span>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                    Achievements
                  </h2>
                </div>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                {ALL_ACHIEVEMENTS.map((a) => {
                  const earned = r.achievements.find((x) => x.code === a.code);
                  return (
                    <div
                      key={a.code}
                      className={`card-lift rounded-xl border p-4 ${
                        earned ? 'border-primary/50 bg-primary/5' : 'border-border bg-card opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Award className={`h-4 w-4 ${earned ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="type-mono-label text-muted-foreground">{a.code}</div>
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-foreground">{a.title}</h3>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                      {earned && (
                        <div className="mt-2 text-[11px] text-primary">Earned</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Ledger */}
            <section className="md:col-span-3">
              <div className="mt-6">
                <span className="type-mono-label text-muted-foreground">Ledger · last 50</span>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  Activity
                </h2>
              </div>
              <div className="mt-3 rounded-2xl border border-border bg-card">
                {r.ledger.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">
                    Start playing a station — points appear here as you listen.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {r.ledger.map((row) => (
                      <li key={row.id} className="flex items-center justify-between p-3 text-sm">
                        <div>
                          <div className="text-foreground">
                            {row.metadata?.station ?? 'Listening'}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {new Date(row.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="type-mono-metric text-primary">+{row.delta}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Redemption placeholder */}
            <section className="md:col-span-3">
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="type-mono-label text-muted-foreground">Redeem · Coming soon</span>
                </div>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                  Gift-card redemption unlocks at <span className="text-foreground">1,000 pts</span>.
                  Live fulfilment requires a partner integration — Tremendous or Amazon
                  Incentives — and will be enabled in a later drop.
                </p>
              </div>
            </section>
          </motion.div>
        )}
      </main>

      <FloatingNav />
      <AudioPlayer />
    </div>
  );
}

const ALL_ACHIEVEMENTS = [
  { code: 'first_tune',   title: 'First Tune',   description: 'Played your first station' },
  { code: 'century_club', title: 'Century Club', description: 'Earned 100 points' },
  { code: 'week_warrior', title: 'Week Warrior', description: '7-day listening streak' },
];

function StatCard({
  icon, label, value, hint,
}: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="card-lift rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="type-mono-label text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 type-mono-metric text-3xl font-semibold text-foreground">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function ProgressRing({ value, max }: { value: number; max: number }) {
  const size = 140;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        style={{ transition: 'stroke-dasharray 400ms cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}
