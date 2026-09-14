"use client";

import { useState } from "react";
import { BustSlam } from "@/components/game/BustSlam";
import { FlipSevenBurst } from "@/components/game/FlipSevenBurst";
import { sound } from "@/lib/sound";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { breakdown, emptyRound } from "@/lib/game/scoring";
import { flipSevenCount, modifiers, numberCards, type Modifier } from "@/lib/game/rules";
import { points } from "@/utils/plural";
import type { Player, RoundEntry } from "@/types/game";

interface RoundSheetProps {
  player: Player;
  position: number;
  total: number;
  running: number;
  onSave: (entry: RoundEntry) => void;
  onBack: () => void;
}

export function RoundSheet({
  player,
  position,
  total,
  running,
  onSave,
  onBack,
}: RoundSheetProps) {
  const [entry, setEntry] = useState<RoundEntry>(emptyRound());
  const [burst, setBurst] = useState(false);
  const [slam, setSlam] = useState(false);
  const detail = breakdown(entry);
  const picked = new Set(entry.numbers);

  const toggleNumber = (value: number) => {
    setEntry((current) => {
      const had = current.numbers.includes(value);
      const numbers = had
        ? current.numbers.filter((kept) => kept !== value)
        : [...current.numbers, value];

      if (!had && numbers.length === flipSevenCount) {
        sound.flipSeven();
        setBurst(true);
      } else if (!had) {
        sound.pick();
      }

      return { ...current, busted: false, numbers };
    });
  };

  const toggleModifier = (value: Modifier) => {
    sound.tap();

    setEntry((current) => ({
      ...current,
      modifiers: current.modifiers.includes(value)
        ? current.modifiers.filter((kept) => kept !== value)
        : [...current.modifiers, value],
    }));
  };

  return (
    <>
      {burst ? <FlipSevenBurst onDone={() => setBurst(false)} /> : null}
      {slam ? <BustSlam player={player} onDone={() => setSlam(false)} /> : null}

    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-ink/75 p-3 sm:items-center">
      <div className="animate-card-pop flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div className="shrink-0 border-b-2 border-ink/15 bg-cream px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar name={player.name} photo={player.photo} size="md" />
            <div className="min-w-0 flex-1">
              <span className="display block truncate text-lg leading-tight text-ink">
                {player.name}
              </span>
              <span className="block text-xs font-semibold text-ink/55">
                {position}ª pessoa · {total} no placar
              </span>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="display shrink-0 cursor-pointer rounded-xl px-2 py-1 text-xs text-ink/50 transition-colors hover:text-ink"
            >
              voltar
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <span className="display block text-xs uppercase tracking-[0.16em] text-ink/50">
            Números que virou
          </span>
          <div className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-7">
            {numberCards().map((value) => {
              const on = picked.has(value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleNumber(value)}
                  aria-pressed={on}
                  className={`display h-12 rounded-xl border-2 border-ink text-base transition-all duration-100 ${
                    on
                      ? "bg-teal text-paper shadow-[0_3px_0_var(--color-ink)]"
                      : "bg-paper text-ink hover:bg-cream"
                  } ${entry.busted ? "opacity-40" : ""}`}
                >
                  {value}
                </button>
              );
            })}
          </div>

          <span className="display mt-4 block text-xs uppercase tracking-[0.16em] text-ink/50">
            Cartas de bônus
          </span>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {modifiers.map((value) => {
              const on = entry.modifiers.includes(value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleModifier(value)}
                  aria-pressed={on}
                  className={`display h-11 rounded-xl border-2 border-ink text-sm transition-all duration-100 ${
                    on
                      ? "bg-gold text-ink shadow-[0_3px_0_var(--color-ink)]"
                      : "bg-paper text-ink hover:bg-cream"
                  } ${entry.busted ? "opacity-40" : ""}`}
                >
                  {value}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              setEntry((current) => {
                const busted = !current.busted;

                if (busted) {
                  sound.bust();
                  setSlam(true);
                }

                return { ...current, busted };
              })
            }
            aria-pressed={entry.busted}
            className={`display mt-4 w-full rounded-2xl border-2 border-ink py-3 text-base transition-all duration-150 ${
              entry.busted
                ? "bg-flame text-paper shadow-[0_4px_0_var(--color-ink)]"
                : "bg-paper text-ink hover:bg-flame-soft"
            }`}
          >
            {entry.busted ? "Estourou · rodada zerada" : "Estourou?"}
          </button>

          <div className="mt-4 rounded-2xl border-2 border-ink bg-cream p-3">
            {entry.busted ? (
              <p className="text-center text-sm font-semibold text-flame">
                Repetiu um número, então essa rodada vale 0.
              </p>
            ) : (
              <div className="flex flex-col gap-1 text-xs font-semibold text-ink/70">
                <span className="flex justify-between">
                  <span>Soma dos números</span>
                  <span className="tabular-nums">{detail.sum}</span>
                </span>
                {detail.multiplier > 1 ? (
                  <span className="flex justify-between">
                    <span>Dobrado pelo x2</span>
                    <span className="tabular-nums">{detail.multiplied}</span>
                  </span>
                ) : null}
                {detail.bonus > 0 ? (
                  <span className="flex justify-between">
                    <span>
                      Bônus{detail.flipSeven ? ` · Flip ${flipSevenCount} fechado` : ""}
                    </span>
                    <span className="tabular-nums">+{detail.bonus}</span>
                  </span>
                ) : null}
              </div>
            )}

            <div className="mt-2 flex items-baseline justify-between border-t-2 border-ink/15 pt-2">
              <span className="display text-sm text-ink">Rodada</span>
              <span
                key={detail.total}
                className="display animate-score-bump text-3xl tabular-nums text-flame"
              >
                {detail.total}
              </span>
            </div>
            <p className="mt-1 text-right text-[0.7rem] font-semibold text-ink/50">
              fica com {points(running + detail.total)}
            </p>
          </div>
        </div>

        <div className="shrink-0 border-t-2 border-ink/15 px-4 pb-4 pt-3">
          <Button
            variant="ink"
            size="lg"
            fullWidth
            onClick={() => {
              sound.saved();
              onSave(entry);
            }}
          >
            Salvar e ir para o próximo
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
