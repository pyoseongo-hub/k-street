// 🚇 **또타러기지 (T-Luggage) — 서울교통공사가 역 안에서 하는 짐 보관.**
//
// 2026-09-10, 사장님이 찾아 주셨다. 내가 두 번 헛짚은 자리다 —
// 1차에서 「또타라커」라는 이름으로 짐작해 도메인을 적었는데 **없는 주소**였고,
// 서울교통공사 사이트는 https 인증서가 깨져 있어 러너에서도 못 열었다.
// 사장님이 http 주소를 주셔서 그제야 읽었다.
//
// 🔑 **왜 이게 다른 곳과 다른가 — 여기만 값과 시간을 적는다.**
//   · 서울교통공사(공공기관)가 직접 운영한다. 약관에 「서울도시철도ENG」로 적혀 있다
//   · 요금·운영시간·지점을 **공식 페이지에 스스로 공개**한다. 근거 등급이 가장 높다
//   · 그래서 사장님 결정(2026-09-10): "공공 서비스만 적는다"
//   · 사설 20곳은 여전히 값도 시간도 안 적는다. 그 잣대는 그대로다
//
// ⚠️ 그래도 **바뀔 수 있다.** 화면에 「받은 날」과 공식 페이지 링크를 항상 같이 띄운다.
//
// 📍 **여기에 「몇 번 출구」가 있다.** 사장님이 처음 말씀하신 바로 그것이다 —
//    "지하철이면 몇 번 출구라던가 설명 있을 줄 알았지".
//    카카오 지역검색에는 없던 값이고, 공식 페이지에만 있다.

/** 공식 페이지에서 받은 날. 원본은 앱 쪽에 있다. */
export { OFFICIAL_CHECKED } from "../../src/lib/luggageFacts";

/** 서울교통공사 또타러기지 안내(공식). 원본은 앱 쪽에 있다. */
export { OFFICIAL_PAGE } from "../../src/lib/luggageFacts";

/**
 * 예약·안내 사이트. **영어·중국어·일본어 페이지가 따로 있다** —
 * 우리 손님 대부분이 한국어를 못 읽으므로 이게 중요하다.
 */
export { BOOKING_SITE, BOOKING_SITE_BY_LANG } from "../../src/lib/luggageFacts";

// 🧳 지점 여섯 곳은 **앱과 같은 자료를 쓴다**(src/lib/luggageFacts.ts).
//    2026-09-11 에 옮겼다 — 같은 표를 두 파일에 적어 두면 언젠가 어긋난다.
//    (「잣대가 둘이면 반쪽 적용이 생긴다」 — 이 저장소가 이미 겪은 사고다.)
export { OFFICIAL_BRANCHES, type LuggageBranch as OfficialBranch } from "../../src/lib/luggageFacts";

// 💰 요금·시간도 **앱과 같은 자료를 쓴다**(src/lib/luggageFacts.ts).
export {
  OFFICIAL_PRICES,
  type OfficialPrice,
  OFFICIAL_BASE_HOURS,
  OFFICIAL_EXTRA_PER_HOUR,
  OFFICIAL_OPEN,
  OFFICIAL_CLOSE,
} from "../../src/lib/luggageFacts";

// ─────────────────────────────────────────────────────────────────────
// 🔒 **또타라커 (T-Locker) — 역 안의 무인 물품보관함.**
//
// 2026-09-10, 사장님이 두 번째로 찾아 주셨다(menuIdx=897).
// 또타러기지(사람이 받아 주는 6곳)와 **다른 것**이다. 이건 코인로커 쪽이고
// **273개 역**에 있다 — 사실상 손님이 어느 역에 있든 쓸 수 있다는 뜻이다.
//
// 💡 여기 **칸 크기가 cm 로** 적혀 있다. 이게 중요한 이유는,
//    우리 페이지가 「내 캐리어가 실제로 들어가나요?」를 물어보라고만 하고
//    **답을 못 주고 있었기** 때문이다. 이제 답을 준다.
//
// ⚠️ 운영시간이 또타러기지와 다르다 — 이쪽이 05~24시로 훨씬 길다.
//    둘을 섞어 적으면 손님이 밤 11시에 닫힌 문 앞에 선다.
// ─────────────────────────────────────────────────────────────────────

/** 또타라커 안내(공식). ⚠️ https 인증서가 깨져 있어 http 다. */
export const LOCKER_PAGE = "http://www.seoulmetro.co.kr/kr/page.do?menuIdx=897";

/** 얼마나 깔려 있나 — 공식 페이지의 「또타라커 운영현황」 그대로. */
export const LOCKER_STATIONS = 273;
export const LOCKER_SITES = 336;
export const LOCKER_CELLS = 5557;

export interface LockerSize {
  /** S · M · L */
  code: string;
  /** 가로 cm */
  w: number;
  /** 세로 cm */
  d: number;
  /** 높이 cm */
  h: number;
  weekday: number;
  weekend: number;
  /** 시간당 추가 */
  extra: number;
}

/** 기본 4시간 요금 + 시간당 추가. 공식 페이지의 「또타라커 요금안내」 그대로. */
export const LOCKER_SIZES: LockerSize[] = [
  { code: "S", w: 50, d: 30, h: 60, weekday: 2200, weekend: 3100, extra: 500 },
  { code: "M", w: 50, d: 45, h: 60, weekday: 3300, weekend: 4600, extra: 800 },
  { code: "L", w: 50, d: 90, h: 60, weekday: 4400, weekend: 6100, extra: 1000 },
];

export const LOCKER_BASE_HOURS = 4;
export const LOCKER_OPEN = "05:00";
export const LOCKER_CLOSE = "24:00";
/** 「평일·주말 및 공휴일」 — 쉬는 날이 없다. */
export const LOCKER_EVERY_DAY = true;
/** 🚨 한 달 지나면 임의로 기증·폐기된다. 손님이 꼭 알아야 하는 사실이다. */
export const LOCKER_MAX_DAYS = 30;

// ─────────────────────────────────────────────────────────────────────
// 📱 **또타라커 앱** (2026-09-10)
//
// 사장님: "맵에는 지하철역 누르면 남은 락커 숫자까지 나오는데"
//
// 🚨 그 숫자는 **우리가 옮겨 적으면 안 된다.** 5분 뒤면 틀린다.
//    틀린 값이 얼마나 나쁜지는 이 저장소가 이미 안다(메뉴판 6장 중 5장이 틀렸다).
//    보관함은 더 나쁘다 — 빈 칸이 없는 역에 캐리어를 끌고 가게 된다.
//    **살아 있는 숫자는 살아 있는 곳에서 본다.** 우리는 그 자리를 가리키기만 한다.
//    사장님 말씀과도 같은 방향이다: "어플로 해야 안정감 신뢰가 가지 않을까"
//
// 🔎 주소를 어떻게 찾았나 (세 번 헛짚고 나서):
//    「또타라커」로만 검색하면 엉뚱한 앱이 나온다. 실제 이름이 **「T locker」로 시작**한다.
//    그런데 검색 결과 원문에는 남의 앱 주소 20개만 있고 이 앱 주소가 없었다 —
//    내 링크 줍는 코드가 「글자 30자 이하」만 담았는데 이 카드는 제목·회사·설명이
//    한 링크 안에 들어 있어 빠져나갔다. 원문을 정규식으로 직접 떠서 찾았다:
//      <a href="/store/apps/details?id=io.mobinity.locker" aria-label="T locker 또타라커 …">
//    ⚠️ 회사 이름처럼 안 보인다고 지나치면 안 된다. 실제로 한 번 지나쳤다.
// ⚠️ 두 주소 모두 **열어서 이름을 확인했다.** 아이폰 쪽 제작사가
//    「Seoul Metropolitan Rapid Transit Engineering」(서울도시철도엔지니어링)로 나온다.
export const LOCKER_APP_ANDROID = "https://play.google.com/store/apps/details?id=io.mobinity.locker";
export const LOCKER_APP_IPHONE = "https://apps.apple.com/kr/app/id1503291383";
