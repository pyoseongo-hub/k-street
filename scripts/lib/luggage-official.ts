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

/** 공식 페이지에서 받은 날. 화면에 그대로 띄운다. */
export const OFFICIAL_CHECKED = "2026-09-10";

/** 서울교통공사 또타러기지 안내(공식). ⚠️ https 는 인증서가 깨져 있어 http 다. */
export const OFFICIAL_PAGE = "http://www.seoulmetro.co.kr/kr/page.do?menuIdx=895";

/**
 * 예약·안내 사이트. **영어·중국어·일본어 페이지가 따로 있다** —
 * 우리 손님 대부분이 한국어를 못 읽으므로 이게 중요하다.
 */
export const BOOKING_SITE = "https://www.tluggage.co.kr/";
export const BOOKING_SITE_BY_LANG: Record<string, string> = {
  ko: "https://www.tluggage.co.kr/",
  en: "https://www.tluggage.co.kr/eng",
  zh: "https://www.tluggage.co.kr/chi",
  "zh-TW": "https://www.tluggage.co.kr/chi",
  ja: "https://www.tluggage.co.kr/jap",
};

export interface OfficialBranch {
  /** 지하철 호선 */
  line: string;
  /** 역 이름 (한국어 그대로 — 택시 기사에게 보여 줄 수 있어야 한다) */
  station: string;
  /** 층 */
  floor: string;
  /** 출구. 「I-센터」처럼 출구 번호가 아닌 곳도 있어 글로 받는다. */
  exit: string;
}

/**
 * 공식 페이지의 「또타러기지 조성 현황」 표를 그대로 옮긴 것.
 * ⚠️ 손으로 옮긴 자리다 — 다음에 고칠 때는 **공식 페이지를 다시 읽고** 대조할 것.
 *    Actions → 「Read page」 에 위 OFFICIAL_PAGE 를 넣고
 *    find 에 「이용요금(보관서비스)」, before 에 3500 을 주면 이 표가 나온다.
 */
export const OFFICIAL_BRANCHES: OfficialBranch[] = [
  { line: "1", station: "서울역", floor: "B1", exit: "1" },
  { line: "2", station: "홍대입구역", floor: "B1", exit: "3,4" },
  { line: "2", station: "잠실역", floor: "B1", exit: "3,4" },
  { line: "4", station: "명동역", floor: "B1", exit: "9,10" },
  { line: "5", station: "김포공항역", floor: "B1", exit: "I-센터" },
  { line: "5", station: "종로3가역", floor: "B1", exit: "6" },
];

/** 공식 요금 (보관서비스). 기본 4시간, 이후 시간당 추가. */
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

/** 기본 시간(시간) · 추가 요금(원/시간) · 운영시간. 전부 공식 페이지에 적힌 그대로. */
export const OFFICIAL_BASE_HOURS = 4;
export const OFFICIAL_EXTRA_PER_HOUR = 1000;
export const OFFICIAL_OPEN = "09:00";
export const OFFICIAL_CLOSE = "22:00";
