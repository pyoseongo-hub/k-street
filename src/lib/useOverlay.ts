// 🔙 **전체화면을 열었을 때 폰 뒤로가기로 닫히게 한다.**
//
// 사장님 지시 (2026-09-12):
//   "여기도 화면이어서 클릭하고 전 화면 가려고 뒤로가기, 폰에 있는 뒤로가기
//    누르면 **화면 꺼져**. 이거 수정해"
//
// ─────────────────────────────────────────────────────────────────────────
// 무슨 일이 일어나고 있었나
// ─────────────────────────────────────────────────────────────────────────
//   우리 전체화면(도착 안내·짐보관·기사님 카드)은 **주소를 바꾸지 않는다.**
//   그래서 안드로이드가 보기에 뒤로 갈 곳은 **앱에 들어오기 전 페이지**뿐이다 —
//   손님은 「화면 하나 닫기」를 눌렀는데 **앱이 통째로 꺼진다.**
//
//   손님이 잘못 누른 게 아니다. 폰에서 전체화면을 닫는 방법은 뒤로가기다.
//   ✕ 단추를 찾아 누르는 사람은 오히려 드물다.
//
// 🔑 고치는 법은 하나뿐이다 — **열 때 주소 기록을 한 칸 남긴다.**
//    그러면 뒤로가기가 그 칸을 먹고, 앱은 그대로 있다.
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 여기서 틀리기 쉬운 자리 셋 — 다 밟아 보고 적는다
// ─────────────────────────────────────────────────────────────────────────
// ① **`onClose` 를 의존성에 넣으면 안 된다.**
//    부모가 `onClose={() => setOpen(false)}` 처럼 그때그때 만든 함수를 넘기면
//    **그릴 때마다 새 함수**라, 의존성에 넣는 순간 효과가 매번 다시 돌고
//    **pushState 가 매번 쌓인다.** 그러면 뒤로가기를 열 번 눌러야 나간다.
//    (지금 App.tsx 가 실제로 그렇게 넘긴다.)
//    → 함수는 **ref 에 담아** 늘 최신 것을 부르고, 효과는 **한 번만** 돌린다.
//
// ② **단추로 닫았을 때는 우리가 남긴 기록을 도로 빼야 한다.**
//    안 빼면 기록이 남아서, 다음 뒤로가기가 **아무 일도 안 하는 한 번**이 된다.
//    손님 눈에는 "뒤로가기가 먹통"이다. → 정리할 때 `history.back()`.
//
// ③ **뒤로가기로 닫혔을 때는 그 back() 을 부르면 안 된다.**
//    이미 브라우저가 기록을 뺐기 때문에, 또 부르면 **한 칸을 더 나간다** —
//    ①을 고치고 나면 이게 앱을 꺼뜨리는 새 원인이 된다.
//    → 어느 쪽으로 닫혔는지 `ref` 로 기억해 둔다.
//
// ⚠️ 이 고리(Esc · 스크롤 잠금)는 원래 화면 셋에 **똑같이 복사돼 있었다.**
//    뒤로가기까지 각자 넣으면 위 셋을 세 번 틀린다. **잣대는 하나만 둔다.**

import { useEffect, useRef } from "react";

/**
 * 전체화면 하나가 지켜야 할 것을 한 곳에 모았다.
 *   · 폰 뒤로가기로 닫힌다 (앱이 꺼지지 않는다)
 *   · Esc 로 닫힌다 (PC)
 *   · 떠 있는 동안 뒤 목록이 같이 스크롤되지 않는다
 *
 * @param onClose 닫을 때 부를 것. **매번 새로 만든 함수여도 된다** — 위 ① 참고.
 */
export function useOverlay(onClose: () => void): void {
  // 늘 최신 onClose 를 부르되, 효과는 다시 돌지 않게 한다(①).
  const close = useRef(onClose);
  close.current = onClose;
  // 뒤로가기로 닫혔나 — 정리할 때 back() 을 또 부르지 않으려고 본다(③).
  const byBack = useRef(false);

  useEffect(() => {
    let pushed = false;
    try {
      window.history.pushState({ ksOverlay: true }, "");
      pushed = true;
    } catch {
      // 아주 드물게 막힌 브라우저가 있다. 그때는 뒤로가기가 예전처럼 동작할 뿐,
      // 화면이 깨지지는 않는다 — 여기서 멈추지 않는다.
    }

    const onPop = () => {
      byBack.current = true;
      close.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
    };
    window.addEventListener("popstate", onPop);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      // 단추·Esc 로 닫았으면 우리가 남긴 칸을 도로 뺀다(②).
      // 뒤로가기로 닫혔으면 브라우저가 이미 뺐다 — 또 부르면 한 칸 더 나간다(③).
      if (pushed && !byBack.current) window.history.back();
    };
    // 🚨 **빈 배열이어야 한다.** 이유는 ① 에 적었다 — 여기에 onClose 를 넣으면
    //    그릴 때마다 기록이 쌓인다.
  }, []);
}
