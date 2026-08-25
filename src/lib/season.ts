export type SeasonKey = "spring" | "summer" | "autumn" | "winter";

export const SEASON_LABEL: Record<SeasonKey, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
};

export function seasonOf(month: number): SeasonKey {
  if (month === 3 || month === 4 || month === 5) return "spring";
  if (month === 6 || month === 7 || month === 8) return "summer";
  if (month === 9 || month === 10 || month === 11) return "autumn";
  return "winter";
}
