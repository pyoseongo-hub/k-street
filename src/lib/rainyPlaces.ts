// 🌧️ **비 와도 괜찮은 곳 고르기** — 앱과 묶음 페이지가 **같은 함수를 쓴다.**
//
// 사장님 (2026-09-12): "항시 보이게 비행기 옆에 두고, 예보 있으면 단추 키우거나
//                     자리 만들어서 더 잘 보이게 해"
//
// 🚨 **잣대를 여기 한 곳에만 둔다.** 묶음 페이지(scripts/build-place-pages.ts)와
//    앱이 각자 골라내면 **같은 주소를 보고 온 손님이 다른 목록을 본다.**
//    이 저장소는 그 사고를 이미 겪었다 — 등급 판정과 화면이 잣대를 따로 쓰다가
//    「반쪽 적용」이 생겼다(CLAUDE.md: "잣대가 둘이면 반쪽 적용이 생긴다").
//
// 그래서 실제 판단은 전부 src/lib/indoor.ts 가 한다. 이 파일이 하는 일은
// **역 자료를 붙여 줄 세우고 두 묶음으로 가르는 것**뿐이다.

import { ALL_PLACES, type Place } from "../data/seed";
import { isArcade, isIndoor, isRainOk, rainWalkMax } from "./indoor";
import { nearestStation } from "./nearestStation";

export interface RainyRow {
  place: Place;
  station: string;
  /** 역까지 **직선거리**(m). 실제 걷는 길은 이보다 길다 — 화면에 그대로 적는다. */
  dist: number;
}

export interface RainyList {
  /** 🏢 건물 안 — 비를 아예 안 맞는 곳 */
  indoors: RainyRow[];
  /** 🏮 중앙 통로에 지붕이 있는 시장 — **안내 문구와 한 세트로만** 보여 준다 */
  arcades: RainyRow[];
  /** 두 묶음을 합친 수. 단추에 적는 숫자다. */
  total: number;
  /** 몇 개 구에 걸쳐 있나 */
  gus: number;
}

/**
 * 비 오는 날 목록. 가까운 역이 **있고** 잣대 안에 드는 곳만.
 *
 * 🚨 **역을 모르는 곳은 안 넣는다.** 「역이 먼지 모른다」와 「역이 가깝다」는
 *    다른 말이다. 모르는 것을 가까운 쪽으로 반올림하면 손님이 젖는다.
 *
 * 📌 자료가 안 바뀌면 결과도 안 바뀌므로 **한 번만 세고 들고 있는다**(아래 caching).
 *    목록이 100곳을 넘어서 그릴 때마다 다시 세면 화면이 버벅인다.
 */
let cached: RainyList | null = null;

export function rainyPlaces(): RainyList {
  if (cached) return cached;

  const rows: RainyRow[] = [];
  for (const place of ALL_PLACES) {
    if (!isRainOk(place)) continue;
    const s = nearestStation(place.id, place);
    if (!s?.station || s.dist == null) continue;
    if (s.dist > rainWalkMax(place)) continue;
    rows.push({ place, station: s.station, dist: s.dist });
  }
  // 가까운 순. 비 오는 날에 손님이 보는 것은 이름이 아니라 **얼마나 걷느냐**다.
  rows.sort((a, b) => a.dist - b.dist);

  // 🏢/🏮 을 **갈라서** 담는다. 섞으면 「중앙 통로만 덮였다」는 안내문구를
  //    붙일 데가 없고, 손님은 박물관과 시장을 같은 정도로 마른 곳이라 읽는다.
  const indoors = rows.filter((r) => isIndoor(r.place));
  const arcades = rows.filter((r) => isArcade(r.place) && !isIndoor(r.place));

  cached = {
    indoors,
    arcades,
    total: indoors.length + arcades.length,
    gus: new Set(rows.map((r) => r.place.gu)).size,
  };
  return cached;
}

// ─────────────────────────────────────────────────────────────────────────
// 🚇 **호선별로 다시 묶는다** (2026-09-12)
// ─────────────────────────────────────────────────────────────────────────
// 사장님이 실제 화면을 보고 짚으셨다:
//   *"장소를 이런 식으로 나열하면 보는 사람이 찾기 힘들어. 우리가 이미 만들어 둔
//    구 지도로 넣거나, 아님 **지하철 1호선 방면 2호선 방면 이런 식이 되어야**
//    사람이 계획을 잡지. 그냥 나열하면 **사용 안 해**."*
//
// 🚨 **맞는 지적이고, 내가 무엇을 틀렸는지도 분명하다.**
//    거리(71m·76m…)는 **걸러내는 잣대**였다. 「역에서 가까운 것만 넣는다」를 재는 값이다.
//    그런데 그 값을 **화면 순서로 그대로 써 버렸다.**
//    손님은 「역에서 71m」로 하루를 계획하지 않는다 — **「오늘 2호선 타는데」**로 계획한다.
//    · 잣대는 목록에 **무엇이 들어갈지**를 정한다
//    · 순서는 손님이 **어떻게 움직일지**를 따라야 한다
//    이 둘은 다른 것이다. 섞으면 자료는 맞는데 아무도 안 쓰는 화면이 된다.
//
// 📌 왜 구(區)가 아니라 호선인가 — 둘 다 사장님이 주신 선택지였다.
//    · 구는 이미 **「동네」 탭**이 한다. 게다가 구를 고르는 것은 「내가 어디 있나」를
//      아는 사람의 방식이다.
//    · 비 오는 날에는 **지하철로 움직이고, 갈아타지 않는 쪽이 덜 젖는다.**
//      한 호선에 머무는 것이 곧 안 젖는 계획이다.
//    자료도 이미 있다 — 역 580곳의 **노선과 좌표**(subway-stations.json).
//
// ⚠️ **환승역의 곳은 그 역이 지나는 호선마다 다 나온다.** 일부러 그렇게 한다 —
//    4호선을 타는 손님에게 「동대문역사문화공원역(2·4·5호선)」의 DDP 가 안 보이면
//    그 손님에게는 없는 곳이 된다. 곳 수를 합치면 118 보다 크다(그게 맞다).

import STATIONS from "../data/subway-stations.json";

interface Station {
  name: string;
  lines: string[];
  lat: number;
  lng: number;
}
const 역표 = (STATIONS as unknown as { 역?: Record<string, Station> })["역"] ?? {};

/**
 * 역 이름 → 찾기용 열쇠.
 * ⚠️ **stationName.ts·fetch-subway-stations.mjs 와 같은 규칙이어야 한다.**
 *    갈리면 역을 못 찾아 그 곳이 어느 호선에도 안 나온다.
 */
const key = (n: string) =>
  n
    .normalize("NFC")
    .replace(/\([^)]*\)/g, "")
    .replace(/역$/, "")
    .replace(/[^0-9A-Za-z가-힣]/g, "")
    .trim();

/** 「9호선(연장)」은 9호선이다 — 같은 노선을 둘로 보여 주지 않는다. */
const tidyLine = (l: string) => l.replace(/\(연장\)$/, "");

/** 숫자 호선만 앞에 세운다. 나머지(경의중앙선·분당선…)는 뒤에 모은다. */
const lineNo = (l: string) => {
  const m = /^(\d{1,2})호선$/.exec(l);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
};

export interface RainyStation {
  /** 「종로5가」 — 「역」과 부역명을 뗀 이름 */
  name: string;
  rows: RainyRow[];
}
export interface RainyLine {
  /** 「1호선」 · 숫자가 아닌 노선은 그 이름 그대로 */
  line: string;
  /** 이 호선에서 갈 수 있는 곳 수 */
  count: number;
  /**
   * 노선 위 순서대로. **한쪽 끝에서 다른 쪽 끝으로** 줄 세운다 —
   * 그래야 손님이 「이 역 보고 다음 역」으로 이어 갈 수 있다.
   *
   * 🚨 **진짜 운행 순서가 아니라 좌표로 잰 것이다.** 서울시 자료에 역의 순번이
   *    없어서, 그 노선 전체 역의 좌표가 **동서로 더 퍼졌나 남북으로 더 퍼졌나**를
   *    보고 그 축으로 줄 세운다. 곧은 노선에서는 실제 순서와 같아진다.
   *    ⚠️ **2호선은 순환선**이라 이 방법이 딱 맞지 않는다 — 가까운 역끼리는
   *       모이지만 한 바퀴 도는 순서는 아니다. 화면에 양 끝 역 이름을 적어
   *       (「종각 → 동대문」) 손님이 방향을 스스로 읽게 한다.
   */
  stations: RainyStation[];
}

let cachedLines: RainyLine[] | null = null;

export function rainyByLine(): RainyLine[] {
  if (cachedLines) return cachedLines;
  const { indoors, arcades } = rainyPlaces();
  const all = [...indoors, ...arcades];

  // 호선 → 역열쇠 → 곳들
  const byLine = new Map<string, Map<string, RainyRow[]>>();
  for (const r of all) {
    const k = key(r.station.split(/\s+/)[0]);
    const st = 역표[k];
    if (!st) continue; // 역을 모르면 못 넣는다 — 지어내지 않는다
    for (const raw of st.lines) {
      const line = tidyLine(raw);
      if (!byLine.has(line)) byLine.set(line, new Map());
      const m = byLine.get(line)!;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
  }

  // 노선마다 역을 **퍼진 방향**으로 줄 세운다(위 주석 참고).
  const out: RainyLine[] = [];
  for (const [line, stMap] of byLine) {
    const onLine = Object.values(역표).filter((s) => s.lines.some((l) => tidyLine(l) === line));
    const latSpread = Math.max(...onLine.map((s) => s.lat)) - Math.min(...onLine.map((s) => s.lat));
    const lngSpread = Math.max(...onLine.map((s) => s.lng)) - Math.min(...onLine.map((s) => s.lng));
    // 위도 1도가 경도 1도보다 길므로 대충 맞춰 견준다(서울에서 약 1.25배).
    const useLat = latSpread * 1.25 > lngSpread;
    const stations = [...stMap.entries()]
      .map(([k, rows]) => ({ k, rows, st: 역표[k] }))
      .sort((a, b) => (useLat ? a.st.lat - b.st.lat : a.st.lng - b.st.lng))
      .map(({ k, rows }) => ({
        name: 역표[k].name.replace(/\([^)]*\)/g, "").replace(/역$/, "").trim(),
        // 한 역 안에서는 가까운 순 — 여기서는 거리가 쓸모 있다(같은 역에서 걷는 거리다)
        rows: rows.sort((a, b) => a.dist - b.dist),
      }));
    const count = new Set(stations.flatMap((s) => s.rows.map((r) => r.place.id))).size;
    out.push({ line, count, stations });
  }

  // 1~9호선 먼저, 그다음 곳이 많은 순
  out.sort((a, b) => lineNo(a.line) - lineNo(b.line) || b.count - a.count);
  cachedLines = out;
  return out;
}
