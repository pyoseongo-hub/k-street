import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CITIES, CITY_BY_KEY, type City } from "../data/cities";

// 🏙️ **지금 보고 있는 도시.**
//
// 사장님 (2026-09-16): *"스트릿 부산 확장 할거야"* · *"점진적 확대할 거니"*
//
// ── 왜 필요한가 ───────────────────────────────────────────────────────────
//   앱 곳곳이 **서울로 박혀 있었다.** 날씨 좌표(weather.ts)·지도 가운데
//   (naverMaps.ts)·곳 페이지 주소(`seoul/…`)가 전부 상수였다.
//   도시가 둘이 되는 순간 그 상수들이 다 틀린 값이 된다.
//   한 군데서 「지금 어느 도시인가」를 답해 주면, 나머지는 그걸 물어보면 된다.
//
// ── 🚨 열린 도시가 하나면 고를 것이 없다 ──────────────────────────────────
//   2026-09-17에 부산이 열려 이제 실제로 바뀐다. 미리 만들어 둔 덕을 봤다 —
//   나중에 급히 만들면 서울이 박힌 자리를 다시 다 찾아다녀야 하기 때문이다.
//   (도시 카드도 같은 판단으로 미리 만들어 뒀다 — CityPicker.tsx)
//
// ── 🔑 저장해 둔 값이 「이제 안 열린 도시」면 버린다 ───────────────────────
//   손님이 부산을 골라 뒀는데 우리가 부산을 다시 닫으면, 저장된 값 때문에
//   **빈 화면**을 보게 된다. 열려 있는 도시가 아니면 기본값으로 되돌린다.

const KEY = "kstreet.city";

/** 지금 자료가 있어 볼 수 있는 도시들. 순서는 cities.ts 의 지도 차례를 따른다. */
export const OPEN_CITIES: readonly City[] = CITIES.filter((c) => c.status === "공개");

/** 아무것도 안 골랐을 때 보여 줄 도시. 지금은 서울 하나뿐이다. */
const FALLBACK = OPEN_CITIES[0] ?? CITY_BY_KEY.get("seoul")!;

interface CityContextValue {
  city: City;
  cityKey: string;
  setCity: (key: string) => void;
  /** 고를 수 있는 도시가 둘 이상인가 — 화면에서 「고르는 자리」를 낼지 정한다. */
  canChoose: boolean;
  openCities: readonly City[];
}

const CityContext = createContext<CityContextValue | null>(null);

function readStored(): City {
  try {
    const saved = localStorage.getItem(KEY);
    const c = saved ? CITY_BY_KEY.get(saved) : null;
    // 🚨 저장돼 있어도 **지금 열린 도시가 아니면 안 쓴다**(위 머리말 참고).
    if (c && c.status === "공개") return c;
  } catch {
    // 시크릿 창·저장 차단 — 그냥 기본값으로 간다. 화면은 멀쩡해야 한다.
  }
  return FALLBACK;
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<City>(FALLBACK);

  // 첫 그림은 언제나 기본값으로 그린다 — localStorage 를 그리는 중에 읽으면
  // 서버에서 미리 만들어 둔 화면과 달라져 깜박인다(useLanguage 와 같은 방식).
  useEffect(() => setCityState(readStored()), []);

  const value = useMemo<CityContextValue>(() => ({
    city,
    cityKey: city.key,
    setCity: (key) => {
      const next = CITY_BY_KEY.get(key);
      if (!next || next.status !== "공개") return;   // 안 열린 도시는 못 고른다
      setCityState(next);
      try { localStorage.setItem(KEY, next.key); } catch { /* 저장 못 해도 화면은 돈다 */ }
    },
    canChoose: OPEN_CITIES.length > 1,
    openCities: OPEN_CITIES,
  }), [city]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity(): CityContextValue {
  const v = useContext(CityContext);
  // 🚨 Provider 밖에서도 **죽지 않는다.** 곳 페이지를 만드는 스크립트처럼
  //    React 트리 없이 부르는 자리가 있다 — 거기서는 기본 도시로 답한다.
  if (v) return v;
  return {
    city: FALLBACK, cityKey: FALLBACK.key, setCity: () => {},
    canChoose: OPEN_CITIES.length > 1, openCities: OPEN_CITIES,
  };
}
