"use client";

import { useEffect } from "react";
import { flipSevenBonus } from "@/lib/game/rules";

interface FlipSevenBurstProps {
  onDone: () => void;
}

export function FlipSevenBurst({ onDone }: FlipSevenBurstProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1750);

    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center">
      <span className="animate-shockwave absolute h-56 w-56 rounded-full border-8 border-gold" />
      <span
        className="animate-shockwave absolute h-56 w-56 rounded-full border-8 border-teal"
        style={{ animationDelay: "180ms" }}
      />

      <div className="animate-card-spin-in">
        <div className="foil-band animate-foil-slide flex h-64 w-44 flex-col items-center justify-center gap-2 rounded-[1.5rem] border-[6px] border-ink shadow-[0_16px_0_var(--color-ink)] sm:h-72 sm:w-52">
          <span className="display text-5xl leading-none text-ink sm:text-6xl">FLIP</span>
          <span className="display text-7xl leading-none text-flame sm:text-8xl">7</span>
          <span className="display mt-1 rounded-xl border-2 border-ink bg-paper px-3 py-1 text-base text-ink">
            +{flipSevenBonus}
          </span>
        </div>
      </div>
    </div>
  );
}
