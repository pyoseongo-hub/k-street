import gallery from "../data/tour-gallery.json";
import type { Place } from "../data/seed";
import { galleryShotsFor } from "./photoGallery";

// 📷 한 곳에 딸린 사진 여러 장 (scripts/fetch-tour-gallery.mjs가 채운다).
//
// 왜 필요한가 (2026-09-02 사용자 지적: "사진 이쁜걸로 교체 / 지금것보다 여기가
// 퀄리티좋다") — 목록 API가 주는 대표 이미지(firstimage)는 곳당 한 장뿐이고,
// 축제는 그 한 장이 아예 **포스터**인 경우가 많다. 관광콘텐츠랩을 열어 보면
// 같은 곳에 실제 풍경 사진이 여러 장 등록돼 있다(강동북페스티벌 10장).
//
// 사진 파일을 받아 두는 게 아니라 **주소만** 적어 둔다. 1,000장이어도 200KB
// 남짓이라 저장 부담이 없고, 관광공사가 사진을 바꾸면 그대로 따라간다.
//
// 🚨 전부 공공누리 제1유형(한국관광공사)이다 — 화면에 출처를 반드시 띄운다.

export interface GalleryPhoto {
  url: string;
  thumb?: string;
  name?: string;
  /**
   * 이 **한 장**의 출처. 없으면 화면이 기본값(한국관광공사)으로 띄운다.
   *
   * 🚨 왜 장마다 따로 두나 (2026-09-04) — 예전에는 출처가 **카드에 하나**뿐이었다
   * (place.photoCredit). 그런데 한 카드 안에 구청 사진과 관광공사 갤러리 사진이
   * 같이 놓이게 되면서, 넘겨도 출처 글자가 안 바뀌어 **남의 사진에 엉뚱한 출처가
   * 붙는** 상태가 된다. 공공누리는 출처 표시가 의무라 그냥 넘길 일이 아니다.
   */
  credit?: string;
}

interface GalleryEntry {
  name?: string;
  gu?: string;
  category?: string;
  photos?: GalleryPhoto[];
}

const GALLERY: Record<string, GalleryEntry> = gallery as Record<string, GalleryEntry>;

/**
 * 그 곳의 사진을 **보여줄 순서대로** 돌려준다. 첫 장이 카드에 뜨고,
 * 나머지는 눌러서 넘겨 본다.
 *
 * 📷 **관광사진 갤러리(포토코리아)를 맨 앞에 둔다**
 *    (사용자 지시 2026-09-04: "이미 있는 곳도 관광공사 사진있으면 방영해").
 *
 *    예전에는 대표 이미지(place.image)가 맨 앞이었다. 그런데 대표 이미지는 목록
 *    API가 주는 **한 장**이고, 축제는 그게 아예 **포스터**인 경우가 많다
 *    (정조대왕 능행차·서울건축문화제가 그랬다). 포스터는 카드 크기로 줄이면
 *    글자가 안 읽혀서 손님에게 아무것도 말해 주지 않는다.
 *    갤러리는 사진작가가 그 장소를 찍은 사진이라 대개 이쪽이 낫다.
 *
 *    🚨 **대표 이미지를 버리지는 않는다** — 바로 뒤에 붙여 손님이 넘겨 볼 수 있게
 *    한다. 어느 게 더 나은지 기계가 단정해 멀쩡한 사진을 버리는 쪽이 더 나쁘다
 *    (좌표에서 겪은 그 문제와 같다). 순서만 바꾸고 고르는 건 손님에게 맡긴다.
 *
 * 같은 주소가 두 번 들어가지 않게 거른다 — 사진이 없던 곳은 seed의
 * withGalleryPhoto가 갤러리 첫 장을 대표 이미지로 올려 뒀으므로 그대로 두면
 * 같은 사진이 두 번 나온다.
 */
export function galleryOf(place: Place): GalleryPhoto[] {
  const entry = place.tourContentId ? GALLERY[place.tourContentId] : undefined;
  const photos = entry?.photos ?? [];
  const out: GalleryPhoto[] = [];
  const seen = new Set<string>();
  const push = (p: GalleryPhoto | undefined) => {
    if (!p?.url || seen.has(p.url)) return;
    seen.add(p.url);
    out.push(p);
  };
  // ① 갤러리 사진 — 출처는 한국관광공사라 credit을 비워 둔다(화면 기본값이 그것이다).
  for (const s of galleryShotsFor(place.name, place.gu)) push({ url: s.url });
  // ② 그 곳이 원래 갖고 있던 대표 이미지. 구청 사진일 수 있으므로 **그 출처를 함께** 넘긴다.
  push(place.image ? { url: place.image, thumb: place.thumb, credit: place.photoCredit } : undefined);
  // ③ 같은 곳에 딸린 관광공사 사진 여러 장(detailImage2).
  for (const p of photos) push(p);
  return out;
}

/** 사진을 여러 장 가진 곳이 몇 곳인지 — 감사·보고용. */
export const GALLERY_PLACE_COUNT = Object.keys(GALLERY).length;
