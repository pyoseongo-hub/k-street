// 🚗 **땅이 붙어 있는 시·도** — 축제 화면에서 「옆 지역에서도」를 띄우는 데 쓴다.
//
// 왜 필요한가 (사장님 2026-10-11: *"지방은 축제 탭이 너무 비는데 합치거나 방법이 없을까"*)
//   세어 보니 **달 칸 204개 중 75개(37%)가 비어** 있었다. 대구는 8달, 광주는 9달,
//   울산은 8달, 세종은 **12달 모두** 빈다. 서울은 0달이다 — 지방만 비는 것이다.
//   이웃 시·도까지 함께 보여 주면 **75 → 11칸(5%)** 으로 준다.
//
// ✋ **내 지역 것을 대신하지 않는다** (사장님 2026-10-11: *"합쳐 내용은 남겨야해"*).
//    내 지역 축제를 먼저 다 보여 주고, 그 **아래에** 구분선을 두고 옆 지역을 잇는다.
//    옆 지역 카드에는 「경남」처럼 시·도 이름을 달아 어디 것인지 분명히 한다.
//    섞어서 날짜 순으로 늘어놓지 않는다 — 그러면 내 지역이 무엇인지 흐려진다.
//
// 📐 **무엇을 이웃으로 보나** — 땅이 맞닿아 있는 시·도다. 행정 경계 기준이고,
//    차로 한두 시간이면 가는 거리다. 바다 건너는 넣지 않는다.
//    🏝️ **제주는 이웃이 없다.** 섬이라 그렇다. 여기 빈 배열로 두는 것은 빠뜨린 게
//       아니라 **그게 사실**이라는 표시다. 제주는 이 방법으로 못 메운다.
//
// 🚨 열쇠는 cities.ts 의 `key` 와 **글자 하나까지 같아야** 한다. 틀리면 조용히
//    아무것도 안 나온다 — 그래서 아래 검사가 앱 뜰 때 한 번 짚어 준다.
import { CITIES } from "./cities";

export const NEIGHBOR_CITIES: Readonly<Record<string, readonly string[]>> = {
  seoul: ["gyeonggi", "incheon"],
  incheon: ["seoul", "gyeonggi"],
  gyeonggi: ["seoul", "incheon", "gangwon", "chungnam", "chungbuk"],
  gangwon: ["gyeonggi", "chungbuk", "gyeongbuk"],
  chungnam: ["sejong", "daejeon", "chungbuk", "gyeonggi", "jeonbuk"],
  sejong: ["daejeon", "chungnam", "chungbuk"],
  daejeon: ["sejong", "chungnam", "chungbuk"],
  chungbuk: ["sejong", "daejeon", "chungnam", "gyeonggi", "gangwon", "gyeongbuk", "jeonbuk"],
  gyeongbuk: ["daegu", "gangwon", "chungbuk", "gyeongnam", "ulsan"],
  jeonbuk: ["chungnam", "chungbuk", "jeonnam", "gyeongnam"],
  daegu: ["gyeongbuk", "gyeongnam"],
  gwangju: ["jeonnam"],
  gyeongnam: ["busan", "ulsan", "daegu", "gyeongbuk", "jeonbuk", "jeonnam"],
  ulsan: ["busan", "gyeongnam", "gyeongbuk"],
  jeonnam: ["gwangju", "jeonbuk", "gyeongnam"],
  busan: ["ulsan", "gyeongnam"],
  jeju: [],   // 🏝️ 섬 — 이웃이 없다
};

/** 그 도시의 이웃 시·도 열쇠들. 모르는 도시면 빈 배열. */
export function neighborsOf(cityKey: string): readonly string[] {
  return NEIGHBOR_CITIES[cityKey] ?? [];
}

// 🧪 **열쇠가 명부와 어긋나면 바로 알려 준다.**
//    오타 하나면 그 도시만 조용히 아무것도 안 나온다 — 화면은 멀쩡해 보인다.
//    그게 이 저장소에서 여러 번 당한 꼴이라, 만들 때 한 번 짚고 간다.
//    (배포용 묶음에서는 빠진다 — import.meta.env.DEV 안이다.)
if (import.meta.env?.DEV) {
  const 있는열쇠 = new Set(CITIES.map((c) => c.key));
  const 이상한것: string[] = [];
  for (const [k, vs] of Object.entries(NEIGHBOR_CITIES)) {
    if (!있는열쇠.has(k)) 이상한것.push(`명부에 없는 도시: ${k}`);
    for (const v of vs) {
      if (!있는열쇠.has(v)) 이상한것.push(`${k} 의 이웃에 없는 도시: ${v}`);
      // 이웃은 서로여야 한다 — 한쪽만 적어 두면 한 방향으로만 메워진다.
      if (!(NEIGHBOR_CITIES[v] ?? []).includes(k)) 이상한것.push(`짝이 안 맞는다: ${k} → ${v} 인데 ${v} → ${k} 가 없다`);
    }
  }
  if (이상한것.length) console.warn("🚨 neighborCities.ts\n   " + 이상한것.join("\n   "));
}
