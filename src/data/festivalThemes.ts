// 축제를 '테마'로 가른다 (사용자 지시 2026-09-01: "계절별 월별 테마 추천").
//
// 지금까지 축제를 고르는 길은 계절과 달, 둘뿐이었다. 그런데 "10월 서울"에 31곳이
// 몰려 있어서, 달만으로는 고를 수가 없다. 불꽃놀이를 보러 온 사람과 김장을 보러 온
// 사람에게 같은 31줄을 주는 셈이다.
//
// 🚨 이름에 **확실히 드러난 것만** 붙이고, 애매하면 비워 둔다.
// (CLAUDE.md 정확도 원칙 — 빈 칸이 틀린 정보보다 낫다.) 테마가 없는 축제는
// '전체'에서는 그대로 보이고, 테마 칩을 눌렀을 때만 빠진다. 그러니 빈 칸의 대가는
// "덜 보인다"뿐이고, 잘못 붙인 대가는 "엉뚱한 걸 보러 간다"이다. 무게가 다르다.
//
// 규칙은 fetch-tour-places.mjs의 장르 분류와 같은 방식이다 — 위에서부터 훑어
// **처음 걸리는 하나**만 준다. 그래서 **차례가 뜻을 정한다**:
//  · 먹거리를 역사보다 앞에 둔 이유 — "가락옥토버페스트 미식야행"의 '야행'이
//    역사 규칙(정동야행·국가유산 야행)에 먼저 걸려 버린다.
//  · 음악을 거리보다 앞에 둔 이유 — "댄싱노원 거리페스티벌"은 춤 축제다.

export type FestivalTheme = "food" | "light" | "music" | "nature" | "history" | "street";

export const FESTIVAL_THEMES: FestivalTheme[] = [
  "nature",
  "light",
  "music",
  "food",
  "history",
  "street",
];

export const THEME_ICON: Record<FestivalTheme, string> = {
  nature: "🌸",
  light: "🎆",
  music: "🎵",
  food: "🍢",
  history: "🏛️",
  street: "🏘️",
};

/** 위에서부터 처음 걸리는 하나. 차례를 바꾸면 결과가 바뀐다(위 주석 참고). */
const RULES: { theme: FestivalTheme; re: RegExp }[] = [
  // '야행'이 역사 규칙에 먼저 걸리지 않게 맨 앞.
  { theme: "food", re: /(음식|미식|고메|맛|술\s?대?축제|우리술|김장|막걸리|옥토버페스트|사과|먹거리|푸드)/ },
  // '별빛산책'이 자연 규칙(산책)에 걸리지 않게 자연보다 앞.
  { theme: "light", re: /(불꽃|빛|연등|등불|라이트|미디어)/ },
  { theme: "music", re: /(뮤직|JAZZ|재즈|음악|무용|춤|댄스|댄싱|발레|국악|콘서트)/i },
  { theme: "nature", re: /(꽃|벚꽃|장미|억새|단풍|숲길|나무|메타세쿼이아|트레킹|폭포|공원|호수)/ },
  { theme: "history", re: /(문화제|국가유산|세계유산|왕릉|한옥|한복|한글|궁|백제|선사|대보름|설맞이|야행|전통|허준|강감찬)/ },
  { theme: "street", re: /(거리|골목|마을|누리|주민|동네|스트릿|지구촌|시장|마켓)/ },
];

/** 못 고르면 null — 지어내지 않는다. */
export function themeOf(name: string): FestivalTheme | null {
  const n = name.normalize("NFC");
  return RULES.find((r) => r.re.test(n))?.theme ?? null;
}
