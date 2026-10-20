// 🧭 **메인 맨 위 바로가기 4칸** — 사장님 요청서 (2026-10-20) 「메인 화면 개편」.
//
//   내 주변 · 이번 주말 · 오늘 열리는 · 걷는 길
//
// ── 새 화면을 만들지 않는다 ─────────────────────────────────────────────
//   네 칸 모두 **이미 있는 화면으로 가는 문**이다. 요청서 6-2 「기존 기능과 중복되는
//   신규 기능을 만들지 않는다」. 그래서 아래 탭을 4개로 늘리지 않았다 — 탭을 늘리면
//   같은 화면으로 가는 문이 둘이 된다(2026-09-13 ☂️ 단추를 뺀 것과 같은 이유).
//     · 내 주변 → 동네 화면의 「내 주변 코스」를 펼친다(위치는 여전히 「만들기」에서만 묻는다)
//     · 이번 주말 · 오늘 열리는 → 계절 화면의 기간 칩(whenWindow.ts)
//     · 걷는 길 → 동네 화면의 산책길 칩
//
// ── 「무료 행사」 칸은 넣지 않았다 ─────────────────────────────────────
//   요청서에는 Free Events 가 있었지만, 무료 여부가 정리된 자료가 없다(설명글에
//   「무료」가 적힌 곳 19곳뿐). 확인 못 한 「무료」를 붙이면 입장료 있는 곳에 손님을
//   보낸다. 그 자리에 「오늘 열리는」을 넣었다 — 검토서(2026-10-20) ② 참고.
//
// ── 글자로 쓴다 ────────────────────────────────────────────────────────
//   그림만 둔 단추는 사장님이 두 번 다 못 알아보셨다(CLAUDE.md 「아이콘은 두 번 다 못 읽으셨다」).
import { useLanguage } from "../lib/useLanguage";

export type QuickTarget = "near" | "weekend" | "today" | "walk";

export default function QuickLinks({ onGo }: { onGo: (to: QuickTarget) => void }) {
  const { t } = useLanguage();
  const items: { key: QuickTarget; label: string }[] = [
    { key: "near", label: t.quickNear },
    { key: "weekend", label: t.quickWeekend },
    { key: "today", label: t.quickToday },
    { key: "walk", label: t.quickWalk },
  ];
  return (
    <nav className="quick-links" aria-label={t.quickNavLabel}>
      {items.map((it) => (
        <button key={it.key} type="button" onClick={() => onGo(it.key)}>
          {it.label}
        </button>
      ))}
    </nav>
  );
}
