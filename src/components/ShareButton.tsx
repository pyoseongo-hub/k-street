import { useState } from "react";
import { placeUrl, sharePlace } from "../lib/shareLink";
import { useLanguage } from "../lib/useLanguage";

// 🔗 **공유** — 카드 맨 윗줄(구·날짜 옆)에 붙는다.
//
// 왜 여기인가 (2026-09-09 사장님: "공유는 날짜확인 9월말 옆으로") —
// 아래 단추 줄은 자리가 **298px** 뿐이라 낱말 단추 셋이 절대 안 들어간다.
// 그런데 윗줄은 오른쪽이 늘 비어 있다. 거기로 올리면 아래 줄이 둘이 되어
// **목적지 보여주기·주변 먹거리가 같은 칸으로** 나란히 선다.
//
// 🚨 주소가 없는 곳(아직 곳 페이지가 없는 곳)은 **아무것도 안 그린다** —
//    없는 주소를 지어내지 않는다(shareLink.ts 규칙 그대로).
export default function ShareButton({
  place,
  className = "",
}: {
  place: { id?: string; name: string };
  className?: string;
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const url = placeUrl(place.id);
  if (!url) return null;

  async function onShare() {
    if (!url) return;
    const r = await sharePlace(place.name, url);
    // 「복사됨」은 복사했을 때만 띄운다 — 공유창이 열렸으면 손님이 이미 봤다.
    if (r === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button type="button" className={`meta-share ${className}`.trim()} onClick={onShare}>
      <span aria-hidden="true">🔗</span>
      {copied ? t.shareCopied : t.shareLabel}
    </button>
  );
}
