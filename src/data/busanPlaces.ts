// 🌊 **부산 곳 목록** — 관광공사 자료를 앱이 쓰는 모양으로 바꿔 둔 것.
//
// 사장님 (2026-09-16): *"스트릿 부산 확장 할거야"* · *"잘 짜서 만들어."*
//
// ── 어디서 왔나 ───────────────────────────────────────────────────────────
//   ① Actions 의 **Survey city** 가 관광공사에서 부산(지역 6) 257곳을 받아
//      `src/data/survey-6.json` 에 저장한다.
//   ② `scripts/build-city-places.mjs` 가 그것을 읽어 갈래를 정하고
//      `src/data/busan-places.json` 을 만든다. **관광공사를 다시 부르지 않는다.**
//   갈래는 이름이 아니라 **관광공사 분류 코드**로 정한다
//   (scripts/lib/tour-categories.mjs — 왜 그런지는 그 파일 머리말에).
//
// ── 🙈 지금은 화면에 안 나온다 ────────────────────────────────────────────
//   `LAUNCH_REGIONS` 가 아직 서울뿐이라(src/config/launchScope.ts) ALL_PLACES 가
//   부산을 전부 걸러 낸다. **일부러 그렇게 뒀다** — 자료를 먼저 들여놓고
//   눈으로 확인한 뒤에 여는 것이, 반쯤 된 도시를 손님에게 보여 주는 것보다 낫다.
//   여는 법은 두 줄이다: launchScope 에 "부산"을 넣고, cities.ts 의 부산 status 를
//   「공개」로 바꾼다. 그러면 도시 카드도 같이 살아난다(CityPicker.tsx).
//
// ── 🚨 id 는 관광공사 contentId 그대로다 ──────────────────────────────────
//   순번으로 만들지 않는다. 순번은 항목 하나를 지우면 뒤가 통째로 밀리고,
//   그러면 **지운 곳의 사진이 새 곳에 붙는다.**
//   부산 257개가 서울 304개와 **하나도 안 겹치는 것**을 확인했다(2026-09-16).
import type { Place } from "./seed";
import raw from "./busan-places.json";

export const BUSAN_PLACES: Place[] = raw as Place[];
