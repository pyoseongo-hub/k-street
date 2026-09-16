// 🧾 **도시 명부(src/data/cities.ts)를 스크립트에서 읽는다.**
//
// 왜 파싱하나 — cities.ts 는 TypeScript 라 `node` 가 그대로 못 읽는다. 그렇다고
// 같은 내용을 JSON 으로 한 벌 더 두면 **두 벌이 어긋나는 날이 온다**(바다 칸이
// 한쪽에만 true 로 남는 식). 그래서 **원본 한 벌만 두고 여기서 읽어 낸다.**
//
// ⚠️ 정규식으로 읽으므로 cities.ts 의 모양이 바뀌면 여기도 같이 봐야 한다.
//    빠뜨리면 조용히 틀리지 않게, 읽어 낸 개수를 확인하는 곳을 아래에 뒀다.
import { readFileSync } from "node:fs";

const SRC = "src/data/cities.ts";

/** @returns {{key:string, ko:string, areaCode:string, coast:boolean, lat:number, lng:number, units:string[], status:string}[]} */
export function readCities(path = SRC) {
  const text = readFileSync(path, "utf8");
  const blocks = text.split(/\n  \{\n/).slice(1);
  const out = [];
  for (const b of blocks) {
    const key = b.match(/key: "([^"]+)"/)?.[1];
    if (!key) continue;
    out.push({
      key,
      ko: b.match(/ko: "([^"]+)"/)?.[1] ?? key,
      koFull: b.match(/koFull: "([^"]+)"/)?.[1] ?? "",
      status: b.match(/status: "([^"]+)"/)?.[1] ?? "",
      areaCode: b.match(/areaCode: "([^"]+)"/)?.[1] ?? "",
      // 🌊 **없으면 「있다」로 치지 않는다.** 못 읽었는데 바다가 있다고 치면
      //    서울에 「바다·해변」이 되살아난다 — 못 읽은 것은 못 읽었다고 한다.
      coast: /coast: true/.test(b) ? true : /coast: false/.test(b) ? false : undefined,
      lat: Number(b.match(/lat:\s*([\d.]+)/)?.[1]),
      lng: Number(b.match(/lng:\s*([\d.]+)/)?.[1]),
      units: [...(b.match(/units:\s*\[([\s\S]*?)\n    \]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]),
    });
  }
  if (out.length !== 17)
    throw new Error(`❌ ${path} 에서 ${out.length}곳만 읽혔다 — 17곳이어야 한다. 모양이 바뀌었는지 볼 것.`);
  return out;
}

/** 관광공사 지역 번호로 찾는다 (survey-<번호>.json 이 어느 도시 것인지). */
export function cityByArea(areaCode, cities = readCities()) {
  return cities.find((c) => c.areaCode === String(areaCode));
}

/** 열쇠로 찾는다 (--city busan). */
export function cityByKey(key, cities = readCities()) {
  return cities.find((c) => c.key === key);
}
