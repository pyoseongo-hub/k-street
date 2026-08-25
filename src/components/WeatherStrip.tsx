import { useSeoulWeather } from "../lib/weather";
import { useLanguage } from "../lib/useLanguage";

export default function WeatherStrip() {
  const { weather, error } = useSeoulWeather();
  const { language, t } = useLanguage();

  if (error || !weather) return null;

  const timeLocale = language === 'ko' ? 'ko-KR' : language === 'zh' ? 'zh-Hans-CN' : language === 'zh-TW' ? 'zh-Hant-TW' : language === 'ja' ? 'ja-JP' : language === 'vi' ? 'vi-VN' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : language === 'ru' ? 'ru-RU' : language === 'id' ? 'id-ID' : language === 'th' ? 'th-TH' : 'en-US';

  const time = new Date(weather.observedAt).toLocaleTimeString(timeLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="weather-strip">
      <span className="weather-icon">☀️</span>
      <span className="weather-temp">
        서울 {Math.round(weather.tempC)}°C
        <span className="weather-feels"> · {t.feelsLike} {Math.round(weather.feelsLikeC)}°C</span>
      </span>
      <span className="weather-time">{time}</span>
    </div>
  );
}
