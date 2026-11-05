// 📋 **이번 달·다음 달 축제 중 날짜가 확정 안 된 것** — check-month-pending.mjs 가 매일 물어볼 목록.
//
// 사장님 (2026-11-05): *"해당 달의 행사는 날짜 지나기 전까지 날짜 확정 없으면 매일 확인하게
// 루틴에 넣어 — 관광공사 · 시청 · 구청 확인"*.
//
// 잣대는 화면과 **똑같은 것**을 쓴다(festivalFreshness) — 잣대가 둘이면 반쪽 적용이 생긴다.
//   1 날짜 미정 · 3 작년 자료뿐 → 물어본다
//   0 올해 확정 · 2 올해 끝남 → 안 묻는다(이미 알거나, 지났다)
// 「해당 달」은 **이번 달**이다. 달이 바뀌면 그 달 것이 목록에 들어온다 — 날마다 저절로.
import { ALL_FESTIVALS } from "../src/data/seed";
import { festivalFreshness } from "../src/lib/guFestival";

const 이번달 = new Date(Date.now() + 9 * 3600_000).getUTCMonth() + 1; // 한국 시간

function opensIn(p: { startMonth?: number; endMonth?: number }, m: number): boolean {
  if (p.startMonth == null) return false;
  const e = p.endMonth ?? p.startMonth;
  return p.startMonth <= e ? m >= p.startMonth && m <= e : m >= p.startMonth || m <= e;
}

export const TARGETS = ALL_FESTIVALS.filter((p) => opensIn(p, 이번달))
  .map((p) => ({ p, k: festivalFreshness(p) }))
  .filter(({ k }) => k === 1 || k === 3)
  .map(({ p, k }) => ({
    id: p.id,
    name: p.name,
    city: p.city ?? "seoul",
    gu: p.gu,
    officialUrl: p.officialUrl ?? "",
    freshness: k,
  }));

export const MONTH = 이번달;
