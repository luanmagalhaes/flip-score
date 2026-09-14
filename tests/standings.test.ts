import { describe, expect, it } from "vitest";
import { champions, pointsToGo, rank, reachedTarget } from "@/lib/game/standings";
import { copiesOf, numberCards, targetScore } from "@/lib/game/rules";

describe("classificação", () => {
  it("ordena do maior para o menor", () => {
    const order = rank([
      { playerId: "a", total: 90 },
      { playerId: "b", total: 150 },
      { playerId: "c", total: 20 },
    ]).map((entry) => entry.playerId);

    expect(order).toEqual(["b", "a", "c"]);
  });

  it("não altera a lista original", () => {
    const original = [
      { playerId: "a", total: 10 },
      { playerId: "b", total: 20 },
    ];

    rank(original);

    expect(original[0].playerId).toBe("a");
  });
});

describe("chegada aos 200", () => {
  it("reconhece quem bateu a marca", () => {
    expect(reachedTarget([{ playerId: "a", total: targetScore }])).toBe(true);
  });

  it("não encerra com 199", () => {
    expect(reachedTarget([{ playerId: "a", total: 199 }])).toBe(false);
  });

  it("premia o maior total, não quem passou primeiro", () => {
    const winners = champions([
      { playerId: "a", total: 205 },
      { playerId: "b", total: 230 },
    ]);

    expect(winners).toEqual([{ playerId: "b", total: 230 }]);
  });

  it("devolve os dois num empate exato", () => {
    expect(
      champions([
        { playerId: "a", total: 210 },
        { playerId: "b", total: 210 },
      ]),
    ).toHaveLength(2);
  });

  it("não aponta campeão antes da hora", () => {
    expect(champions([{ playerId: "a", total: 120 }])).toEqual([]);
  });

  it("conta quanto falta para a marca", () => {
    expect(pointsToGo(160)).toBe(40);
    expect(pointsToGo(240)).toBe(0);
  });
});

describe("baralho do Flip 7", () => {
  it("tem uma carta de cada número de 0 a 12", () => {
    expect(numberCards()).toHaveLength(13);
  });

  it("repete cada número tantas vezes quanto o próprio valor", () => {
    expect(copiesOf(1)).toBe(1);
    expect(copiesOf(7)).toBe(7);
    expect(copiesOf(12)).toBe(12);
  });

  it("tem um único zero", () => {
    expect(copiesOf(0)).toBe(1);
  });

  it("soma 79 cartas de número, que com ações e modificadores fecham as 94 do baralho", () => {
    const total = numberCards().reduce((sum, value) => sum + copiesOf(value), 0);

    expect(total).toBe(79);
  });
});
