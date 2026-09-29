"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { points } from "@/utils/plural";
import type { EntryRow, PlayerRow } from "@/types/room";

interface WaitingModalProps {
  roundNumber: number;
  mine: EntryRow;
  missing: PlayerRow[];
  onWait: () => void;
  onFix: () => void;
}

export function WaitingModal({ roundNumber, mine, missing, onWait, onFix }: WaitingModalProps) {
  return (
    <div className="fixed inset-0 z-[58] flex items-end justify-center bg-ink/75 p-3 sm:items-center sm:p-4">
      <div className="animate-card-pop flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div className="shrink-0 bg-teal px-5 py-4 text-paper">
          <span className="display block text-xl leading-tight">
            A rodada {roundNumber} ainda não fechou
          </span>
          <span className="mt-1 block text-xs font-semibold opacity-85">
            A sua já está salva com {points(mine.total)}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 text-sm text-ink/75">
          <span className="display block text-xs uppercase tracking-[0.16em] text-ink/50">
            Falta lançar
          </span>
          <ul className="mt-2 flex flex-col gap-1.5">
            {missing.map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-cream px-3 py-2"
              >
                <Avatar name={person.name} photo={person.avatar} emoji={person.emoji} size="sm" />
                <span className="display min-w-0 flex-1 truncate text-ink">{person.name}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3">
            A rodada {roundNumber + 1} abre sozinha assim que todo mundo lançar a {roundNumber}.
            Até lá, não lance a próxima aqui: os pontos novos entrariam no lugar dos que você já
            salvou.
          </p>
        </div>

        <div className="shrink-0 border-t-2 border-ink/10 px-5 pb-5 pt-4">
          <div className="flex flex-col gap-2">
            <Button variant="ink" size="lg" fullWidth onClick={onWait}>
              Beleza, vou esperar
            </Button>
            <button
              type="button"
              onClick={onFix}
              className="display cursor-pointer rounded-xl px-3 py-2 text-sm text-ink/55 transition-colors hover:text-ink"
            >
              Errei a rodada {roundNumber}, quero corrigir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
