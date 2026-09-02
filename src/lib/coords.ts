import coordsData from "../data/coords.json";

// scripts/fetch-coords.mjs가 채우는 좌표 — 카카오 로컬 검색(상호명 검색) +
// 네이버 지오코딩(카카오가 찾은 주소를 다시 좌표로 변환해 대조)이 서로
// 근접한 값을 냈을 때만 저장한다. seed.ts를 프로그램으로 고치지 않고
// id로 찾아 덧씌우는 방식이라(정확도 원칙: 확인 안 된 좌표는 안 지어낸다),
// 이미 seed.ts에 직접 박아 둔 좌표(현재 5곳)는 그대로 우선한다.
export interface CoordEntry {
  lat: number;
  lng: number;
  source: string;
  matchedName?: string;
  /** 축제처럼 이름이 아니라 '열리는 곳'으로 찾은 경우, 그 축제 이름과 근거. */
  venueFor?: string;
  venueWhy?: string;
}

const COORDS: Record<string, CoordEntry> = coordsData as Record<string, CoordEntry>;

export function getCoords(id: string): CoordEntry | undefined {
  return COORDS[id];
}
