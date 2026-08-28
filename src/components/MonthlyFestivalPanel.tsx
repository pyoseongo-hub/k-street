import { useMemo, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import SeasonMonthPicker from "./SeasonMonthPicker";
import SeasonArt from "./SeasonArt";
import { FESTIVALS } from "../data/seed";
import { seasonOf } from "../lib/season";
import { useRotatingSeed } from "../lib/useRotatingSeed";
import { getTourImage } from "../lib/tourImages";
import { getMapLinks, MAP_LINK_CLASS, MAP_LINK_TEXT } from "../lib/mapLinks";

const nowMonth = new Date().getMonth() + 1;

export default function MonthlyFestivalPanel() {
  const { t } = useLanguage();
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
      <SeasonArt className="mfp-hero" season={seasonOf(month)} seed={rotatingSeed} dense />
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
                <div className="fc-art fc-art-photo" style={{ backgroundImage: `url(${photo.thumb})` }}>
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
                  <span className="fc-gu">{f.gu}</span>
                  {f.dateLabel && <span className="fc-date">{f.dateLabel}</span>}
                </div>
                <div className="fc-name">{f.name}</div>
                {f.note && <div className="fc-note">{f.note}</div>}
                <div className="place-directions">
                  <span className="place-directions-icon" aria-hidden="true">🧭</span>
                  {getMapLinks(f).map((l) => (
                    <a
                      key={l.label}
                      className={MAP_LINK_CLASS[l.label]}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {MAP_LINK_TEXT[l.label]}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
