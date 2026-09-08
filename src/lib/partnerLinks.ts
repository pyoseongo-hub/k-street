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
 * ⏳ **아직 안 켰다.** 저쪽이 예쁜 주소(`/seoul/jongno-gu`)를 25개 구에 만들어
 *    주기로 했고, 그것이 **인터넷에 올라간 것을 눈으로 확인한 뒤** 켠다.
 *
 * 🚨 확인 전에 켜지 않는다. 눌렀는데 빈 화면이면 손님은 **두 앱 다** 못 믿는다.
 *    (지금 있는 것은 `?region=dist:seoul|종로구` 인데, 저쪽도 "내부 상태 인코딩"
 *     이라고 했다 — 내부 형식에 링크를 걸면 그쪽이 안을 고칠 때 같이 깨진다.)
 */
export const PARTNER_READY = false;

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
