"use client";

import { useState } from "react";
import { InviteModal } from "@/components/game/InviteModal";
import { WaitingModal } from "@/components/game/WaitingModal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Screen } from "@/components/ui/Screen";
import { Wordmark } from "@/components/ui/Wordmark";
import { maxPlayers } from "@/lib/game/limits";
import { missingLaunch, requiredPlayers } from "@/lib/game/round";
import { targetScore } from "@/lib/game/rules";
import { joinNames, points, rounds } from "@/utils/plural";
import { ExitKind, type EntryRow, type PlayerRow, type RoomRow } from "@/types/room";

interface TableScreenProps {
  room: RoomRow;
  players: PlayerRow[];
  entries: EntryRow[];
  meId: string | null;
  isHost: boolean;
  busy: boolean;
  error: string | null;
  quiet: boolean;
  onQuiet: (next: boolean) => void;
  onNewRound: () => void;
  onFixRound: (entry: EntryRow) => void;
  onOpenMine: () => void;
  onRemovePlayer: (playerId: string) => void;
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
  isHost,
  busy,
  error,
  quiet,
  onQuiet,
  onNewRound,
  onFixRound,
  onOpenMine,
  onRemovePlayer,
  onRules,
  onLeave,
}: TableScreenProps) {
  const [askingFixFor, setAskingFixFor] = useState<number | null>(null);
  const [confirmingRemoval, setConfirmingRemoval] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const ranked = [...players].sort((left, right) => right.total - left.total);
  const thisRound = entries.filter((entry) => entry.round_number === room.round_number);
  const mineThisRound = thisRound.find((entry) => entry.player_id === meId) ?? null;
  const me = players.find((person) => person.id === meId) ?? null;
  const meJoinsLater = me !== null && me.joined_round > room.round_number;
  const waiting = missingLaunch(
    requiredPlayers(players, room.round_number),
    entries,
    room.round_number,
  );
  const othersWaiting = waiting.filter((person) => person.id !== meId);
  const someoneLaunched = thisRound.length > 0;
  const myEntries = entries.filter((entry) => entry.player_id === meId);
  const pendingRemoval = players.find((person) => person.id === confirmingRemoval) ?? null;
  const removalLaunches = pendingRemoval
    ? entries.filter((entry) => entry.player_id === pendingRemoval.id).length
    : 0;
  const removalUnblocks =
    pendingRemoval !== null &&
    waiting.length === 1 &&
    waiting[0].id === pendingRemoval.id;
  const showWaiting =
    askingFixFor === room.round_number && mineThisRound !== null && othersWaiting.length > 0;

  const askToFix = () => {
    if (!mineThisRound) {
      return;
    }

    if (othersWaiting.length > 0) {
      setAskingFixFor(room.round_number);

      return;
    }

    onFixRound(mineThisRound);
  };

  const footer = meJoinsLater ? (
    <div className="flex flex-col gap-2">
      <div className="rounded-2xl border-2 border-ink bg-cream px-3 py-2.5 text-center">
        <span className="display block text-sm text-ink">
          Você entra na rodada {me.joined_round}
        </span>
        <span className="block text-xs font-semibold text-ink/55">
          A rodada {room.round_number} já estava rolando quando você sentou. Acompanhe o placar.
        </span>
      </div>
    </div>
  ) : !mineThisRound ? (
    <div className="flex flex-col gap-2">
      <Button variant="ink" size="lg" fullWidth disabled={busy} onClick={onNewRound}>
        Lançar minha rodada {room.round_number}
      </Button>
      <p className="text-center text-xs font-semibold text-ink/55">
        {othersWaiting.length === 0
          ? "Só falta você lançar"
          : `Falta lançar: você e ${joinNames(othersWaiting.map((person) => person.name))}`}
      </p>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-cream px-3 py-2.5">
        {othersWaiting.length > 0 ? (
          <span className="flex shrink-0 -space-x-3">
            {othersWaiting.slice(0, 3).map((person) => (
              <Avatar
                key={person.id}
                name={person.name}
                photo={person.avatar}
                emoji={person.emoji}
                size="sm"
                className="ring-2 ring-cream"
              />
            ))}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="display block text-sm text-ink">
            {othersWaiting.length > 0
              ? `Esperando ${joinNames(othersWaiting.map((person) => person.name))}`
              : "Todo mundo lançou"}
          </span>
          <span className="block text-xs font-semibold text-ink/55">
            {othersWaiting.length > 0
              ? `Sua rodada ${room.round_number} está salva. A ${room.round_number + 1} abre quando todo mundo lançar.`
              : "A rodada vira em instantes."}
          </span>
        </span>
      </div>
      <Button variant="paper" fullWidth disabled={busy} onClick={askToFix}>
        Corrigir minha rodada {room.round_number}
      </Button>
    </div>
  );

  return (
    <Screen wide footer={footer}>
      {showWaiting && mineThisRound ? (
        <WaitingModal
          roundNumber={room.round_number}
          mine={mineThisRound}
          missing={othersWaiting}
          onWait={() => setAskingFixFor(null)}
          onFix={() => {
            setAskingFixFor(null);
            onFixRound(mineThisRound);
          }}
        />
      ) : null}

      {inviting ? (
        <InviteModal
          code={room.code}
          roundNumber={someoneLaunched ? room.round_number + 1 : room.round_number}
          onClose={() => setInviting(false)}
        />
      ) : null}

      {pendingRemoval ? (
        <ConfirmModal
          title={`Tirar ${pendingRemoval.name} da mesa?`}
          tone="danger"
          busy={busy}
          confirmLabel="Tirar da mesa"
          cancelLabel="Deixa quieto"
          body={
            <>
              <p>
                <strong className="text-ink">{pendingRemoval.name}</strong> sai da partida na hora.
                Se for engano, dá para voltar com o código {room.code}, começando do zero.
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-xs">
                <li className="rounded-xl bg-sky/50 px-3 py-2">
                  {removalLaunches === 0
                    ? "Ainda não tinha lançado nenhuma rodada"
                    : `${rounds(removalLaunches)} e ${points(pendingRemoval.total)} saem do placar`}
                </li>
                {removalUnblocks ? (
                  <li className="rounded-xl bg-gold/40 px-3 py-2 font-semibold text-ink">
                    Só faltava essa pessoa, então a rodada {room.round_number} fecha na hora
                  </li>
                ) : null}
              </ul>
            </>
          }
          onCancel={() => setConfirmingRemoval(null)}
          onConfirm={() => {
            onRemovePlayer(pendingRemoval.id);
            setConfirmingRemoval(null);
          }}
        />
      ) : null}

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
              const joinsLater = person.joined_round > room.round_number;

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

                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`display rounded-full px-2 py-1 text-[0.6rem] ${
                        entry
                          ? exitSkins[entry.exit_kind]
                          : joinsLater
                            ? "bg-sky text-ink"
                            : someoneLaunched
                              ? "bg-flame-soft text-ink"
                              : "bg-ink/10 text-ink/55"
                      }`}
                    >
                      {entry
                        ? `${exitLabels[entry.exit_kind]} ${entry.total}`
                        : joinsLater
                          ? `Entra na rodada ${person.joined_round}`
                          : someoneLaunched
                            ? "Falta lançar"
                            : "Jogando"}
                    </span>
                    {isHost && person.id !== meId ? (
                      <button
                        type="button"
                        onClick={() => setConfirmingRemoval(person.id)}
                        disabled={busy}
                        aria-label={`Tirar ${person.name} da mesa`}
                        className="display cursor-pointer rounded-lg px-2 py-0.5 text-[0.65rem] text-ink/40 transition-colors hover:bg-flame hover:text-paper disabled:cursor-not-allowed"
                      >
                        Tirar
                      </button>
                    ) : null}
                  </span>
                </li>
              );
            })}

            {players.length < maxPlayers ? (
              <li>
                <button
                  type="button"
                  onClick={() => setInviting(true)}
                  className="display w-full cursor-pointer rounded-2xl border-2 border-dashed border-ink/30 p-3 text-sm text-ink/50 transition-colors hover:border-ink hover:text-ink"
                >
                  + Chamar mais alguém
                </button>
              </li>
            ) : null}
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
