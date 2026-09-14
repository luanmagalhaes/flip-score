import { describe, expect, it } from "vitest";
import { breakdown, emptyRound, roundScore, totalFor } from "@/lib/game/scoring";
import { flipSevenBonus } from "@/lib/game/rules";

const round = (numbers: number[], mods: string[] = [], busted = false) =>
  ({ numbers, modifiers: mods as never, busted });

describe("soma das cartas de número", () => {
  it("soma o que a pessoa virou", () => {
    expect(roundScore(round([3, 7, 10]))).toBe(20);
  });

  it("conta o zero sem somar nada", () => {
    expect(roundScore(round([0, 5]))).toBe(5);
  });

  it("devolve zero na rodada vazia", () => {
    expect(roundScore(emptyRound())).toBe(0);
  });

  it("ignora número repetido em vez de somar duas vezes", () => {
    expect(roundScore(round([4, 4, 9]))).toBe(13);
  });
});

describe("estourou", () => {
  it("zera a rodada inteira, por maior que fosse", () => {
    expect(roundScore(round([12, 11, 10, 9], ["x2", "+10"], true))).toBe(0);
  });

  it("não dá o bônus do Flip 7 para quem estourou", () => {
    const entry = round([1, 2, 3, 4, 5, 6, 7], [], true);

    expect(breakdown(entry).flipSeven).toBe(false);
    expect(roundScore(entry)).toBe(0);
  });
});

describe("modificadores", () => {
  it("dobra só a soma das cartas de número", () => {
    expect(roundScore(round([5, 10], ["x2"]))).toBe(30);
  });

  it("soma o bônus fixo depois de dobrar, não antes", () => {
    const entry = round([5, 10], ["x2", "+10"]);

    expect(breakdown(entry).multiplied).toBe(30);
    expect(roundScore(entry)).toBe(40);
  });

  it("acumula mais de um bônus fixo", () => {
    expect(roundScore(round([4], ["+2", "+6"]))).toBe(12);
  });

  it("vale mesmo sem nenhuma carta de número", () => {
    expect(roundScore(round([], ["+10"]))).toBe(10);
  });
});

describe("bônus do Flip 7", () => {
  it("entra sozinho quando fecham sete números diferentes", () => {
    const entry = round([0, 1, 2, 3, 4, 5, 6]);

    expect(breakdown(entry).flipSeven).toBe(true);
    expect(roundScore(entry)).toBe(21 + flipSevenBonus);
  });

  it("não entra com seis números", () => {
    expect(breakdown(round([1, 2, 3, 4, 5, 6])).flipSeven).toBe(false);
  });

  it("não conta repetido para fechar os sete", () => {
    expect(breakdown(round([1, 1, 2, 3, 4, 5, 6])).flipSeven).toBe(false);
  });

  it("soma com o multiplicador na ordem certa", () => {
    const entry = round([1, 2, 3, 4, 5, 6, 7], ["x2"]);

    expect(breakdown(entry).multiplied).toBe(56);
    expect(roundScore(entry)).toBe(56 + flipSevenBonus);
  });
});

describe("total da partida", () => {
  it("soma as rodadas na ordem", () => {
    expect(totalFor([round([10]), round([5], ["x2"]), round([12], [], true)])).toBe(20);
  });

  it("começa em zero sem rodada nenhuma", () => {
    expect(totalFor([])).toBe(0);
  });
});
