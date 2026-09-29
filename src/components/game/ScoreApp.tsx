"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { HowToPlay } from "@/components/game/HowToPlay";
import { HomeScreen } from "@/components/game/HomeScreen";
import { JoinScreen } from "@/components/game/JoinScreen";
import { HistoryScreen } from "@/components/history/HistoryScreen";
import { LobbyScreen } from "@/components/game/LobbyScreen";
import { MyRounds } from "@/components/game/MyRounds";
import { RemovedScreen } from "@/components/game/RemovedScreen";
import { RoundSheet, type SheetEntry } from "@/components/game/RoundSheet";
import { TableScreen } from "@/components/game/TableScreen";
import { VictoryScreen } from "@/components/game/VictoryScreen";
import { useRoom } from "@/hooks/useRoom";
import { useSession } from "@/hooks/useSession";
import { api } from "@/lib/api";
import { applyMuted, sound, unlockSound } from "@/lib/sound";
import {
  mutedSnapshot,
  rememberMuted,
  rememberTutorialSeen,
  serverMutedSnapshot,
  serverTutorialSnapshot,
  subscribeMatch,
  tutorialSnapshot,
} from "@/lib/storage";
import { RoomPhase, type EntryRow } from "@/types/room";

type View = "HOME" | "CREATE" | "JOIN" | "HISTORY";

interface OpenSheet {
  roundNumber: number;
  entry: EntryRow | null;
}

export function ScoreApp() {
  const { session, seats, save, clear, forget, seatFor } = useSession();
  const [view, setView] = useState<View>("HOME");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [askedRules, setAskedRules] = useState(false);
  const [sheet, setSheet] = useState<OpenSheet | null>(null);
  const [listingMine, setListingMine] = useState(false);

  const tutorialSeen = useSyncExternalStore(
    subscribeMatch,
    tutorialSnapshot,
    serverTutorialSnapshot,
  );
  const quiet = useSyncExternalStore(subscribeMatch, mutedSnapshot, serverMutedSnapshot);
  const { state, refresh } = useRoom(session?.code ?? null, session?.accessToken ?? null);

  useEffect(() => {
    applyMuted(quiet);
  }, [quiet]);

  useEffect(() => {
    const prime = () => unlockSound();

    window.addEventListener("pointerdown", prime, { once: true });

    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = window.setTimeout(() => setError(null), 4000);

    return () => window.clearTimeout(timer);
  }, [error]);

  const run = useCallback(async (work: () => Promise<void>) => {
    setBusy(true);
    setError(null);

    try {
      await work();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não consegui completar isso.");
    } finally {
      setBusy(false);
    }
  }, []);

  const leave = () =>
    run(async () => {
      if (session) {
        await api.leave(session.code, session.accessToken).catch(() => null);
        forget(session.code);
      }

      clear();
      setView("HOME");
    });

  const showRules = askedRules || !tutorialSeen;
  const rulesGate = showRules ? (
    <HowToPlay
      onClose={() => {
        rememberTutorialSeen();
        setAskedRules(false);
      }}
    />
  ) : null;

  if (!session) {
    if (view === "HISTORY") {
      return <HistoryScreen onBack={() => setView("HOME")} />;
    }

    if (view === "CREATE" || view === "JOIN") {
      return (
        <>
          {rulesGate}
          <JoinScreen
            mode={view}
            busy={busy}
            error={error}
            onBack={() => setView("HOME")}
            onSubmit={(input) =>
              run(async () => {
                if (view === "JOIN") {
                  const known = seatFor(input.code, input.name);

                  if (known) {
                    save({
                      code: known.code,
                      playerId: known.playerId,
                      accessToken: known.accessToken,
                      name: known.name,
                    });
                    setView("HOME");

                    return;
                  }
                }

                const result =
                  view === "CREATE"
                    ? await api.createRoom(input.name, input.emoji)
                    : await api.joinRoom(input.code, input.name, input.emoji);

                save(result);
                setView("HOME");
              })
            }
          />
        </>
      );
    }

    return (
      <>
        {rulesGate}
        <HomeScreen
          seats={seats}
          onResume={(seat) =>
            save({
              code: seat.code,
              playerId: seat.playerId,
              accessToken: seat.accessToken,
              name: seat.name,
            })
          }
          onForget={forget}
          onCreate={() => setView("CREATE")}
          onJoin={() => setView("JOIN")}
          onRules={() => setAskedRules(true)}
          onHistory={() => setView("HISTORY")}
        />
      </>
    );
  }

  if (!state || state.room.code.toUpperCase() !== session.code.toUpperCase()) {
    return (
      <div className="stage-cream flex min-h-dvh items-center justify-center px-8">
        <p className="display text-lg text-ink/70">Entrando na sala...</p>
      </div>
    );
  }

  const me = state.players.find((person) => person.id === state.meId) ?? null;
  const myEntries = state.entries.filter((entry) => entry.player_id === state.meId);
  const isHost = state.room.host_player_id !== null && state.room.host_player_id === state.meId;
  const removePlayer = (playerId: string) =>
    run(async () => {
      await api.removePlayer(session.code, session.accessToken, playerId);
      await refresh();
    });

  if (!me && state.room.phase !== RoomPhase.Finished) {
    return (
      <RemovedScreen
        room={state.room}
        onHome={() => {
          forget(session.code);
          clear();
          setView("HOME");
        }}
      />
    );
  }

  if (state.room.phase === RoomPhase.Finished) {
    const best = [...state.players].sort((left, right) => right.total - left.total);
    const top = best[0]?.total ?? 0;

    return (
      <VictoryScreen
        winners={best.filter((person) => person.total === top)}
        ranked={best}
        playedRounds={state.room.round_number}
        onNewTable={leave}
      />
    );
  }

  if (state.room.phase === RoomPhase.Lobby) {
    return (
      <>
        {rulesGate}
        <LobbyScreen
          room={state.room}
          players={state.players}
          meId={state.meId}
          isHost={isHost}
          busy={busy}
          error={error}
          onStart={() => run(() => api.start(session.code, session.accessToken).then(() => refresh()))}
          onLeave={leave}
          onRemovePlayer={removePlayer}
          onEmoji={(emoji) =>
            run(async () => {
              await api.setEmoji(session.code, session.accessToken, emoji);
              await refresh();
            })
          }
          onPhoto={(blob) =>
            run(async () => {
              await api.sendAvatar(session.code, session.accessToken, blob);
              await refresh();
            })
          }
        />
      </>
    );
  }

  const editing = sheet?.entry ?? null;

  return (
    <>
      {rulesGate}

      {listingMine ? (
        <MyRounds
          entries={myEntries}
          busy={busy}
          error={error}
          onEdit={(entry) => {
            setListingMine(false);
            setSheet({ roundNumber: entry.round_number, entry });
          }}
          onDelete={(entry) =>
            run(async () => {
              await api.removeEntry(session.code, session.accessToken, entry.id);
              await refresh();
            })
          }
          onClose={() => setListingMine(false)}
        />
      ) : null}

      {sheet && me ? (
        <RoundSheet
          key={`${sheet.roundNumber}-${editing?.id ?? "new"}`}
          player={me}
          roundNumber={sheet.roundNumber}
          running={me.total - (editing?.total ?? 0)}
          busy={busy}
          error={error}
          initial={
            editing
              ? {
                  numbers: editing.numbers,
                  modifiers: editing.modifiers,
                  exitKind: editing.exit_kind,
                }
              : undefined
          }
          onBack={() => setSheet(null)}
          onSave={(entry: SheetEntry) =>
            run(async () => {
              await api.saveEntry(session.code, session.accessToken, {
                roundNumber: sheet.roundNumber,
                replacing: editing !== null,
                numbers: entry.numbers,
                modifiers: entry.modifiers,
                exitKind: entry.exitKind,
              });
              sound.saved();
              setSheet(null);
              await refresh();
            })
          }
        />
      ) : null}

      <TableScreen
        room={state.room}
        players={state.players}
        entries={state.entries}
        meId={state.meId}
        isHost={isHost}
        busy={busy}
        error={error}
        quiet={quiet}
        onQuiet={(next) => rememberMuted(next)}
        onNewRound={() => setSheet({ roundNumber: state.room.round_number, entry: null })}
        onFixRound={(entry) => setSheet({ roundNumber: entry.round_number, entry })}
        onRemovePlayer={removePlayer}
        onOpenMine={() => setListingMine(true)}
        onRules={() => setAskedRules(true)}
        onLeave={leave}
      />
    </>
  );
}
