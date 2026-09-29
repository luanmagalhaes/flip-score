"use client";

import { useEffect, useEffectEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import type { PlayerRow } from "@/types/room";

interface BustSlamProps {
  player: PlayerRow;
  onDone: () => void;
}

const jeers = [
  "Foi na ganância",
  "Tinha que ter parado",
  "A mesa avisou",
  "Confiou demais no baralho",
  "Era só parar, mas não",
  "Zero bonito esse",
];

export function BustSlam({ player, onDone }: BustSlamProps) {
  const finish = useEffectEvent(onDone);

  useEffect(() => {
    const timer = window.setTimeout(() => finish(), 1800);

    return () => window.clearTimeout(timer);
  }, []);

  const jeer = jeers[player.name.length % jeers.length];

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-ink/55">
      <div className="animate-shake-hard flex flex-col items-center gap-3">
        <div className="animate-drop-away relative">
          <Avatar
            name={player.name}
            photo={player.avatar}
            emoji={player.emoji}
            size="xl"
            className="grayscale"
          />
          <span className="absolute inset-0 rounded-2xl border-4 border-flame" />
        </div>

        <span className="display rounded-xl border-4 border-ink bg-paper px-4 py-1.5 text-xl text-ink">
          {player.name}
        </span>
      </div>

      <div className="animate-stamp-slam absolute flex flex-col items-center gap-2">
        <span className="display rounded-2xl border-[6px] border-flame bg-paper/95 px-8 py-3 text-6xl text-flame shadow-[0_10px_0_var(--color-ink)] sm:text-7xl">
          ZERO
        </span>
        <span className="display rounded-xl border-2 border-ink bg-ink px-3 py-1 text-sm text-paper">
          {jeer}
        </span>
      </div>
    </div>
  );
}
