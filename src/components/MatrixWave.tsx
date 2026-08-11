import { useEffect, useRef } from 'react';

/**
 * Extremely subtle animated MATRIX waveform background.
 * SVG-based, GPU-friendly. Respects prefers-reduced-motion.
 * Metaphor: oscilloscope / electromagnetic field, not the movie's digital rain.
 */
export function MatrixWave({ className = '' }: { className?: string }) {
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
        const speed = 0.15 + i * 0.05;
        const offset = Math.sin(elapsed * speed) * 8;
        p.setAttribute('transform', `translate(0 ${offset})`);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%"  stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Three drifting oscilloscope waves — extremely low opacity */}
        <path
          data-wave
          d="M0,220 C200,180 400,260 600,220 C800,180 1000,260 1200,220"
          stroke="url(#wave-fade)"
          strokeWidth="1"
          fill="none"
          opacity="0.35"
        />
        <path
          data-wave
          d="M0,240 C200,290 400,190 600,240 C800,290 1000,190 1200,240"
          stroke="url(#wave-fade)"
          strokeWidth="1"
          fill="none"
          opacity="0.22"
        />
        <path
          data-wave
          d="M0,260 C300,220 500,300 700,260 C900,220 1100,300 1200,260"
          stroke="url(#wave-fade)"
          strokeWidth="1"
          fill="none"
          opacity="0.14"
        />
      </svg>
    </div>
  );
}
