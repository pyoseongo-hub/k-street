const SEASONS: { label: string; icon: string; months: number[] }[] = [
  { label: "봄", icon: "🌸", months: [3, 4, 5] },
  { label: "여름", icon: "☀️", months: [6, 7, 8] },
  { label: "가을", icon: "🍁", months: [9, 10, 11] },
  { label: "겨울", icon: "⛄", months: [12, 1, 2] },
];

interface Props {
  month: number;
  onChange: (month: number) => void;
}

export default function SeasonMonthPicker({ month, onChange }: Props) {
  const activeSeason = SEASONS.find((s) => s.months.includes(month));

  return (
    <div className="season-month-picker">
      <div className="season-row">
        {SEASONS.map((s) => (
          <button
            key={s.label}
            className={"season-chip" + (s === activeSeason ? " active" : "")}
            onClick={() => onChange(s.months[0])}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      <div className="month-strip">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <button
            key={m}
            className={"month-chip" + (m === month ? " active" : "")}
            onClick={() => onChange(m)}
            aria-label={`${m}월`}
          >
            {m}월
          </button>
        ))}
      </div>
    </div>
  );
}
