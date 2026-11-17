import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const decreeCreateSchema = z.object({
  texto: z.string().trim().min(1, "Escreva seu decreto antes de publicar.").max(500, "O decreto pode ter no máximo 500 caracteres."),
  idempotencyKey: uuidSchema,
});

export const decreeUpdateSchema = z.object({
  status: z.enum(["recebido", "em_andamento", "cumprido"]),
  resposta: z.string().trim().max(300, "A resposta pode ter no máximo 300 caracteres.").nullable(),
});

export const albumEventSchema = z.object({
  photoId: z.number().int().min(1).max(7),
  eventType: z.enum(["opened", "liked"]),
  idempotencyKey: uuidSchema,
});

export const activityEventSchema = z.object({
  eventType: z.literal("visit"),
  idempotencyKey: uuidSchema,
});

export const gameRunSchema = z.object({
  clientRunId: uuidSchema,
  score: z.number().int().min(0).max(1_000_000),
  durationSeconds: z.number().int().min(1).max(180),
  items: z.object({
    cake: z.number().int().min(0).max(500),
    collar: z.number().int().min(0).max(500),
    bag: z.number().int().min(0).max(500),
    zara: z.number().int().min(0).max(500),
  }),
  won: z.boolean(),
  attempts: z.number().int().min(1).max(10_000),
});

export type GameRunPayload = z.infer<typeof gameRunSchema>;
