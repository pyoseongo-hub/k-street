import { useState } from "react";
import { shareApp } from "../lib/shareLink";
import { useLanguage } from "../lib/useLanguage";

// 🔗 **앱을 통째로 보내는 단추** (2026-09-06 사장님: "우리 앱을 링크 공유가없네").
//
// ─────────────────────────────────────────────────────────────────────────
// 자리를 화면 맨 아래에서 **머리줄 맨 오른쪽**으로 옮겼다 (2026-09-12)
// ─────────────────────────────────────────────────────────────────────────
// 사장님: *"통 공유 다크모드 옆 맨 위 오른쪽 공유 아이콘 만들어서 옮겨 줘"*
//
// 그전에는 **화면 맨 아래 소개 줄 옆**에 「🔗 앱 공유하기」라고 낱말까지 붙여
// 두었다. 내가 그 자리를 고른 이유는 「목록을 다 본 뒤가 남에게 권할 마음이
// 드는 자리」였는데, **자료가 늘면서 그 자리가 너무 멀어졌다** — 축제 목록을
// 끝까지 내려야 나오므로 대부분의 손님은 그 단추를 **한 번도 못 본다.**
// 이 저장소는 같은 일을 이미 겪었다: 「계절 ↔ 동네」도 아래에 있다가
// *"자료가 많아지면서 이 페이지가 너무 아래인데"* 소리를 듣고 맨 위로 올라갔다
// (HomeSwitch.tsx). **아래에 있는 것은 자료가 늘수록 없는 것이 된다.**
//
// ⚠️ **머리줄로 오면서 낱말을 잃는다 — 그 대가를 안다.**
//    아이콘만 있는 단추는 무슨 뜻인지 모르겠다는 지적을 두 번 받았다
//    ("아이콘 몬지 모르겠어" · "이것도 뭐가뮛지 알수가없네"). 그래서 세 가지로 받친다:
//    · 🔗 은 공유에 쓰이는 그림 중 가장 널리 쓰이는 것이다(폰 기본 공유창도 이 계열).
//    · `aria-label` 에 12개 언어로 뜻을 적는다 — 화면을 읽어 주는 손님에게는 낱말이 간다.
//    · 눌렀을 때 **무슨 일이 났는지 낱말로 보여 준다**(아래 share-toast).
//      링크가 복사되는 PC 에서는 이게 없으면 **아무 일도 안 난 것처럼 보인다.**
export default function ShareApp() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const r = await shareApp();
    // 「복사됨」은 복사했을 때만 띄운다 — 공유창이 열렸으면 손님이 이미 봤다.
    if (r === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <span className="share-wrap">
      <button
        type="button"
        className="icon-btn app-share-btn"
        onClick={onClick}
        aria-label={t.shareAppLabel}
      >
        <span aria-hidden="true">{copied ? "✅" : "🔗"}</span>
      </button>
      {/* 🗣️ `role="status"` — 화면을 읽어 주는 손님에게도 「복사됨」이 전해진다.
          그림만 ✅ 로 바꾸면 눈으로 보는 손님만 알게 된다. */}
      {copied && (
        <span className="share-toast" role="status">
          {t.shareCopied}
        </span>
      )}
    </span>
  );
}
