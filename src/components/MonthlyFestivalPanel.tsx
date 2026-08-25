import { useMemo, useState } from "react";
import SeasonMonthPicker from "./SeasonMonthPicker";
import { FESTIVALS } from "../data/seed";

const nowMonth = new Date().getMonth() + 1;

export default function MonthlyFestivalPanel() {
  const [month, setMonth] = useState(nowMonth);

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
      <div className="panel-head">
        <span className="panel-eyebrow">🎪 이달의 축제</span>
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
        {festivals.map((f) => (
          <div className="festival-card" key={f.id}>
            <div className="fc-top">
              <span className="fc-gu">{f.gu}</span>
              {f.dateLabel && <span className="fc-date">{f.dateLabel}</span>}
            </div>
            <div className="fc-name">{f.name}</div>
            {f.note && <div className="fc-note">{f.note}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
