import { useLanguage } from "../lib/useLanguage";
import LINKS from "../data/video-links.json";

// ▶️ **유튜브 사용법 영상으로 가는 칸** (2026-09-13 사장님: "유튜브에 동영상 설명
//    올릴 거야 / 언어별 링크 줄게 / 설명 링크 걸 수 있는 카드").
//
// 🚨 **주소가 없는 언어에는 카드를 안 그린다.** 이 저장소의 오랜 규칙이다 —
//    없는 곳으로 손님을 보내지 않는다(ShareButton 이 주소 없는 곳에 아무것도 안
//    그리는 것과 같다). 12개 언어 영상을 한 번에 만들 수는 없으니, 만들어진
//    언어에서만 뜨고 나머지 화면은 조용히 비어 있는다.
//
// 📌 **자기 언어 영상이 없으면 영어 것을 대신 보여 준다.** 앱의 다른 화면이 번역이
//    없을 때 영어로 대신 보여 주는 것과 같은 규칙이다 — 없는 것보다 낫다.
//    ⚠️ 다만 그때는 **(English)** 라고 적어 준다. 눌렀더니 못 알아듣는 말이 나오는
//       것은 손님을 속이는 것이다.
const MAP = LINKS as unknown as Record<string, string>;

export default function VideoCard() {
  const { t, language } = useLanguage();
  const mine = (MAP[language] ?? "").trim();
  const fallback = (MAP.en ?? "").trim();
  const url = mine || fallback;
  if (!url) return null;
  const isFallback = !mine && !!fallback && language !== "en";

  return (
    <a className="top-card video-card" href={url} target="_blank" rel="noopener noreferrer">
      <span className="top-card-ic" aria-hidden="true">
        ▶️
      </span>
      <span className="top-card-tx">
        <strong>{t.watchVideo}</strong>
        {isFallback && <span className="video-card-sub">English</span>}
      </span>
      {/* ↗ 는 **새 창으로 나간다**는 표시다. 앱 안에서 열리는 것과 구별해 준다. */}
      <span className="top-card-go" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}
