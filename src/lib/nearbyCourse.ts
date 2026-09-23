// 🧭 **내 주변 코스** — 지금 서 있는 자리에서 가까운 곳들을 가까운 순으로 이어 준다.
//
// 사장님 (2026-09-22): *"내 주변 코스 받는게 목표야 지금 구조로 만들어"*
//
// ── 🚨 시간은 쓰지 않는다 ────────────────────────────────────────────────
//   사장님이 2026-09-11에 못박은 것 —
//     "코스추천은 그시간을 잴수없어 거기에 머무르는 시간은 개개인이 틀리니
//      그러니 숫자로 몇개 코스를 넣을지 정하게 하는게 좋을거 같아"
//   그래서 이 파일은 **「2시간 코스」·「예상 소요시간」을 만들지 않는다.**
//   손님이 고르는 것은 **몇 곳**이고, 우리가 내놓는 것은 **미터**다.
//   미터는 좌표에서 나오는 사실이라 지어낸 값이 하나도 없다. docs/코스-추천.md.
//
// ── 🧭 「내 위치」와 「구 선택」은 **둘 다 있어야 한다** ──────────────────
//   사장님은 2026-09-12에 이렇게도 말했다 —
//     "내 위치는 매일 숙소에서 계획 짜면 같은장소니 구를 선택하게"
//   그건 **숙소에서 내일을 계획할 때** 맞는 말이고, 그 화면은 이미 있다
//   (districtDistance.ts + DistrictExplorer 의 「가까운 순 보기」).
//   이 파일은 **밖에 나와 있을 때**를 맡는다 — 이미 거리에 서 있는 손님에게
//   「구를 고르세요」는 한 단계 더 걷게 하는 일이다. 둘은 서로를 안 밀어낸다.
//
// ── 🖥️ 서버도 AI 도 쓰지 않는다 ─────────────────────────────────────────
//   전부 브라우저 안에서 도는 순수 계산이다. CLAUDE.md 의 「서버를 두지 않는다」
//   — 고정비 0원을 지킨다. 좌표가 있으면 거리는 하버사인으로 정확히 나온다.

import { metersBetween, type Point } from "./districtDistance";
import type { Category, Place } from "../data/seed";
// 🗓️ 축제는 **날짜가 있는 곳**이다 — 아래 onToday 주석 참고.
import { guFestivalDate } from "./guFestival";
import { isPastEdition } from "./pastEdition";

/** 손님이 고를 수 있는 곳 수. 「몇 곳」이 시간을 대신한다. */
export const COURSE_SIZES = [3, 5, 7] as const;
export type CourseSize = (typeof COURSE_SIZES)[number];

/**
 * 🚶🚇 **어디까지를 「주변」으로 볼 것인가.**
 *
 * 사장님 설계안의 「이동방식(도보/대중교통)」을 **거리 한도**로 옮긴 것이다.
 * 「도보 15분」이라고 적으려면 걷는 속도를 알아야 하는데 그건 우리 자료에 없다.
 * 대신 **다음 곳까지 몇 m 까지 이어 줄지**로 정한다 — 이건 좌표만으로 정해진다.
 *
 * ⚠️ 이 숫자는 화면에 **한도로도 안 적는다.** 손님에게 보이는 것은 실제 거리뿐이다.
 */
export const REACH = {
  /** 걸어서 — 한 구간이 1.2km 를 넘지 않게 잇는다 */
  walk: 1200,
  /** 지하철도 탄다 — 한 구간 4km 까지 벌린다 */
  transit: 4000,
} as const;
export type Reach = keyof typeof REACH;

/**
 * 🚨 **같은 자리를 두 번 세지 않는다** (2026-09-22, scripts/check-nearby-course.ts 로 잡았다).
 *
 * 처음 돌렸더니 중구 「5곳 코스」가 **모두 100m** 로 나왔다. 열어 보니 이랬다 —
 *   남대문 종합상가 · 숭례문 수입상가 · 남대문시장 · 남대문 액세사리상가 · 남대문 중앙상가
 * 다섯 곳 중 **셋이 좌표가 글자 하나까지 같았다.** 전부 남대문시장 한 덩어리다.
 * 서초구도 마찬가지였다 — 김장대축제와 우리술대축제가 같은 자리(양재 시민의숲)다.
 *
 * 화면은 멀쩡하고 숫자도 틀리지 않다. 그런데 **손님이 받는 것은 거짓말이다** —
 * 「5곳을 도는 코스」라고 해 놓고 실제로는 **한 군데에 서 있게** 된다.
 * 없는 값을 적는 것만 거짓이 아니라, **있는 값으로 없는 것을 말하는 것도 거짓이다.**
 *
 * 그래서 이미 넣은 곳에서 이만큼 안 떨어진 후보는 **건너뛴다.**
 * 150m 인 이유 — 관광공사 좌표는 건물·공원 한가운데를 찍은 것이라 그보다 촘촘한
 * 차이를 주장할 수 없고, 손님 입장에서 150m 안은 **이미 거기 와 있는 것**이다.
 *
 * ⚠️ **남는 한계 하나** — 좌표가 똑같은 것들 중 **어느 이름이 뽑힐지는 정해지지 않는다.**
 *    위 다섯 중 「남대문시장」이 아니라 「남대문 종합상가」가 뽑힐 수 있다.
 *    어느 쪽이 더 유명한지를 우리 자료가 모르기 때문이다 — 지어내지 않고 그냥 둔다.
 *    고치려면 곳 자료에 대표/부속 관계를 적어야 한다. 그건 자료 일이지 계산 일이 아니다.
 */
export const MIN_GAP = 150;

export interface CourseStop {
  place: Place & Point;
  /** 앞 지점(첫 곳은 **내 위치**)에서 여기까지 직선 m */
  fromPrev: number;
}

export interface Course {
  /** 기준점 — 손님이 서 있는 자리 */
  origin: Point;
  stops: CourseStop[];
  /** 내 위치 → 첫 곳까지 직선 m */
  toFirst: number;
  /** 곳과 곳 사이만 더한 직선 m (내 위치에서 오는 구간은 뺀다) */
  between: number;
  /** 위 둘을 더한 것 — 화면의 「모두 …」 */
  total: number;
  /** 부탁받은 곳 수. stops.length 가 이보다 적으면 그만큼밖에 못 찾은 것이다 */
  asked: number;
}

export interface CourseOptions {
  /** 몇 곳 */
  size: CourseSize;
  /** 한 구간의 최대 직선 거리(m) */
  reach: number;
  /**
   * 고른 갈래. 비우면 **전부** — 사장님 설계안의 "골라도 되고 안 골라도 되고".
   *
   * ⚠️ 갈래를 좁히면 **빈 코스가 나오기 쉽다.** 9개 구에 골목이 0곳이다
   *    (docs/코스-추천.md). 화면 쪽에서 **곳이 없는 갈래는 아예 못 고르게** 막는다.
   */
  categories?: readonly Category[];
  /** 검사에서 날짜를 고정하려고 넣는 구멍. 화면은 안 넘긴다 */
  now?: Date;
}

/**
 * 🗓️ **오늘 가도 되는 곳인가.**
 *
 * 🚨 이걸 안 걸었더니 영등포구 코스에 **「서울세계불꽃축제」와 「한강 종이비행기 축제」**가
 *    들어왔다(2026-09-22, scripts/check-nearby-course.ts). 시장·공원과 나란히 서서
 *    「여기서 600m」라고 적혀 있었다. **손님은 그걸 보고 걸어간다. 가면 아무것도 없다.**
 *
 *    이건 「값이 조금 틀린 것」과 다른 종류의 잘못이다 — Kfood 에서 이미 한 줄로 적어 둔 것과
 *    같다: **「없는 메뉴를 적는 게 값이 틀린 것보다 나쁘다 — 손님이 그걸 시키려다 헛걸음한다.」**
 *
 * ⚠️ 목록 화면(동네 탭·계절 탭)에서는 축제를 그대로 보여 줘도 된다. 거기는 **「무엇이 있나」**를
 *    보는 자리고 날짜가 같이 붙는다. 코스는 **「지금 여기서 걸어가라」**는 말이라 잣대가 다르다.
 *
 * 그래서 축제는 **오늘 열리고 있는 것만** 넣는다. 날짜를 모르는 축제는 **뺀다** —
 * 「모르니까 일단 넣는다」가 곧 헛걸음이다. 빈 칸이 틀린 정보보다 낫다.
 */
function onToday(p: Place, today: string): boolean {
  // 이름에 지난 연도가 박힌 것은 갈래를 가리지 않고 뺀다 (「2025 서울한옥위크」)
  if (isPastEdition(p.name)) return false;
  if (p.category !== "festival") return true;
  const d = guFestivalDate(p.id);
  // guFestivalDate 는 「아직 안 끝났다」까지만 본다. 코스는 **오늘 열려 있어야** 한다 —
  // 다음 주에 시작하는 축제로 손님을 오늘 보내면 안 된다.
  return !!d && d.start <= today && today <= (d.end ?? d.start);
}

/** 오늘(현지 시각) YYYY-MM-DD. 서울에서 보는 앱이라 UTC 로 자르면 하루가 밀린다. */
function todayYmd(now: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** 좌표가 있고 확인됐고 **오늘 가도 되는** 곳만. 좌표 없는 곳을 0m 로 두면 맨 앞에 선다. */
function usable(places: readonly Place[], categories: readonly Category[] | undefined, now: Date): (Place & Point)[] {
  const today = todayYmd(now);
  return places.filter(
    (p): p is Place & Point =>
      p.confirmed &&
      p.lat != null &&
      p.lng != null &&
      onToday(p, today) &&
      (!categories || categories.length === 0 || categories.includes(p.category)),
  );
}

/**
 * 🧮 **최근접 이웃으로 잇는다.**
 *
 * ① 내 위치에서 가장 가까운 곳을 첫 곳으로
 * ② 거기서 가장 가까운 **아직 안 간 곳**을 다음으로
 * ③ 고른 곳 수만큼 차거나, 한도 안에 더 갈 곳이 없으면 멈춘다
 *
 * ⚠️ **이건 최단 경로가 아니다.** 그래도 괜찮다 — 우리가 손님에게 약속하는 것은
 *    「가까운 것끼리 묶었다」이지 「가장 짧은 길」이 아니다. **말한 것만 지키면 된다.**
 *    (외판원 문제를 제대로 풀려고 들면 브라우저에서 돌릴 수 없고, 풀어 봐야
 *     직선거리 기준이라 실제 골목길에서는 어차피 그 순서가 아니다.)
 *
 * 못 만들면 **null** — 한 곳도 한도 안에 없다는 뜻이다. 억지로 먼 곳을 끌어오지 않는다.
 */
export function buildCourse(
  places: readonly Place[],
  origin: Point,
  { size, reach, categories, now = new Date() }: CourseOptions,
): Course | null {
  const pool = usable(places, categories, now);
  if (pool.length === 0) return null;

  // ① 첫 곳 — 내 위치에서 한도 안에 있는 것 중 가장 가까운 곳.
  //    한도를 첫 구간에도 그대로 건다. 3km 밖에서 시작하는 「내 주변 코스」는
  //    이름과 다른 물건이다.
  let best: (Place & Point) | null = null;
  let bestM = Infinity;
  for (const p of pool) {
    const m = metersBetween(origin, p);
    if (m < bestM && m <= reach) {
      best = p;
      bestM = m;
    }
  }
  if (!best) return null;

  const left = new Set(pool);
  left.delete(best);
  const stops: CourseStop[] = [{ place: best, fromPrev: bestM }];
  let at: Point = best;

  /** 이미 넣은 곳 어디와도 MIN_GAP 안에 붙어 있지 않은가 — 위 MIN_GAP 주석 참고 */
  const apart = (p: Point) => stops.every((s) => metersBetween(s.place, p) >= MIN_GAP);

  // ②③ 한도 안에서 가장 가까운 다음 곳을 계속 잇는다
  while (stops.length < size) {
    let next: (Place & Point) | null = null;
    let nextM = Infinity;
    for (const p of left) {
      const m = metersBetween(at, p);
      if (m < nextM && m <= reach && apart(p)) {
        next = p;
        nextM = m;
      }
    }
    if (!next) break; // 한도 안에 더 갈 곳이 없다 — 있는 만큼만 내놓는다
    left.delete(next);
    stops.push({ place: next, fromPrev: nextM });
    at = next;
  }

  const toFirst = stops[0].fromPrev;
  const between = stops.slice(1).reduce((s, x) => s + x.fromPrev, 0);
  return { origin, stops, toFirst, between, total: toFirst + between, asked: size };
}

/**
 * 📏 화면에 적는 거리 — **직선거리다.**
 *
 * 1km 아래는 10m 단위로 끊는다. 「437m」는 우리 좌표가 그만큼 정확하다는 말이
 * 되는데, 관광공사 좌표는 건물 한가운데를 찍은 것이라 그 정도는 아니다.
 * 「440m」면 손님이 판단하는 데 충분하고, 없는 정밀도를 주장하지 않는다.
 */
export function formatMeters(m: number): string {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
}
