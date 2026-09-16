// 🏙️ **서울 — 관광공사 자료에서 새로 들어온 곳.**
//
// ── 왜 파일이 또 있나 (tourPlaces.ts 와 무엇이 다른가) ─────────────────────
//   tourPlaces.ts 는 **이 빌더가 생기기 전에** 받아 둔 304곳이다. 그때는 갈래를
//   *제목을 눈으로 읽어 만든 이름 규칙*으로 갈랐다 — 그래서 이름에 「…사」가 안
//   붙은 절, 「전망대」가 안 붙은 전망 자리는 **어느 칸에도 못 들어갔다.**
//
//   부산을 열면서 **관광공사 분류 코드로 가르는 법**을 만들었고
//   (scripts/lib/tour-categories.mjs), 그 잣대를 서울 자료 817곳에 다시 대 봤더니
//   **346곳이 그동안 빠져 있었다.** 절만 36곳이다 — 길상사 · 도선사 · 금선사 ….
//   화면을 열어 봐도 티가 안 난다. 없는 것은 안 보이기 때문이다.
//
//   옛 파일을 덮어쓰지 않고 **새 파일로 나란히 둔다.** tourPlaces.ts 에는 사람이
//   손으로 고쳐 둔 것이 겹겹이 붙어 있다(display-names · name-aliases · bad-coords ·
//   축제 날짜). 덮어쓰면 그게 다 날아간다.
//
// ── 🚫 같은 곳이 두 번 들어오지 않게 ──────────────────────────────────────
//   빌더가 **관광공사 번호**와 **이름** 둘 다로 이미 있는 곳을 걸러 낸다
//   (281곳이 그렇게 빠졌다). 번호 쪽은 감사(check-city-places.mjs)가 한 번 더 본다.
//
// ── 만드는 법 ─────────────────────────────────────────────────────────────
//   ① Actions → **Survey city** (city: 서울, save: 켬) → src/data/survey-1.json
//   ② node scripts/build-city-places.mjs --city seoul --area 1 --apply
//   ⚠️ ②는 관광공사를 부르지 않는다. 받아 둔 파일만 읽는다.
import type { Place } from "./seed";
import raw from "./seoul-places.json";

export const SEOUL_TOUR_PLACES: Place[] = raw as Place[];
