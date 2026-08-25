import { useSeoulWeather } from "../lib/weather";

// 참고 화면의 "날씨 히어로 카드"를 실제 데이터로만 채운 버전. 코멘트 문구("그늘로 이동 중" 등)는
// 지어낸 것이라 뺐고, 실제 관측값(기온·체감온도·시각)만 보여준다. 실패하면 조용히 숨는다 —
// 날씨 없이도 앱의 나머지 기능은 다 동작해야 하니까.
export default function WeatherStrip() {
  const { weather, error } = useSeoulWeather();

  if (error || !weather) return null;

  const time = new Date(weather.observedAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="weather-strip">
      <span className="weather-icon">☀️</span>
      <span className="weather-temp">
        서울 {Math.round(weather.tempC)}°C
        <span className="weather-feels"> · 체감 {Math.round(weather.feelsLikeC)}°C</span>
      </span>
      <span className="weather-time">{time}</span>
    </div>
  );
}
