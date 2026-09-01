import { useEffect, useMemo, useState } from "react";
import SeasonArt from "./SeasonArt";
import { ALL_PLACES } from "../data/seed";
import { getTourImage } from "../lib/tourImages";
import { seasonOf, type SeasonKey } from "../lib/season";
import { useLanguage } from "../lib/useLanguage";

// 2026-08-29 사용자 지시: 계절 히어로를 일러스트 한 장이 아니라 "봄 꽃길·여름
// 분수·가을 단풍·겨울 눈" 같은 실제 사진이 여러 장 돌아가게 해달라는 요청.
//
// 🚨 하지만 스톡 사진이나 웹에서 긁어온 이미지는 쓰지 않는다(정확도·저작권
// 원칙) — 앱이 이미 쓰고 있는 유일한 실사진 출처는 한국관광공사 TourAPI
// (공공누리 1유형, tour-images.json)뿐이다. 그래서 이 컴포넌트는 "지어낸
// 20장"이 아니라, 실제로 확보된 사진만 그 계절 후보로 모아 돌린다 — 아직 그
// 계절에 확보된 사진이 하나도 없으면 기존 일러스트(SeasonArt)로 그대로
// 대체한다(빈 화면 대신, 그리고 가짜 사진 대신). fetch-tour-images 액션을
// 더 돌릴수록 이 로테이션에 사진이 자동으로 늘어난다.
const CATEGORY_SEASON: Partial<Record<string, SeasonKey>> = {
  flower: "spring", // 벚꽃 등 꽃길은 봄
  walk: "summer", // 분수·물가 산책로가 많은 카테고리
  hike: "autumn", // 단풍 산행 이미지가 많은 카테고리
};

function seasonalPhotos(season: SeasonKey): string[] {
  const urls: string[] = [];
  for (const p of ALL_PLACES) {
    const placeSeason =
      p.category === "festival"
        ? p.startMonth != null
          ? seasonOf(p.startMonth)
          : undefined
        : CATEGORY_SEASON[p.category];
    if (placeSeason !== season) continue;
    const photo = getTourImage(p.id);
    // 화면 전체 폭을 채우는 배너라 썸네일(_image3_)을 쓰면 특히 심하게 뭉개진다 —
    // 원본(_image2_)을 먼저 쓴다(2026-09-01 사용자 지적 "사진 화질이 안 좋아").
    if (photo) urls.push(photo.image ?? photo.thumb);
  }
  return urls;
}

interface Props {
  season: SeasonKey;
  seed?: number;
  dense?: boolean;
  className?: string;
}

export default function SeasonPhotoHero({ season, seed = 0, dense = false, className }: Props) {
  const { t } = useLanguage();
  const photos = useMemo(() => seasonalPhotos(season), [season]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    if (photos.length < 2) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % photos.length), 3500);
    return () => clearInterval(timer);
  }, [photos]);

  if (photos.length === 0) {
    return <SeasonArt season={season} seed={seed} dense={dense} className={className} />;
  }

  return (
    <div className={`${className ?? ""} season-photo-hero`}>
      {photos.map((url, i) => (
        <div
          key={url}
          className="season-photo-hero-slide"
          style={{ backgroundImage: `url(${url})`, opacity: i === idx ? 1 : 0 }}
        />
      ))}
      <span className="fc-photo-credit season-photo-hero-credit">{t.photoCredit}</span>
    </div>
  );
}
