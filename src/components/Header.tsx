import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

/**
 * MATRIX header. Minimal. Wordmark left, theme toggle right.
 * Uses the geometric M mark from the brand doc.
 */
export function Header() {
  const { user, signOut, loading } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:pl-24 md:pr-8">
        <Link href="/" className="press flex items-center gap-3">
          <div className="rounded-md border border-primary/80 p-0.5 shadow-[0_0_12px_rgba(184,146,74,0.25)]">
            <img
              src="/app-icon.png"
              alt="Hertz — Your Home of Radio"
              width={36}
              height={36}
              className="hidden h-9 w-auto object-contain dark:block"
            />
            <img
              src="/app-icon-light.png"
              alt="Hertz — Your Home of Radio"
              width={36}
              height={36}
              className="block h-9 w-auto object-contain dark:hidden"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-foreground">Hertz</span>
            <span className="type-mono-label mt-0.5 hidden text-primary/80 min-[400px]:block" style={{ fontSize: 9 }}>
              Your Home of Radio
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {!loading && (user ? (
            <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth" aria-label="Sign in">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            </Button>
          ))}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/** Geometric MATRIX-style mark — three connected nodes. */
function MarkLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="text-primary"
    >
      <circle cx="6" cy="8" r="2" fill="currentColor" />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      <circle cx="26" cy="8" r="2" fill="currentColor" />
      <circle cx="6" cy="24" r="2" fill="currentColor" />
      <circle cx="26" cy="24" r="2" fill="currentColor" />
      <path
        d="M6 8 L16 16 L26 8 M6 24 L16 16 L26 24"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
