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
}
const DATES = festivalDates as Record<string, FestivalDate>;

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

function toPlace(category: Category, p: RawPlace): Place {
  const date = category === "festival" ? DATES[p.contentId] : undefined;
  return {
    id: idOf(p),
    gu: p.gu ?? "",
    category,
    name: p.name,
    addr: p.addr,
    image: p.image,
    thumb: p.thumb ?? p.image,
    lat: p.lat,
    lng: p.lng,
    ...(date?.startMonth != null
      ? {
          startMonth: date.startMonth,
          endMonth: date.endMonth ?? date.startMonth,
          period: periodOf(date.start),
        }
      : null),
    // 관광공사가 직접 등록·관리하는 자료라 "확인된 값"으로 둔다.
    // seed.ts의 confirmed:false(=아직 못 찾은 빈 칸)와는 성격이 다르다.
    confirmed: true,
    source: "tour",
  };
}

/** 구를 못 찾은 항목은 뺀다 — 화면이 구 단위로 움직이므로 어디에도 못 붙는다. */
export const TOUR_PLACES: Place[] = Object.entries(RAW).flatMap(([category, list]) =>
  (list ?? []).filter((p) => p.gu).map((p) => toPlace(category as Category, p))
);

/** 이름이 같은 곳을 찾아 쓰기 위한 표. 한글은 보이는 게 같아도 코드가 다를 수 있어 NFC로 맞춘다. */
export const TOUR_BY_NAME = new Map(TOUR_PLACES.map((p) => [p.name.normalize("NFC"), p]));
