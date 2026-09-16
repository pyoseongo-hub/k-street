// 장소·축제의 **내용**(이름·설명·기간 문구)을 그 언어로 보여준다.
//
// 화면의 틀(버튼·안내문)은 translations.ts가 손으로 써 둔 12개 언어를 쓰고,
// 그 안에 담기는 내용은 이 파일이 place-translations.json을 본다
// (scripts/translate-places.mjs가 구글 번역으로 채운다).
//
// 규칙 두 가지 —
//
// ① **번역이 없으면 영어로, 영어도 없으면 한국어로.** 화면이 깨지지 않는다
//    (Kfood에서 쓰는 것과 같은 방식).
//
// ② 🚨 **이름은 번역만 보여주지 않고 한국어 원문을 함께 보여준다.**
//    기계 번역이라 이름이 어색하거나 틀릴 수 있는데, 손님이 길에서 정말 필요한 건
//    "택시 기사에게 보여줄 한국어"다. Kfood의 원칙과 같다 — 손님이 그 이름 그대로
//    말할 수 있어야 한다. 그래서 번역이 이상해도 한국어가 옆에 있으면 길은 찾는다.
//    (한국어 화면에서는 당연히 원문만 보여준다.)

// ─────────────────────────────────────────────────────────────────────────
// 📦 **고른 말 하나만 받는다** (2026-09-17)
// ─────────────────────────────────────────────────────────────────────────
//   예전에는 11개 언어가 한 파일에 있었고 그게 본체 js 안으로 통째로 들어갔다 —
//   **869KB, 번들의 38%.** 그런데 손님 한 사람이 쓰는 말은 하나다.
//   일본에서 온 손님이 태국어·러시아어 번역까지 받고 있었다.
//
//   글꼴은 이미 이렇게 하고 있었다(langFont.ts — "고른 순간에 그 하나만 받는다").
//   같은 원칙을 자료에도 적용한다. 받는 양이 **821KB → 약 130KB** 로 준다
//   (고른 말 + 영어 예비).
//
// 🚨 **영어를 같이 받는 이유** — 번역이 빠진 이름이 언어마다 조금씩 있다
//    (일본어는 1,142개 중 1,111개). 그때 영어로 떨어지는 것이 한국어로 떨어지는 것보다
//    외국 손님에게 낫다. 그래서 영어는 늘 같이 받는다. 영어·한국어 손님은 한 개만 받는다.
//
// ⚠️ **곳 페이지를 만들 때(빌더)는 11개를 다 넣는다** — 12개 언어 페이지를 한 번에
//    만들기 때문이다. 빌더도 Vite 로 돌아가므로(`vite build --ssr`) 아래 glob 이 그대로 쓰인다.
const FILES = import.meta.glob<Record<string, string>>("../data/place-translations/*.json");

const langOf = (path: string) => path.slice(path.lastIndexOf("/") + 1, -5);

const TABLE: Record<string, Record<string, string>> = {};

/**
 * 🚦 **받는 중인 것까지 들고 있는다** — 표시만 찍어 두면 안 된다.
 *
 * 🐞 처음엔 `Set` 에 「받았다」고 표시만 했다가 **영어 손님에게 한국어 이름이 떴다**
 *    (2026-09-17). 순서가 이랬다 —
 *      ① 화면이 한국어('ko')로 먼저 뜬다 → 예비용 영어를 받기 **시작**하면서
 *         「영어 받았음」을 **미리** 찍는다
 *      ② 손님의 말이 'en' 으로 정해져 다시 부른다 → 표시가 이미 있으니 **그냥 지나간다**
 *      ③ 「준비됐다」며 화면을 다시 그린다 — 그런데 ①은 **아직 도착 전**이라 표가 비었다
 *    일본어는 ②에서 일본어를 진짜로 기다리니 멀쩡했다. **영어 손님만** 겪는다.
 *    브라우저로 네 언어를 다 돌려 보다 잡았다 — 화면엔 오류가 안 뜬다.
 *
 * → 그래서 **약속(Promise)을 들고 있는다.** 나중에 부른 쪽은 같은 약속을 기다린다.
 *   같은 조각을 두 번 받지 않으면서, 「준비됐다」는 말이 거짓이 되지 않는다.
 */
const 받는중 = new Map<string, Promise<void>>();

function 받아온다(code: string): Promise<void> {
  const 있던것 = 받는중.get(code);
  if (있던것) return 있던것;
  const entry = Object.entries(FILES).find(([path]) => langOf(path) === code);
  // 그 말의 파일이 아예 없다 — 기다릴 것이 없다. 화면은 예비(영어→한국어)로 뜬다.
  if (!entry) { const 빈것 = Promise.resolve(); 받는중.set(code, 빈것); return 빈것; }
  const 약속 = entry[1]()
    .then((mod) => {
      TABLE[code] = (mod as { default?: Record<string, string> }).default ?? (mod as Record<string, string>);
    })
    .catch(() => {
      // 조각을 못 받았다(네트워크). 다음에 다시 해 볼 수 있게 지운다.
      받는중.delete(code);
    });
  받는중.set(code, 약속);
  return 약속;
}

/**
 * 그 말의 번역을 받아 둔다. 한국어는 원문이라 받을 것이 없다.
 *
 * 🚨 **영어를 같이 받는다** — 번역이 빠진 이름이 언어마다 조금씩 있어서다
 *    (일본어는 1,142개 중 1,111개). 그때 한국어보다 영어가 외국 손님에게 낫다.
 *
 * @returns 늘 true — **다 받고 나서** 돌아오므로, 받는 쪽은 화면을 다시 그리면 된다.
 */
export async function ensurePlaceTranslations(lang: string): Promise<boolean> {
  // 🇰🇷 한국어 손님은 **한 조각도 안 받는다** — 아래 세 함수가 'ko' 면 원문을 그대로
  //    돌려주고 표를 보지 않는다. 예비용 영어까지 받으면 81KB 를 그냥 버리는 셈이다.
  const want = lang === "ko" ? [] : [lang, "en"];
  await Promise.all([...new Set(want)].map(받아온다));
  return true;
}

/** 곳 페이지를 만들 때 쓴다 — 11개 언어를 통째로 넣는다. 브라우저에서는 안 쓴다. */
export async function loadAllPlaceTranslations(): Promise<void> {
  await Promise.all(Object.keys(FILES).map((path) => 받아온다(langOf(path))));
}

/** 그 언어의 번역. 없으면 영어, 영어도 없으면 한국어 원문 그대로. */
export function translateText(ko: string, language: string): string {
  if (language === "ko") return ko;
  return TABLE[language]?.[ko] ?? TABLE.en?.[ko] ?? ko;
}

/** 번역이 실제로 있는지(원문과 다른 값이 있는지). 기간 문구를 쓸지 말지 고르는 데 쓴다. */
export function hasTranslation(ko: string, language: string): boolean {
  if (language === "ko") return true;
  const t = TABLE[language]?.[ko] ?? TABLE.en?.[ko];
  return Boolean(t && t !== ko);
}

/**
 * 이름을 어떻게 보여줄지. main은 크게, sub는 그 아래 작게.
 * 한국어 화면이거나 번역이 없으면 sub가 없다 — 같은 말을 두 번 적지 않는다.
 */
export function placeName(ko: string, language: string): { main: string; sub?: string } {
  if (language === "ko") return { main: ko };
  const t = TABLE[language]?.[ko] ?? TABLE.en?.[ko];
  return t && t !== ko ? { main: t, sub: ko } : { main: ko };
}
