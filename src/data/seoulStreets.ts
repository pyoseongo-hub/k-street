// 🛣️ **서울시 「관광거리」 128곳 — 이름과 자리만.**
//
// 사장님 지시 (2026-10-03): *"자료없는거 이름 만 넣고 안내문구 넣어"*
//
// ── 왜 파일이 또 있나 ─────────────────────────────────────────────────────
//   `seoulPlaces.ts` 는 **관광공사** 자료다 — 개별 업소 목록이라 「홍대」·「피맛골」
//   같은 **동네·골목 자체**는 애초에 그 이름으로 들어 있지 않다.
//   이 파일은 **서울시** 「관광거리」(OA-12929)다. 그 빈칸을 메운다.
//
//   2026-09-14에 받아 `tour-streets.json` 에 넣어 뒀는데 **앱에 넣는 단계를
//   아무도 안 했다.** 134곳 중 6곳만 앱에 있었고 **128곳이 잠들어 있었다** —
//   피맛골 · 명동거리 · 삼청동문화거리 · 무교동음식문화의거리 · 논현동포차골목 ·
//   먹자골목 여섯 군데가 그 안에 있었다.
//
// ── 📝 사진도 소개 글도 없다. 그래서 안내문구를 띄운다 ────────────────────
//   `nameOnly: true` 가 그 표시다. 카드에 「이름과 자리만 있어요」 한 줄이 붙는다
//   (translations.ts 의 `nameOnlyNote`). 아무 말 없이 이름만 두면 손님은
//   "앱이 부실하다"고 읽는다 — 이유를 적으면 "지어내지 않는 앱"으로 읽힌다.
//   축제 카드의 `festivalNoPhoto` 와 같은 결이다.
//
// ── 📍 좌표는 41곳만 있다 ────────────────────────────────────────────────
//   원본 좌표가 **128곳에 72개뿐**이었다. 양천구 7곳이 같은 점이고,
//   가로수길·압구정카페골목·압구정로데오거리도 같은 점이다. 한 점이 일곱 거리일
//   수는 없으니 그건 **등록 묶음의 대표 점**이다. 나눠 쓰는 87곳은 **비워 뒀다** —
//   길찾기가 손님을 엉뚱한 골목으로 보내는 쪽이 훨씬 나쁘다.
//   빈 좌표는 `fetch-coords` 가 이름으로 다시 찾아 채운다(withFetchedCoords).
//
// ── 만드는 법 ─────────────────────────────────────────────────────────────
//   node scripts/build-seoul-streets.mjs --apply
//   (원본을 새로 받을 때는 Actions → **Fetch tour streets** 를 먼저 돌린다)
import type { Place } from "./seed";
import raw from "./seoul-streets.json";

// ── 🌙 서울 달빛야장 6곳 (2026-10-20, 사장님: *"메일 확인 달빛야장 확인하고 6개 야장 업데이트 해"*) ──
//   근거 — 서울시 소식지 제5782호(2026.10.20.) → 미디어허브 기사
//   https://mediahub.seoul.go.kr/archives/2019784 의 「달빛상품권 이용 가능 6개 상권 및 행정동」 표.
//   러너(read-page)로 본문을 직접 읽었다. 6곳 이름과 행정동은 그 표 그대로다.
//   · 건대맛의거리는 **이미 관광거리 자료에 있다**(sst_BE_IW01-0091) — 새로 넣지 않고 안내 한 줄만 붙인다.
//   · 나머지 다섯은 우리 자료 어디에도 없었다(이름으로 전체를 찾아 확인).
//   · `addr` 는 표의 **행정동** 그대로, `dong` 은 그 행정동이 속한 **법정동**이다
//     (상봉2동→상봉동, 창4동→창동, 사당제1동→사당동).
//   ✋ **날짜·시간 칸은 없다 — 원래 있을 수가 없다** (사장님 짚음 2026-10-20, 원문으로 확인).
//      달빛야장은 행사가 아니라 **원래 있던 골목 상권**이다. 가게 앞에 내놓던 불법 식탁을
//      제도 안의 옥외 영업으로 들인 것이라, 영업시간은 **가게마다** 다르다.
//      근거 — 서울시 「서울사랑」 2026.10 https://love.seoul.go.kr/articles/10661
//      ("가게 안에 머물던 식탁을 골목으로 옮겨…", "불법 식탁에서 질서 있는 야장으로").
//      그래서 축제(festival)가 아니라 골목·거리(street) 칸에 둔다.
//      · 상품권 판매일(10.23 금)·결제 시간(17~24시)은 야장 영업 시간이 아니다. 상품권은
//        서울페이+ 앱 전용이라 외국인 손님이 쓰기 어려워 화면에도 안 넣었다.
//   🆔 id 는 `dy_` 로 직접 박는다 — 자리에 기대지 않아 다른 목록이 늘어도 안 밀린다.
//   🚨 build-seoul-streets.mjs 가 seoul-streets.json 을 다시 써도 이 칸은 안 지워진다(그래서 JSON 이 아니라 여기 둔다).
const DALBIT_URL = "https://mediahub.seoul.go.kr/archives/2019784";
const DALBIT_NOTE = "2026년 9월 서울시 「서울 달빛야장」 선정 — 저녁에도 먹거리와 문화를 즐길 수 있도록 조성된 야간 골목 상권";
const DALBIT_ALREADY = new Set(["sst_BE_IW01-0091"]); // 건대맛의거리
const DALBIT_YAJANG: Place[] = [
  { id: "dy_sangbong", city: "seoul", gu: "중랑구", dong: "상봉동", category: "street", name: "상봉먹자골목", addr: "서울시 중랑구 상봉2동 일대", note: DALBIT_NOTE, officialUrl: DALBIT_URL, nameOnly: true, confirmed: true },
  { id: "dy_changdong", city: "seoul", gu: "도봉구", dong: "창동", category: "street", name: "창동역상점가", addr: "서울시 도봉구 창4동 일대", note: DALBIT_NOTE, officialUrl: DALBIT_URL, nameOnly: true, confirmed: true },
  { id: "dy_sadang1", city: "seoul", gu: "동작구", dong: "사당동", category: "street", name: "사당1동 먹자골목", addr: "서울시 동작구 사당제1동 일대", note: DALBIT_NOTE, officialUrl: DALBIT_URL, nameOnly: true, confirmed: true },
  { id: "dy_sadangorak", city: "seoul", gu: "관악구", dong: "남현동", category: "street", name: "사당오락 달빛야장", addr: "서울시 관악구 남현동 일대", note: DALBIT_NOTE, officialUrl: DALBIT_URL, nameOnly: true, confirmed: true },
  { id: "dy_serosu", city: "seoul", gu: "강남구", dong: "신사동", category: "street", name: "신사 세로수길", addr: "서울시 강남구 신사동 일대", note: DALBIT_NOTE, officialUrl: DALBIT_URL, nameOnly: true, confirmed: true },
];

export const SEOUL_STREET_PLACES: Place[] = [
  ...(raw as Place[]).map((p) => (DALBIT_ALREADY.has(p.id) ? { ...p, note: DALBIT_NOTE, officialUrl: DALBIT_URL } : p)),
  ...DALBIT_YAJANG,
];
