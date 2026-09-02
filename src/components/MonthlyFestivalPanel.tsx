import { useMemo, useState, type CSSProperties } from "react";
import { useLanguage } from "../lib/useLanguage";
import SeasonArt from "./SeasonArt";
import SeasonPhotoHero from "./SeasonPhotoHero";
import { ALL_FESTIVALS } from "../data/seed";
import { seasonOf, type SeasonKey } from "../lib/season";
import { useRotatingSeed } from "../lib/useRotatingSeed";
import { getTourImage } from "../lib/tourImages";
import { districtFullName } from "../data/districtNamesEn";
import MapDirections from "./MapDirections";
import PlacePhoto from "./PlacePhoto";
import { openPlaceInfo } from "../lib/mapLinks";
import { placeName, translateText, hasTranslation } from "../lib/placeText";
import { FESTIVAL_THEMES, THEME_ICON, themeOf, type FestivalTheme } from "../data/festivalThemes";

// 「봄 여름 가을 겨울 그리고 서울」 — 지도와 상관없이 **계절 · 달 · 테마**로
// 축제를 고르는 화면이다(사용자 지시 2026-09-01: "이건 지도와상관없이 서울의
// 계절별 월별 축제 등 추천 화면이야").
//
// 예전에는 달 하나로만 걸렀는데, 10월에만 31곳이 몰려 있어서 그 달을 고르면
// 31줄이 그대로 쏟아졌다. 불꽃놀이를 보러 온 사람과 김장을 보러 온 사람에게
// 같은 목록을 주는 셈이라, 세 번째 축인 '테마'를 넣었다(festivalThemes.ts).

const SEASONS: { key: SeasonKey; icon: string; months: number[] }[] = [
  { key: "spring", icon: "🌸", months: [3, 4, 5] },
  { key: "summer", icon: "☀️", months: [6, 7, 8] },
  { key: "autumn", icon: "🍁", months: [9, 10, 11] },
  { key: "winter", icon: "⛄", months: [12, 1, 2] },
];

const nowMonth = new Date().getMonth() + 1;

/** 그 달에 열리는 축제인가. 여러 달에 걸치는 축제는 걸친 달 전부에서 보인다. */
function opensIn(f: (typeof ALL_FESTIVALS)[number], month: number): boolean {
  if (f.startMonth == null) return false;
  const end = f.endMonth ?? f.startMonth;
  // 12월 → 1월처럼 해를 넘기는 축제. 그냥 비교하면 start > end라 아무 달에도 안 걸린다.
  if (end < f.startMonth) return month >= f.startMonth || month <= end;
  return month >= f.startMonth && month <= end;
}

export default function MonthlyFestivalPanel() {
  const { t, language } = useLanguage();
  const [month, setMonth] = useState(nowMonth);
  const [theme, setTheme] = useState<FestivalTheme | null>(null);
  const rotatingSeed = useRotatingSeed();

  const season = seasonOf(month);
  const seasonMonths = SEASONS.find((s) => s.key === season)!.months;

  // 이 달에 열리는 축제 — 테마를 거르기 **전**. 테마 칩을 몇 개 띄울지 정하는 데 쓴다.
  const inMonth = useMemo(() => ALL_FESTIVALS.filter((f) => opensIn(f, month)), [month]);

  // 이 달에 실제로 있는 테마만 칩으로 띄운다. 눌러도 0곳인 칩을 보여주면
  // "고장 났나" 싶어진다(앱 안의 죽은 버튼 문제와 같은 이야기).
  const themesHere = useMemo(() => {
    const found = new Set(inMonth.map((f) => themeOf(f.name)).filter(Boolean) as FestivalTheme[]);
    return FESTIVAL_THEMES.filter((k) => found.has(k));
  }, [inMonth]);

  const festivals = useMemo(
    () => (theme ? inMonth.filter((f) => themeOf(f.name) === theme) : inMonth),
    [inMonth, theme]
  );

  const pickMonth = (m: number) => {
    setMonth(m);
    // 달을 바꾸면 테마를 푼다 — 안 그러면 그 달에 없는 테마가 걸린 채로 남아
    // 축제가 있는데도 빈 화면이 뜬다.
    setTheme(null);
  };

  return (
    <section className="panel monthly-festival-panel">
      {/* 계절 사진을 이 화면의 표지로 크게 쓴다(5안 "계절 표지"). 예전에는 96px짜리
          띠였는데, 계절이 주인공인 화면이라 제목을 얹을 만큼 키웠다. */}
      <div className="mfp-cover">
        <SeasonPhotoHero className="mfp-cover-art" season={season} seed={rotatingSeed} />
        {/* 🎨 제목을 두 줄로 나누고 계절 넷에 각각 그 계절의 색을 준다
            (사용자 지시 2026-09-01: "겨울까지 다 윗줄 / 그리고 서울 아래 /
             그리고 서울 강조 / 아니면 봄 여름 가을 겨울을 계절에 맞게").
            둘 다 한다 — 윗줄은 계절 색, 아랫줄은 크고 굵게.

            ⚠️ 기울임(이탤릭)은 쓰지 않는다. 한글 글꼴에는 진짜 이탤릭이 없어서
            브라우저가 글자를 억지로 비스듬히 눕히는데, 획이 뭉개져 오히려 싸구려로
            보인다. 대신 **크기 · 굵기 · 색**으로 강조한다.

            윗줄은 seasonNames를 그대로 쓰므로 12개 언어에서 저절로 맞는다 —
            새 문구를 언어마다 또 만들지 않아도 된다. */}
        <div className="mfp-cover-text">
          <h2>
            <span className="mfp-seasons">
              {SEASONS.map((s) => (
                <span key={s.key} className={"mfp-season mfp-" + s.key}>
                  {t.seasonNames[s.key]}
                </span>
              ))}
            </span>
            <span className="mfp-and">{t.seasonTitleAnd}</span>
          </h2>
          <p>{t.seasonSubtitle(t.seasonNames[season], t.months[month], inMonth.length)}</p>
        </div>
      </div>

      <div className="panel-inner">
        <div className="season-row">
          {SEASONS.map((s) => (
            <button
              key={s.key}
              className={"season-chip" + (s.key === season ? " active" : "")}
              onClick={() => pickMonth(s.months[0])}
            >
              {s.icon} {t.seasonNames[s.key]}
            </button>
          ))}
        </div>

        {/* 그 계절의 석 달만 띄운다. 예전에는 12개가 한 줄로 늘어서서 가로로
            밀어야 했고, 계절 칩과 달 칩이 무슨 관계인지도 안 보였다. */}
        <div className="month-strip">
          {seasonMonths.map((m) => (
            <button
              key={m}
              className={"month-chip" + (m === month ? " active" : "")}
              onClick={() => pickMonth(m)}
            >
              {t.months[m]}
            </button>
          ))}
        </div>

        {themesHere.length > 0 && (
          <div className="theme-row">
            <button
              className={"theme-chip" + (theme === null ? " active" : "")}
              onClick={() => setTheme(null)}
            >
              {t.themeAll}
            </button>
            {themesHere.map((k) => (
              <button
                key={k}
                className={"theme-chip" + (theme === k ? " active" : "")}
                onClick={() => setTheme(theme === k ? null : k)}
              >
                <span aria-hidden="true">{THEME_ICON[k]}</span> {t.themeLabels[k]}
              </button>
            ))}
          </div>
        )}

        {/* 🚨 정확한 날짜를 안 적는 이유를 화면에도 적는다 — 받아온 날짜가 지난
            회차 것이라, 손님이 "10월 중순"만 믿고 날짜를 정하면 안 된다. */}
        <p className="map-disclaimer">{t.festivalDateDisclaimer}</p>

        <div className="festival-cards">
          {festivals.length === 0 && (
            <p className="empty-note">{t.noFestivalsMessage(month)}</p>
          )}
          {festivals.map((f, i) => {
            const legacy = getTourImage(f.id);
            // 원본(image)을 썸네일(thumb)보다 먼저 쓴다 — 2026-09-01 "사진 화질이 안 좋아".
            const photoUrl = f.image ?? f.thumb ?? legacy?.image ?? legacy?.thumb;
            const k = themeOf(f.name);
            return (
              <div className="festival-card" key={f.id}>
                {photoUrl ? (
                  <PlacePhoto place={{ ...f, image: photoUrl }} />
                ) : (
                  /* 카드 그림은 **지금 고른 달**의 계절로 그린다.
                     예전엔 그 축제의 시작 달을 썼는데, 2월~3월에 걸친 축제가
                     3월(봄) 목록에서 겨울 그림으로 떠서 화면이 어수선했다.
                     사실을 말하는 자리가 아니라 분위기를 내는 자리라 보는 쪽에 맞춘다. */
                  <SeasonArt
                    className="fc-art"
                    season={season}
                    seed={rotatingSeed * 100 + i}
                  />
                )}
                <div className="fc-body">
                  <div className="fc-top">
                    <span className="fc-gu">{districtFullName(f.gu, language)}</span>
                    {/* 🈳 dateLabel은 사람이 seed.ts에 **한국어로** 적어 둔 문구다
                        ("9월 말~10월 초"). 근거를 확인한 값이라 한국어 화면에서는
                        가장 좋지만, 12개 언어 앱에서 영어 사용자에게 한글을 그대로
                        보여줄 수는 없다(2026-09-01 영어로 바꿔 보고 발견).
                        그래서 **한국어일 때만 그 문구를 쓰고**, 다른 언어에서는
                        달(+초·중·하순)로 만들어 준다 — 덜 자세하지만 번역이 된다. */}
                    {(() => {
                      // 번역이 있으면 사람이 적어 둔 기간 문구를 그 언어로 쓴다
                      // ("9월 말~10월 초"처럼 달보다 자세하다). 번역이 아직 없으면
                      // 달(+초·중·하순)로 대신한다 — 덜 자세하지만 늘 읽힌다.
                      const label =
                        f.dateLabel && hasTranslation(f.dateLabel, language)
                          ? translateText(f.dateLabel, language)
                          : f.startMonth == null
                            ? null
                            : f.period
                              ? t.monthPeriod(t.months[f.startMonth], f.period)
                              : t.months[f.startMonth];
                      return label ? <span className="fc-date">{label}</span> : null;
                    })()}
                  </div>
                  {/* 이름을 누르면 네이버 통합검색 → 그 구청의 공식 행사 안내로 간다.
                      축제는 지도에 등록된 '장소'가 아니라 며칠만 열리는 '행사'라
                      지도에서 찾으면 "검색결과가 없습니다"가 뜬다(2026-09-01 캡처). */}
                  <button
                    type="button"
                    className="fc-name pr-name-link"
                    onClick={() => openPlaceInfo(f)}
                  >
                    {placeName(f.name, language).main}
                    <span className="pr-name-arrow" aria-hidden="true">↗</span>
                  </button>
                  {/* 번역된 이름 아래에 한국어 원문 — placeText.ts 주석 참고. */}
                  {placeName(f.name, language).sub && (
                    <div className="name-ko" lang="ko">{f.name}</div>
                  )}
                  {k && (
                    <span className="fc-theme" style={{ "--cc": "var(--festival)" } as CSSProperties}>
                      {THEME_ICON[k]} {t.themeLabels[k]}
                    </span>
                  )}
                  {f.note && <div className="fc-note">{translateText(f.note, language)}</div>}
                  <MapDirections
                    place={
                      f.lat == null && legacy?.lat != null
                        ? { ...f, lat: legacy.lat, lng: legacy.lng }
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
