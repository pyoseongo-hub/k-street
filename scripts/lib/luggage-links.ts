// 🔗 **짐 보관 안내에 넣는 바깥 링크 — 전부 실제로 두드려 본 것만.**
//
// 2026-09-10에 러너(scripts/check-guide-links.mjs)로 후보 12개를 두드렸다.
// **내가 기억으로 적은 주소 3개가 전부 틀렸다:**
//
//   ❌ t-locker.co.kr      ENOTFOUND — 그런 도메인이 없다
//   ❌ citylocker.co.kr    ENOTFOUND — 없다
//   ❌ seoulmetro.co.kr    인증서 오류(브라우저에서도 경고가 뜬다)
//
// 안 두드려 봤으면 **지하철 보관함을 찾는 손님을 없는 주소로 보낼 뻔했다.**
// 그래서 여기 있는 것은 전부 200 이 뜨고 **제목까지 확인한 것**이다.
// 새 링크를 넣으려면 반드시 그 스크립트를 먼저 돌린다.
//
// ⚠️ 코레일(letskorail.com)은 korail.com 으로 튕기는데 **제목이 비어** 있었다
//    (자바스크립트로 그리는 듯). 맞는 페이지인지 확인이 안 돼 **넣지 않았다.**
import type { Language } from "../../src/lib/translations";

export interface LuggageLink {
  label: string;
  url: string;
}

/** 링크를 마지막으로 두드려 본 날. 화면에 그대로 띄운다. */
export const LINKS_CHECKED = "2026-09-10";

/**
 * 공식(공공) 안내. **언어별로 갈라 준다** — 한국어를 못 읽는 손님에게
 * 한국어 사이트를 주면 거기서 끝난다.
 *
 * 🚨 확인한 것은 한국어판과 영어판뿐이다. 다른 언어에도 다국어 사이트가
 *    있을 수 있지만 **두드려 보지 않았으므로 영어판을 준다.**
 *    (없는 주소를 주는 것보다 읽을 수 있는 영어를 주는 편이 낫다.)
 */
export function officialLinks(lang: Language): LuggageLink[] {
  if (lang === "ko")
    return [
      { label: "비지트서울 — 서울 공식 관광정보", url: "https://korean.visitseoul.net/" },
      { label: "대한민국 구석구석 — 한국관광공사", url: "https://korean.visitkorea.or.kr/" },
    ];
  return [
    { label: "Visit Seoul — the city's official travel guide", url: "https://english.visitseoul.net/" },
    { label: "VisitKorea — Korea Tourism Organization", url: "https://english.visitkorea.or.kr/" },
  ];
}

/** 공항. 짐을 맡기는 자리이자 배송을 맡기는 자리라 따로 둔다. */
export const AIRPORT_LINKS: LuggageLink[] = [
  { label: "Incheon Airport", url: "https://www.airport.kr/" },
  { label: "Gimpo Airport", url: "https://www.airport.co.kr/gimpo/" },
];

/**
 * 🚨 **사설 예약 서비스.**
 *
 * 사장님 지시(2026-09-10): "사설 안내까지는 하고 안내문 넣어" ·
 * "결제나 그런거에 우리가 관여하여서는 안되 특히 사설 창고 같은경우".
 *
 * 그래서 이렇게 한다:
 *   · **제휴 추적코드를 붙이지 않는다.** 수수료를 받지 않는다
 *   · 순위를 매기지 않는다 — **가나다·알파벳 순으로만** 둔다
 *   · 공식과 **눈에 띄게 갈라서** 보여 주고, 바로 아래 안내문을 붙인다
 *   · 우리가 써 보지 않았다는 것을 그 안내문에 분명히 적는다
 *     (영어가 되는지, 카드가 되는지, 문제 생기면 어떻게 되는지 우리는 모른다)
 *
 * 여기 두 곳은 **주소가 살아 있다는 것만** 확인했다. 서비스 품질은 확인 대상이 아니다.
 */
export const BOOKED_SERVICES: LuggageLink[] = [
  { label: "Bounce", url: "https://usebounce.com/" },
  { label: "Radical Storage", url: "https://radicalstorage.com/" },
];
