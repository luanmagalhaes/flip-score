"use client";

import { useState } from "react";
import { BustSlam } from "@/components/game/BustSlam";
import { FlipSevenBurst } from "@/components/game/FlipSevenBurst";
import { sound } from "@/lib/sound";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { breakdown } from "@/lib/game/scoring";
import { flipSevenCount, modifiers, numberCards, type Modifier } from "@/lib/game/rules";
import { points } from "@/utils/plural";
import { ExitKind, type PlayerRow } from "@/types/room";

export interface SheetEntry {
  numbers: number[];
  modifiers: Modifier[];
  exitKind: ExitKind;
}

interface RoundSheetProps {
  player: PlayerRow;
  roundNumber: number;
  running: number;
  initial?: SheetEntry;
  busy?: boolean;
  error?: string | null;
  onSave: (entry: SheetEntry) => void;
  onBack: () => void;
}

const exits: Array<{ key: ExitKind; label: string; hint: string; skin: string }> = [
  { key: "STAY", label: "Parou", hint: "Guardou os pontos", skin: "bg-teal text-paper" },
  { key: "FREEZE", label: "Congelou", hint: "Levou um freeze", skin: "bg-freeze text-ink" },
  { key: "BUST", label: "Estourou", hint: "Rodada zerada", skin: "bg-flame text-paper" },
];

export function RoundSheet({
  player,
  roundNumber,
  running,
  initial,
  busy = false,
  error = null,
  onSave,
  onBack,
}: RoundSheetProps) {
  const [entry, setEntry] = useState<SheetEntry>(
    initial ?? { numbers: [], modifiers: [], exitKind: "STAY" },
  );
  const [burst, setBurst] = useState(false);
  const [slam, setSlam] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const busted = entry.exitKind === "BUST";
  const detail = breakdown({ ...entry, busted });
  const previous = initial
    ? breakdown({ ...initial, busted: initial.exitKind === "BUST" }).total
    : null;
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

      return { ...current, numbers };
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

      {confirming ? (
        <ConfirmModal
          title={
            previous === null
              ? `Fechar a sua rodada ${roundNumber}?`
              : `Trocar a sua rodada ${roundNumber}?`
          }
          confirmLabel="Isso mesmo, salvar"
          cancelLabel="Deixa eu conferir"
          body={
            <>
              {busted ? (
                <p className="rounded-2xl border-2 border-ink bg-flame px-3 py-2.5 text-center font-semibold text-paper">
                  Vai entrar como estouro: você fica com 0 nesta rodada.
                </p>
              ) : (
                <>
                  <p>
                    Vai entrar{" "}
                    <strong className="text-ink">
                      {detail.total} {detail.total === 1 ? "ponto" : "pontos"}
                    </strong>{" "}
                    para você.
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 rounded-2xl bg-cream px-3 py-2 text-xs">
                    <li>
                      Números:{" "}
                      {entry.numbers.length === 0
                        ? "nenhum"
                        : [...new Set(entry.numbers)].sort((a, b) => a - b).join(", ")}
                    </li>
                    {entry.modifiers.length > 0 ? (
                      <li>Bônus: {entry.modifiers.join(", ")}</li>
                    ) : null}
                    {detail.flipSeven ? <li>Flip 7 fechado</li> : null}
                  </ul>
                </>
              )}
              {previous !== null ? (
                <p className="mt-2 rounded-2xl border-2 border-ink bg-gold/40 px-3 py-2 text-xs font-semibold text-ink">
                  Isso entra no lugar de {points(previous)} que estavam na rodada {roundNumber}.
                </p>
              ) : null}
              <p className="mt-2 text-xs text-ink/60">
                Errou? Dá para corrigir ou apagar esta rodada depois, em Suas rodadas.
              </p>
            </>
          }
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onSave(entry);
          }}
        />
      ) : null}

    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-ink/75 p-3 sm:items-center">
      <div className="animate-card-pop flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div className="shrink-0 border-b-2 border-ink/15 bg-cream px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar name={player.name} photo={player.avatar} emoji={player.emoji} size="md" />
            <div className="min-w-0 flex-1">
              <span className="display block truncate text-lg leading-tight text-ink">
                {player.name}
              </span>
              <span className="block text-xs font-semibold text-ink/55">
                Rodada {roundNumber} · {running} no placar
              </span>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="display shrink-0 cursor-pointer rounded-xl px-2 py-1 text-xs text-ink/50 transition-colors hover:text-ink"
            >
              Voltar
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
                  } ${busted ? "opacity-40" : ""}`}
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
                  } ${busted ? "opacity-40" : ""}`}
                >
                  {value}
                </button>
              );
            })}
          </div>

          <span className="display mt-4 block text-xs uppercase tracking-[0.16em] text-ink/50">
            Como você saiu
          </span>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {exits.map((option) => {
              const on = entry.exitKind === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    if (option.key === "BUST" && entry.exitKind !== "BUST") {
                      sound.bust();
                      setSlam(true);
                    } else {
                      sound.tap();
                    }

                    setEntry((current) => ({ ...current, exitKind: option.key }));
                  }}
                  aria-pressed={on}
                  className={`display rounded-2xl border-2 border-ink px-2 py-2.5 transition-all duration-150 ${
                    on ? `${option.skin} shadow-[0_4px_0_var(--color-ink)]` : "bg-paper text-ink"
                  }`}
                >
                  <span className="block text-sm leading-none">{option.label}</span>
                  <span className="mt-1 block text-[0.6rem] font-semibold opacity-75">
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border-2 border-ink bg-cream p-3">
            {busted ? (
              <p className="text-center text-sm font-semibold text-flame">
                Estourou, então essa rodada vale 0.
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
          {error ? (
            <p
              role="alert"
              className="mb-2 rounded-2xl border-2 border-ink bg-flame-soft px-3 py-2 text-sm font-semibold text-ink"
            >
              Não salvou: {error}
            </p>
          ) : null}
          <Button
            variant="ink"
            size="lg"
            fullWidth
            disabled={busy}
            onClick={() => setConfirming(true)}
          >
            {busy ? "Salvando..." : initial ? "Salvar a correção" : "Salvar minha rodada"}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
