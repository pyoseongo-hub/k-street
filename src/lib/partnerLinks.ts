// 🍚 **밥집 쪽으로 잇는 링크** — 표 한 장.
//
// 왜 (2026-09-08, docs/연동-준비물.md) — 손님은 시장을 구경하고 산책하면 배가 고프다.
// 그때 밥집을 못 주면 앱을 닫는다. **홍보가 아니라 빠진 기능이다.**
//
// 🚨 주소를 코드 여기저기에 박지 않는다. **이 파일 하나만** 고치면 되게 둔다 —
//    저쪽이 주소를 바꾸는 날, 어디를 고쳐야 하는지 찾아다니지 않으려고.
import { districtFullName } from "../data/districtNamesEn";
import type { Language } from "./translations";

/** 저쪽 주소의 뿌리. */
const BASE = "https://kfood-t493.onrender.com";

/**
 * ✅ **켰다** (2026-09-08). 확인은 러너에서 실제 주소를 두드려서 했다 —
 *    작업 세션은 바깥 인터넷이 막혀 있다(scripts/check-live.mjs ⑦).
 *
 *      HTTP 200  /seoul/jongno-gu   · 제목 「Best Korean Restaurants in Jongno-gu, Seoul」
 *      HTTP 200  /seoul/jongno-gu/  · 빗금 있는 쪽도 같다
 *      HTTP 200  /seoul/jung-gu     · 구마다 내용이 다르다(글자 수가 다르다)
 *
 * 🚨 **확인 없이 켜지 않는다.** 눌렀는데 빈 화면이면 손님은 **두 앱 다** 못 믿는다.
 *    저쪽 주소가 죽으면 여기를 false 로 되돌리면 25장에서 한꺼번에 사라진다.
 *
 * ⚠️ 안 쓰기로 한 것 — `?region=dist:seoul|종로구`. 저쪽도 "내부 상태 인코딩"이라고
 *    했다. 내부 형식에 링크를 걸면 그쪽이 안을 고칠 때 같이 깨진다.
 */
export const PARTNER_READY = true;

/**
 * 우리 구 이름 → 저쪽 주소의 마지막 조각.
 *
 * 기본은 **우리 구별 페이지와 같은 규칙**이다(`종로구` → `jongno-gu`).
 * 저쪽이 우리 표기를 그대로 받아 쓰기로 했기 때문에 표를 두 벌 만들지 않는다 —
 * 두 벌이면 한쪽만 고쳐 놓고 어긋난다.
 *
 * ⚠️ 그래도 **예외 칸은 남겨 둔다.** 한 곳이라도 표기가 다르면 여기에 적는다.
 *    (`jongno` / `jongro` / `jong-no` 처럼 로마자는 갈리기 쉽다.)
 */
const SLUG_OVERRIDES: Record<string, string> = {};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** 「종로구」 → 「jongno-gu」. 우리 `/seoul/…` 주소와 **글자까지 같다.** */
export function partnerSlug(gu: string): string {
  return SLUG_OVERRIDES[gu] ?? slugify(districtFullName(gu, "en"));
}

/**
 * 손님 언어를 저쪽 언어 코드로.
 *
 * 🚨 **12개 중 하나만 표기가 다르다** — 우리는 `zh-TW`, 저쪽은 `zhTW`.
 *    이걸 안 맞추면 **대만 손님만** 엉뚱한 화면을 받는다. 딱 한 글자 차이라
 *    눈으로는 안 보이고, 대만 손님이 적어서 한참 뒤에나 발견된다.
 */
export function partnerLang(lang: Language): string {
  return lang === "zh-TW" ? "zhTW" : lang;
}

/**
 * 그 구의 밥집 목록 주소. 아직 안 켰거나 아는 구가 아니면 **null** —
 * 그러면 화면은 링크를 아예 안 그린다(주소를 지어내지 않는다).
 *
 * ⚠️ 구 단위만 쓴다. 저쪽은 동(법정동)까지 되지만 **구 안에 빈 동네가 있다**고
 *    알려 왔다 — 동 단위로 걸려면 그 동에 실제로 곳이 있는지 따로 확인해야 한다.
 */
export function eatNearbyUrl(gu: string, lang: Language = "en"): string | null {
  if (!PARTNER_READY) return null;
  const slug = partnerSlug(gu);
  if (!slug) return null;
  return `${BASE}/seoul/${slug}?hl=${partnerLang(lang)}`;
}

// ── 🏘️ 동네(관광객이 아는 이름) ──────────────────────────────────────────
//
// 저쪽이 구 25개 말고 **관광객이 부르는 이름**으로도 페이지를 만들었고
// (홍대·이태원·북촌·을지로·광장시장 …), **어느 법정동을 묶은 것인지 표**까지
// 보내 왔다(2026-09-08). 구보다 훨씬 정확하다 — 마포구 전체가 아니라 홍대다.
//
// 🚨 **도로명으로 동네를 추측하지 않는다.** 처음에 주소에 「이태원」이 들어가면
//    이태원으로 쳤더니 **전쟁기념관**(용산동, 주소가 「이태원로 29」)이 걸렸다.
//    도로는 여러 동을 가로지른다. 그래서 여기서는 **법정동 이름 전체**로만 찾고
//    (「이태원」이 아니라 「이태원동」), 뒤에 길·로·숫자가 붙으면 버린다 —
//    「인사동길」·「인사동9길」은 동이 아니라 길 이름이다.
const AREA_DONGS: Record<string, string[]> = {
  myeongdong: ["명동1가", "명동2가"],
  hongdae: ["서교동", "동교동", "합정동", "상수동", "연남동", "망원동"],
  itaewon: ["이태원동", "한남동"],
  seongsu: ["성수동1가", "성수동2가"],
  gangnam: ["역삼동", "논현동", "신사동", "청담동", "압구정동"],
  bukchon: ["익선동", "인사동", "안국동", "소격동", "가회동", "삼청동"],
  euljiro: ["을지로1가", "을지로2가", "을지로3가", "을지로4가", "을지로5가", "을지로6가", "을지로7가"],
  "gwangjang-market": ["예지동", "종로4가", "종로5가"],
};

/** 화면에 뜨는 글자. 링크는 **무엇이 나오는지** 말해야 눌린다. */
const AREA_LABEL: Record<string, string> = {
  myeongdong: "Where to eat in Myeongdong",
  hongdae: "Where to eat in Hongdae",
  itaewon: "Where to eat in Itaewon",
  seongsu: "Where to eat in Seongsu",
  gangnam: "Where to eat in Gangnam",
  bukchon: "Where to eat near Bukchon & Insadong",
  euljiro: "Restaurants & bars in Euljiro",
  "gwangjang-market": "Street food at Gwangjang Market",
};

/**
 * 주소로는 못 푸는데 **이름만 봐도 확실한 곳**. 하나씩 눈으로 확인해 적었다.
 *
 * 왜 필요한가 — 곳 307장 중 44곳은 한국어 주소가 아예 없고, 있어도 도로명뿐이라
 * 동이 안 적힌 곳이 있다. **광장시장이 바로 그렇다**(「종로구 창경궁로 88」).
 * 양쪽에 같은 이름이 있는데 표로는 안 걸린다.
 */
const AREA_BY_SLUG: Record<string, string> = {
  "gwangjang-market": "gwangjang-market", // 이름이 같다. 시장 자체가 먹거리다
  "mangwon-market": "hongdae", // 망원시장 — 주소가 없다. 망원동은 저쪽 홍대 묶음이다
  "itaewon-global-village-festival": "itaewon", // 주소가 없다. 이름이 이태원이다
  "gyeongui-line-book-street": "hongdae", // 경의선책거리 — 홍대입구역 앞(서교동)
  "autumn-to-myeongdong": "myeongdong", // 「가을, 명동으로」 — 명동에서 하는 행사다
};

/** 「(예지동)」은 동, 「인사동길」·「이태원로」는 길 — 뒤에 뭐가 붙는지로 가른다. */
function areaFromAddr(addr: string): string | null {
  for (const [area, dongs] of Object.entries(AREA_DONGS)) {
    for (const d of dongs) {
      const i = addr.indexOf(d);
      if (i < 0) continue;
      const next = addr[i + d.length] ?? "";
      if (next && !/[\s),]/.test(next)) continue; // 뒤에 길·로·숫자가 붙으면 길 이름이다
      return area;
    }
  }
  return null;
}

/**
 * 그 곳에서 밥 먹으러 갈 자리. **동네를 알면 동네로, 모르면 그 구로** 보낸다.
 * 둘 다 없으면 null — 없는 주소는 지어내지 않는다.
 */
export function eatUrlForPlace(
  p: { slug?: string; addr?: string; gu: string },
  lang: Language = "en"
): { href: string; label: string } | null {
  if (!PARTNER_READY) return null;
  const area = (p.slug ? AREA_BY_SLUG[p.slug] : undefined) ?? areaFromAddr(p.addr ?? "");
  if (area)
    return { href: `${BASE}/seoul/${area}?hl=${partnerLang(lang)}`, label: `${AREA_LABEL[area]} →` };

  const href = eatNearbyUrl(p.gu, lang);
  return href ? { href, label: `Where to eat in ${districtFullName(p.gu, "en")} →` } : null;
}
