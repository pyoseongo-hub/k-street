import { DISTRICT_NAME_EN } from "../data/districtNamesEn";

// 🔗 **주소로 도시·구를 받는다** — `korea-street.com/?city=seoul&gu=jung-gu` (2026-10-02).
//
// 사장님 지시: *"korea-street.com 홈이 주소로 구를 받게 해 줘."*
//
// ── 왜 ───────────────────────────────────────────────────────────────────
//   Kfood 가 「이 근처 산책로·시장 둘러보기」로 손님을 보낸다. 그전에는 미리
//   만들어 둔 **낱장 페이지**(`/seoul/jung-gu/`)로 보냈는데, 그건 검색 엔진과
//   링크를 위한 자리라 **앱이 아니다** — 손님은 지도도 거리순도 못 쓴다.
//   홈이 구를 받을 수 있으면 **앱 그대로** 그 동네에서 시작할 수 있다.
//
// ── 🔑 조각(slug) → 한국어 구 이름 ───────────────────────────────────────
//   `DISTRICT_NAME_EN` 을 소문자로 맞춰 거꾸로 찾는다 (중구 → Jung-gu → jung-gu).
//   표를 따로 만들지 않는다 — **같은 표가 둘이면 한쪽만 고치게 된다**(이 저장소의 오랜 교훈).
//   🪪 102칸을 거꾸로 돌려 **겹치는 조각이 하나도 없는 것**을 세어 보고 정했다.
//
// ── 🏙️ 도시가 왜 같이 필요한가 ───────────────────────────────────────────
//   「중구」는 **서울에도 부산에도 있다.** 게다가 홈은 마지막으로 본 도시를
//   기억한다(useCity). 부산을 보던 손님이 서울 중구 링크로 들어오면, 도시를
//   안 맞추는 한 **부산 중구**가 열린다. 그래서 도시를 먼저 맞춘다.
//
// ── 🚨 모르는 값이면 **아무 일도 안 일어난다** ──────────────────────────
//   없는 도시·없는 구·빈 값은 전부 `null` 이 되어, 구가 안 골라진 지금 홈 그대로다.
//   손님이 주소를 손으로 고쳐도 빈 화면이 나오지 않아야 한다.
//
// ⚠️ **한 번만 읽는다.** 이건 「시작할 때」 값이지 앱이 도는 내내 보는 값이 아니다.
//    손님이 앱 안에서 구를 바꾸면 주소는 그대로인데, 그때마다 다시 읽으면
//    손님이 고른 것을 주소가 되돌려 버린다.
// ⚠️ 창이 없는 데서도 죽지 않는다 — 곳 페이지를 만드는 스크립트는 React 트리도
//    `window` 도 없이 이 파일을 불러갈 수 있다(useCity.tsx 머리말과 같은 이유).

interface StartParams {
  /** cities.ts 의 열쇠 (`seoul`·`busan`…). 못 알아보면 null. */
  city: string | null;
  /** **한국어** 구 이름 (`중구`). 못 알아보면 null. */
  gu: string | null;
}

function readStartParams(): StartParams {
  if (typeof window === "undefined") return { city: null, gu: null };
  let q: URLSearchParams;
  try {
    q = new URLSearchParams(window.location.search);
  } catch {
    return { city: null, gu: null }; // 주소가 이상해도 홈은 열려야 한다
  }
  const city = (q.get("city") ?? "").trim().toLowerCase() || null;

  const slug = (q.get("gu") ?? "").trim().toLowerCase();
  let gu: string | null = null;
  if (slug) {
    for (const [ko, en] of Object.entries(DISTRICT_NAME_EN)) {
      if (en.toLowerCase() === slug) {
        gu = ko;
        break;
      }
    }
  }
  return { city, gu };
}

/** 앱이 처음 열릴 때의 주소에서 읽은 값. 한 번만 읽는다(위 머리말). */
export const START: StartParams = readStartParams();
