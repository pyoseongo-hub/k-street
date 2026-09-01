import { useEffect, useMemo, useState } from "react";
import SeasonArt from "./SeasonArt";
import { ALL_PLACES, type Place } from "../data/seed";
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
// 🐞 2026-09-01 — 여기가 **엉뚱한 파일을 보고 있었다.**
// getTourImage()는 예전 방식(이름을 맞춰 사진을 붙이던 tour-images.json)을 읽는데,
// 그 파일에는 **딱 1장**이 들어 있다. 그 뒤 관광공사 자료를 통째로 받아오면서
// 사진 265장이 항목 자체(p.image)에 붙었는데 이 화면만 몰랐다. 그래서 계절 표지가
// 거의 항상 일러스트로 떨어졌다(사용자: "위에 계절별 이미지 바뀌는 거 화사한 걸로").
// 이제 p.image를 먼저 보고, 없을 때만 옛 파일을 본다.

/** 이 곳이 어느 계절의 사진으로 어울리나. 못 정하면 undefined — 아무 계절에도 안 쓴다. */
function seasonOfPlace(p: Place): SeasonKey | undefined {
  // ① 축제는 **실제로 열리는 달**이 있다. 짐작할 필요가 없다.
  if (p.category === "festival") {
    return p.startMonth != null ? seasonOf(p.startMonth) : undefined;
  }
  // ② 이름에 계절이 드러나면 그걸 따른다 — 벚꽃길을 여름 표지에 쓸 수는 없다.
  const n = p.name.normalize("NFC");
  if (/(벚꽃|봄꽃|진달래|철쭉|유채|매화)/.test(n)) return "spring";
  if (/(단풍|억새|국화|가을)/.test(n)) return "autumn";
  if (/(빛|라이트|윈터|크리스마스|눈꽃|겨울)/.test(n)) return "winter";
  if (/(계곡|물놀이|분수|수영|워터|해수)/.test(n)) return "summer";
  // ③ 그래도 모르면 칸으로 어림한다. 공원·정원은 초록이 좋은 봄에, 나머지 산책길은
  //    여름에, 등산로는 단풍철에 어울린다. 시장·박물관·골목은 계절이 없어 안 쓴다.
  if (p.category === "flower") return "spring";
  if (p.category === "walk") return /(공원|정원|수목원|숲)/.test(n) ? "spring" : "summer";
  if (p.category === "hike") return "autumn";
  return undefined;
}

function seasonalPhotos(season: SeasonKey): string[] {
  const urls: string[] = [];
  for (const p of ALL_PLACES) {
    if (seasonOfPlace(p) !== season) continue;
    const legacy = getTourImage(p.id);
    // 화면 폭을 꽉 채우는 배너라 썸네일(_image3_)을 쓰면 특히 심하게 뭉개진다 —
    // 원본(_image2_)을 먼저 쓴다(2026-09-01 "사진 화질이 안 좋아").
    const url = p.image ?? p.thumb ?? legacy?.image ?? legacy?.thumb;
    if (url) urls.push(url);
  }
  // 너무 많으면 한 바퀴 도는 데 몇 분씩 걸린다. 앞에서 여덟 장만 쓴다.
  return urls.slice(0, 8);
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
