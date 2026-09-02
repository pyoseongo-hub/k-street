// 사람이 직접 찾아 넣은 사진(구청·서울시 공공누리 자료).
//
// 왜 필요한가 — 2026-09-01 기준 443곳 중 179곳에 사진이 없다. 그중 175곳이
// "사람이 웹 검색으로 이름만 모은" 곳이라 애초에 사진이 없었고, 관광공사 DB에도
// 143곳은 아예 없어서 자동으로는 못 채운다.
//
// 사용자 결정(2026-09-01): 사진 없는 곳은 앱에서 숨기고, **하루 3곳씩** 구청 자료에서
// 무료 사진을 찾아 여기에 채운다. 채워진 곳은 그날부터 다시 앱에 나타난다.
//
// 🚨 저작권 — 여기 들어갈 수 있는 건 **공공기관이 공공누리로 공개한 사진**뿐이다.
// 블로그·인스타·구글 이미지 검색 결과는 전부 남의 저작물이라 절대 안 된다.
// source(어디서)와 license(이용 조건)를 못 적는 사진은 넣지 않는다 — 이 프로젝트의
// "확인 못 한 것은 넣지 않는다" 원칙이 사진에도 그대로 적용된다.

import manual from "../data/manual-photos.json";

export interface ManualPhoto {
  image: string;
  /** 어디서 가져왔는지 — 예: "강남구청". 화면에 출처로 띄운다(공공누리 의무). */
  source: string;
  /** 이용 조건 — 예: "공공누리 제1유형". 없으면 쓰지 않는다. */
  license: string;
  /** 원본 페이지. 나중에 출처를 다시 확인할 때 쓴다. */
  pageUrl?: string;
  /**
   * 관광공사에서 자동으로 찾아 넣은 경우, **그때 맞춘 장소 이름**.
   * 지금 이름과 다르면 그 사진은 안 쓴다 — 아래 getManualPhoto 주석 참고.
   */
  matchedName?: string;
}

const sameName = (a?: string, b?: string) =>
  String(a ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "") ===
  String(b ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "");

// "_"로 시작하는 열쇠는 파일 안에 적어 둔 설명·규칙이라 자료가 아니다.
const PHOTOS: Record<string, ManualPhoto> = Object.fromEntries(
  Object.entries(manual as Record<string, unknown>).filter(
    ([k, v]) =>
      !k.startsWith("_") &&
      typeof v === "object" &&
      v !== null &&
      typeof (v as ManualPhoto).image === "string" &&
      // 출처·이용 조건이 없는 사진은 아예 안 쓴다(저작권 원칙).
      typeof (v as ManualPhoto).source === "string" &&
      typeof (v as ManualPhoto).license === "string"
  )
) as Record<string, ManualPhoto>;

/**
 * 🚨 **id만 믿지 않는다** (2026-09-02에 11곳이 남의 사진을 달고 있었다).
 *
 * seed.ts의 id는 `ks_1, ks_2 …`로 **파일에 적힌 순서**로 매겨진다. 항목 하나를
 * 지우거나 끼워 넣으면 그 뒤가 전부 밀리는데, 이 파일은 옛 번호를 그대로 들고
 * 있어 **화면에 남의 집 사진이 뜬다**:
 *
 *     서울시립미술관(중구)  → 딜쿠샤 사진 (종로구의 다른 곳)
 *     관세박물관(강남구)    → 대안공간 루프 사진
 *     무수골(도봉구)       → 경춘선숲길 사진
 *
 * 좌표가 밀린 것과 같은 원인이고(lib/coords.ts 주석), 사진 쪽이 더 나쁘다 —
 * 좌표는 눌러 봐야 알지만 사진은 **목록에 그냥 보인다.**
 *
 * 그래서 자동으로 넣은 사진에는 그때 맞춘 이름(matchedName)이 적혀 있고,
 * 지금 이름과 다르면 **안 쓴다.** 사진이 없는 곳으로 취급되어 목록에서 빠지거나
 * 일러스트가 대신 나온다 — 남의 사진을 보여 주는 것보다 낫다.
 *
 * matchedName이 없는 항목(사람이 직접 찾아 넣은 것)은 검사하지 않는다 —
 * 사람이 그 장소를 보고 고른 것이라 밀림과 무관하다.
 */
export function getManualPhoto(placeId: string, name?: string): ManualPhoto | undefined {
  const p = PHOTOS[placeId];
  if (!p) return undefined;
  if (name && p.matchedName && !sameName(p.matchedName, name)) return undefined;
  return p;
}

export const MANUAL_PHOTO_COUNT = Object.keys(PHOTOS).length;
