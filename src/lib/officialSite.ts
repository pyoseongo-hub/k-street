// 「이 주소를 '공식 창구'로 내보내도 되는가」를 정하는 **한 개의 잣대**.
//
// 🚨 잣대가 둘이면 반쪽만 적용된다. 그래서 이 파일 하나만 두고
//    자료 쪽(tourPlaces.ts)과 화면 쪽(mapLinks.ts)이 같은 함수를 쓴다.
//    한쪽만 고치면 "목록에서는 걸렀는데 카드에서는 그대로 뜨는" 사고가 난다.
//
// 무엇을 거르나 — **블로그·SNS**.
// 관광공사 홈페이지 칸에 블로그·인스타가 적힌 축제가 있다(2026-09-04 기준 34곳 중 2곳:
// 구로청소년축제=네이버 블로그, 로맨틱 한강 크리스마스 마켓=인스타그램).
// 주최 쪽이 직접 적어 둔 건 맞지만, 이 앱에서 **OFFICIAL 딱지를 붙여 내보내는 것**은
// 다른 문제다:
//
// · 계정이 사라지거나 이름이 바뀌면 링크가 통째로 죽는다.
// · 광고·협찬 글과 공지가 한 자리에 섞여 나온다 — "광고를 걸러낸 자료"라는
//   이 앱의 존재 이유와 정면으로 부딪힌다.
// · 손님이 볼 때 인스타 계정과 공식 홈페이지는 무게가 다르다.
//
// 걸러도 손해가 아니다 — 공식 주소가 없으면 이름을 눌렀을 때 **네이버 검색**으로
// 가는데(mapLinks.ts), 네이버 축제정보 카드에는 올해 날짜가 같은 자리에 뜬다.
// 오히려 지난 회차에 멈춰 있는 홈페이지보다 나을 때가 많다.
//
// ⚠️ 자료 자체는 지우지 않는다. festival-dates.json에는 그대로 남겨 둬야
//    다음 실행이 같은 곳을 또 물어보지 않는다(undefined/null/문자열 세 가지 구분).
//    여기서는 **쓸지 말지만** 정한다.

const NOT_OFFICIAL_HOST =
  /^(blog\.naver\.com|m\.blog\.naver\.com|cafe\.naver\.com|m\.cafe\.naver\.com|blog\.daum\.net|[\w-]+\.tistory\.com|instagram\.com|facebook\.com|m\.facebook\.com|youtube\.com|youtu\.be|band\.us|twitter\.com|x\.com|tiktok\.com|naver\.me|linktr\.ee)$/i;

export function isOfficialSite(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return !NOT_OFFICIAL_HOST.test(host);
  } catch {
    // 주소 모양이 아니면 안 쓴다 — 눌렀을 때 아무 데도 못 가는 링크보다 없는 쪽이 낫다.
    return false;
  }
}
