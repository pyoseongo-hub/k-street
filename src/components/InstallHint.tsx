import { useEffect, useState } from "react";
import { useLanguage } from "../lib/useLanguage";

// 📲 "홈 화면에 추가" 안내 (2026-09-04 홍보 준비).
//
// 이 앱은 PWA다 — 홈 화면에 추가하면 주소창 없이 앱처럼 열리고, 서비스워커가
// 받아 둔 덕에 **지하철·비행기에서도** 이미 본 화면이 열린다. 그런데 손님은
// 그걸 모른다. 알려 주지 않으면 브라우저 탭 하나로 한 번 보고 끝난다.
//
// 두 갈래로 갈린다 — 이게 이 화면의 전부다:
//
//  · **안드로이드/크롬**은 브라우저가 `beforeinstallprompt`를 던져 준다.
//    그걸 붙잡아 뒀다가 손님이 단추를 누를 때 진짜 설치 창을 띄운다.
//  · **아이폰 사파리는 그런 게 없다.** 방법이 하나뿐이다 —
//    공유(⬆️) → "홈 화면에 추가". 그래서 **글로 알려 주는 수밖에 없다.**
//
// 이미 설치해서 쓰는 중이면(standalone) 아무것도 안 띄운다. 한 번 닫으면
// 다시 안 띄운다 — 계속 따라다니는 설치 배너만큼 미움받는 것도 없다.

const DISMISS_KEY = "k-street-install-hint-dismissed";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** 이미 홈 화면에서 열고 있나. iOS는 표준 밖 속성이라 따로 본다. */
function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

const isIosSafari = () => {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  // 아이폰의 크롬·파이어폭스도 속은 사파리지만 '홈 화면에 추가'가 없다 —
  // 그쪽에 사파리 안내를 띄우면 못 찾는 메뉴를 찾게 만든다.
  const realSafari = !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return ios && realSafari;
};

export default function InstallHint() {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [closed, setClosed] = useState(true);

  useEffect(() => {
    if (isStandalone()) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // 저장소를 막아 둔 브라우저 — 이번 방문에는 그냥 보여 준다.
    }
    if (dismissed) return;

    setClosed(false);
    setIos(isIosSafari());

    const onPrompt = (e: Event) => {
      // 브라우저가 알아서 띄우는 창은 막고, 우리 단추가 눌릴 때 띄운다.
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    // 설치가 끝나면 안내를 치운다.
    const onInstalled = () => setClosed(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function close() {
    setClosed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // 못 적어 둬도 이번 방문 동안은 안 뜬다.
    }
  }

  // 설치 창을 띄울 수도 없고 아이폰도 아니면(데스크톱 브라우저 등) 할 말이 없다.
  if (closed || (!prompt && !ios)) return null;

  return (
    <div className="install-hint">
      <span className="install-hint-icon" aria-hidden="true">📲</span>
      <div className="install-hint-text">
        <b>{t.installTitle}</b>
        <span>{prompt ? t.installBody : t.installBodyIos}</span>
      </div>
      {prompt && (
        <button
          type="button"
          className="install-hint-btn"
          onClick={async () => {
            await prompt.prompt();
            await prompt.userChoice;
            close();
          }}
        >
          {t.installAction}
        </button>
      )}
      <button
        type="button"
        className="install-hint-close"
        onClick={close}
        aria-label={t.installDismiss}
      >
        ✕
      </button>
    </div>
  );
}
