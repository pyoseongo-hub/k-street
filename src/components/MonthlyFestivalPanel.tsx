import { useMemo, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import SeasonMonthPicker from "./SeasonMonthPicker";
import SeasonArt from "./SeasonArt";
import SeasonPhotoHero from "./SeasonPhotoHero";
import { FESTIVALS } from "../data/seed";
import { seasonOf } from "../lib/season";
import { useRotatingSeed } from "../lib/useRotatingSeed";
import { getTourImage } from "../lib/tourImages";
import { districtFullName } from "../data/districtNamesEn";
import MapDirections from "./MapDirections";
import { openPlaceInfo } from "../lib/mapLinks";

const nowMonth = new Date().getMonth() + 1;

export default function MonthlyFestivalPanel() {
  const { t, language } = useLanguage();
  const [month, setMonth] = useState(nowMonth);
  const rotatingSeed = useRotatingSeed();

  const festivals = useMemo(
    () =>
      FESTIVALS.filter((f) => {
        if (f.startMonth == null) return false;
        const end = f.endMonth ?? f.startMonth;
        return month >= f.startMonth && month <= end;
      }),
    [month]
  );

  return (
    <section className="panel monthly-festival-panel">
      <SeasonPhotoHero className="mfp-hero" season={seasonOf(month)} seed={rotatingSeed} dense />
      <div className="panel-inner">
        <div className="panel-head">
          <span className="panel-eyebrow">{t.monthlyEditorLabel}</span>
          <h2>{t.monthlyTitle(month)}</h2>
        </div>
        <SeasonMonthPicker month={month} onChange={setMonth} />
        <div className="festival-cards">
          {festivals.length === 0 && (
            <p className="empty-note">
              {t.noFestivalsMessage(month)}
            </p>
          )}
          {festivals.map((f, i) => {
            const photo = getTourImage(f.id);
            return (
            <div className="festival-card" key={f.id}>
              {photo ? (
                <div className="fc-art fc-art-photo" style={{ backgroundImage: `url(${photo.image ?? photo.thumb})` }}>
                  <span className="fc-photo-credit">{t.photoCredit}</span>
                </div>
              ) : (
                <SeasonArt
                  className="fc-art"
                  season={seasonOf(f.startMonth!)}
                  seed={rotatingSeed * 100 + i}
                />
              )}
              <div className="fc-body">
                <div className="fc-top">
                  <span className="fc-gu">{districtFullName(f.gu, language)}</span>
                  {f.dateLabel && <span className="fc-date">{f.dateLabel}</span>}
                </div>
                {/* 장소 카드와 같은 규칙 — 이름을 누르면 네이버 통합검색으로 간다.
                    축제는 지도에 등록된 '장소'가 아니라 며칠만 열리는 '행사'라
                    지도에서 찾으면 "검색결과가 없습니다"가 뜬다(2026-09-01 사용자 캡처).
                    통합검색으로 보내면 그 자치구의 공식 행사 안내 페이지가 잡힌다. */}
                <button
                  type="button"
                  className="fc-name pr-name-link"
                  onClick={() => openPlaceInfo(f)}
                >
                  {f.name}
                  <span className="pr-name-arrow" aria-hidden="true">↗</span>
                </button>
                {f.note && <div className="fc-note">{f.note}</div>}
                {/* 관광공사 사진과 함께 받은 실제 좌표(fetch-tour-images.mjs)가 있으면
                    길찾기에도 쓴다 — 2026-08-29 사용자 지적: 좌표가 이미 있는데도
                    "검색" 링크만 뜨고 "길찾기 단계"로 못 가는 걸 잡음. */}
                <MapDirections
                  place={
                    f.lat == null && photo?.lat != null
                      ? { ...f, lat: photo.lat, lng: photo.lng }
                      : f
                  }
                />
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
