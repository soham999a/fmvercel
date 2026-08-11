import { useEffect, useRef } from 'react';

/**
 * Full-screen ambient frequency wave — sits behind the app as a fixed layer.
 * Multiple oscilloscope waves drift + phase-shift continuously.
 * Extremely low opacity so it never fights content. Reduced-motion respected.
 */
export function AmbientWave() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !svgRef.current) return;

    const paths = svgRef.current.querySelectorAll<SVGPathElement>('path[data-wave]');
    let raf = 0;
    const start = performance.now();

    const tick = (t: number) => {
      const elapsed = (t - start) / 1000;
      paths.forEach((p, i) => {
        const speed = 0.12 + i * 0.04;
        const amp = 6 + i * 3;
        const y = Math.sin(elapsed * speed + i) * amp;
        const x = Math.cos(elapsed * (speed * 0.6)) * (10 + i * 4);
        p.setAttribute('transform', `translate(${x} ${y})`);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ambient-wave" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="ambient-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* soft central glow */}
        <rect x="0" y="0" width="1200" height="800" fill="url(#ambient-glow)" />

        {/* Drifting frequency waves — full page */}
        {[
          { d: 'M-50,150 C200,110 400,190 600,150 C800,110 1000,190 1250,150', o: 0.09 },
          { d: 'M-50,300 C200,350 400,250 600,300 C800,350 1000,250 1250,300', o: 0.08 },
          { d: 'M-50,450 C300,410 500,490 700,450 C900,410 1100,490 1250,450', o: 0.07 },
          { d: 'M-50,600 C200,560 400,640 600,600 C800,560 1000,640 1250,600', o: 0.06 },
          { d: 'M-50,720 C250,690 450,750 650,720 C900,690 1100,750 1250,720', o: 0.05 },
        ].map((w, i) => (
          <path
            key={i}
            data-wave
            d={w.d}
            stroke="url(#ambient-wave)"
            strokeWidth="1"
            fill="none"
            opacity={w.o}
          />
        ))}
      </svg>
    </div>
  );
}
