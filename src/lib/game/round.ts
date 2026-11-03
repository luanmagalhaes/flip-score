interface Scored {
  player_id: string;
  total: number;
}

interface Launched {
  player_id: string;
  round_number: number;
}

export function totalsByPlayer(entries: readonly Scored[]): Map<string, number> {
  const tally = new Map<string, number>();

  for (const entry of entries) {
    tally.set(entry.player_id, (tally.get(entry.player_id) ?? 0) + entry.total);
  }

  return tally;
}

export function withTotals<T extends { id: string }>(
  people: readonly T[],
  entries: readonly Scored[],
): Array<T & { total: number }> {
  const tally = totalsByPlayer(entries);

  return people.map((person) => ({ ...person, total: tally.get(person.id) ?? 0 }));
}

export function requiredPlayers<T extends { joined_round: number }>(
  people: readonly T[],
  roundNumber: number,
): T[] {
  return people.filter((person) => person.joined_round <= roundNumber);
}

export function missingLaunch<T extends { id: string }>(
  people: readonly T[],
  entries: readonly Launched[],
  roundNumber: number,
): T[] {
  const done = new Set(
    entries.filter((entry) => entry.round_number === roundNumber).map((entry) => entry.player_id),
  );

  return people.filter((person) => !done.has(person.id));
}
