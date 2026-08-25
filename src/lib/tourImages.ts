import tourImages from "../data/tour-images.json";

export interface TourImage {
  name: string;
  matchedTitle: string;
  image: string;
  thumb: string;
  contentId: string;
  /** 한국관광공사가 등록한 실제 좌표 — 값이 없으면 좌표를 안 가진 항목이다(지어내지 않음). */
  lat?: number;
  lng?: number;
  source: string;
}

const IMAGES = tourImages as Record<string, TourImage>;

// scripts/fetch-tour-images.mjs가 채워 넣기 전까지는 빈 객체다 — 그 경우 전부 undefined라
// 호출부는 자연히 SeasonArt 일러스트로 대체된다(정확도 원칙: 없으면 없는 대로 둔다).
export function getTourImage(placeId: string): TourImage | undefined {
  return IMAGES[placeId];
}
