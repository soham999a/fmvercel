"use client";

import { motion } from 'framer-motion';
import { Award, Flame, Trophy, Sparkles, Gift, Lock, Radio, Clock, Zap, TrendingUp, Play, Plus } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { FloatingNav } from '@/components/FloatingNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useAuth } from '@/hooks/useAuth';
import { useRewards } from '@/hooks/useRewards';
import { usePlayer } from '@/contexts/PlayerContext';

export default function Rewards() {
  const { user, loading } = useAuth();
  const r = useRewards();
  const player = usePlayer();
  const isListening = player.isPlaying && !!player.currentStation;

  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-24">
      <Header />
      <main className="mx-auto max-w-4xl px-4 pt-6 md:pl-24 md:pr-8">
        {/* Hero */}
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="type-mono-label text-primary">Rewards · Live</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Earn While You Listen
          </h1>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            Every minute of listening earns you 1 point. Build daily streaks, unlock achievements, and climb levels.
          </p>
          <div className="rule-gold mt-4 max-w-[160px]" />
        </div>

        {!loading && !user && (
          <div className="mt-8 rounded-2xl border border-primary/30 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sign in to start earning</p>
                <p className="text-xs text-muted-foreground">Create an account to track your rewards and streaks across devices.</p>
              </div>
            </div>
            <Link
              href="/auth"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in / Create account
            </Link>
          </div>
        )}

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="mt-6 space-y-6"
          >
            {/* Live listening banner */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Radio className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="live-dot" />
                    <span className="type-mono-label text-primary">Earning points now</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                    {player.currentStation?.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="type-mono-metric text-lg font-semibold text-primary">+1</div>
                  <div className="type-mono-label text-muted-foreground">per min</div>
                </div>
              </motion.div>
            )}

            {/* How it works */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <span className="type-mono-label text-muted-foreground">How it works</span>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Step
                  icon={<Play className="h-4 w-4" />}
                  number="01"
                  title="Play a station"
                  desc="Pick any station from the home screen or search"
                />
                <Step
                  icon={<Clock className="h-4 w-4" />}
                  number="02"
                  title="Listen for 1+ min"
                  desc="Points are awarded every minute you stay tuned"
                />
                <Step
                  icon={<Zap className="h-4 w-4" />}
                  number="03"
                  title="Earn & level up"
                  desc="1 point per minute. Every 100 pts = new level"
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {/* Level + Points */}
              <div className="relative col-span-2 overflow-hidden rounded-2xl border border-border bg-card p-5 md:col-span-2">
                <div className="matrix-grid absolute inset-0 opacity-40" />
                <div className="relative flex items-center gap-5">
                  <ProgressRing value={r.progressInLevel} max={100} />
                  <div>
                    <div className="type-mono-label text-muted-foreground">Level {r.level}</div>
                    <div className="mt-1 text-3xl font-semibold tabular text-foreground">
                      {r.totalPoints}<span className="ml-1 text-sm font-normal text-muted-foreground">pts</span>
                    </div>
                    <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${r.progressInLevel}%` }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                    <div className="mt-1.5 text-[11px] text-muted-foreground">
                      {100 - r.progressInLevel > 0
                        ? `${100 - r.progressInLevel} pts to Level ${r.level + 1}`
                        : `Level ${r.level + 1} unlocked!`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <span className="type-mono-label text-muted-foreground">Streak</span>
                </div>
                <div className="mt-3">
                  <div className="type-mono-metric text-2xl font-semibold text-foreground">
                    {r.streak.current_streak}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.streak.current_streak === 1 ? 'day' : 'days'} · best: {r.streak.longest_streak}
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                  <span className="type-mono-label text-muted-foreground">Badges</span>
                </div>
                <div className="mt-3">
                  <div className="type-mono-metric text-2xl font-semibold text-foreground">
                    {r.achievements.length}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    of {ALL_ACHIEVEMENTS.length} unlocked
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <section>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="type-mono-label text-muted-foreground">Milestones</span>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                    Achievements
                  </h2>
                </div>
                <span className="type-mono-label text-primary">
                  {r.achievements.length}/{ALL_ACHIEVEMENTS.length}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {ALL_ACHIEVEMENTS.map((a) => {
                  const earned = r.achievements.find((x) => x.code === a.code);
                  return (
                    <div
                      key={a.code}
                      className={`card-lift relative overflow-hidden rounded-xl border p-4 ${
                        earned
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            earned ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          <Award className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                          <div className="type-mono-label text-muted-foreground">{a.points} pts</div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{a.description}</p>
                      {earned && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="type-mono-label text-primary">
                            Earned {new Date(earned.earned_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {!earned && (
                        <div className="mt-2 type-mono-label text-muted-foreground/60">Locked</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Activity Ledger */}
            <section>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="type-mono-label text-muted-foreground">Activity</span>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                    Recent Earnings
                  </h2>
                </div>
                {r.ledger.length > 0 && (
                  <span className="type-mono-label text-muted-foreground">
                    {r.ledger.length} entries
                  </span>
                )}
              </div>
              <div className="mt-3 rounded-2xl border border-border bg-card">
                {r.ledger.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                      <Play className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <h3 className="mt-3 text-sm font-medium text-foreground">No points yet</h3>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      Play any radio station for at least 1 minute and your first points will appear here automatically.
                    </p>
                    <Link
                      href="/"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Play className="h-3 w-3" />
                      Start listening
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {r.ledger.map((row) => (
                      <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                            row.reason === 'century_club'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {row.reason === 'century_club' ? (
                            <Trophy className="h-4 w-4" />
                          ) : (
                            <Radio className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">
                            {row.reason === 'century_club'
                              ? 'Century Club Bonus'
                              : row.metadata?.station ?? 'Listening'}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {row.reason === 'century_club'
                              ? 'Achievement unlocked'
                              : `${row.metadata?.minutes ?? '?'} min listened`}
                            {' · '}
                            {new Date(row.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="type-mono-metric text-sm font-semibold text-primary">
                          +{row.delta}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Levels guide */}
            <section>
              <div className="rounded-2xl border border-border bg-card p-5">
                <span className="type-mono-label text-muted-foreground">Level guide</span>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {LEVELS.map((l) => (
                    <div
                      key={l.level}
                      className={`rounded-xl border p-3 text-center ${
                        r.level >= l.level
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="type-mono-metric text-lg font-semibold text-foreground">
                        Lv.{l.level}
                      </div>
                      <div className="type-mono-label text-muted-foreground">{l.points} pts</div>
                      <div className="mt-1 text-[10px] text-muted-foreground/70">{l.title}</div>
                    </div>
                  ))}
                </div>
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
  { code: 'first_tune', title: 'First Tune', description: 'Play your very first radio station', points: 1 },
  { code: 'century_club', title: 'Century Club', description: 'Earn 100 total points from listening', points: 100 },
  { code: 'week_warrior', title: 'Week Warrior', description: 'Maintain a 7-day listening streak', points: 50 },
];

const LEVELS = [
  { level: 1, points: 0, title: 'Listener' },
  { level: 5, points: 400, title: 'Regular' },
  { level: 10, points: 900, title: 'Enthusiast' },
  { level: 20, points: 1900, title: 'Radio Legend' },
];

function Step({
  icon, number, title, desc,
}: { icon: React.ReactNode; number: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
        {icon}
      </div>
      <div>
        <div className="type-mono-label text-muted-foreground">Step {number}</div>
        <h3 className="mt-0.5 text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function ProgressRing({ value, max }: { value: number; max: number }) {
  const size = 88;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <div className="relative flex-shrink-0">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${c * pct} ${c}` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="type-mono-metric text-lg font-semibold text-foreground">{value}%</span>
      </div>
    </div>
  );
}
