// 🀄 **한자권 이름이 「이름」인가, 아니면 구글이 뜻으로 옮긴 낱말인가.**
//
// 사장님께 보이는 자리는 한 곳이지만, 이 잣대를 쓰는 곳은 둘이다 —
//   · scripts/translate-places.mjs  — 저장할 때 **걷어낸다**
//   · scripts/check-cjk-names.mjs   — 푸시할 때 **그물로 받는다**
// 그래서 **한 파일에 둔다.** 잣대가 둘이면 반쪽만 적용되는 날이 온다.
//
// ── 무슨 일이 일어나나 ────────────────────────────────────────────────────
//   구글은 한국 이름을 소리로 옮기다가, **소리가 비슷한 낱말**이 있으면 그쪽을 고른다.
//   화면은 멀쩡해 보이고, 그 글자를 읽는 손님만 이상하게 여긴다:
//     금용암(부산) → 屍速列車   (영화 「부산행」)
//     운수사(부산) → 運輸会社   (운수 회사)
//     법안정사     → 法律與秩序 (드라마 「법과 질서」)
//     금련산       → 禁煙       (금연!)
//     일자산       → 日産       (닛산!)
//     경희궁공원   → 朴庆熙宫   (공원의 Park 를 **성씨 朴**으로 읽었다)
//
// ── 왜 낱말 목록이 아니라 규칙인가 ────────────────────────────────────────
//   틀린 말을 하나씩 적어 막으면 **다음 도시에서 새것이 또 나온다.** 대신
//   **그 종류의 이름에 반드시 들어가는 글자**를 본다. 절이면 寺, 산이면 山.
//   한자가 있는데 그 글자가 하나도 없으면, 그건 그 이름이 아니다.
//
// ── 🚨 지우기만 한다. 지어내지 않는다 ─────────────────────────────────────
//   맞는 한자를 우리가 만들어 낼 수는 없다. 지우면 앱이 **영어(로마자)로 대신**
//   보여 준다 — 「運輸会社」 대신 「Unsu Temple (Busan)」. 틀린 한자보다 낫다.
//   🪪 관광공사 공식 이름은 이 그물에 안 걸린다(寺·山 이 들어 있다). 손으로 적은
//      null 과 달리 **공식 자료를 밀어내지 않는다** — 자료가 늘면 저절로 물러난다.

/** 한자(중국·일본 공통 영역). 가타카나만 있는 일본어 표기는 이 검사를 안 받는다. */
const HAN = /[一-鿿]/;

/**
 * 규칙 하나 = 「어떤 곳인가」 + 「그 언어 표기에 반드시 있어야 할 글자」.
 *
 * `is(place, name)` 가 참인 곳만 본다. 갈래로 고르는 것이 이름으로 고르는 것보다
 * 튼튼하다 — 「무형문화유산」도 「…산」으로 끝나기 때문이다(실제로 걸렸다).
 * 공원만 이름으로 고른다. 공원은 walk 갈래 안에 산책로·하천과 섞여 있어서다.
 */
export const RULES = [
  {
    key: "temple",
    label: "절",
    is: (p) => p.category === "temple",
    need: { ja: /[寺庵菴院]/, zh: /[寺庵菴院]/, "zh-TW": /[寺庵菴院]/ },
  },
  {
    key: "hike",
    label: "산",
    is: (p) => p.category === "hike",
    // ⚠️ 山 만 찾으면 멀쩡한 것이 걸린다. hike 갈래에는 봉우리·숲도 들어 있다 —
    //    「가덕도 연대봉 → 加德島延大峰」(峰), 「매헌시민의 숲 → 梅軒市民の森 · 梅軒市民之林」(森·林),
    //    「관악산 → 冠岳」(岳, 널리 쓰는 줄임말). 이들은 틀린 게 아니다.
    //    일본어는 「サン」처럼 가타카나로 적기도 한다 — 그것도 틀린 게 아니다.
    need: { ja: /[山峰嶽岳森林]|サン/, zh: /[山峰嶽岳森林]/, "zh-TW": /[山峰嶽岳森林]/ },
  },
  {
    key: "park",
    label: "공원",
    is: (p) => /공원$/.test(p.name),
    need: { ja: /公園|パーク|園/, zh: /公园|园/, "zh-TW": /公園|園/ },
  },
];

export const CJK_LANGS = ["ja", "zh", "zh-TW"];

/**
 * 규칙에 걸리는 이름을 찾는다.
 *
 * @param {Record<string, Record<string,string>>} translations place-translations.json
 * @param {{name:string, category:string}[]} places 도시 곳 목록(-places.json)
 * @returns {{lang:string, ko:string, value:string, label:string}[]}
 */
export function brokenCjkNames(translations, places) {
  const out = [];
  for (const rule of RULES) {
    const names = new Set(places.filter((p) => p && rule.is(p)).map((p) => String(p.name)));
    if (!names.size) continue;
    for (const lang of CJK_LANGS) {
      for (const [ko, v] of Object.entries(translations[lang] ?? {})) {
        if (!names.has(ko)) continue;
        // 괄호 안의 지역 이름(（釜山）·（首尔）)은 빼고 본다 — 거기만 한자면 오해한다.
        const body = String(v).replace(/[（(][^）)]*[）)]/g, "");
        if (HAN.test(body) && !rule.need[lang].test(body))
          out.push({ lang, ko, value: v, label: rule.label });
      }
    }
  }
  return out;
}

/**
 * 🧾 **이름과 갈래를 세 군데서 모은다.**
 *
 * 곳이 한 파일에 모여 있지 않다. 셋 다 봐야 빠지는 게 없다 —
 *   · `src/data/<도시>-places.json` — 분류 코드로 만든 것 (갈래가 있다)
 *   · `src/data/tour-places-raw.json` — 예전에 받은 것 (**열쇠가 갈래다**)
 *   · `src/data/seed.ts` — 사람이 적은 것
 * seed.ts 는 갈래가 글자로 안 남는 항목이 많아(배열째 .map 으로 붙인다) **이름만**
 * 담는다. 그래서 갈래를 보는 규칙(절·산)은 seed.ts 항목을 건너뛰고, 이름으로 보는
 * 규칙(공원)만 걸린다. 억지로 갈래를 짐작해 붙이지 않는다.
 */
export function loadPlaces(readFileSync, readdirSync) {
  const out = [];
  for (const f of readdirSync("src/data").filter((f) => /-places\.json$/.test(f)))
    for (const p of JSON.parse(readFileSync(`src/data/${f}`, "utf8")))
      if (p?.name) out.push({ name: String(p.name), category: p.category });
  for (const [category, list] of Object.entries(
    JSON.parse(readFileSync("src/data/tour-places-raw.json", "utf8"))
  ))
    for (const p of list) if (p?.name) out.push({ name: String(p.name), category });
  for (const m of readFileSync("src/data/seed.ts", "utf8").matchAll(/\bname: "([^"]+)"/g))
    out.push({ name: m[1], category: undefined });
  return out;
}
