import { describe, expect, it } from "vitest";
import { buildYouTubeEmbedUrl, parseYouTubeVideoId, resolveYouTubeAnthemUrl } from "@/lib/youtube";

const newAnthemUrl = "https://www.youtube.com/watch?v=wwHneL4DrCg&list=RDwwHneL4DrCg&start_radio=1";

describe("configuração do hino no YouTube", () => {
  it("extrai o ID válido da URL configurada em produção", () => {
    expect(
      parseYouTubeVideoId(newAnthemUrl),
    ).toBe("wwHneL4DrCg");
  });

  it("aceita formatos oficiais de compartilhamento e incorporação", () => {
    expect(parseYouTubeVideoId("https://youtu.be/wwHneL4DrCg?t=4")).toBe("wwHneL4DrCg");
    expect(parseYouTubeVideoId("https://www.youtube.com/embed/wwHneL4DrCg")).toBe("wwHneL4DrCg");
    expect(parseYouTubeVideoId("https://www.youtube.com/shorts/wwHneL4DrCg")).toBe("wwHneL4DrCg");
  });

  it("recusa hosts e IDs inválidos", () => {
    expect(parseYouTubeVideoId("https://example.com/watch?v=Gt2gf6NCr3Q")).toBeNull();
    expect(parseYouTubeVideoId("https://www.youtube.com/watch?v=curto")).toBeNull();
  });

  it("gera o embed oficial com origem e reprodução após interação", () => {
    const embed = new URL(buildYouTubeEmbedUrl("wwHneL4DrCg", "https://6meses-gamma.vercel.app"));
    expect(embed.origin).toBe("https://www.youtube.com");
    expect(embed.pathname).toBe("/embed/wwHneL4DrCg");
    expect(embed.searchParams.get("origin")).toBe("https://6meses-gamma.vercel.app");
    expect(embed.searchParams.get("autoplay")).toBe("1");
    expect(embed.searchParams.get("playsinline")).toBe("1");
  });

  it("migra a variável antiga indisponível e preserva uma configuração nova", () => {
    expect(resolveYouTubeAnthemUrl("https://www.youtube.com/watch?v=Gt2gf6NCr3Q", newAnthemUrl)).toBe(
      newAnthemUrl,
    );
    expect(resolveYouTubeAnthemUrl("https://youtu.be/M7lc1UVf-VE", newAnthemUrl)).toBe(
      "https://youtu.be/M7lc1UVf-VE",
    );
  });
});
