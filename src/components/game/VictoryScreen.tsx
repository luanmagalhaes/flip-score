"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/game/Confetti";
import { useEffect } from "react";
import { sound } from "@/lib/sound";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { points, rounds as roundLabel } from "@/utils/plural";
import type { Player } from "@/types/game";

interface VictoryScreenProps {
  winners: Player[];
  ranked: Player[];
  totals: Record<string, number>;
  playedRounds: number;
  onRematch: () => void;
  onNewTable: () => void;
}

export function VictoryScreen({
  winners,
  ranked,
  totals,
  playedRounds,
  onRematch,
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
          <div className="flex flex-col gap-2">
            <Button variant="flame" size="lg" fullWidth onClick={onRematch}>
              Jogar de novo com a mesma mesa
            </Button>
            <Button variant="paper" fullWidth onClick={onNewTable}>
              Montar outra mesa
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Wordmark size="sm" />

          <div className="animate-crown-drop relative">
            <Avatar
              name={champion?.name ?? "Campeã"}
              photo={champion?.photo ?? null}
              size="xl"
              glow
            />
            <span className="display absolute -right-3 -top-3 rotate-12 rounded-2xl border-4 border-ink bg-gold px-3 py-1 text-xl text-ink shadow-[0_5px_0_var(--color-ink)]">
              {totals[champion?.id ?? ""] ?? 0}
            </span>
          </div>

          <h1 className="display text-3xl leading-tight text-balance text-ink sm:text-4xl">
            {tie
              ? `Empate: ${winners.map((person) => person.name).join(" e ")}`
              : `${champion?.name ?? "Alguém"} venceu!`}
          </h1>

          <p className="max-w-[30ch] text-sm font-semibold text-ink/65">
            {tie
              ? `Terminaram com ${points(totals[champion?.id ?? ""] ?? 0)} cada em ${roundLabel(playedRounds)}.`
              : `Chegou com ${points(totals[champion?.id ?? ""] ?? 0)} em ${roundLabel(playedRounds)}.`}
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
                  <Avatar name={person.name} photo={person.photo} size="md" />
                  <span className="display min-w-0 flex-1 truncate text-ink">{person.name}</span>
                  <span className="display shrink-0 text-xl tabular-nums text-ink">
                    {totals[person.id] ?? 0}
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
