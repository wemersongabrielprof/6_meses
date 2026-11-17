import { describe, expect, it } from "vitest";
import { calculateScore, collectedAllCategories } from "@/lib/game";

describe("pontuação do Pedal do Médio", () => {
  it("calcula os quatro tipos com os valores oficiais", () => {
    expect(calculateScore({ cake: 2, collar: 1, bag: 3, zara: 1 })).toBe(830);
  });

  it("só completa a meta com ao menos um de cada categoria", () => {
    expect(collectedAllCategories({ cake: 1, collar: 1, bag: 1, zara: 1 })).toBe(true);
    expect(collectedAllCategories({ cake: 1, collar: 0, bag: 1, zara: 1 })).toBe(false);
  });
});
