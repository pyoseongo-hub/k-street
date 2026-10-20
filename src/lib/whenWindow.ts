// 🗓️ **오늘 · 이번 주말 · 이번 주** — 기간을 날짜 두 개로 바꾼다.
//
// 사장님 요청서 (2026-10-20) ② 「이번 주말 뭐 하지?」.
// 계절 화면은 「달」까지만 고를 수 있어서, 금요일 저녁에 「내일 갈 데」를 찾는
// 손님이 10월 축제 54곳을 다 훑어야 했다.
//
// 🚨 **확정 날짜가 있는 축제만 이 기간에 넣는다.** 달만 아는 축제를 「이번 주말」에
//    끼우면 그건 추측이다 — 손님은 그 말을 믿고 간다. 달만 아는 것은 지금처럼
//    달별 보기에 남는다(화면에도 그렇게 적는다).
//
// 📅 날짜는 **폰의 현지 날짜**로 자른다. guFestival.ts 의 todayYmd 와 같은 잣대다 —
//    UTC 로 자르면 서울 아침 9시 전까지 하루가 밀린다.

export type WhenKind = "today" | "weekend" | "week";

export interface WhenWindow {
  /** YYYY-MM-DD */
  from: string;
  /** YYYY-MM-DD (그날 포함) */
  to: string;
}

const ymd = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const plusDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/**
 * 기간의 첫날과 끝날.
 * - 오늘: 오늘 하루
 * - 이번 주: 오늘부터 이번 일요일까지 (월요일 시작 주)
 * - 이번 주말: 토·일. 오늘이 토요일이면 오늘·내일, 일요일이면 오늘만,
 *   평일이면 **다가오는** 토·일
 */
export function whenWindow(kind: WhenKind, now: Date = new Date()): WhenWindow {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dow = today.getDay(); // 0 = 일요일, 6 = 토요일
  if (kind === "today") return { from: ymd(today), to: ymd(today) };
  const toSunday = dow === 0 ? 0 : 7 - dow;
  if (kind === "week") return { from: ymd(today), to: ymd(plusDays(today, toSunday)) };
  // weekend
  if (dow === 0) return { from: ymd(today), to: ymd(today) };
  if (dow === 6) return { from: ymd(today), to: ymd(plusDays(today, 1)) };
  return { from: ymd(plusDays(today, 6 - dow)), to: ymd(plusDays(today, toSunday)) };
}

/** 행사 기간(start~end)이 이 기간과 하루라도 겹치나 */
export function overlaps(w: WhenWindow, start: string, end?: string): boolean {
  return start <= w.to && (end ?? start) >= w.from;
}

/** 기간 안에 든 요일들(0 = 일요일). 기간은 길어야 7일이다. */
export function weekdaysIn(w: WhenWindow): Set<number> {
  const out = new Set<number>();
  const [y, m, d] = w.from.split("-").map(Number);
  for (let i = 0; i < 7; i++) {
    const day = new Date(y, m - 1, d + i);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    if (key > w.to) break;
    out.add(day.getDay());
  }
  return out;
}

/**
 * 🗓️ **정해진 요일에만 여는 행사** — 사람이 적어 둔 기간 문구(dateLabel·note)에서 읽는다.
 *
 * 🚨 왜 (2026-10-20, 화면을 띄워 보고 찾았다) — 「차 없는 잠수교 뚜벅뚜벅 축제」는
 *    확정 기간이 9월 6일 – 10월 25일인데 **매주 일요일에만** 연다. 기간만 보면 화요일
 *    「오늘 열리는」 목록에 뜬다 — 손님이 화요일에 잠수교에 가면 차가 다닌다.
 *    적혀 있는 요일만 믿는다. 안 적혀 있으면 undefined(= 모른다)를 돌려준다.
 */
export function onlyOnWeekdays(text: string | undefined): number[] | undefined {
  if (!text) return undefined;
  if (/매주\s*(토·일|토,\s*일|토요일·일요일|주말)|주말에만/.test(text)) return [6, 0];
  if (/매주\s*일요일/.test(text)) return [0];
  if (/매주\s*토요일/.test(text)) return [6];
  return undefined;
}

/** 이 기간보다 긴 행사(며칠 내내 여는지 모른다)를 따로 묶는 기준 — 2주. */
export const LONG_RUN_DAYS = 14;

export function spanDays(start: string, end?: string): number {
  if (!end) return 1;
  const a = new Date(start + "T00:00:00");
  const b = new Date(end + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
}
