import data from "../data/photo-gallery.json";

// 📷 **관광사진 갤러리(포토코리아)에서 받아 온 사진** — scripts/fetch-photo-gallery.mjs가 채운다.
//
// 왜 또 다른 사진 창구인가 (사용자 지시 2026-09-04: "쓸수있는 사진있나 전부 확인해
// / 사진 있으면 여기 사진을 우선으로 띄워") —
// 지금까지 쓰던 사진은 전부 KorService2(국문 관광정보)가 주는 대표 이미지인데,
// 그 자료에 **아예 등록이 안 된 곳이 149곳**이었다. 국립중앙박물관·남산·청계천·
// 통인시장처럼 손님이 당연히 찾을 곳들이 사진이 없다는 이유로 화면에서 가려져 있었다.
//
// 갤러리는 장소 자료와 이어져 있지 않고 **사진 자체를 낱말로 찾는** 별도 창구라,
// 장소 자료에 없는 곳도 사진만 따로 올라와 있다. 2026-09-04에 활용신청이 승인됐다.
//
// 🚨 전부 공공누리 제1유형(한국관광공사)이다 — 화면에 출처를 반드시 띄운다.
//
// 🔀 **열쇠가 id가 아니라 이름인 이유** — seed의 id는 파일에 나오는 순서대로
//    매겨진다(ks_1, ks_2…). 항목 하나를 지우면 그 뒤가 전부 한 칸씩 당겨져서,
//    지운 곳의 사진이 **남의 곳에 그대로 붙는다.** 곁다리 자료는 이름으로 붙인다.

export interface GalleryShot {
  url: string;
  /** 갤러리에 등록된 제목. "이 사진이 왜 이 곳에 붙었나"를 되짚는 근거다. */
  title: string;
  photographer: string | null;
  createdAt: string | null;
  contentId: string | null;
}

interface Entry {
  name: string;
  gu: string;
  photos: GalleryShot[];
  source: string;
  license: string;
  fetchedAt: string;
}

/** "_"로 시작하는 열쇠는 파일 안에 적어 둔 설명이라 자료가 아니다. */
const BY_NAME: Record<string, Entry> = Object.fromEntries(
  Object.entries(data as Record<string, Entry>).filter(([k]) => !k.startsWith("_"))
);

const key = (s: string) => s.normalize("NFC");

/**
 * 그 곳의 갤러리 사진. **이름과 구가 둘 다 맞을 때만** 돌려준다.
 *
 * 왜 구까지 보나 — 이름이 같은 곳이 다른 구에 있을 수 있다(「○○시장」은 흔한
 * 이름이다). manual-photos에서 id만 믿었다가 남의 집 사진이 뜬 적이 있어
 * (2026-09-02, 11곳) 여기서는 처음부터 두 가지를 맞춰 본다.
 */
export function galleryShotsFor(name: string, gu: string): GalleryShot[] {
  const e = BY_NAME[key(name)];
  if (!e || key(e.gu) !== key(gu)) return [];
  return e.photos ?? [];
}

/** 갤러리로 채워진 곳이 몇 곳인지 — 감사·보고용. */
export const PHOTO_GALLERY_PLACE_COUNT = Object.keys(BY_NAME).length;
