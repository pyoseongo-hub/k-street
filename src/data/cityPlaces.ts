// 🏙️ **새로 연 일곱 도시의 곳 목록을 한 자리에 모은다.**
//
// 사장님 (2026-10-01): *"제주 광주 대구 경주 대전 전주 강원도 순으로 만들어
//                        축제는 나중 동네부터 채워서 열고"*
//
// ── 왜 한 파일인가 ───────────────────────────────────────────────────
//   부산은 busanPlaces.ts, 서울은 seoulPlaces.ts 로 한 도시에 한 파일이었다.
//   일곱이 더 붙으면 **똑같이 생긴 파일이 아홉 개**가 된다. 한 줄 고치려면
//   아홉 군데를 봐야 하고, 그러면 한두 곳을 빠뜨린다.
//   → 새 도시는 여기 한 줄씩 더한다.
//
// ── 🏯 경주·전주는 왜 따로 없나 ──────────────────────────────────────
//   둘 다 **광역시가 아니다.** 경주는 경상북도의 시, 전주는 전북특별자치도의 시다.
//   명부(cities.ts)는 17개 시·도로 짜여 있어서, 경주는 `gyeongbuk` 안에,
//   전주는 `jeonbuk` 안에 들어간다. 동네 화면에서 「경주시」·「전주시」 칸을
//   누르면 그 도시 것만 나온다 — 벌집 지도에 자리를 잡아 뒀다(cityHexMaps.ts).
//
// ── 🚨 id 는 관광공사 contentId 그대로다 ──────────────────────────────
//   순번으로 만들지 않는다. 순번은 항목 하나를 지우면 뒤가 통째로 밀리고,
//   그러면 **지운 곳의 사진이 새 곳에 붙는다.**
//   contentId 는 전국에서 하나뿐이라 도시끼리도 안 부딪힌다.
//
// ⏳ **축제는 아직 비어 있다.** 관광공사 쪽 날짜가 2025년에 멈춰 있어서다.
//    그래서 첫 화면도 동네로 열어 뒀다(HomeSwitch.tsx). 동네부터 채운다.
import type { Place } from "./seed";
import jeju from "./jeju-places.json";
import gwangju from "./gwangju-places.json";
import daegu from "./daegu-places.json";
import daejeon from "./daejeon-places.json";
import gyeongbuk from "./gyeongbuk-places.json";
import jeonbuk from "./jeonbuk-places.json";
import gangwon from "./gangwon-places.json";

// 🗺️ **2026-10-05에 연 일곱 — 빈 칸이 있던 시·도를 채웠다.**
//    사장님: *"스트릿 비워진 지역 채워"*
//    🚨 **자료 파일만 만들면 한 곳도 안 보인다.** 2026-10-05에 그렇게 했다가
//       「화면 0곳 · 빈 칸 110」을 세고서야 알았다 — 앱은 멀쩡히 돌고 칸만 빈다.
//       파일을 만들었으면 **여기에 이어 붙이고 seed.ts 의 ALL_PLACES_RAW 에도** 넣는다.
import incheon from "./incheon-places.json";
import ulsan from "./ulsan-places.json";
import sejong from "./sejong-places.json";
import gyeonggi from "./gyeonggi-places.json";
import chungbuk from "./chungbuk-places.json";
import gyeongnam from "./gyeongnam-places.json";
import jeonnam from "./jeonnam-places.json";
import chungnam from "./chungnam-places.json";

export const CITY_PLACES_2026_10: Place[] = [
  ...(jeju as Place[]),
  ...(gwangju as Place[]),
  ...(daegu as Place[]),
  ...(daejeon as Place[]),
  ...(gyeongbuk as Place[]),
  ...(jeonbuk as Place[]),
  ...(gangwon as Place[]),
];

/** 🗺️ 2026-10-05에 연 일곱 시·도. id 가 관광공사 contentId 라 순서에 영향을 주지 않는다. */
export const CITY_PLACES_2026_10_05: Place[] = [
  ...(incheon as Place[]),
  ...(ulsan as Place[]),
  ...(sejong as Place[]),
  ...(gyeonggi as Place[]),
  ...(chungbuk as Place[]),
  ...(gyeongnam as Place[]),
  ...(jeonnam as Place[]),
  ...(chungnam as Place[]),
];
