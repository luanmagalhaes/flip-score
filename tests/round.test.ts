import { describe, expect, it } from "vitest";
import { missingLaunch, totalsByPlayer, withTotals } from "@/lib/game/round";
import { joinNames } from "@/utils/plural";

const people = [
  { id: "a", name: "Tigre", total: 0 },
  { id: "b", name: "Coruja", total: 0 },
  { id: "c", name: "Lontra", total: 0 },
];

describe("total de cada um", () => {
  it("soma todas as rodadas lançadas", () => {
    const tally = totalsByPlayer([
      { player_id: "a", total: 20 },
      { player_id: "a", total: 15 },
      { player_id: "b", total: 0 },
    ]);

    expect(tally.get("a")).toBe(35);
    expect(tally.get("b")).toBe(0);
  });

  it("vem dos lançamentos, não do total guardado no jogador", () => {
    const stale = [{ id: "a", name: "Tigre", total: 12 }];
    const [fresh] = withTotals(stale, [
      { player_id: "a", total: 12 },
      { player_id: "a", total: 40 },
    ]);

    expect(fresh.total).toBe(52);
  });

  it("quem não lançou nada fica com zero", () => {
    expect(withTotals(people, []).map((person) => person.total)).toEqual([0, 0, 0]);
  });
});

describe("quem falta lançar", () => {
  it("lista só quem ainda não lançou a rodada atual", () => {
    const missing = missingLaunch(
      people,
      [
        { player_id: "a", round_number: 4 },
        { player_id: "b", round_number: 3 },
      ],
      4,
    );

    expect(missing.map((person) => person.id)).toEqual(["b", "c"]);
  });

  it("não conta lançamento de rodada passada", () => {
    const missing = missingLaunch(people, [{ player_id: "c", round_number: 3 }], 4);

    expect(missing).toHaveLength(3);
  });

  it("fica vazio quando todo mundo lançou", () => {
    const launched = people.map((person) => ({ player_id: person.id, round_number: 2 }));

    expect(missingLaunch(people, launched, 2)).toEqual([]);
  });
});

describe("nomes em frase", () => {
  it("junta dois nomes com e", () => {
    expect(joinNames(["Tigre", "Coruja"])).toBe("Tigre e Coruja");
  });

  it("junta três nomes com vírgula e e", () => {
    expect(joinNames(["Tigre", "Coruja", "Lontra"])).toBe("Tigre, Coruja e Lontra");
  });

  it("resume quando passa do limite", () => {
    expect(joinNames(["Tigre", "Coruja", "Lontra", "Panda", "Gato"])).toBe(
      "Tigre, Coruja e mais 3",
    );
  });

  it("devolve o nome sozinho", () => {
    expect(joinNames(["Tigre"])).toBe("Tigre");
  });
});
