"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { roundScore } from "@/lib/game/scoring";
import { pointsToGo } from "@/lib/game/standings";
import { targetScore } from "@/lib/game/rules";
import { rounds as roundLabel } from "@/utils/plural";
import type { Match, Player } from "@/types/game";

interface MatchScreenProps {
  match: Match;
  totals: Record<string, number>;
  ranked: Player[];
  roundNumber: number;
  onNewRound: () => void;
  onUndo: () => void;
  onRules: () => void;
  onQuit: () => void;
}

export function MatchScreen({
  match,
  totals,
  ranked,
  roundNumber,
  onNewRound,
  onUndo,
  onRules,
  onQuit,
}: MatchScreenProps) {
  const played = Math.max(0, roundNumber - 1);
  const leader = ranked[0];
  const best = leader ? (totals[leader.id] ?? 0) : 0;

  return (
    <Screen
      wide
      footer={
        <div className="flex flex-col gap-2">
          <Button variant="flame" size="lg" fullWidth onClick={onNewRound}>
            Lançar a rodada {roundNumber}
          </Button>
          {played > 0 ? (
            <button
              type="button"
              onClick={onUndo}
              className="display cursor-pointer rounded-xl px-3 py-1.5 text-sm text-ink/55 transition-colors hover:text-flame"
            >
              Apagar a última rodada
            </button>
          ) : null}
        </div>
      }
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onQuit}
          className="display cursor-pointer rounded-xl px-2 py-1 text-sm text-ink/55 transition-colors hover:text-ink"
        >
          ← Encerrar
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRules}
            className="display cursor-pointer rounded-full border-2 border-ink bg-paper px-2.5 py-1 text-xs text-ink transition-colors hover:bg-cream"
          >
            regras
          </button>
          <Wordmark size="sm" />
        </div>
      </header>

      <div className="deco-card mb-5 overflow-hidden rounded-3xl border-4 border-ink bg-paper">
        <div className="foil-band animate-foil-slide px-4 py-2 text-center">
          <span className="display text-sm text-ink">
            {played === 0 ? "Nenhuma rodada ainda" : roundLabel(played)} · alvo {targetScore}
          </span>
        </div>

        <ul className="divide-y-2 divide-ink/10">
          {ranked.map((person, index) => {
            const total = totals[person.id] ?? 0;
            const missing = pointsToGo(total);
            const share = Math.min(100, (total / targetScore) * 100);
            const last = match.rounds[person.id]?.at(-1);

            return (
              <li key={person.id} className="flex items-center gap-3 px-3 py-2.5">
                <span
                  className={`display flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${
                    index === 0 && total > 0 ? "bg-gold text-ink" : "bg-ink text-paper"
                  }`}
                >
                  {index + 1}
                </span>

                <Avatar
                  name={person.name}
                  photo={person.photo}
                  size="md"
                  glow={index === 0 && total > 0 && best >= targetScore * 0.75}
                />

                <span className="min-w-0 flex-1">
                  <span className="display block truncate text-sm text-ink sm:text-base">{person.name}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                      <span
                        className="block h-full rounded-full bg-teal transition-[width] duration-500"
                        style={{ width: `${share}%` }}
                      />
                    </span>
                    <span className="shrink-0 text-[0.7rem] font-semibold text-ink/50">
                      {missing === 0 ? "chegou!" : `faltam ${missing}`}
                    </span>
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span
                    key={total}
                    className="display animate-score-bump block text-xl tabular-nums text-ink sm:text-2xl"
                  >
                    {total}
                  </span>
                  {last ? (
                    <span
                      className={`block text-[0.7rem] font-semibold ${
                        last.busted ? "text-flame" : "text-teal"
                      }`}
                    >
                      {last.busted ? "estourou" : `+${roundScore(last)}`}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-center text-xs font-semibold text-ink/50">
        Toque em lançar para marcar o que cada pessoa fez na rodada.
      </p>
    </Screen>
  );
}
