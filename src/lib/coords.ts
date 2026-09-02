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
  /**
   * 이 좌표를 받을 때의 **장소 이름**. 지금 이름과 다르면 그 좌표는 안 쓴다.
   * 아래 getCoords 주석 참고 — 없으면(옛 자료) 검사를 건너뛴다.
   */
  for?: string;
  /** 축제처럼 이름이 아니라 '열리는 곳'으로 찾은 경우, 그 축제 이름과 근거. */
  venueFor?: string;
  venueWhy?: string;
}

const COORDS: Record<string, CoordEntry> = coordsData as Record<string, CoordEntry>;

const sameName = (a?: string, b?: string) =>
  String(a ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "") ===
  String(b ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "");

/**
 * 🚨 **id만 믿지 않는다** (2026-09-02에 실제로 당했다).
 *
 * seed.ts의 id는 `ks_1, ks_2 …`로 **파일에 적힌 순서**로 매겨진다. 그래서 항목
 * 하나를 지우거나 끼워 넣으면 **그 뒤가 전부 한 칸씩 밀린다.** 좌표는 옛 번호를
 * 그대로 들고 있으므로, 밀린 자리의 좌표가 조용히 남의 것이 된다:
 *
 *     무수골(도봉구)        → 경춘선숲길 좌표
 *     홍릉 두물길(동대문구)  → 무수골 좌표
 *     국립서울현충원(동작구) → 홍릉 두물길 좌표
 *
 * 화면도 안 깨지고 문법도 안 틀려서 **눈으로는 절대 못 잡는다** — 손님만 엉뚱한
 * 데로 간다. CLAUDE.md에 Kfood에서 같은 사고를 겪었다고 적혀 있는 바로 그것이다.
 *
 * 그래서 좌표에 **그때의 장소 이름을 함께 적어 두고, 지금 이름과 다르면 버린다.**
 * 버리면 좌표가 빈 칸이 되고 길찾기는 이름 검색으로 간다 — 남의 좌표로 보내는
 * 것보다 낫다(틀린 좌표 < 빈 칸). 다음 fetch-coords 실행이 제 이름으로 다시 채운다.
 *
 * `for`가 없는 옛 항목은 검사를 건너뛴다 — 다 지우면 멀쩡한 좌표까지 날아간다.
 * 새로 받는 것부터 이름이 붙으므로 시간이 지나면 저절로 다 검사 대상이 된다.
 */
export function getCoords(id: string, name?: string): CoordEntry | undefined {
  const c = COORDS[id];
  if (!c) return undefined;
  if (name && c.for && !sameName(c.for, name)) return undefined;
  return c;
}
