// 📷 **사진 목록을 작게 적는 법** — 정보는 하나도 안 버린다.
//
// 왜 (2026-09-17) — 서울 341곳·부산 202곳까지 사진을 받으면서 tour-gallery.json 이
// **439KB → 859KB** 가 됐다. 이 자료는 손님이 첫 화면을 본 직후에 받는데, 그만큼이
// 그대로 통신비다. 그런데 안을 열어 보니 **같은 말이 세 번 적혀 있었다**:
//
//   ① 곳 이름·구·갈래 — 앱이 이미 들고 있다(seed·*-places.json). 다시 적을 이유가 없다.
//   ② 사진마다 붙은 이름("서울_청계산 (1)") — 화면 어디에도 안 쓴다.
//   ③ 썸네일 주소 — **원본 주소에서 `image2` 를 `image3` 로 바꾼 것**이다.
//      4,174장 중 4,046장이 정확히 그 규칙이었고, 나머지 128장은 **썸네일이 원본과
//      같은** 경우였다. 즉 새 정보가 아니라 **규칙과 예외 두 가지**뿐이다.
//
// 그래서 이렇게 적는다 —
//   · 규칙대로인 사진 → 주소 **한 줄**(문자열)
//   · 예외(썸네일이 원본과 같은 것) → `[주소]` (길이 1짜리 배열)
//   · 혹시 둘 다 아닌 것이 생기면 → `[주소, 썸네일]`
// → **859KB → 약 290KB.** 버린 정보는 없다.
//
// 🚨 읽는 쪽과 쓰는 쪽이 **이 파일 하나**를 같이 쓴다. 모양을 두 군데 적으면
//    한쪽만 고치는 날이 온다(이 저장소에서 여러 번 겪은 일이다).

/** 원본 주소에서 썸네일 주소를 만든다. 규칙이 안 맞으면 null. */
export function thumbFromUrl(url) {
  return url.includes("image2") ? url.replace("image2", "image3") : null;
}

/** {url, thumb} → 작게 적은 모양 */
export function packPhoto(p) {
  const url = String(p.url ?? "");
  if (!url) return null;
  const thumb = p.thumb ? String(p.thumb) : "";
  if (thumb === thumbFromUrl(url)) return url;      // 규칙대로 — 주소만 적는다
  if (!thumb || thumb === url) return [url];        // 썸네일이 원본과 같다
  return [url, thumb];                              // 그 밖 — 둘 다 적는다
}

/** 작게 적은 모양 → {url, thumb} */
export function unpackPhoto(x) {
  if (typeof x === "string") return { url: x, thumb: thumbFromUrl(x) ?? x };
  if (Array.isArray(x)) return { url: x[0], thumb: x[1] ?? x[0] };
  // 옛 모양({url, thumb, name})도 그대로 읽는다 — 자료를 다시 받지 않아도 되게.
  return { url: x?.url, thumb: x?.thumb ?? x?.url };
}
