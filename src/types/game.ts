import type { Modifier } from "@/lib/game/rules";

export interface Player {
  id: string;
  name: string;
  photo: string | null;
  createdAt: number;
}

export interface RoundEntry {
  numbers: number[];
  modifiers: Modifier[];
  busted: boolean;
}

export interface Match {
  id: string;
  players: Player[];
  rounds: Record<string, RoundEntry[]>;
  startedAt: number;
  finishedAt: number | null;
  winnerIds: string[];
}
