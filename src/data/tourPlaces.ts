// 한국관광공사(TourAPI) 자료를 앱이 쓰는 Place 모양으로 바꾼다.
//
// 왜 별도 파일인가 — seed.ts는 사람이 25개 구를 직접 조사해 적은 185곳이고,
// 이 파일은 scripts/fetch-tour-places.mjs가 받아온 결과를 그대로 읽는다.
// 두 출처를 섞어 한 파일에 적어 두면 스크립트를 다시 돌릴 때 사람이 적은 것까지
// 덮어써 버린다. 그래서 **사람이 적은 것과 기계가 받은 것을 파일로 갈라 둔다.**
//
// 🚨 2026-09-01에 확인한 것 — 두 출처는 겹치지 않는다.
// 이름이 똑같은 곳이 185곳 중 10곳(5%)뿐이다. 그래서 "매칭"이 필요 없다.
// (예전에 실패한 건 이름으로 사진을 맞춰 붙이는 작업이었고, 185곳 중 1곳만 맞았다.
//  지금 하는 건 똑같은 이름 10개를 골라내는 것뿐이라 성격이 완전히 다르다.)
//
// 칸별 강약도 갈린다. 축제·시장·박물관·골목은 관광공사가 훨씬 많고,
// 꽃길·등산로·산책로는 사람이 조사한 seed.ts가 더 많다(꽃길은 30곳 대 2곳).
// 그래서 **어느 쪽도 버리지 않고 합친다**(사용자 결정 2026-09-01).

import type { Category, Place } from "./seed";
import raw from "./tour-places-raw.json";
import festivalDates from "./festival-dates.json";
import aliases from "./name-aliases.json";
// 🏷️ 관광공사 이름에 붙어 오는 홍보 문구를 털어낸다. 이유와 규칙은 그 파일에 있다.
import displayNames from "./display-names.json";
// 🚫 관광공사가 준 좌표 중 **가리키는 곳 자체가 엉뚱한** 것. 이유는 그 파일에 적혀 있다.
import badCoords from "./bad-coords.json";
// 블로그·SNS를 공식 창구에서 걸러내는 잣대. 화면 쪽(mapLinks.ts)과 **같은 함수**를 쓴다.
import { isOfficialSite } from "../lib/officialSite";

interface RawPlace {
  name: string;
  gu?: string;
  addr?: string;
  contentId: string;
  image?: string;
  thumb?: string;
  lat?: number;
  lng?: number;
}

const RAW = raw as Record<string, RawPlace[]>;

/**
 * id는 관광공사 contentId를 그대로 쓴다.
 *
 * seed.ts는 `ks_1`·`ks_2`처럼 순번으로 id를 만드는데, 그 순번은 항목을 하나
 * 지우거나 넣으면 뒤가 통째로 밀린다. 여기에 같은 방식을 쓰면 스크립트를 다시
 * 돌릴 때마다 id가 바뀌어, 사진·좌표가 엉뚱한 곳에 붙는다(Kfood에서 실제로
 * 겪은 사고다 — 지운 가게의 사진이 새 가게에 그대로 붙었다).
 * contentId는 관광공사가 장소마다 고정으로 주는 값이라 그럴 일이 없고,
 * `tour_` 접두사 덕에 `ks_`와 절대 겹치지 않는다.
 */
const idOf = (p: RawPlace) => `tour_${p.contentId}`;

// ── 축제가 언제 열리는지 (scripts/fetch-festival-dates.mjs가 채운다) ──────────
//
// 처음 자료를 받은 areaBasedList2에는 날짜 칸이 아예 없어서, 관광공사 축제 57곳은
// **열리는 달을 하나도 모르는 상태**였다 — 사진도 좌표도 다 있는데 계절·월로 고르는
// 화면에서는 통째로 사라졌다. 축제 전용 창구(searchFestival2)를 따로 불러 채운다.
// 이름이 아니라 **contentId로 잇는다** — 두 창구가 같은 번호를 쓴다.
interface FestivalDate {
  start: string;
  end: string;
  startMonth: number | null;
  endMonth: number | null;
  /**
   * 축제 공식 홈페이지(관광공사 detailCommon2). 이름을 눌렀을 때 여기로 간다.
   *
   * · undefined = 아직 안 물어봤다   · null = 물어봤는데 없더라   · 문자열 = 있다
   * 셋을 갈라야 다음 실행이 같은 곳을 또 묻지 않는다.
   *
   * 🔗 이름이 아니라 **contentId로 이어서** 받는다 — 웹 검색으로 찾으면
   *    「서울숲 재즈」에 「서울 재즈」 주소가 붙는 사고가 난다.
   */
  homepage?: string | null;
}
const DATES = festivalDates as Record<string, FestivalDate>;

// 🚫 좌표를 안 쓰기로 한 곳. `_읽어보세요`는 설명이라 열쇠에서 뺀다.
const BAD_COORDS: Record<string, { name: string; why: string }> = Object.fromEntries(
  Object.entries(badCoords as Record<string, unknown>).filter(([k]) => !k.startsWith("_"))
) as Record<string, { name: string; why: string }>;

/** contentId로 축제 공식 홈페이지를 찾는다. 없거나 블로그·SNS면 undefined. */
export function tourHomepage(contentId?: string): string | undefined {
  const h = contentId ? DATES[contentId]?.homepage : undefined;
  return isOfficialSite(h) ? h : undefined;
}

/**
 * "20251017" → "mid". 날짜가 이상하면 undefined — 지어내지 않는다.
 *
 * 🚨 날짜를 그대로 안 쓰고 초·중·하순으로 뭉개는 이유는 Place.period 주석에 적어 뒀다:
 * 받아온 값이 **지난 회차(2025년)** 것이라, 달까지는 맞아도 날짜는 해마다 옮겨 간다.
 */
function periodOf(yyyymmdd: string): Place["period"] {
  if (!/^\d{8}$/.test(yyyymmdd)) return undefined;
  const day = Number(yyyymmdd.slice(6, 8));
  if (day < 1 || day > 31) return undefined;
  return day <= 10 ? "early" : day <= 20 ? "mid" : "late";
}

/**
 * 🏷️ 화면에 띄울 이름. 관광공사가 준 이름에 붙어 온 홍보 문구를 털어낸다.
 *
 * 왜 (2026-09-04 사장님 지시: "강추는 빼") — 「강북청소년축제 강추」의 '강추'가
 * 이름 자리에 그대로 들어가 있었다. 못생긴 데서 끝나지 않고 **번역까지
 * 망가뜨렸다** — 구글이 그걸 문장으로 읽어 영어 이름이
 * "I highly recommend Gangbuk Youth Festival." 이 돼 있었다.
 * 게다가 이제는 **택시 기사에게 내미는 화면**에도 그대로 나간다(DriverCard.tsx).
 *
 * 표에 없는 곳은 원래 이름 그대로다 — 기계가 알아서 자르지 않는다.
 * '강추' 같은 말을 규칙으로 잘라 내려 하면 그게 이름의 일부인 곳까지 자른다.
 */
const DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(displayNames as Record<string, unknown>).filter(
    ([k, v]) => !k.startsWith("_") && typeof v === "string"
  ) as [string, string][]
);
const displayName = (raw: string) => DISPLAY_NAMES[raw.normalize("NFC")] ?? raw;

function toPlace(category: Category, p: RawPlace): Place {
  const date = category === "festival" ? DATES[p.contentId] : undefined;
  const homepage = date?.homepage;
  const distrusted = idOf(p) in BAD_COORDS;
  return {
    id: idOf(p),
    gu: p.gu ?? "",
    category,
    name: displayName(p.name),
    addr: p.addr,
    // 관광공사가 등록해 둔 공식 홈페이지. 없으면 이름을 눌렀을 때 네이버 검색으로 간다.
    // 블로그·SNS는 여기서 걸린다(isOfficialSite 주석 참고).
    ...(isOfficialSite(homepage) ? { officialUrl: homepage } : null),
    image: p.image,
    thumb: p.thumb ?? p.image,
    // 🚫 가리키는 곳이 엉뚱한 좌표는 아예 안 쓴다 — 틀린 좌표 < 빈 칸.
    //    좌표가 없으면 길찾기가 이름 검색으로 넘어가고, 없는 대로 티가 난다.
    //    틀린 좌표는 티가 안 난다 — 손님이 도착한 뒤에야 안다.
    ...(distrusted ? { lat: undefined, lng: undefined } : { lat: p.lat, lng: p.lng }),
    ...(date?.startMonth != null
      ? {
          startMonth: date.startMonth,
          endMonth: date.endMonth ?? date.startMonth,
          period: periodOf(date.start),
          // 🔒 관광공사 축제 창구에서 직접 받은 날짜다 — 그 자체가 근거이고,
          //    하루 한 번 다시 받아 대조된다(seed.ts의 monthSource 주석 참고).
          //    이걸 안 붙이면 관광공사 축제 56곳이 통째로 화면에서 사라진다.
          monthSource: `한국관광공사 축제 창구 (${date.start})`,
        }
      : null),
    // 관광공사가 직접 등록·관리하는 자료라 "확인된 값"으로 둔다.
    // seed.ts의 confirmed:false(=아직 못 찾은 빈 칸)와는 성격이 다르다.
    confirmed: true,
    source: "tour",
    // 사진 여러 장(tour-gallery.json)을 찾는 열쇠. 합쳐질 때 id는 사람 쪽이
    // 남으므로 이 값을 따로 들고 다녀야 한다.
    tourContentId: String(p.contentId),
  };
}

/** 구를 못 찾은 항목은 뺀다 — 화면이 구 단위로 움직이므로 어디에도 못 붙는다. */
export const TOUR_PLACES: Place[] = Object.entries(RAW).flatMap(([category, list]) =>
  (list ?? []).filter((p) => p.gu).map((p) => toPlace(category as Category, p))
);

/**
 * 이름으로 관광공사 항목을 찾는 표.
 *
 * 🔁 **열쇠는 기호·공백을 털어낸 이름**이다(2026-09-02 사용자가 앱 화면에서 잡은 사고).
 * 예전에는 NFC 문자열을 글자까지 그대로 비교해서, 같은 곳인데도 표기가 조금만
 * 다르면 안 합쳐지고 **카드가 두 장** 떴다:
 *
 *   성북거리문화축제 다다페스타   vs  성북거리문화축제 <다다페스타>
 *   양천가족거리축제             vs  양천가족 거리축제
 *   마장축산물시장               vs  마장 축산물시장
 *   서울로7017                  vs  서울로 7017
 *   한양대학교박물관             vs  한양대학교 박물관
 *
 * 관광공사는 부제를 < >나 ( )로 묶고 띄어쓰기도 다르게 적는 일이 잦다. 기호와
 * 공백을 털면 이 다섯 쌍이 저절로 붙는다.
 *
 * ⚠️ **여기서 더 느슨하게 하면 안 된다.** '포함하면 같은 곳'까지 인정하면
 * 구로시장과 **남**구로시장(서로 다른 시장), 광장시장과 광장시장 **한복매장**
 * (시장과 그 안의 매장)이 하나로 합쳐진다. 좌표·사진 쪽 잣대가 '5자 이내 덧붙음'을
 * 인정하는 것과 일부러 다르게 뒀다 — 거기는 **검색 결과를 고르는** 자리라 덜 맞아도
 * 사람이 로그로 보지만, 여기는 **화면에 뜰 항목을 지우는** 자리라 되돌리기 어렵다.
 *
 * 한글은 보이는 게 같아도 코드가 다를 수 있으므로 NFC를 먼저 거친다.
 */
export const nameKey = (s: string) => s.normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "");

export const TOUR_BY_NAME = new Map(TOUR_PLACES.map((p) => [nameKey(p.name), p]));

/** 이름 자체가 달라 위 규칙으로는 못 잇는 곳 — 사람이 확인해 적은 표(name-aliases.json). */
const NAME_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(aliases as Record<string, unknown>).filter(
    ([k, v]) => !k.startsWith("_") && typeof v === "string"
  ) as [string, string][]
);

/** 사람이 적은 이름에 붙여 둔 관광공사 쪽 이름. 없으면 undefined. */
export const aliasOf = (handName: string): string | undefined =>
  NAME_ALIASES[handName.normalize("NFC")];

/**
 * 주어진 표에서 그 곳을 찾는다. 별명표를 먼저 보고, 없으면 이름으로 찾는다.
 *
 * 표를 밖에서 받는 이유 — 축제 합치기는 **축제만 담은 표**로 찾아야 한다.
 * 전체 표에서 찾으면 이름이 같은 다른 칸의 항목(예: 박물관 '허준박물관')이 먼저
 * 걸려 축제가 안 붙는다.
 */
export function findIn(table: Map<string, Place>, handName: string): Place | undefined {
  const alias = aliasOf(handName);
  if (alias) {
    const byAlias = table.get(nameKey(alias));
    if (byAlias) return byAlias;
  }
  return table.get(nameKey(handName));
}

/** 전체 관광공사 자료에서 찾는다(칸을 가리지 않는 합치기용). */
export const findTourPlace = (handName: string): Place | undefined =>
  findIn(TOUR_BY_NAME, handName);
