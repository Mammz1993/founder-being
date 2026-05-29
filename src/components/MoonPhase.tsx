import { useState, useEffect } from 'react';

interface MoonData {
  phaseName: string;
  illumination: number;
  daysToFullMoon: number;
}

// Simple approximation of moon phase based on dates
function calculateMoonPhase(date: Date): MoonData {
  // Simple algorithm relative to 2026-05-30 (known full moon)
  const targetDate = new Date('2026-05-30T17:00:00Z');
  const DIFF_MS = targetDate.getTime() - date.getTime();
  const diffDays = DIFF_MS / (1000 * 60 * 60 * 24);

  if (diffDays <= 0) {
    return {
      phaseName: "Full Moon (Gathering Night)",
      illumination: 100,
      daysToFullMoon: 0
    };
  }

  // 29.53 days average lunar cycle
  const fractionalDiff = diffDays % 29.53;
  
  if (fractionalDiff < 1) {
    return {
      phaseName: "Full Moon Ritual",
      illumination: 99,
      daysToFullMoon: 0
    };
  } else if (fractionalDiff <= 5) {
    // 1-5 days before full moon: Waxing Gibbous
    const pct = 98 - (fractionalDiff * 3.5);
    return {
      phaseName: "Waxing Gibbous",
      illumination: Math.round(pct),
      daysToFullMoon: Math.ceil(fractionalDiff)
    };
  } else {
    // Generic
    return {
      phaseName: "Waxing Gibbous Ascent",
      illumination: 75,
      daysToFullMoon: Math.ceil(fractionalDiff)
    };
  }
}

export default function MoonPhase() {
  const [currentTime, setCurrentTime] = useState(new Date('2026-05-25T12:28:07Z'));
  const [moon, setMoon] = useState<MoonData>({ phaseName: '', illumination: 0, daysToFullMoon: 0 });

  useEffect(() => {
    // Keep internal standard for current user
    const interval = setInterval(() => {
      // Small variation or real clock
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMoon(calculateMoonPhase(currentTime));
  }, [currentTime]);

  return (
    <div className="flex items-center gap-3 backdrop-blur-md bg-stone-100/10 dark:bg-white/5 py-1.5 px-3 rounded-full border border-stone-250 dark:border-stone-800/40 text-stone-850 dark:text-stone-300 hover:border-stone-350 dark:hover:border-stone-700/60 transition-all duration-300 text-xs font-mono">
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Animated minimal moon phase SVG indicator */}
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-500/80 dark:text-amber-100 fill-current drop-shadow-[0_0_10px_rgba(253,224,71,0.2)]">
          <circle cx="12" cy="12" r="9" className="opacity-10 stroke-stone-500 fill-none" strokeWidth="1" />
          {/* We dynamically mask to represent Waxing Gibbous illumination */}
          <path d="M12,3 A9,9 0 0,1 21,12 A9,9 0 0,1 12,21 A4,9 0 0,1 12,3" />
        </svg>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 leading-none">
        <span className="text-[10px] text-stone-900 dark:text-stone-200 font-medium">
          {moon.phaseName}
        </span>
        <span className="hidden md:inline text-[9px] text-stone-600 dark:text-stone-450">
          • {moon.illumination}% lit
        </span>
        {moon.daysToFullMoon > 0 ? (
          <span className="text-[9px] text-amber-800 dark:text-amber-400/85 font-medium">
            ({moon.daysToFullMoon}d to Full Moon)
          </span>
        ) : (
          <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium font-sans">
            (Gathering Phase)
          </span>
        )}
      </div>
    </div>
  );
}
