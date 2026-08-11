import { useEffect, useRef } from 'react';

/**
 * MATRIX metaphor — abstract listener with headphones, drawn in dotted gold.
 * Dashed strokes animate to feel "live". Reduced-motion respected.
 * Uses currentColor so it inherits `text-primary` in dark mode
 * and `text-foreground` in light mode via wrapper class.
 */
export function ListenerFigure({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !ref.current) return;
    const dashes = ref.current.querySelectorAll<SVGPathElement | SVGCircleElement>('[data-flow]');
    const waves = ref.current.querySelectorAll<SVGPathElement>('[data-wave]');
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const elapsed = (t - start) / 1000;
      dashes.forEach((el, i) => {
        el.setAttribute('stroke-dashoffset', String(-elapsed * (18 + i * 4)));
      });
      waves.forEach((w, i) => {
        const scale = 1 + Math.sin(elapsed * 2 + i) * 0.06;
        const opacity = 0.25 + Math.sin(elapsed * 2 + i) * 0.2;
        w.setAttribute('transform', `translate(${72 + i * 14} 60) scale(${scale})`);
        w.setAttribute('opacity', String(Math.max(0.08, opacity)));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 180 200"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* orbital ring — reference geometry */}
      <circle cx="80" cy="70" r="58" opacity="0.15" strokeDasharray="1 5" />
      <circle cx="80" cy="70" r="42" opacity="0.25" strokeDasharray="1 4" data-flow />

      {/* Head */}
      <circle cx="80" cy="60" r="20" strokeDasharray="2 3" data-flow />

      {/* Headphones band */}
      <path d="M56 58 C58 40, 102 40, 104 58" strokeDasharray="2 3" data-flow />
      {/* Left ear cup */}
      <path d="M52 58 a6 8 0 1 0 0.1 0" fill="currentColor" opacity="0.9" />
      {/* Right ear cup */}
      <path d="M108 58 a6 8 0 1 0 0.1 0" fill="currentColor" opacity="0.9" />

      {/* Neck */}
      <path d="M74 82 L74 92 M86 82 L86 92" strokeDasharray="2 2" data-flow />

      {/* Shoulders + torso outline */}
      <path
        d="M44 116 C48 100, 66 92, 80 92 C94 92, 112 100, 116 116 L120 172 L40 172 Z"
        strokeDasharray="3 3"
        data-flow
      />

      {/* Chest waveform — the music inside */}
      <path
        d="M56 138 L62 132 L68 144 L74 128 L80 148 L86 128 L92 144 L98 132 L104 138"
        strokeDasharray="2 2"
        opacity="0.9"
        data-flow
      />

      {/* Music notes drifting from headphones */}
      <g strokeDasharray="2 2" opacity="0.7">
        <path d="M126 44 L126 28 L134 26 L134 42" data-flow />
        <circle cx="124" cy="46" r="3" fill="currentColor" />
        <circle cx="132" cy="44" r="3" fill="currentColor" />
      </g>

      {/* Sound waves emanating right side */}
      <path
        data-wave
        d="M0 -18 a18 18 0 0 1 0 36"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.3"
      />
      <path
        data-wave
        d="M0 -26 a26 26 0 0 1 0 52"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.22"
      />
      <path
        data-wave
        d="M0 -34 a34 34 0 0 1 0 68"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.15"
      />

      {/* baseline rule */}
      <line x1="20" y1="180" x2="160" y2="180" strokeDasharray="1 4" opacity="0.3" />
    </svg>
  );
}
