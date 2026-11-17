import { siteConfig, type GameItemKey } from "@/config/site";

export type GameCounts = Record<GameItemKey, number>;

export function calculateScore(counts: GameCounts) {
  return (Object.keys(counts) as GameItemKey[]).reduce(
    (total, key) => total + counts[key] * siteConfig.game.items[key].points,
    0,
  );
}

export function collectedAllCategories(counts: GameCounts) {
  return (Object.keys(counts) as GameItemKey[]).every((key) => counts[key] > 0);
}
