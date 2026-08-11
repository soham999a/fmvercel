"use client";

import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { AmbientWave } from "@/components/AmbientWave";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="hertz-theme"
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <PlayerProvider>
            <Toaster />
            <Sonner />
            <AmbientWave />
            <div className="relative z-10">{children}</div>
          </PlayerProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
