import { useSeoulWeather } from "../lib/weather";
import { useLanguage } from "../lib/useLanguage";

// 🌤️ **날씨 칸** — 머리줄 아래 오른쪽 반. 누르면 「비 와도 갈 곳」이 열린다.
//
// 사장님 (2026-09-13): *"복잡하게 하지 말고 체크 지우고 **날씨 설명이랑 반반 써서
//                     항시 배치**로"*
//
// ─────────────────────────────────────────────────────────────────────────
// 왜 「비 오는 날에만」이 아니라 **늘** 있나 — 오늘 두 번 뒤집힌 자리다
// ─────────────────────────────────────────────────────────────────────────
// 아침에는 **비 오는 날에만** 뜨는 한 줄 띠였다(RainyBanner). 그 판단의 근거는
// 「한 달에 며칠 쓰는 것에 자리를 영구히 주지 않는다」였다.
// 그런데 그러면 **비 안 오는 날은 그 칸이 통째로 비고**, 아래 화면이 그만큼 올라갔다
// 내려갔다 한다. 자리가 들쭉날쭉한 화면은 손님이 어디를 눌러야 할지 매번 다시 찾는다.
//
// 🔑 **지금 답: 자리는 늘 있고, 안에 드는 말이 바뀐다.**
//    · 맑은 날 — `24°` · 체감 26°   (날씨 그대로)
//    · 비 오는 날 — `지금 비` · 24°  (색도 파랗게)
//    어느 날이든 **누르면 비 와도 갈 곳이 열린다** — 비 오기 전에 미리 보는 손님도 있다.
//
// 🚨 날씨를 못 받아오면 **아무것도 안 그린다.** 지어내지 않는다(weather.ts 머리말과 같은 규칙).
//    그때는 왼쪽 영상 칸이 줄 전체를 쓴다(index.css 의 flex: 1).
export default function WeatherCard({ onOpen }: { onOpen: () => void }) {
  const { weather, error } = useSeoulWeather();
  const { t } = useLanguage();
  if (error || !weather) return null;

  const rain = weather.rainToday;
  const temp = `${Math.round(weather.tempC)}°`;
  return (
    <button
      type="button"
      className={"top-card weather-card" + (rain ? " rainy" : "")}
      onClick={onOpen}
      /* 🗣️ 화면에는 `≈26°` 로 짧게 쓰지만, 읽어 주는 손님에게는 **말로** 전한다 —
         「체감 26도」. 짧게 쓰느라 뜻을 잃지 않게. */
      aria-label={
        `${t.rainyH1} — ` +
        (rain ? `${weather.rainingNow ? t.rainyNow : t.rainyForecast}, ` : "") +
        `${temp}, ${t.feelsLike} ${Math.round(weather.feelsLikeC)}°`
      }
    >
      <span className="top-card-ic" aria-hidden="true">
        {rain ? "☔" : "🌤️"}
      </span>
      <span className="top-card-tx">
        {/* 비 오는 날엔 **비 이야기가 위**로 온다 — 그날 먼저 알아야 하는 것이 그것이다. */}
        <strong>{rain ? (weather.rainingNow ? t.rainyNow : t.rainyForecast) : temp}</strong>
        {/* 🐞 처음엔 `${t.feelsLike} 26°` 로 낱말을 다 썼는데, **독일어
            「Gefühlte Temperatur」가 두 줄이 되어** 320px 화면에서 칸이 81px 까지
            커졌다(재 봤다). 반반 칸에서는 낱말 하나가 줄 높이를 좌우한다.
            → `≈26°` 로 줄인다. 뜻은 **aria-label 이 말로** 전한다(위). */}
        <span>{rain ? temp : `≈${Math.round(weather.feelsLikeC)}°`}</span>
      </span>
    </button>
  );
}
