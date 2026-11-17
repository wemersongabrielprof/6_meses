import { describe, expect, it } from "vitest";
import { buildYouTubeEmbedUrl, parseYouTubeVideoId } from "@/lib/youtube";

describe("configuração do hino no YouTube", () => {
  it("extrai o ID válido da URL configurada em produção", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/watch?v=Gt2gf6NCr3Q")).toBe("Gt2gf6NCr3Q");
  });

  it("aceita formatos oficiais de compartilhamento e incorporação", () => {
    expect(parseYouTubeVideoId("https://youtu.be/Gt2gf6NCr3Q?t=4")).toBe("Gt2gf6NCr3Q");
    expect(parseYouTubeVideoId("https://www.youtube.com/embed/Gt2gf6NCr3Q")).toBe("Gt2gf6NCr3Q");
    expect(parseYouTubeVideoId("https://www.youtube.com/shorts/Gt2gf6NCr3Q")).toBe("Gt2gf6NCr3Q");
  });

  it("recusa hosts e IDs inválidos", () => {
    expect(parseYouTubeVideoId("https://example.com/watch?v=Gt2gf6NCr3Q")).toBeNull();
    expect(parseYouTubeVideoId("https://www.youtube.com/watch?v=curto")).toBeNull();
  });

  it("gera o embed oficial com origem e reprodução após interação", () => {
    const embed = new URL(buildYouTubeEmbedUrl("Gt2gf6NCr3Q", "https://6meses-gamma.vercel.app"));
    expect(embed.origin).toBe("https://www.youtube.com");
    expect(embed.pathname).toBe("/embed/Gt2gf6NCr3Q");
    expect(embed.searchParams.get("origin")).toBe("https://6meses-gamma.vercel.app");
    expect(embed.searchParams.get("autoplay")).toBe("1");
    expect(embed.searchParams.get("playsinline")).toBe("1");
  });
});
