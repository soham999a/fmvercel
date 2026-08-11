import Link from 'next/link';
import { Sparkles, Play, Loader2 } from 'lucide-react';
import { useRecommendations } from '@/hooks/useAiInsights';
import { useAuth } from '@/hooks/useAuth';

/**
 * AI-recommended stations, powered by Lovable AI Gateway.
 * Requires auth + prior listening history.
 */
export function AiRecommendations() {
  const { user } = useAuth();
  const { data, isLoading, error } = useRecommendations();

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="type-mono-label text-primary">AI Curator</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          <Link href="/auth" className="text-primary underline underline-offset-2">Sign in</Link> and listen for a few minutes — we'll suggest stations tuned to your taste.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Tuning recommendations…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Couldn't reach the AI curator right now.
      </div>
    );
  }

  const recs = data?.recommendations ?? [];
  if (recs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
        {data?.message ?? 'Listen for a few minutes to unlock personalised recommendations.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {recs.map((r) => {
        const query = encodeURIComponent(r.name);
        return (
          <a
            key={r.name}
            href={`/?q=${query}`}
            className="card-lift group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
              <Play className="ml-0.5 h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="type-mono-label text-primary/80">{r.genre}</span>
                <span className="type-mono-label text-muted-foreground">· {r.country}</span>
              </div>
              <h4 className="mt-1 truncate text-sm font-semibold text-foreground group-hover:text-primary">
                {r.name}
              </h4>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {r.reason}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
