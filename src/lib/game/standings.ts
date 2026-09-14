import { targetScore } from "@/lib/game/rules";

export interface Standing {
  playerId: string;
  total: number;
}

export function rank(standings: readonly Standing[]): Standing[] {
  return [...standings].sort((a, b) => b.total - a.total);
}

export function reachedTarget(standings: readonly Standing[]): boolean {
  return standings.some((entry) => entry.total >= targetScore);
}

export function champions(standings: readonly Standing[]): Standing[] {
  if (!reachedTarget(standings)) {
    return [];
  }

  const best = Math.max(...standings.map((entry) => entry.total));

  return standings.filter((entry) => entry.total === best);
}

export function pointsToGo(total: number): number {
  return Math.max(0, targetScore - total);
}
