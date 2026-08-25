import { useMemo, useState } from "react";
import SeasonMonthPicker from "./SeasonMonthPicker";
import SeasonArt from "./SeasonArt";
import { FESTIVALS } from "../data/seed";
import { seasonOf } from "../lib/season";
import { useRotatingSeed } from "../lib/useRotatingSeed";

const nowMonth = new Date().getMonth() + 1;

export default function MonthlyFestivalPanel() {
  const [month, setMonth] = useState(nowMonth);
  const rotatingSeed = useRotatingSeed();

  const festivals = useMemo(
    () =>
      FESTIVALS.filter((f) => {
        if (f.startMonth == null) return false; // 월 정보 없는 항목은 이 칸에 띄우지 않는다
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
          <span className="panel-eyebrow">이달의 편집</span>
          <h2>{month}월에 놓치면 안 되는 것</h2>
        </div>
        <SeasonMonthPicker month={month} onChange={setMonth} />
        <div className="festival-cards">
          {festivals.length === 0 && (
            <p className="empty-note">
              이번 세션 조사에서는 {month}월에 확인된 축제가 없다 — 없는 게 아니라
              아직 확인을 못 한 것일 수 있다.
            </p>
          )}
          {festivals.map((f, i) => (
            <div className="festival-card" key={f.id}>
              <SeasonArt
                className="fc-art"
                season={seasonOf(f.startMonth!)}
                seed={rotatingSeed * 100 + i}
              />
              <div className="fc-body">
                <div className="fc-top">
                  <span className="fc-gu">{f.gu}</span>
                  {f.dateLabel && <span className="fc-date">{f.dateLabel}</span>}
                </div>
                <div className="fc-name">{f.name}</div>
                {f.note && <div className="fc-note">{f.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
