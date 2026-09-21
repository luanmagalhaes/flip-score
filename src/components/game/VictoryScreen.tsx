"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/game/Confetti";
import { useEffect } from "react";
import { sound } from "@/lib/sound";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { points, rounds as roundLabel } from "@/utils/plural";
import type { PlayerRow } from "@/types/room";

interface VictoryScreenProps {
  winners: PlayerRow[];
  ranked: PlayerRow[];
  playedRounds: number;
  onNewTable: () => void;
}

export function VictoryScreen({
  winners,
  ranked,
  playedRounds,
  onNewTable,
}: VictoryScreenProps) {
  useEffect(() => {
    sound.win();
  }, []);

  const tie = winners.length > 1;
  const champion = winners[0];

  return (
    <>
      <Confetti running />

      <Screen
        footer={
          <Button variant="flame" size="lg" fullWidth onClick={onNewTable}>
            Montar outra mesa
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Wordmark size="sm" />

          <div className="relative flex items-center justify-center py-3">
            <span className="foil-band animate-ring-spin absolute h-[17rem] w-[17rem] rounded-full opacity-40 blur-xl sm:h-[21rem] sm:w-[21rem]" />

            <div className="animate-champion-zoom relative">
              <Avatar
                name={champion?.name ?? "Campeã"}
                photo={champion?.avatar ?? null}
                emoji={champion?.emoji ?? null}
                size="hero"
                glow
              />
              <span className="display absolute -right-4 -top-4 rotate-12 rounded-2xl border-4 border-ink bg-gold px-4 py-1.5 text-2xl text-ink shadow-[0_6px_0_var(--color-ink)]">
                {champion?.total ?? 0}
              </span>
            </div>
          </div>

          <h1 className="display text-3xl leading-tight text-balance text-ink sm:text-4xl">
            {tie
              ? `Empate: ${winners.map((person) => person.name).join(" e ")}`
              : `${champion?.name ?? "Alguém"} venceu!`}
          </h1>

          <p className="max-w-[30ch] text-sm font-semibold text-ink/65">
            {tie
              ? `Terminaram com ${points(champion?.total ?? 0)} cada em ${roundLabel(playedRounds)}.`
              : `Chegou com ${points(champion?.total ?? 0)} em ${roundLabel(playedRounds)}.`}
          </p>
        </div>

        <section className="mt-7">
          <h2 className="display mb-3 text-lg text-ink">Placar final</h2>
          <ul className="flex flex-col gap-2">
            {ranked.map((person, index) => {
              const won = winners.some((winner) => winner.id === person.id);

              return (
                <li
                  key={person.id}
                  className={`flex items-center gap-3 rounded-2xl border-2 border-ink p-2.5 ${
                    won ? "bg-gold" : "bg-paper"
                  }`}
                >
                  <span className="display flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink text-sm text-paper">
                    {index + 1}
                  </span>
                  <Avatar name={person.name} photo={person.avatar}
                emoji={person.emoji} size="md" />
                  <span className="display min-w-0 flex-1 truncate text-ink">{person.name}</span>
                  <span className="display shrink-0 text-xl tabular-nums text-ink">
                    {person.total}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </Screen>
    </>
  );
}
