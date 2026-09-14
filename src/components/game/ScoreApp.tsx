"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { HowToPlay } from "@/components/game/HowToPlay";
import { MatchScreen } from "@/components/game/MatchScreen";
import { RoundSheet } from "@/components/game/RoundSheet";
import { SetupScreen } from "@/components/game/SetupScreen";
import { VictoryScreen } from "@/components/game/VictoryScreen";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { totalFor } from "@/lib/game/scoring";
import { applyMuted, unlockSound } from "@/lib/sound";
import { champions, rank } from "@/lib/game/standings";
import {
  clearMatch,
  matchSnapshot,
  rememberTutorialSeen,
  saveMatch,
  serverMatchSnapshot,
  mutedSnapshot,
  rememberMuted,
  serverMutedSnapshot,
  serverTutorialSnapshot,
  subscribeMatch,
  tutorialSnapshot,
} from "@/lib/storage";
import type { Match, Player, RoundEntry } from "@/types/game";

function freshId(): string {
  return crypto.randomUUID();
}

export function ScoreApp() {
  const match = useSyncExternalStore(subscribeMatch, matchSnapshot, serverMatchSnapshot);
  const tutorialSeen = useSyncExternalStore(
    subscribeMatch,
    tutorialSnapshot,
    serverTutorialSnapshot,
  );
  const [draft, setDraft] = useState<Player[]>([]);
  const [askedRules, setAskedRules] = useState(false);
  const [lane, setLane] = useState<Player[] | null>(null);
  const [collected, setCollected] = useState<Record<string, RoundEntry>>({});
  const [confirmingQuit, setConfirmingQuit] = useState(false);
  const quiet = useSyncExternalStore(subscribeMatch, mutedSnapshot, serverMutedSnapshot);

  useEffect(() => {
    applyMuted(quiet);
  }, [quiet]);

  useEffect(() => {
    const prime = () => unlockSound();

    window.addEventListener("pointerdown", prime, { once: true });

    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  const showRules = askedRules || !tutorialSeen;
  const rulesGate = showRules ? (
    <HowToPlay
      onClose={() => {
        setAskedRules(false);
        rememberTutorialSeen();
      }}
    />
  ) : null;

  const roster = match?.players ?? draft;
  const totals: Record<string, number> = {};

  for (const person of roster) {
    totals[person.id] = totalFor(match?.rounds[person.id] ?? []);
  }

  const standings = roster.map((person) => ({ playerId: person.id, total: totals[person.id] ?? 0 }));
  const winnerIds = champions(standings).map((entry) => entry.playerId);
  const ranked = rank(standings)
    .map((entry) => roster.find((person) => person.id === entry.playerId))
    .filter((person): person is Player => Boolean(person));

  const playedRounds = match ? Math.max(...roster.map((p) => match.rounds[p.id]?.length ?? 0), 0) : 0;

  if (match && winnerIds.length > 0) {
    const winners = roster.filter((person) => winnerIds.includes(person.id));

    return (
      <>
        {rulesGate}
        <VictoryScreen
          winners={winners}
          ranked={ranked}
          totals={totals}
          playedRounds={playedRounds}
          onRematch={() => {
            saveMatch({
              id: freshId(),
              players: match.players,
              rounds: Object.fromEntries(match.players.map((person) => [person.id, []])),
              startedAt: Date.now(),
              finishedAt: null,
              winnerIds: [],
            });
          }}
          onNewTable={() => {
            setDraft([]);
            clearMatch();
          }}
        />
      </>
    );
  }

  if (!match) {
    return (
      <>
        {rulesGate}
        <SetupScreen
          roster={draft}
          onAdd={(name, photo) =>
            setDraft((current) => [
              ...current,
              { id: freshId(), name, photo, createdAt: Date.now() },
            ])
          }
          onRemove={(playerId) =>
            setDraft((current) => current.filter((person) => person.id !== playerId))
          }
          onStart={() =>
            saveMatch({
              id: freshId(),
              players: draft,
              rounds: Object.fromEntries(draft.map((person) => [person.id, []])),
              startedAt: Date.now(),
              finishedAt: null,
              winnerIds: [],
            })
          }
          onRules={() => setAskedRules(true)}
          quiet={quiet}
          onQuiet={(next) => rememberMuted(next)}
        />
      </>
    );
  }

  const saveRound = (entries: Record<string, RoundEntry>) => {
    const next: Match = {
      ...match,
      rounds: Object.fromEntries(
        match.players.map((person) => [
          person.id,
          [...(match.rounds[person.id] ?? []), entries[person.id]],
        ]),
      ),
    };

    saveMatch(next);
  };

  const current = lane?.[0] ?? null;

  return (
    <>
      {rulesGate}

      {current ? (
        <RoundSheet
          key={current.id}
          player={current}
          position={match.players.findIndex((person) => person.id === current.id) + 1}
          total={totals[current.id] ?? 0}
          running={totals[current.id] ?? 0}
          onBack={() => {
            setLane(null);
            setCollected({});
          }}
          onSave={(entry) => {
            const gathered = { ...collected, [current.id]: entry };
            const rest = lane?.slice(1) ?? [];

            if (rest.length === 0) {
              saveRound(gathered);
              setLane(null);
              setCollected({});

              return;
            }

            setCollected(gathered);
            setLane(rest);
          }}
        />
      ) : null}

      <MatchScreen
        match={match}
        totals={totals}
        ranked={ranked}
        roundNumber={playedRounds + 1}
        onNewRound={() => {
          setCollected({});
          setLane([...match.players]);
        }}
        onUndo={() =>
          saveMatch({
            ...match,
            rounds: Object.fromEntries(
              match.players.map((person) => [
                person.id,
                (match.rounds[person.id] ?? []).slice(0, -1),
              ]),
            ),
          })
        }
        onRules={() => setAskedRules(true)}
        quiet={quiet}
        onQuiet={(next) => rememberMuted(next)}
        onQuit={() => setConfirmingQuit(true)}
      />

      {confirmingQuit ? (
        <ConfirmModal
          title="Encerrar esta partida?"
          tone="danger"
          confirmLabel="Encerrar e apagar"
          cancelLabel="Continuar jogando"
          body={
            <>
              <p>O placar desta mesa some e você volta para a montagem.</p>
              <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-xs">
                As fotos também saem deste aparelho.
              </p>
            </>
          }
          onCancel={() => setConfirmingQuit(false)}
          onConfirm={() => {
            setConfirmingQuit(false);
            setDraft([]);
            clearMatch();
          }}
        />
      ) : null}
    </>
  );
}
