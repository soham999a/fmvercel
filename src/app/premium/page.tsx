"use client";

import { motion } from 'framer-motion';
import { Check, Zap, Globe, Headphones, Star, Shield, Wifi, Download } from 'lucide-react';
import { Header } from '@/components/Header';
import { FloatingNav } from '@/components/FloatingNav';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MatrixWave } from '@/components/MatrixWave';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const features = [
  { icon: Globe,      title: 'All Regions',    description: 'Every country, every language. 500+ exclusive stations.' },
  { icon: Headphones, title: 'HD Audio',       description: 'Lossless 320kbps stream where broadcaster allows.' },
  { icon: Zap,        title: 'No Ads',         description: 'Uninterrupted broadcast, entirely.' },
  { icon: Star,       title: 'Rewards',        description: 'Every minute earns you points redeemable as gift cards.' },
  { icon: Download,   title: 'Offline Cache',  description: 'Save station bookmarks for zero-signal listening.' },
  { icon: Shield,     title: 'Priority Support', description: '24/7 direct line to the Hertz team.' },
];

const plans = [
  { id: 'monthly', name: 'Monthly', price: '$4.99', period: '/ month',   popular: false },
  { id: 'yearly',  name: 'Annual',  price: '$39.99', period: '/ year',    popular: true, savings: 'Save 33%', equiv: '$3.33/mo' },
];

export default function Premium() {
  return (
    <div className="min-h-dvh bg-background pb-32 md:pb-24">
      <Header />

      <main className="mx-auto max-w-4xl px-4 pt-6 md:pl-24 md:pr-8">
        {/* Hero */}
        <section className="relative rounded-3xl border border-border bg-card">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div className="matrix-grid absolute inset-0" />
            <MatrixWave />
          </div>

          <div className="relative px-6 py-12 md:px-10 md:py-16 text-center">
            <div className="inline-flex items-center gap-2">
              <span className="live-dot" />
              <span className="type-mono-label text-primary">Hertz Premium</span>
            </div>
            <h1 className="mx-auto mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
              The world&apos;s radio,<br />
              <span className="text-primary">precisely delivered.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              No ads. HD audio. Every region. 7-day free trial included.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="mt-8">
          <div className="type-mono-label text-muted-foreground mb-3">Choose your plan</div>
          <div className="grid gap-3 md:grid-cols-2">
            {plans.map(p => (
              <div
                key={p.id}
                className={cn(
                  'rounded-2xl border bg-card p-5 transition-colors duration-component ease-matrix',
                  p.popular ? 'border-primary' : 'border-border'
                )}
              >
                {p.popular && (
                  <div className="mb-3 inline-flex items-center gap-1.5">
                    <span className="live-dot" />
                    <span className="type-mono-label text-primary">Most popular</span>
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tabular text-foreground">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="type-mono-label text-muted-foreground">{p.name}</span>
                  {p.equiv && (<>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="type-mono-label text-primary">{p.equiv}</span>
                  </>)}
                  {p.savings && (<>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="type-mono-label text-primary">{p.savings}</span>
                  </>)}
                </div>
                <Button className="mt-5 w-full" variant={p.popular ? 'default' : 'outline'}>
                  Start 7-day free trial
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center type-mono-label text-muted-foreground">
            Cancel anytime · Secure payment · No card required for trial
          </p>
        </section>

        {/* Features */}
        <section className="mt-10">
          <div className="type-mono-label text-muted-foreground mb-3">What you get</div>
          <div className="grid gap-3 md:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-border">
                  <f.icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground">{f.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.description}</p>
                </div>
                <Check className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2} />
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <FloatingNav />
      <AudioPlayer />
    </div>
  );
}
