import "server-only";

import { createHash } from "node:crypto";
import { ApiError } from "@/lib/http";

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function assertTokenShape(token: string) {
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) {
    throw new ApiError("Convite inválido ou expirado.", 404);
  }
}

export function assertSameOrigin(request: Request) {
  const originHeader = request.headers.get("origin");
  if (!originHeader) throw new ApiError("Origem da requisição ausente.", 403);

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    throw new ApiError("Origem da requisição inválida.", 403);
  }

  const requestUrl = new URL(request.url);
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const allowed = new Set([requestUrl.origin]);
  if (configured) {
    try {
      allowed.add(new URL(configured).origin);
    } catch {
      // Uma configuração incorreta não deve liberar origens adicionais.
    }
  }

  if (!allowed.has(origin.origin)) throw new ApiError("Origem não autorizada.", 403);
}
