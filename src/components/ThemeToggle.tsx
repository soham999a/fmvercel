"use client";

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={mounted ? `Switch to ${isDark ? 'light' : 'dark'} theme` : 'Toggle theme'}
      className="press flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/70 hover:text-foreground transition-colors duration-micro ease-matrix"
    >
      {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
    </button>
  );
}
