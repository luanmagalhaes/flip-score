"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { targetScore } from "@/lib/game/rules";
import { ExitKind, type EntryRow, type PlayerRow, type RoomRow } from "@/types/room";

interface TableScreenProps {
  room: RoomRow;
  players: PlayerRow[];
  entries: EntryRow[];
  meId: string | null;
  busy: boolean;
  error: string | null;
  quiet: boolean;
  onQuiet: (next: boolean) => void;
  onNewRound: () => void;
  onOpenMine: () => void;
  onRules: () => void;
  onLeave: () => void;
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

export function TableScreen({
  room,
  players,
  entries,
  meId,
  busy,
  error,
  quiet,
  onQuiet,
  onNewRound,
  onOpenMine,
  onRules,
  onLeave,
}: TableScreenProps) {
  const ranked = [...players].sort((left, right) => right.total - left.total);
  const thisRound = entries.filter((entry) => entry.round_number === room.round_number);
  const done = new Set(thisRound.map((entry) => entry.player_id));
  const mineThisRound = thisRound.find((entry) => entry.player_id === meId) ?? null;
  const waiting = players.filter((person) => !done.has(person.id));
  const myEntries = entries.filter((entry) => entry.player_id === meId);

  return (
    <Screen
      wide
      footer={
        <div className="flex flex-col gap-2">
          <Button variant="ink" size="lg" fullWidth disabled={busy} onClick={onNewRound}>
            {mineThisRound
              ? `Refazer a rodada ${room.round_number}`
              : `Lançar minha rodada ${room.round_number}`}
          </Button>
          {waiting.length > 0 ? (
            <p className="text-center text-xs font-semibold text-ink/55">
              {waiting.length === 1
                ? `Falta ${waiting[0].name} lançar`
                : `Faltam ${waiting.length} pessoas lançarem`}
            </p>
          ) : (
            <p className="text-center text-xs font-semibold text-ink/55">
              Todo mundo lançou. A rodada vira em instantes.
            </p>
          )}
        </div>
      }
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onLeave}
          className="display cursor-pointer rounded-xl px-2 py-1 text-sm text-ink/55 transition-colors hover:text-ink"
        >
          ← Sair
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onQuiet(!quiet)}
            className="display cursor-pointer rounded-full border-2 border-ink bg-paper px-2.5 py-1 text-xs text-ink transition-colors hover:bg-sky"
          >
            {quiet ? "Som off" : "Som on"}
          </button>
          <button
            type="button"
            onClick={onRules}
            className="display cursor-pointer rounded-full border-2 border-ink bg-paper px-2.5 py-1 text-xs text-ink transition-colors hover:bg-sky"
          >
            Regras
          </button>
          <Wordmark size="sm" className="hidden opacity-45 sm:inline-block" />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="display text-xl text-ink">Placar</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Rodada {room.round_number} · Alvo {targetScore}
            </span>
          </div>

          <ul className="flex flex-col gap-2">
            {ranked.map((person, index) => {
              const progress = Math.min(100, (person.total / targetScore) * 100);
              const entry = thisRound.find((row) => row.player_id === person.id) ?? null;

              return (
                <li
                  key={person.id}
                  className={`flex items-center gap-3 rounded-2xl border-2 border-ink p-3 ${
                    person.id === meId ? "bg-gold/30" : "bg-paper"
                  }`}
                >
                  <span className="display flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink text-xs text-paper">
                    {index + 1}
                  </span>
                  <Avatar name={person.name} photo={person.avatar} emoji={person.emoji} size="md" />

                  <span className="min-w-0 flex-1">
                    <span className="display flex items-center gap-1.5 truncate text-lg text-ink sm:text-xl">
                      <span className="truncate">{person.name}</span>
                      {person.id === meId ? (
                        <span className="display shrink-0 rounded-full bg-ink px-2 py-0.5 text-[0.55rem] text-paper">
                          VOCÊ
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink/12">
                        <span
                          className="block h-full rounded-full bg-teal transition-[width] duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </span>
                      <span className="display shrink-0 text-sm text-ink">{person.total}</span>
                    </span>
                  </span>

                  <span
                    className={`display shrink-0 rounded-full px-2 py-1 text-[0.6rem] ${
                      entry ? exitSkins[entry.exit_kind] : "bg-ink/10 text-ink/55"
                    }`}
                  >
                    {entry ? `${exitLabels[entry.exit_kind]} ${entry.total}` : "Jogando"}
                  </span>
                </li>
              );
            })}
          </ul>

          {error ? (
            <p className="mt-3 rounded-2xl border-2 border-ink bg-flame-soft p-3 text-sm font-semibold text-ink">
              {error}
            </p>
          ) : null}
        </section>

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="display text-xl text-ink">Suas rodadas</h2>
            <button
              type="button"
              onClick={onOpenMine}
              className="display cursor-pointer text-xs uppercase tracking-[0.14em] text-ink/55 underline-offset-2 hover:underline"
            >
              Corrigir
            </button>
          </div>

          {myEntries.length === 0 ? (
            <p className="rounded-2xl border-2 border-dashed border-ink/30 p-5 text-center text-sm font-semibold text-ink/50">
              Você ainda não lançou nenhuma rodada.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {myEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-paper p-3"
                >
                  <span className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky text-sm text-ink">
                    {entry.round_number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display block text-sm text-ink">
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
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Screen>
  );
}
