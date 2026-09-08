import { useState } from "react";
import { shareApp } from "../lib/shareLink";
import { useLanguage } from "../lib/useLanguage";

// 🏠 **앱을 통째로 보내는 단추** (2026-09-06 사장님: "우리 앱을 링크 공유가없네").
//
// 그 전에는 공유가 **곳 카드 안에만** 있었다(MapDirections.tsx). 그러면
// "여기 가 봐"는 보낼 수 있어도 **"이 앱 써 봐"는 보낼 수 없다.**
// 홍보로 퍼지는 건 대개 뒤쪽이다 — 받은 사람이 아직 어디를 갈지 모르기 때문이다.
//
// 📍 자리는 **화면 맨 아래 소개 줄 옆**이다. 머리줄이 아니다:
//    · 머리줄 아이콘은 무슨 뜻인지 모르겠다는 지적을 두 번 받았다
//      ("아이콘 몬지 모르겠어" · "이것도 뭐가뮛지 알수가없네") — 그래서 여기서는
//      그림 옆에 **낱말을 같이** 적는다. 좁은 머리줄에는 그럴 자리가 없다.
//    · 목록을 다 본 뒤가 남에게 권할 마음이 드는 자리다.
//    · 홈에서든 저장한 곳에서든 늘 끝에 붙는다(두 탭 밖에 있다).
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
    <div className="app-share">
      <button type="button" className="app-share-btn" onClick={onClick}>
        <span aria-hidden="true">🔗</span>
        {copied ? t.shareCopied : t.shareAppLabel}
      </button>
    </div>
  );
}
