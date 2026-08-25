import { useLanguage } from "../lib/useLanguage";

const SEASONS: { key: string; icon: string; months: number[] }[] = [
  { key: "spring", icon: "🌸", months: [3, 4, 5] },
  { key: "summer", icon: "☀️", months: [6, 7, 8] },
  { key: "autumn", icon: "🍁", months: [9, 10, 11] },
  { key: "winter", icon: "⛄", months: [12, 1, 2] },
];

const SEASON_LABELS: Record<string, Record<string, string>> = {
  ko: { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" },
  en: { spring: "Spring", summer: "Summer", autumn: "Fall", winter: "Winter" },
  ja: { spring: "春", summer: "夏", autumn: "秋", winter: "冬" },
  zh: { spring: "春", summer: "夏", autumn: "秋", winter: "冬" },
  "zh-TW": { spring: "春", summer: "夏", autumn: "秋", winter: "冬" },
  vi: { spring: "Xuân", summer: "Hè", autumn: "Thu", winter: "Đông" },
  es: { spring: "Primavera", summer: "Verano", autumn: "Otoño", winter: "Invierno" },
  fr: { spring: "Printemps", summer: "Été", autumn: "Automne", winter: "Hiver" },
  de: { spring: "Frühling", summer: "Sommer", autumn: "Herbst", winter: "Winter" },
  ru: { spring: "Весна", summer: "Лето", autumn: "Осень", winter: "Зима" },
  id: { spring: "Musim Semi", summer: "Musim Panas", autumn: "Musim Gugur", winter: "Musim Dingin" },
  th: { spring: "ฤดูใบไม้ผลิ", summer: "ฤดูร้อน", autumn: "ฤดูใบไม้ร่วง", winter: "ฤดูหนาว" },
};

interface Props {
  month: number;
  onChange: (month: number) => void;
}

export default function SeasonMonthPicker({ month, onChange }: Props) {
  const { language, t } = useLanguage();
  const activeSeason = SEASONS.find((s) => s.months.includes(month));
  const seasonLabels = SEASON_LABELS[language] || SEASON_LABELS.ko;

  return (
    <div className="season-month-picker">
      <div className="season-row">
        {SEASONS.map((s) => (
          <button
            key={s.key}
            className={"season-chip" + (s === activeSeason ? " active" : "")}
            onClick={() => onChange(s.months[0])}
          >
            {s.icon} {seasonLabels[s.key]}
          </button>
        ))}
      </div>
      <div className="month-strip">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <button
            key={m}
            className={"month-chip" + (m === month ? " active" : "")}
            onClick={() => onChange(m)}
            aria-label={t.months[m]}
          >
            {t.months[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
