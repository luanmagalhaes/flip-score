import type { Modifier } from "@/lib/game/rules";

export const RoomPhase = {
  Lobby: "LOBBY",
  Playing: "PLAYING",
  Finished: "FINISHED",
} as const;

export type RoomPhase = (typeof RoomPhase)[keyof typeof RoomPhase];

export const ExitKind = {
  Stay: "STAY",
  Freeze: "FREEZE",
  Bust: "BUST",
} as const;

export type ExitKind = (typeof ExitKind)[keyof typeof ExitKind];

export interface RoomRow {
  id: string;
  code: string;
  phase: RoomPhase;
  target_score: number;
  round_number: number;
  is_test: boolean;
  host_player_id: string | null;
  winner_player_id: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface PlayerRow {
  id: string;
  room_id: string;
  name: string;
  avatar: string | null;
  emoji: string | null;
  seat: number;
  total: number;
  created_at: string;
}

export interface EntryRow {
  id: string;
  player_id: string;
  round_number: number;
  numbers: number[];
  modifiers: Modifier[];
  exit_kind: ExitKind;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface RoomState {
  room: RoomRow;
  players: PlayerRow[];
  entries: EntryRow[];
  meId: string | null;
}
