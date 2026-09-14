import { flipSevenBonus, flipSevenCount, modifiers, type Modifier } from "@/lib/game/rules";

export interface RoundEntry {
  numbers: number[];
  modifiers: Modifier[];
  busted: boolean;
}

export interface RoundBreakdown {
  sum: number;
  multiplier: number;
  multiplied: number;
  bonus: number;
  flipSeven: boolean;
  total: number;
}

export function emptyRound(): RoundEntry {
  return { numbers: [], modifiers: [], busted: false };
}

export function isModifier(value: string): value is Modifier {
  return (modifiers as readonly string[]).includes(value);
}

export function breakdown(entry: RoundEntry): RoundBreakdown {
  if (entry.busted) {
    return { sum: 0, multiplier: 1, multiplied: 0, bonus: 0, flipSeven: false, total: 0 };
  }

  const unique = [...new Set(entry.numbers)];
  const sum = unique.reduce((running, value) => running + value, 0);
  const multiplier = entry.modifiers.includes("x2") ? 2 : 1;
  const multiplied = sum * multiplier;
  const flat = entry.modifiers
    .filter((modifier) => modifier !== "x2")
    .reduce((running, modifier) => running + Number(modifier.replace("+", "")), 0);
  const flipSeven = unique.length >= flipSevenCount;
  const bonus = flat + (flipSeven ? flipSevenBonus : 0);

  return { sum, multiplier, multiplied, bonus, flipSeven, total: multiplied + bonus };
}

export function roundScore(entry: RoundEntry): number {
  return breakdown(entry).total;
}

export function totalFor(rounds: readonly RoundEntry[]): number {
  return rounds.reduce((running, entry) => running + roundScore(entry), 0);
}
