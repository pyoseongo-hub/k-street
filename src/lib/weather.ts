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
  /** 🌧️ **지금 비가 오고 있나.** 관측값이다 — 손님이 창밖을 보면 맞는지 안다. */
  rainingNow: boolean;
  /** ☔ **오늘 비 예보가 있나.** 사실이 아니라 **예보**다 — 화면에도 그렇게 적는다. */
  rainToday: boolean;
}

/**
 * 🌧️ **비로 볼 날씨 코드** (WMO).
 *
 * 51~57 안개비 · 61~67 비 · 80~82 소나기 · 95~99 뇌우.
 *
 * ❄️ **눈(71~77·85~86)은 일부러 뺐다.** 눈이 올 때도 실내가 답이긴 하지만
 *    화면에 「비」라고 적히기 때문이다 — **눈 오는 날 「비」라고 말하면 그건 틀린 말이다.**
 *    눈까지 챙기려면 문구를 따로 만들어야 한다(12개 언어). 나중 일로 남겨 둔다.
 */
const RAIN_CODES = (c: number) =>
  (c >= 51 && c <= 57) || (c >= 61 && c <= 67) || (c >= 80 && c <= 82) || (c >= 95 && c <= 99);

/**
 * ☔ **몇 %부터 「예보가 있다」고 할까 — 50%.**
 *
 * 사장님 (2026-09-12): *"날씨는 기상청도 못 맞춰"*
 *
 * 그 말이 이 숫자를 정했다. 문턱을 낮게 잡으면(20~30%) **거의 매일 켜져서**
 * 강조가 강조가 아니게 된다 — 늘 켜진 불은 아무도 안 본다.
 * 반반을 넘을 때만 켠다. 그리고 그때도 **「예보」라고 적는다**(t.rainyForecast) —
 * 안 왔을 때 우리가 틀린 말을 한 것이 되지 않게.
 */
const RAIN_CHANCE_MIN = 50;

export function useSeoulWeather(): { weather: SeoulWeather | null; error: boolean } {
  const [weather, setWeather] = useState<SeoulWeather | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // 🆓 비·예보는 **같은 요청에 덧붙이면 끝이다** — 호출도 한 번, 값도 공짜다.
    //    (2026-09-12에 기온만 받고 있던 것을 늘렸다. 열쇠도 돈도 안 든다.)
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${SEOUL.lat}&longitude=${SEOUL.lng}` +
      `&current=temperature_2m,apparent_temperature,precipitation,weather_code` +
      `&daily=precipitation_probability_max&forecast_days=1&timezone=Asia%2FSeoul`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const c = data?.current;
        if (!c || typeof c.temperature_2m !== "number") throw new Error("no current data");
        // 🚨 **모르면 false 다.** 값이 안 왔을 때 「비 온다」로 기울면 맑은 날에
        //    비 이야기를 하게 된다. 강조를 못 하는 쪽으로 틀린다.
        const chance = Number(data?.daily?.precipitation_probability_max?.[0]);
        const rainingNow =
          Number(c.precipitation) > 0 || (Number.isFinite(c.weather_code) && RAIN_CODES(Number(c.weather_code)));
        setWeather({
          tempC: c.temperature_2m,
          feelsLikeC: c.apparent_temperature,
          observedAt: c.time,
          rainingNow,
          // 지금 오고 있으면 오늘 예보도 당연히 켠다 — 확률이 안 와도 마찬가지다.
          rainToday: rainingNow || (Number.isFinite(chance) && chance >= RAIN_CHANCE_MIN),
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
