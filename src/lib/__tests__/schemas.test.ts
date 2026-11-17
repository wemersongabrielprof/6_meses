import { describe, expect, it } from "vitest";
import { albumEventSchema, decreeCreateSchema, gameRunSchema } from "@/lib/schemas";

const id = "123e4567-e89b-42d3-a456-426614174000";

describe("fluxo de decreto", () => {
  it("aceita a mensagem do critério de aceite e remove espaços externos", () => {
    const parsed = decreeCreateSchema.parse({ texto: "  Quero bolo de chocolate hoje  ", idempotencyKey: id });
    expect(parsed.texto).toBe("Quero bolo de chocolate hoje");
  });

  it("recusa texto vazio e texto acima de 500 caracteres", () => {
    expect(() => decreeCreateSchema.parse({ texto: "   ", idempotencyKey: id })).toThrow();
    expect(() => decreeCreateSchema.parse({ texto: "a".repeat(501), idempotencyKey: id })).toThrow();
  });
});

describe("payloads significativos", () => {
  it("valida evento do álbum e resultado de partida", () => {
    expect(albumEventSchema.parse({ photoId: 7, eventType: "liked", idempotencyKey: id }).photoId).toBe(7);
    expect(gameRunSchema.parse({
      clientRunId: id,
      score: 490,
      durationSeconds: 75,
      items: { cake: 1, collar: 1, bag: 1, zara: 1 },
      won: true,
      attempts: 1,
    }).won).toBe(true);
  });
});
