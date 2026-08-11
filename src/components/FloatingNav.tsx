"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Headphones, Heart, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/',          label: 'Home',      icon: Home },
  { to: '/regions',   label: 'Explore',   icon: Compass },
  { to: '/podcasts',  label: 'Podcasts',  icon: Headphones },
  { to: '/insights',  label: 'Insights',  icon: Sparkles },
  { to: '/rewards',   label: 'Rewards',   icon: Award },
  { to: '/favorites', label: 'Saved',     icon: Heart },
];

/**
 * Floating navigation.
 *  - Mobile: floating pill at bottom
 *  - Desktop: left rail
 */
export function FloatingNav() {
  const pathname = usePathname();

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <>
      {/* Mobile floating pill — centered, safe-area aware */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
        style={{
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        }}
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between gap-0.5 rounded-2xl border border-border bg-card/95 px-1.5 py-1 shadow-[0_-12px_40px_-12px_hsl(0_0%_0%/0.55)] backdrop-blur">
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              href={to}
              aria-label={label}
              className={cn(
                'press flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-colors duration-micro ease-matrix',
                isActive(to)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              <span
                className="type-mono-label w-full truncate text-center"
                style={{ fontSize: 8, letterSpacing: '0.06em' }}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>


      {/* Desktop left rail */}
      <nav
        aria-label="Primary"
        className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 md:block"
      >
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/95 px-2 py-3 backdrop-blur">
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              href={to}
              aria-label={label}
              className={cn(
                'press group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-micro ease-matrix',
                isActive(to)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.6} />
              <span
                className="type-mono-label pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 opacity-0 transition-opacity duration-micro ease-matrix group-hover:opacity-100"
                style={{ fontSize: 9 }}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

