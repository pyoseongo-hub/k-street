// 🔗 곳 하나를 친구에게 보내는 링크.
//
// 왜 만들었나 (2026-09-06) — 홍보 길을 훑다가 **가장 싼 홍보가 빠져 있는 것**을
// 찾았다. 손님이 친구에게 보내는 것인데, 앱에 `navigator.share` 도 「링크 복사」도
// 한 줄도 없었다. 밖에서 사람을 데려와도 **안에서 퍼져 나갈 구멍이 없었다.**
//
// 🚨 보내는 주소는 **앱 첫 화면이 아니라 그 곳의 페이지**다.
//    `korea-street.com/place/<슬러그>/` — 받은 사람이 앱을 안 깔아도,
//    자바스크립트가 안 돌아도 **그 곳의 이름·주소·사진이 그대로 보인다.**
//    첫 화면 주소를 보내면 받은 사람이 그 곳을 다시 찾아야 한다 — 대부분 안 찾는다.
//
// ⚠️ 슬러그는 `src/data/place-slugs.json` 에 **id 를 열쇠로** 고정돼 있다.
//    이름이 바뀌어도 주소는 안 바뀐다(남이 걸어 둔 링크가 안 깨지게).
//    그래서 여기서도 이름이 아니라 **id** 로 찾는다.
import SLUGS from "../data/place-slugs.json";

const SITE = "https://korea-street.com";

/**
 * 🏠 앱 자체의 주소 (2026-09-06 사장님 지적: "우리 앱을 링크 공유가없네").
 *
 * 곳 하나를 보내는 것과 **쓰임이 다르다** —
 * · 곳 링크 = "여기 가 봐" (이미 한 곳을 정한 사람)
 * · 앱 링크 = "이거 써 봐" (아직 뭘 볼지 모르는 사람)
 * 홍보로 퍼지는 건 대개 뒤쪽이다. 앞엣것만 있으면 **앱을 통째로 소개할 방법이 없다.**
 *
 * 끝의 `/` 를 뺴지 않는다 — GitHub Pages 는 그 한 글자로 리다이렉트를 한 번 더 탄다.
 * 미리보기 카드(제목·설명·사진)는 index.html 의 og:* 가 만들어 주므로 여기서 안 만든다.
 */
export const APP_URL = `${SITE}/`;

const slugMap = SLUGS as Record<string, string>;

/** 그 곳의 공개 주소. 슬러그가 없으면(아직 페이지가 안 만들어진 곳) null. */
export function placeUrl(id: string | undefined): string | null {
  if (!id) return null;
  const slug = slugMap[id];
  return slug ? `${SITE}/place/${slug}/` : null;
}

export type ShareResult = "shared" | "copied" | "failed";

/**
 * 폰이면 기본 공유창(카톡·문자·인스타…)을 열고, 안 되면 링크를 복사한다.
 *
 * ⚠️ `navigator.share` 는 **사람이 누른 그 순간에만** 열린다(브라우저 규칙).
 *    await 를 앞에 끼워 넣으면 "사용자 동작이 아니다"라며 거절당하므로,
 *    이 함수 안에서 다른 걸 기다리지 않는다.
 * ⚠️ 사용자가 공유창을 그냥 닫으면 AbortError 가 난다 — 그건 **실패가 아니다.**
 *    실패로 처리하면 "복사됨" 이 떠서 손님이 헷갈린다.
 */
export async function shareUrl(title: string, url: string): Promise<ShareResult> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };

  if (typeof nav.share === "function") {
    try {
      await nav.share({ title, url });
      return "shared";
    } catch (e) {
      // 사용자가 닫은 것 — 아무 것도 안 한 것으로 둔다.
      if (e instanceof Error && e.name === "AbortError") return "shared";
      // 그 외(권한·미지원)는 복사로 넘어간다.
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

/** 곳 하나를 보낸다 — 보내는 주소는 그 곳의 페이지. */
export function sharePlace(name: string, url: string): Promise<ShareResult> {
  return shareUrl(name, url);
}

/** 앱을 통째로 보낸다 — 첫 화면 주소. 이름은 언어와 상관없이 늘 K-Street 다. */
export function shareApp(): Promise<ShareResult> {
  return shareUrl("K-Street", APP_URL);
}
