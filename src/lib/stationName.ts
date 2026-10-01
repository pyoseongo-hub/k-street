// 🚇 **역 이름을 손님 언어로** — 「종로5가역 1호선」 → 「Jongno 5(o)-ga Stn. Line 1 (종로5가역)」
//
// 사장님이 잡아 주신 3단계 중 셋째(docs/비오는날-계획.md): "지하철 코스로 만들기".
//
// 그전까지 **12개 언어 전부** 역 이름이 한국어로만 나왔다:
//     Gwangjang Market   Traditional market · Jongno-gu · **종로5가역 1호선** · 250 m away
// 영어 화면에 한글이 박혀 있으면 손님은 그게 역 이름인지 뭔지도 모른다.
//
// 자료: src/data/subway-stations.json (서울 열린데이터광장, 역 580곳 · 외국어 99%).
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 **한국어 이름을 괄호로 같이 둔다 — 이게 이 파일의 핵심이다.**
// ─────────────────────────────────────────────────────────────────────────
//   손님이 역무원에게 물어보거나 **안내판과 대조**해야 하기 때문이다.
//   「Jongno 5(o)-ga」만 적혀 있으면 한국 사람에게 보여 줄 수가 없다.
//   한식 메뉴 이름을 그대로 두는 것(「Donkkaseu」)과 **같은 이유**다.
//
// ⚠️ 대만(zh-TW)에는 **간체 이름을 그대로 쓴다.** 서울시가 번체를 따로 안 주기
//    때문이다. 영어로 떨어뜨리는 것보다는 읽힌다 — 안 주는 것을 지어내지 않는다.

import STATIONS from "../data/subway-stations.json";
// 🏙️ 「부산2호선」의 「부산」을 손님 말로 바꾸는 데 쓴다 — 아래 CITY_BY_KO 주석 참고.
import { CITIES, cityName } from "../data/cities";

interface Station {
  name: string;
  lines: string[];
  lat: number;
  lng: number;
  en?: string;
  zh?: string;
  ja?: string;
}

const 역 = (STATIONS as unknown as { 역?: Record<string, Station> })["역"] ?? {};

/**
 * 찾기용 열쇠 — 「역」을 떼고 괄호 속 부역명을 떼고 기호를 턴다.
 * ⚠️ **자료를 만든 스크립트(fetch-subway-stations.mjs)와 같은 규칙이어야 한다.**
 *    갈리면 여기서 만든 열쇠가 표에 없어서 **외국어 이름이 통째로 안 붙는다.**
 */
function key(name: string): string {
  return name
    .normalize("NFC")
    .replace(/\([^)]*\)/g, "")
    .replace(/역$/, "")
    .replace(/[^0-9A-Za-z가-힣]/g, "")
    .trim();
}

/**
 * 「Station」/「駅」/「站」 — 이름 뒤에 붙이는 말.
 *
 * 🚨 **일본어·중국어 말고는 전부 영어 「Station」이다.** 스페인어 Estación,
 *    프랑스어 Gare 로 옮기고 싶어지지만 **그러면 안 된다** —
 *    **서울 지하철 안내판에 영어로 「Jongno 5(o)-ga Station」이라고 적혀 있다.**
 *    이 줄의 쓸모는 손님이 **그 간판과 대조**하는 것이라, 간판에 없는 말을 쓰면
 *    오히려 못 찾는다. 예쁜 번역보다 **눈앞의 간판과 같은 글자**가 먼저다.
 *    (역 이름 자체도 같은 이유로 서울시가 정한 로마자 표기를 그대로 쓴다.)
 */
const STATION_WORD: Record<string, string> = { ja: "駅", zh: "站", "zh-TW": "站" };
const suffixFor = (lang: string) => STATION_WORD[lang] ?? " Station";

/** 「Line 1」/「1号線」 — 숫자 노선만. 이름 있는 노선(신분당선)은 한국어 그대로 둔다. */
const LINE: Record<string, (n: string) => string> = {
  en: (n) => `Line ${n}`,
  ja: (n) => `${n}号線`,
  zh: (n) => `${n}号线`,
  "zh-TW": (n) => `${n}號線`,
  vi: (n) => `Tuyến ${n}`,
  th: (n) => `สาย ${n}`,
  id: (n) => `Jalur ${n}`,
  es: (n) => `Línea ${n}`,
  fr: (n) => `Ligne ${n}`,
  de: (n) => `Linie ${n}`,
  ru: (n) => `Линия ${n}`,
};

/**
 * 저장된 「종로5가역 1호선」을 그 언어로.
 *
 * 🚨 **못 찾으면 원문을 그대로 돌려준다.** 빈칸으로 두지 않는다 —
 *    한글이라도 있는 편이 아무것도 없는 것보다 낫다(지도 앱에 붙여 넣을 수 있다).
 *
 * 📊 **재 봤다 (2026-09-12):** 우리가 쓰는 역 263곳 중 **262곳이 바뀌고 1곳이 남는다.**
 *    남는 것은 **자양역** — 서울시 자료(subwayStationMaster 784줄)에 그 역이 없다.
 *    우리 맞추는 법이 틀린 게 아니라 **원자료에 빠져 있다.** 언젠가 채워지면
 *    저절로 붙는다(이 파일은 표를 볼 뿐 이름을 적어 두지 않는다).
 */
export function stationLabel(stored: string, lang: string): string {
  if (lang === "ko") return stored;

  // 「종로5가역 1호선」 → 이름 / 노선
  const m = /^(.*?역)\s+(.+)$/.exec(stored.normalize("NFC"));
  const rawName = m?.[1] ?? stored;
  const rawLine = m?.[2] ?? "";

  const hit = 역[key(rawName)];
  // 🇹🇼 대만은 서울시가 번체를 안 줘서 간체를 쓴다(위 머리말 참고).
  const foreign =
    lang === "ja" ? hit?.ja : lang === "zh" || lang === "zh-TW" ? hit?.zh : hit?.en;
  // 🚇 **표에 없는 역 — 노선만이라도 그 언어로** (2026-10-01, 일곱 도시를 열면서).
  //
  //   이 표는 **서울시 자료**다(subway-stations.json). 그래서 부산·대구·대전·광주
  //   역은 한 줄도 없고, 그전에는 영어 화면에 「서면역 2호선」이 그대로 떴다.
  //
  //   손님이 실제로 쓰는 것은 **「몇 호선을 타야 하나」**다 — 그건 우리가 안다.
  //   역 이름은 한국어 그대로 두는 편이 **안내판·역무원과 대조하기 쉽다**
  //   (이 파일 머리말의 「한국어를 괄호로 같이 둔다」와 같은 이유다).
  //
  //   🚨 **로마자를 지어내지 않는다.** 「서면」을 번역기에 맡기면 「In writing」이
  //      나온다 — 뜻이 있는 낱말이기 때문이다. 틀린 영어 이름은 한글보다 나쁘다.
  //      부산교통공사가 공식 표기를 내놓으면 그때 표에 넣는다.
  if (!foreign) {
    const only = lineLabel(rawLine, lang);
    return rawLine && only !== rawLine ? `${rawName} ${only}` : stored;
  }

  // 「Seoul Station」처럼 이미 Station 이 든 이름에 또 붙이지 않는다.
  const suffix = suffixFor(lang);
  const name = foreign.endsWith(suffix.trim()) ? foreign : `${foreign}${suffix}`;

  const num = /^(\d{1,2})호선$/.exec(rawLine)?.[1];
  const line = num ? (LINE[lang] ?? LINE.en)(num) : rawLine;

  // 🚨 한국어 역 이름을 괄호로 같이 — 손님이 안내판·역무원에게 대조해야 한다.
  return `${name}${line ? ` ${line}` : ""} (${rawName})`;
}

/**
 * 🚇 **노선 이름만** 그 언어로 — 「1호선」 → 「Line 1」/「1号線」.
 *
 * 「비 오는 날」 화면이 호선별로 묶기 때문에 **역 없이 노선만** 부를 자리가 생겼다
 * (src/lib/rainyPlaces.ts). 위 `LINE` 표를 **그대로 쓴다** —
 * 표가 둘이 되면 한쪽만 고쳐 놓고 다른 쪽이 한국어로 남는다.
 *
 * ⚠️ 이름 있는 노선(신분당선·경의중앙선)은 **한국어 그대로** 돌려준다.
 *    서울시가 번역을 안 주고, **안 주는 것을 지어내지 않는다** — 안내판에도
 *    로마자로 「Sinbundang」이라 적혀 있어 한국어를 보여 주는 편이 대조하기 쉽다.
 */
/**
 * 🏙️ **「부산2호선」처럼 도시 이름이 붙은 노선** (2026-10-01, 아홉 도시를 열고 재 보니 나왔다).
 *
 * 카카오가 돌려주는 노선 이름은 서울만 「2호선」이고 나머지는 **도시가 앞에 붙는다** —
 * 부산1~4호선 · 대구1~3호선 · 대전1호선 · 광주1호선. 실제로 세어 보니 29가지 중 9가지다.
 * 그전 규칙(`^\d{1,2}호선$`)은 이들을 하나도 못 알아보고 **한국어 그대로 내보냈다.**
 *
 * 🚨 도시 이름을 **떼지 않는다.** 「Line 2」만 쓰면 어느 도시 2호선인지 사라진다 —
 *    부산에도 2호선이 있고 대구에도 있다. 명부(cities.ts)의 이름을 그대로 쓴다.
 *    ⚠️ 명부에 그 언어 이름이 없으면 cityName 이 로마자를 준다(「Daegu」). 지어내지 않는다.
 */
const CITY_BY_KO = new Map(CITIES.map((c) => [c.ko, c]));

export function lineLabel(line: string, lang: string): string {
  if (lang === "ko") return line;
  const m = /^([가-힣]*)(\d{1,2})호선$/.exec(line.normalize("NFC"));
  if (!m) return line;
  const [, koCity, num] = m;
  const num말 = (LINE[lang] ?? LINE.en)(num);
  if (!koCity) return num말;
  const city = CITY_BY_KO.get(koCity);
  // 명부에 없는 앞가지(새 노선 이름)는 **건드리지 않는다.** 모르면 한국어 그대로가 낫다.
  return city ? `${cityName(city, lang)} ${num말}` : line;
}

/**
 * 🚇 **역 이름만 짧게** 그 언어로 — 「서울역」 → 「Seoul」.
 *
 * 노선의 양 끝을 적는 줄(「Seoul → Cheongnyangni」)에 쓴다. 거기서는 「Station」도
 * 노선 이름도 군더더기다 — 두 이름만 보이면 방향이 읽힌다.
 *
 * 🚨 **못 찾으면 한국어를 그대로 돌려준다.** 빈칸으로 두지 않는다 —
 *    한글이라도 있으면 안내판과 대조할 수 있다.
 */
export function stationShort(korName: string, lang: string): string {
  if (lang === "ko") return korName;
  const hit = 역[key(korName)];
  const foreign = lang === "ja" ? hit?.ja : lang === "zh" || lang === "zh-TW" ? hit?.zh : hit?.en;
  if (!foreign) return korName;
  // 「Seoul Station」처럼 이미 Station 이 붙어 온 것은 뗀다 — 여기서는 이름만 쓴다.
  return foreign.replace(/\s*Station$/i, "").trim();
}

/**
 * 🔎 **검색에 넣을 역 이름** — 「여의나루역 5호선」 → 「여의나루역」.
 *
 * 왜 호선을 떼나 (2026-09-15) — 네이버 검색으로 그 역 화면을 여는데, 호선까지
 * 붙이면 검색어가 흐려진다. 사장님이 캡처로 보여 주신 것도 「건대역」 한 낱말이었다.
 *
 * ⚠️ 우리 자료는 **호선이 섞여 있어야 한다** — 환승역은 호선마다 출구도 시설도
 *    다르고, 손님이 안내판과 대조할 때도 호선이 필요하다(이 파일 머리말).
 *    그래서 **자료는 그대로 두고 검색어만 줄인다.**
 *
 * 🚨 자르는 자리는 **첫 빈칸**이다. 180개를 세어 보니 전부 빈칸이 하나뿐이었고,
 *    「서울역 GTX-A」·「서울역 공항철도」처럼 뒤가 「…선」이 아닌 것도 둘 있어서
 *    「…선으로 끝나면 뗀다」는 규칙으로는 안 떨어진다.
 */
export function stationBareName(korName: string): string {
  const head = korName.normalize("NFC").trim().split(/\s+/)[0];
  // 첫 토막이 역 이름이 아닌 이상한 자료가 오면 원래 것을 그대로 쓴다 — 빈 검색보다 낫다.
  return head.endsWith("역") ? head : korName;
}
