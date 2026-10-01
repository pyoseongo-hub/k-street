// 🎚️ **명령줄에서 값 하나 꺼내기 — 한 자리에만 둔다.**
//
// 🐞 왜 생겼나 (2026-10-01에 당했다). 여기저기 이렇게 적혀 있었다:
//
//     const ONLY = process.argv[process.argv.indexOf("--city") + 1];
//
//   `--city` 를 **안 주면** `indexOf` 가 **-1** 을 돌려준다. 그럼 `argv[-1 + 1]`
//   즉 **`argv[0]`** 이고, 그건 **node 실행 파일 경로**다
//   (`/opt/hostedtoolcache/node/22.x/x64/bin/node`).
//
//   ⚠️ 빈 값이 아니라 **길고 그럴듯한 글자**라 참으로 읽힌다. 그래서 보관함 찾기가
//      「한 도시만 보라」는 뜻으로 알아듣고 **여덟 도시를 전부 건너뛰었다.**
//      카카오를 한 번도 안 부르고 29초 만에 끝났는데 **워크플로는 초록불**이었고
//      파일에는 `"도시": {}` 만 저장됐다. 조용한 실패의 교과서다.
//
// ✅ 그래서 **쓴 적이 있을 때만** 값을 본다. 없으면 받아 둔 기본값을 준다.
//
//   import { argValue } from "./lib/args.mjs";
//   const ONLY = argValue("--city");              // 안 주면 ""
//   const SEASON = argValue("--season", "autumn"); // 안 주면 "autumn"

/**
 * @param {string} flag 「--city」처럼 앞의 두 줄표까지 포함한 이름
 * @param {string} [fallback] 안 줬을 때 쓸 값 (기본 "")
 * @param {string[]} [argv] 시험할 때 바꿔 넣는다
 * @returns {string}
 */
export function argValue(flag, fallback = "", argv = process.argv) {
  const i = argv.indexOf(flag);
  // 🚨 **-1 을 먼저 거른다.** 이 한 줄이 위 사고를 막는다.
  if (i < 0) return fallback;
  const v = argv[i + 1];
  // 🚨 뒤가 비었거나 **또 다른 깃발**이면 값을 안 준 것이다 (`--city --apply`).
  //    그걸 값으로 받으면 「--apply 라는 이름의 도시」를 찾게 된다.
  if (v === undefined || v.startsWith("--")) return fallback;
  return v;
}
