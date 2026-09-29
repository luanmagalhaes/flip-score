"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ExitKind, type EntryRow } from "@/types/room";

interface MyRoundsProps {
  entries: EntryRow[];
  busy: boolean;
  error: string | null;
  onEdit: (entry: EntryRow) => void;
  onDelete: (entry: EntryRow) => void;
  onClose: () => void;
}

const exitLabels: Record<ExitKind, string> = {
  STAY: "Parou",
  FREEZE: "Congelou",
  BUST: "Estourou",
};

const exitSkins: Record<ExitKind, string> = {
  STAY: "bg-teal text-paper",
  FREEZE: "bg-freeze text-ink",
  BUST: "bg-flame text-paper",
};

export function MyRounds({ entries, busy, error, onEdit, onDelete, onClose }: MyRoundsProps) {
  const [erasing, setErasing] = useState<EntryRow | null>(null);

  return (
    <>
      {erasing ? (
        <ConfirmModal
          title={`Apagar a rodada ${erasing.round_number}?`}
          tone="danger"
          busy={busy}
          confirmLabel="Apagar"
          cancelLabel="Deixa"
          body={
            <p>
              Você perde os <strong className="text-ink">{erasing.total} pontos</strong> dessa
              rodada e ela some do placar. Dá para lançar de novo depois.
            </p>
          }
          onCancel={() => setErasing(null)}
          onConfirm={() => {
            const target = erasing;

            setErasing(null);
            onDelete(target);
          }}
        />
      ) : null}

      <div className="fixed inset-0 z-[58] flex items-end justify-center bg-ink/75 p-3 sm:items-center">
        <div className="animate-card-pop flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
          <div className="flex shrink-0 items-center gap-3 border-b-2 border-ink/15 bg-cream px-4 py-3">
            <div className="min-w-0 flex-1">
              <span className="display block text-lg leading-tight text-ink">Suas rodadas</span>
              <span className="block text-xs font-semibold text-ink/55">
                Corrija ou apague o que você lançou
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="display shrink-0 cursor-pointer rounded-xl px-2 py-1 text-xs text-ink/50 transition-colors hover:text-ink"
            >
              Fechar
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            {error ? (
              <p
                role="alert"
                className="mb-3 rounded-2xl border-2 border-ink bg-flame-soft px-3 py-2 text-sm font-semibold text-ink"
              >
                {error}
              </p>
            ) : null}
            {entries.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-ink/50">
                Você ainda não lançou nenhuma rodada.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <li key={entry.id} className="rounded-2xl border-2 border-ink bg-cream p-3">
                    <div className="flex items-center gap-3">
                      <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky text-sm text-ink">
                        {entry.round_number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="display block truncate text-sm text-ink">
                          {entry.numbers.length > 0 ? entry.numbers.join(" · ") : "Sem cartas"}
                        </span>
                        <span className="block text-xs font-semibold text-ink/55">
                          {entry.modifiers.length > 0 ? entry.modifiers.join(" ") : "Sem bônus"}
                        </span>
                      </span>
                      <span
                        className={`display shrink-0 rounded-full px-2 py-1 text-[0.6rem] ${exitSkins[entry.exit_kind]}`}
                      >
                        {exitLabels[entry.exit_kind]}
                      </span>
                      <span className="display w-9 shrink-0 text-right text-lg text-ink">
                        {entry.total}
                      </span>
                    </div>

                    <div className="mt-2.5 flex gap-2">
                      <Button
                        variant="paper"
                        fullWidth
                        disabled={busy}
                        onClick={() => onEdit(entry)}
                      >
                        Corrigir
                      </Button>
                      <Button
                        variant="flame"
                        fullWidth
                        disabled={busy}
                        onClick={() => setErasing(entry)}
                      >
                        Apagar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
