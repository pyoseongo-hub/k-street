// ✉️ **문의하기** — 화면 맨 아래 작은 링크 하나.
//
// 사장님 지시 (2026-10-03): *"사용자가 문의 메일 보낼수 있게 해"*
//
// ── 왜 입력 양식이 아니라 메일 링크인가 ───────────────────────────────────
//   이 앱은 **서버가 없다.** GitHub Pages 가 파일만 내려 준다. 입력 양식을 두려면
//   받아 줄 데(Formspree·Netlify Forms 같은 것)가 필요하고 그건 달마다 돈이거나
//   공짜 칸이 금방 찬다. 이 저장소의 초심은 **「적은 비용으로 오래」**다.
//   `mailto:` 는 **돈이 안 들고 고장날 게 없다** — 손님의 메일 앱이 열린다.
//
// ── 🚨 아무것도 몰래 담지 않는다 ─────────────────────────────────────────
//   /privacy/ 에 **「K-Street collects nothing」**이라고 적어 뒀다. 그 약속을
//   메일 한 통으로 깨면 안 된다. 그래서 —
//     · 위치·기기·화면 크기 같은 것은 **넣지 않는다**
//     · 지금 보고 있는 **페이지 주소 한 줄**만 넣는다. 어느 화면에서 막혔는지
//       모르면 고칠 수가 없고, 그 한 줄은 **손님이 지우고 보낼 수 있다**
//     · 보내기 전에 **손님이 본문을 다 본다** — 몰래 가는 것이 없다
//
// ── ⚠️ mailto 는 본문을 반드시 인코딩해야 한다 ───────────────────────────
//   줄바꿈·공백·한글이 그대로 들어가면 메일 앱이 제목과 본문을 잘못 끊는다.
//   `encodeURIComponent` 를 쓴다. (`+` 로 공백을 쓰는 옛 방식은 본문에서 깨진다.)
import { useLanguage } from "../lib/useLanguage";

/** 📬 문의를 받는 곳. 바꿀 때는 **여기 한 줄만** 고친다. */
export const CONTACT_EMAIL = "pyosungo2@gmail.com";

export default function ContactLink() {
  const { t } = useLanguage();

  // 지금 보고 있는 주소. 서버에서 페이지를 만들 때(SSR)는 window 가 없다.
  const here = typeof window === "undefined" ? "" : window.location.href;
  const body = here ? `${t.contactBodyHint}\n\n\n---\n${here}\n` : `${t.contactBodyHint}\n\n`;
  const href =
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent(t.contactSubject)}` +
    `&body=${encodeURIComponent(body)}`;

  return (
    <a className="contact-link" href={href}>
      ✉️ {t.contactLabel}
    </a>
  );
}
