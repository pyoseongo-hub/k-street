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
}

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

export function getManualPhoto(placeId: string): ManualPhoto | undefined {
  return PHOTOS[placeId];
}

export const MANUAL_PHOTO_COUNT = Object.keys(PHOTOS).length;
