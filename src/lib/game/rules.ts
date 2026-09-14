export const targetScore = 200;
export const flipSevenBonus = 15;
export const flipSevenCount = 7;
export const lowestCard = 0;
export const highestCard = 12;

export const modifiers = ["x2", "+2", "+4", "+6", "+8", "+10"] as const;

export type Modifier = (typeof modifiers)[number];

export const cardCopies: Record<number, number> = {
  0: 1,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
};

export function numberCards(): number[] {
  const cards: number[] = [];

  for (let value = lowestCard; value <= highestCard; value += 1) {
    cards.push(value);
  }

  return cards;
}

export function copiesOf(value: number): number {
  return cardCopies[value] ?? 0;
}
