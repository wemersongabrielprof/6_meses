export const siteConfig = {
  couple: {
    name: "Yasmin",
    headline: "Feliz 6 meses de namoro, Yasmin! ❤️",
    subtitle: "Preparei este cantinho para celebrar nós dois — com carinho, risadas e algumas surpresas.",
    closing: "Seis meses e eu ainda escolheria você de novo. ❤️",
  },
  anthemUrl: "https://www.youtube.com/watch?v=wwHneL4DrCg&list=RDwwHneL4DrCg&start_radio=1",
  album: [
    { id: 1, src: "/assets/album/01.webp", alt: "Fotografia 1 do casal", caption: "Cada foto guarda um pedacinho do nosso amor." },
    { id: 2, src: "/assets/album/02.webp", alt: "Fotografia 2 do casal", caption: "Meu lugar favorito sempre tem um pouco de você." },
    { id: 3, src: "/assets/album/03.webp", alt: "Fotografia 3 do casal", caption: "Com você, até os instantes simples ficam especiais." },
    { id: 4, src: "/assets/album/04.webp", alt: "Fotografia 4 do casal", caption: "Um capítulo bonito da nossa história, guardado aqui." },
    { id: 5, src: "/assets/album/05.webp", alt: "Fotografia 5 do casal", caption: "Seu sorriso deixa qualquer lembrança mais bonita." },
    { id: 6, src: "/assets/album/06.webp", alt: "Fotografia 6 do casal", caption: "Que a gente continue colecionando momentos assim." },
    { id: 7, src: "/assets/album/07.webp", alt: "Fotografia 7 do casal", caption: "Sete fotos, seis meses e um amor que só cresce." },
  ],
  decreeSuggestions: [
    "Comer bolo de chocolate 🍫",
    "Passear com Macchi 🐶",
    "Sessão de filme 🎬",
    "Passear juntinhos 💕",
    "Comprinhas 🛍️",
  ],
  game: {
    durationSeconds: 75,
    items: {
      cake: { label: "Bolo de chocolate", emoji: "🎂", points: 100 },
      collar: { label: "Coleira do Macchi", emoji: "🐶", points: 140 },
      bag: { label: "Bolsa", emoji: "👜", points: 120 },
      zara: { label: "Roupa Zara", emoji: "👗", points: 130 },
    },
  },
} as const;

export type GameItemKey = keyof typeof siteConfig.game.items;
