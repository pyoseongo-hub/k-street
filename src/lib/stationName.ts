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
  if (!foreign) return stored;

  // 「Seoul Station」처럼 이미 Station 이 든 이름에 또 붙이지 않는다.
  const suffix = suffixFor(lang);
  const name = foreign.endsWith(suffix.trim()) ? foreign : `${foreign}${suffix}`;

  const num = /^(\d{1,2})호선$/.exec(rawLine)?.[1];
  const line = num ? (LINE[lang] ?? LINE.en)(num) : rawLine;

  // 🚨 한국어 역 이름을 괄호로 같이 — 손님이 안내판·역무원에게 대조해야 한다.
  return `${name}${line ? ` ${line}` : ""} (${rawName})`;
}
