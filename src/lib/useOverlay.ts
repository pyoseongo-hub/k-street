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
// 🚨 여기서 틀리기 쉬운 자리 넷 — 다 밟아 보고 적는다
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
//    → 어느 쪽으로 닫혔는지 기억해 둔다.
//
// ④ 🚨 **화면이 겹쳐 뜨면(전체화면 위의 전체화면) 뒤로가기 한 번에 둘 다 닫힌다.**
//    2026-09-25에 사장님이 잡으셨다: *"짐보관에서 뒤로가기하면 꺼짐"*.
//
//    · 짐보관 카드는 혼자만 뜨는 게 아니다. **비 오는 날 화면 → 곳 카드 → 짐보관**
//      처럼 전체화면 **위에** 뜬다(RainyPanel → MapDirections → LuggageCard).
//    · 그런데 popstate 는 **window 에 붙는 전역 사건**이다. 열려 있는 화면마다
//      각자 처리기를 달아 놨으니, 뒤로가기 **한 번에 전부가 반응**한다 —
//      짐보관만 닫으려 했는데 **그 밑 화면까지 같이 닫힌다.**
//    · 게다가 밑 화면이 남긴 기록 칸은 **안 먹힌 채로 남는다.** 그래서 다음
//      뒤로가기는 아무 일도 안 하는 헛발이 되고, **그다음 한 번이 앱을 끈다.**
//      손님 눈에는 그냥 "짐보관에서 뒤로가기하면 꺼짐"이다.
//
//    🔑 고치는 법 — **처리기를 하나만 둔다.** 떠 있는 화면들을 층(stack)으로
//       쌓아 두고, 뒤로가기는 **맨 위 한 장만** 닫는다. 화면마다 처리기를 달면
//       이 규칙을 강제할 방법이 없다.
//
// ⚠️ 이 고리(Esc · 스크롤 잠금)는 원래 화면 셋에 **똑같이 복사돼 있었다.**
//    뒤로가기까지 각자 넣으면 위 넷을 세 번 틀린다. **잣대는 하나만 둔다.**

import { useEffect, useRef } from "react";

/** 떠 있는 전체화면 한 장. 맨 뒤가 **맨 위**(가장 나중에 열린 것)다. */
type Layer = {
  /** 닫으라고 부를 것. 늘 최신 onClose 를 부른다(①). */
  close: () => void;
  /** 뒤로가기로 닫혔나 — 정리할 때 back() 을 또 부르지 않으려고 본다(③). */
  byBack: boolean;
};

/** 🚨 **모듈 하나에 층 하나.** 화면마다 두면 ④ 를 막을 수 없다. */
const layers: Layer[] = [];
let listening = false;

/** 뒤로가기 한 번 = **맨 위 한 장만** 닫는다(④). */
function onPop(): void {
  const top = layers[layers.length - 1];
  if (!top) return;
  top.byBack = true;
  top.close();
  // 층에서 빼는 것은 **정리(cleanup)에서** 한다 — 화면이 실제로 사라진 뒤라야
  // 아래 화면이 「내가 맨 위」가 된다. 여기서 빼면 닫히는 도중에 순서가 어긋난다.
}

function sync(): void {
  const want = layers.length > 0;
  if (want === listening) return;
  if (want) window.addEventListener("popstate", onPop);
  else window.removeEventListener("popstate", onPop);
  listening = want;
}

/**
 * 지금 전체화면이 떠 있나.
 *
 * 🚇 **HomeSwitch 가 이걸 본다.** 그쪽도 popstate 를 듣는데(띠를 눌러 건너온
 *    화면으로 돌아가려고), 전체화면이 떠 있는 동안의 뒤로가기는 **그 화면 몫**이다.
 *    안 보면 짐보관을 닫는 한 번이 홈 화면까지 같이 되돌린다 — ④ 와 같은 사고다.
 */
export function overlayOpen(): boolean {
  return layers.length > 0;
}

/**
 * 전체화면 하나가 지켜야 할 것을 한 곳에 모았다.
 *   · 폰 뒤로가기로 닫힌다 (앱이 꺼지지 않는다)
 *   · 겹쳐 떠 있으면 **맨 위 한 장만** 닫힌다 (④)
 *   · Esc 로 닫힌다 (PC)
 *   · 떠 있는 동안 뒤 목록이 같이 스크롤되지 않는다
 *
 * @param onClose 닫을 때 부를 것. **매번 새로 만든 함수여도 된다** — 위 ① 참고.
 */
export function useOverlay(onClose: () => void): void {
  // 늘 최신 onClose 를 부르되, 효과는 다시 돌지 않게 한다(①).
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const layer: Layer = { close: () => close.current(), byBack: false };
    layers.push(layer);
    sync();

    let pushed = false;
    try {
      window.history.pushState({ ksOverlay: true }, "");
      pushed = true;
    } catch {
      // 아주 드물게 막힌 브라우저가 있다. 그때는 뒤로가기가 예전처럼 동작할 뿐,
      // 화면이 깨지지는 않는다 — 여기서 멈추지 않는다.
    }

    // ⌨️ Esc 도 **맨 위 한 장만** 닫는다. 뒤로가기와 잣대가 달라지면
    //    PC 와 폰에서 다르게 굴어 재현이 안 되는 사고가 된다.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (layers[layers.length - 1] !== layer) return;
      close.current();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      const i = layers.lastIndexOf(layer);
      if (i >= 0) layers.splice(i, 1);
      sync();
      document.removeEventListener("keydown", onKey);
      // 🚨 **밑에 아직 화면이 남아 있으면 잠금을 풀지 않는다.** 풀어 버리면
      //    짐보관만 닫았는데 그 밑 비 오는 날 목록이 같이 스크롤된다.
      if (layers.length === 0) document.body.style.overflow = prevOverflow;
      // 단추·Esc 로 닫았으면 우리가 남긴 칸을 도로 뺀다(②).
      // 뒤로가기로 닫혔으면 브라우저가 이미 뺐다 — 또 부르면 한 칸 더 나간다(③).
      if (pushed && !layer.byBack) window.history.back();
    };
    // 🚨 **빈 배열이어야 한다.** 이유는 ① 에 적었다 — 여기에 onClose 를 넣으면
    //    그릴 때마다 기록이 쌓인다.
  }, []);
}
