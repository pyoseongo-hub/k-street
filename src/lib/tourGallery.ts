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
}

interface GalleryEntry {
  name?: string;
  gu?: string;
  category?: string;
  photos?: GalleryPhoto[];
}

const GALLERY: Record<string, GalleryEntry> = gallery as Record<string, GalleryEntry>;

/**
 * 그 곳의 사진을 **보여줄 순서대로** 돌려준다.
 *
 * 대표 이미지(place.image)를 맨 앞에 둔다 — 관광공사가 대표로 고른 것이고,
 * 지금까지 화면에 나오던 그 사진이라 갑자기 다른 그림으로 바뀌지 않는다.
 * 그 뒤에 나머지를 붙여 손님이 넘겨 볼 수 있게 한다.
 *
 * 같은 주소가 두 번 들어가지 않게 거른다(대표 이미지는 대개 목록의 첫 장과 같다).
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
  push(place.image ? { url: place.image, thumb: place.thumb } : undefined);
  for (const p of photos) push(p);
  // 📷 관광사진 갤러리(포토코리아)에서 받아 온 사진도 뒤에 붙인다
  //    (2026-09-04, lib/photoGallery.ts 참고).
  //    이 곳들은 대표 이미지가 아예 없어서 seed의 withGalleryPhoto가 **첫 장을
  //    대표 사진으로 올려 둔 상태**다 — 그래서 첫 장은 위 push에서 이미 들어갔고
  //    여기서는 seen 덕분에 두 번 들어가지 않는다. 나머지가 넘겨 볼 사진이 된다.
  for (const s of galleryShotsFor(place.name, place.gu)) push({ url: s.url });
  return out;
}

/** 사진을 여러 장 가진 곳이 몇 곳인지 — 감사·보고용. */
export const GALLERY_PLACE_COUNT = Object.keys(GALLERY).length;
