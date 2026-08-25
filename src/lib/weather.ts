// 실시간 서울 날씨. Open-Meteo는 키가 필요 없고 CORS가 열려 있어서 정적 사이트에서
// 클라이언트 쪽에서 바로 호출할 수 있다(TourAPI/네이버 지도 키처럼 숨길 게 없다).
// 참고 화면에 있던 "인기 명소가 그늘로 이동 중" 같은 코멘트 문구는 지어낸 것이라 넣지 않는다 —
// 여기서는 실제 관측값(기온·체감온도·시각)만 보여준다.

import { useEffect, useState } from "react";

const SEOUL = { lat: 37.5665, lng: 126.978 };

export interface SeoulWeather {
  tempC: number;
  feelsLikeC: number;
  observedAt: string; // Asia/Seoul 현지시각 ISO 문자열
}

export function useSeoulWeather(): { weather: SeoulWeather | null; error: boolean } {
  const [weather, setWeather] = useState<SeoulWeather | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${SEOUL.lat}&longitude=${SEOUL.lng}` +
      `&current=temperature_2m,apparent_temperature&timezone=Asia%2FSeoul`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const c = data?.current;
        if (!c || typeof c.temperature_2m !== "number") throw new Error("no current data");
        setWeather({
          tempC: c.temperature_2m,
          feelsLikeC: c.apparent_temperature,
          observedAt: c.time,
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { weather, error };
}
