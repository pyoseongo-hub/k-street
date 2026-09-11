// 🔒 **또타라커에 대해 앱이 아는 것 — 딱 두 줄.** (2026-09-10)
//
// 사장님: "공식 페이지 링크 주고 역까지만 / 너무 많은 걸 할 수 없어"
//
// 그래서 앱은 **역까지만 안내하고, 나머지는 공식 페이지로 보낸다.**
// 요금표·칸 크기·앱 주소는 검색용 낱장(scripts/lib/luggage-official.ts)에만 둔다 —
// 거기는 글을 길게 실어도 되는 자리고, 카드는 아니다.
//
// 🚨 빈 칸 수는 어느 쪽에도 적지 않는다. 실시간 값이라 옮기는 순간 틀린다.

/** 또타라커 공식 안내. ⚠️ https 인증서가 깨져 있어 http 다(서울교통공사). */
export const LOCKER_PAGE = "http://www.seoulmetro.co.kr/kr/page.do?menuIdx=897";

/** 이 주소를 마지막으로 열어 본 날. */
export const LOCKER_CHECKED = "2026-09-10";

// ─────────────────────────────────────────────────────────────────────
// 🧳 **또타러기지 — 사람이 받아 주는 보관소 6곳** (2026-09-11)
//
// 사장님: "서울시 교통공사는 따로 카드해서 버튼 만들어줘 / 6군데 버튼 만들어"
//
// 근거: 서울교통공사 공식 페이지(menuIdx=895)의 「호선 · 역명 · 위치」 표.
//   사장님이 그 표를 화면으로 보내 주셔서 **글자 하나까지 대조**했다.
//
// ⚠️ 여기가 **원본이다.** 검색용 낱장(scripts/lib/luggage-official.ts)은 이걸 가져다 쓴다.
//    같은 사실을 두 군데에 적으면 언젠가 어긋난다.
// ⚠️ 출구가 **숫자가 아닌 곳이 있다** — 김포공항역은 「I-센터」다.
//    무조건 "번 출구"를 붙였다가 「I-센터번 출구 방면」이 나온 적이 있다.

export interface LuggageBranch {
  /** 호선. 카카오에서 역을 찾을 때도 쓴다 — 「서울역」만으로는 GTX-A 가 잡힌다 */
  line: string;
  /** 역 이름. **한국어 그대로** — 손님이 역 표지판에서 그 글자를 찾는다 */
  station: string;
  /** 층 (전부 B1) */
  floor: string;
  /** 「1」 · 「3,4」 · 「I-센터」 */
  exit: string;
}

export const OFFICIAL_BRANCHES: LuggageBranch[] = [
  { line: "1", station: "서울역", floor: "B1", exit: "1" },
  { line: "2", station: "홍대입구역", floor: "B1", exit: "3,4" },
  { line: "2", station: "잠실역", floor: "B1", exit: "3,4" },
  { line: "4", station: "명동역", floor: "B1", exit: "9,10" },
  { line: "5", station: "김포공항역", floor: "B1", exit: "I-센터" },
  { line: "5", station: "종로3가역", floor: "B1", exit: "6" },
];

/** 또타러기지 안내(공식). ⚠️ https 인증서가 깨져 있어 http 다. */
export const OFFICIAL_PAGE = "http://www.seoulmetro.co.kr/kr/page.do?menuIdx=895";

/** 예약·안내 사이트. **영어·중국어·일본어 페이지가 따로 있다** — 손님 대부분이 한국어를 못 읽는다. */
export const BOOKING_SITE = "https://www.tluggage.co.kr/";
export const BOOKING_SITE_BY_LANG: Record<string, string> = {
  ko: "https://www.tluggage.co.kr/",
  en: "https://www.tluggage.co.kr/eng",
  zh: "https://www.tluggage.co.kr/chi",
  "zh-TW": "https://www.tluggage.co.kr/chi",
  ja: "https://www.tluggage.co.kr/jap",
};

/**
 * 또타러기지 요금 (보관서비스). 공식 페이지의 「이용요금(보관서비스)」 표 그대로.
 * 🚨 **가방 크기가 인치다** — 또타라커(무인함)는 cm 다. 둘을 섞으면 안 된다.
 * ⚠️ 2026-09-11 사장님이 화면으로 그 표를 보내 주셔서 네 줄을 다시 대조했다.
 */
export interface OfficialPrice {
  /** 가방 크기 (인치) */
  size: string;
  weekday: number;
  weekend: number;
}

export const OFFICIAL_PRICES: OfficialPrice[] = [
  { size: 'S (~20")', weekday: 3000, weekend: 4000 },
  { size: 'M (20~23")', weekday: 4000, weekend: 6000 },
  { size: 'L (23~27")', weekday: 6000, weekend: 9000 },
  { size: 'XL (27"~)', weekday: 9000, weekend: 13000 },
];

/** 기본 시간 · 시간당 추가(주중·주말 같음) · 운영시간. 전부 공식 페이지 그대로. */
export const OFFICIAL_BASE_HOURS = 4;
export const OFFICIAL_EXTRA_PER_HOUR = 1000;
/** ⚠️ 또타라커(05~24시)와 **다르다.** 섞어 적으면 손님이 밤에 닫힌 창구 앞에 선다. */
export const OFFICIAL_OPEN = "09:00";
export const OFFICIAL_CLOSE = "22:00";
/** 이 값들을 공식 페이지에서 확인한 날. 화면에 함께 띄운다. */
export const OFFICIAL_CHECKED = "2026-09-11";
