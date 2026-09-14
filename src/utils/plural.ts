export function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

export function countLabel(count: number, one: string, many: string): string {
  return `${count} ${plural(count, one, many)}`;
}

export function players(count: number): string {
  return countLabel(count, "jogador", "jogadores");
}

export function points(count: number): string {
  return countLabel(count, "ponto", "pontos");
}

export function rounds(count: number): string {
  return countLabel(count, "rodada", "rodadas");
}

export function cards(count: number): string {
  return countLabel(count, "carta", "cartas");
}
