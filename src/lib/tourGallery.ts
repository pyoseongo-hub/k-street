import { useSyncExternalStore } from "react";
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

/**
 * 저장된 모양 — **한 곳당 사진 배열**이다.
 *
 * 사진 한 장은 세 가지 중 하나로 적혀 있다(scripts/lib/gallery-shape.mjs) —
 *   · `"주소"`            썸네일이 규칙대로(image2 → image3)
 *   · `["주소"]`          썸네일이 원본과 같다
 *   · `["주소","썸네일"]` 그 밖
 * 이렇게 적어 859KB → 288KB 가 됐고, **버린 정보는 없다**(4,174장 전수 대조).
 */
type PackedPhoto = string | [string] | [string, string];
type GalleryEntry = PackedPhoto[];

/** 원본 주소에서 썸네일 주소를 만든다. 규칙이 안 맞으면 null. */
function thumbFromUrl(url: string): string | null {
  return url.includes("image2") ? url.replace("image2", "image3") : null;
}

/** 저장된 모양 → 화면이 쓰는 모양. 옛 모양({url,thumb})도 그대로 읽는다. */
function unpack(x: PackedPhoto | { url?: string; thumb?: string }): GalleryPhoto | null {
  if (typeof x === "string") return { url: x, thumb: thumbFromUrl(x) ?? x };
  if (Array.isArray(x)) return x[0] ? { url: x[0], thumb: x[1] ?? x[0] } : null;
  return x?.url ? { url: x.url, thumb: x.thumb ?? x.url } : null;
}

// ─────────────────────────────────────────────────────────────────────────
// 📦 **이 자료는 첫 화면에 필요하지 않다 — 늦게 받는다** (2026-09-17)
// ─────────────────────────────────────────────────────────────────────────
//   서울 341곳·부산 202곳에도 사진을 받아 오면서 이 파일이 **439KB → 1,058KB**
//   가 됐다. 그대로 두면 본체 js 가 1,458 → 2,100KB 로 도로 커진다 —
//   곳 이름 번역을 말마다 갈라 아낀 것을 그대로 뱉어 내는 셈이다.
//
//   🚨 **늦게 와도 카드에 보이는 첫 사진은 안 바뀐다.** 아래 galleryOf 의 순서를
//      보면 이 자료는 **③번째**다 — ①포토코리아 ②그 곳의 대표 사진 다음이다.
//      즉 이 파일이 주는 것은 「넘겨 볼 사진 몇 장 더」뿐이고, 그건 손님이
//      실제로 넘길 때나 필요하다. 첫 그림이 늦어질 일이 없다.
//
//   못 받아도 화면은 멀쩡하다 — 넘겨 볼 사진이 없을 뿐이다.
const GALLERY: Record<string, GalleryEntry> = {};

/** 자료가 도착하면 이 번호가 올라간다. 화면은 이걸 보고 다시 그린다. */
let 판 = 0;
const 듣는이 = new Set<() => void>();

let 받는중: Promise<void> | null = null;

/** 한 번만 받는다. 여러 카드가 동시에 불러도 같은 약속을 기다린다. */
export function ensureTourGallery(): Promise<void> {
  if (!받는중) {
    받는중 = import("../data/tour-gallery.json")
      .then((mod) => {
        const data = ((mod as { default?: unknown }).default ?? mod) as Record<string, GalleryEntry>;
        Object.assign(GALLERY, data);
        판++;
        for (const 알린다 of 듣는이) 알린다();
      })
      .catch(() => {
        // 못 받았다(네트워크). 다음에 다시 해 볼 수 있게 비운다.
        받는중 = null;
      });
  }
  return 받는중;
}

/**
 * 자료가 도착하면 다시 그리게 한다.
 *
 * 🚨 리액트 바깥에 있는 값이라, 채워져도 리액트가 **혼자서는 모른다.**
 *    곳 이름 번역에서도 같은 자리에서 한 번 당했다(placeText.ts 머리말).
 */
export function useTourGallery(): void {
  useSyncExternalStore(
    (알린다) => {
      듣는이.add(알린다);
      return () => 듣는이.delete(알린다);
    },
    () => 판,
    () => 판
  );
}

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
  const photos = (entry ?? []).map(unpack).filter((p): p is GalleryPhoto => p !== null);
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
