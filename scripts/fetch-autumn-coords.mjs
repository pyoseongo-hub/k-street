#!/usr/bin/env node
// 🍁 **단풍길 110곳에 좌표를 채운다.**
//
// ─────────────────────────────────────────────────────────────────────────
// 왜 이게 필요했나 — 2026-09-15에 사장님이 화면으로 잡아 주셨다
// ─────────────────────────────────────────────────────────────────────────
//   삼청동길(단풍길)에서 「짐 보관」을 눌렀더니 **「가까운 지하철역 없음」**이 떴다.
//   안국역이 걸어서 갈 거리인데도.
//
//   사장님: *"지하철 짐보관 싹다 다시봐 가까운역 안떠"*
//           *"역까지 안내를 해야 다음 있는데 그게 없어. 항상 만들고 검사 좀 해.
//             어떻게 이렇게 많이 없을 수 있어"*
//
//   재 보니 이랬다 (곳 425개 기준):
//     · 좌표가 아예 없는 곳  111곳  — 그중 **단풍길이 106곳**
//     · 역 기록이 없는 곳    112곳  — 그중 **단풍길이 107곳**
//
//   사슬이 이렇게 이어져 있다:
//       좌표 → 가까운 역(find-nearest-station) → 짐 보관 화면
//   **첫 칸이 비면 뒤가 전부 끊긴다.** 단풍길을 넣을 때 좌표를 안 넣었으니
//   역도 없고, 역이 없으니 짐보관도 없다. 그런데 화면은 그걸 「없음」이라고
//   단정해서, **모르는 것을 없다고 말하고 있었다.**
//
// ─────────────────────────────────────────────────────────────────────────
// 🔑 좌표를 어디에 넣나 — **coords.json 한 곳**
// ─────────────────────────────────────────────────────────────────────────
//   이미 그 자리가 있다. dump-place-coords.ts 가 `getCoords(id, name)` 로 읽고,
//   거기서 나온 PLACES 를 find-nearest-station 이 쓴다. 그러니 **coords.json 만
//   채우면 역도 짐보관도 곳 페이지도 저절로 따라온다.** 새 통로를 만들지 않는다
//   (「자료를 읽는 길이 둘이면 필터도 둘이 된다」 — dump-place-coords 주석).
//
//   열쇠는 seed.ts 가 만드는 id 그대로 `autumn_<번호>` 다. 그리고 `for` 에
//   **그때의 이름**을 적는다 — 번호가 밀려도 남의 좌표를 쓰지 않게 하는 장치다
//   (coords.ts 의 2026-09-02 사고 주석 참고).
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 길은 점이 아니다 — 그래서 더 엄하게 대조한다
// ─────────────────────────────────────────────────────────────────────────
//   「동호로」는 1km 가 넘는 길이고, 좌표는 그중 한 점일 뿐이다. 그건 받아들인다
//   (산책길·꽃길도 이미 그렇게 쓴다). 받아들일 수 없는 것은 **다른 동네의 같은
//   이름**이다. Kfood 에서 배운 것 그대로 — 검색 결과를 그냥 그 곳의 자료로
//   저장하면 남의 집이 들어온다.
//
//   그래서 두 가지를 **둘 다** 통과해야 저장한다:
//     ① 주소가 **서울 + 그 구**여야 한다
//     ② 돌아온 이름이나 도로명이 **우리가 찾는 길 이름을 담고** 있어야 한다
//   하나라도 어긋나면 **비워 둔다.** 빈 칸이 틀린 좌표보다 낫다.
//
//   ⚠️ 한글 비교 전에 **NFC 정규화**한다. 눈에 같아 보여도 자모 분해형(NFD)이면
//      다른 문자열이다 — Kfood 에서 유튜브 제목으로 당한 적이 있다.
//
//   실행:
//     KAKAO_REST_API_KEY=xxx node scripts/fetch-autumn-coords.mjs           # 맛보기
//     KAKAO_REST_API_KEY=xxx node scripts/fetch-autumn-coords.mjs --apply   # 저장
//
//   🚨 **맛보기를 먼저 돌려 눈으로 본다.** 이 저장소가 여러 번 데인 규칙이다.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROADS = join(__dirname, "..", "src", "data", "autumn-roads.json");
const COORDS = join(__dirname, "..", "src", "data", "coords.json");

const KEY = process.env.KAKAO_REST_API_KEY ?? "";
const APPLY = process.argv.includes("--apply");
/** 이미 좌표가 있는 곳까지 전부 다시 받는다. */
const ALL = process.argv.includes("--all");
/** 🐢 분당 한도에 안 닿게 쉬어 간다 — find-nearest-station 이 여기서 크게 데였다. */
const GAP_MS = Number(process.env.GAP_MS ?? 250);
/**
 * ✂️ **한 판에 몇 곳까지만** (0 이면 전부).
 *
 * 🚨 한 곳에 **최대 세 번** 묻는다. 106곳이면 318번이라 — 2026-09-12에
 *    317번을 몰아쳤다가 **전부 400** 을 받은 그 숫자와 거의 같다(분당 한도).
 *    그래서 기본을 30곳(최대 90번)으로 끊는다. 받은 것은 합쳐지므로
 *    **여러 번 나눠 돌려도 앞판이 받은 것이 안 사라진다.**
 */
const LIMIT = Number(process.env.LIMIT ?? 30);

if (!KEY) {
  console.error("❌ KAKAO_REST_API_KEY 가 없다. Actions 시크릿을 워크플로에 넘겼는지 볼 것.");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 한글 비교 전에 반드시 거친다 — 보이는 게 같다고 같은 문자열이 아니다. */
const norm = (s) =>
  String(s ?? "")
    .normalize("NFC")
    .replace(/[^가-힣a-zA-Z0-9]/g, "");

/**
 * 카카오에 묻는다. **한도는 답이 아니라 「조금 있다 다시 물어」다** —
 * 이걸 실패로 세면 그 곳이 「좌표 없음」으로 굳는다.
 */
async function kakao(path, params) {
  const url = `https://dapi.kakao.com/v2/local/${path}?${new URLSearchParams(params)}`;
  for (let try_ = 0; ; try_++) {
    try {
      const r = await fetch(url, {
        headers: { Authorization: `KakaoAK ${KEY}` },
        signal: AbortSignal.timeout(20000),
      });
      const text = await r.text();
      if (!r.ok) {
        const limited = /API limit has been exceeded/i.test(text) || r.status === 429;
        if (limited && try_ < 3) {
          await sleep(2000 * 2 ** try_);
          continue;
        }
        return { ok: false, why: `HTTP ${r.status} — ${text.slice(0, 80)}`, limited };
      }
      return { ok: true, docs: JSON.parse(text).documents ?? [] };
    } catch (e) {
      if (try_ < 3) {
        await sleep(2000 * 2 ** try_);
        continue;
      }
      return { ok: false, why: e?.cause?.code || e?.name || e?.message };
    }
  }
}

/** 이 결과를 그 길의 자료로 저장해도 되나 — ①주소 ②이름, 둘 다 봐야 한다. */
function accepts(doc, 구, 이름) {
  const addr = `${doc.address_name ?? ""} ${doc.road_address_name ?? ""}`;
  const a = norm(addr);
  // ① 서울 + 그 구. 카카오는 "서울 종로구 …" 또는 "서울특별시 종로구 …" 로 준다.
  if (!a.startsWith("서울")) return null;
  if (!a.includes(norm(구))) return null;
  // ② 이름. 장소 이름이든 도로명이든 **찾는 길 이름을 담고** 있어야 한다.
  const 이름N = norm(이름);
  const place = norm(doc.place_name);
  const roadN = norm(doc.road_address?.road_name ?? doc.road_address_name ?? "");
  if (place.includes(이름N)) return "이름";
  if (roadN.includes(이름N)) return "도로명";
  return null;
}

const 자료 = JSON.parse(readFileSync(ROADS, "utf8"));
// 🚫 과천 3곳은 seed.ts 가 이미 뺀다(서울이 아니다). 여기서도 같은 잣대를 쓴다 —
//    잣대가 둘이면 반쪽 적용이 생긴다.
const 길 = 자료.길.filter((r) => r.구.endsWith("구"));

const coords = existsSync(COORDS) ? JSON.parse(readFileSync(COORDS, "utf8")) : {};
const 모르는곳 = ALL ? 길 : 길.filter((r) => !coords[`autumn_${r.번호}`]);
const 남은곳 = LIMIT > 0 ? 모르는곳.slice(0, LIMIT) : 모르는곳;

console.log(
  `🍁 단풍길 ${길.length}곳 (과천 ${자료.길.length - 길.length}곳 제외) 중 ` +
    `좌표를 모르는 곳 ${모르는곳.length}곳 — 이번 판에 **${남은곳.length}곳**을 묻는다\n`,
);

let 찾음 = 0;
const 못찾음 = [];
const 새로 = {};

for (const r of 남은곳) {
  const id = `autumn_${r.번호}`;
  // 🔎 세 가지로 물어본다. 사장님 캡처에서 네이버가 「가을단풍길(삼청동길)」로
  //    갖고 있었으니 **정식표기가 가장 잘 맞는 검색어**다. 그 다음이 구+이름.
  //    마지막은 주소 검색 — 「동호로」·「인수봉로」처럼 **이름 자체가 도로명**인
  //    곳이 많아서, 장소 검색보다 이쪽이 정확하다.
  const 시도 = [
    ["search/keyword.json", { query: r.정식표기, size: 5 }, "정식표기"],
    ["search/keyword.json", { query: `${r.구} ${r.이름}`, size: 5 }, "구+이름"],
    ["search/address.json", { query: `서울 ${r.구} ${r.이름}`, size: 5 }, "주소"],
  ];

  let 붙음 = null;
  for (const [path, params, 어떻게] of 시도) {
    const res = await kakao(path, params);
    await sleep(GAP_MS);
    if (!res.ok) {
      // 한도에 걸린 것은 **답이 아니다.** 여기서 멈춰야 「좌표 없음」으로 굳지 않는다.
      console.error(`   ⚠️ ${r.구} ${r.이름} — ${res.why}`);
      if (res.limited) {
        console.error("   🛑 한도에 걸렸다. 여기서 멈춘다 — 받은 것까지만 저장한다.");
        break;
      }
      continue;
    }
    for (const doc of res.docs) {
      const 왜 = accepts(doc, r.구, r.이름);
      if (!왜) continue;
      붙음 = {
        lat: Number(doc.y),
        lng: Number(doc.x),
        source: "kakao",
        matchedName: doc.place_name || doc.address_name,
        // 🚨 `for` 를 반드시 적는다 — 번호가 밀려도 남의 좌표를 안 쓰게 하는 장치다.
        for: r.이름,
        via: `${어떻게}/${왜}`,
      };
      break;
    }
    if (붙음) break;
  }

  if (붙음) {
    찾음++;
    새로[id] = 붙음;
    console.log(
      `✅ ${r.구.padEnd(5)} ${r.이름.padEnd(14)} → ${붙음.matchedName}  ` +
        `(${붙음.lat.toFixed(5)}, ${붙음.lng.toFixed(5)})  [${붙음.via}]`,
    );
  } else {
    못찾음.push(`${r.구}/${r.이름}`);
    console.log(`·  ${r.구.padEnd(5)} ${r.이름.padEnd(14)} — 못 찾았다 (비워 둔다)`);
  }
}

console.log(`\n찾음 ${찾음}곳 · 못 찾음 ${못찾음.length}곳 · 아직 안 물어본 곳 ${모르는곳.length - 남은곳.length}곳`);
if (못찾음.length) console.log(`   비워 둔 곳: ${못찾음.join(" · ")}`);

if (!APPLY) {
  console.log("\n🔎 맛보기다 — 아무것도 저장하지 않았다. 눈으로 보고 나서 --apply 를 붙일 것.");
  process.exit(0);
}

// 🚨 **가진 것부터 깔고 합친다.** 받은 것만으로 새로 쓰면, 한 판이 실패했을 때
//    이미 아는 좌표가 통째로 날아간다 (find-nearest-station 이 겪은 사고).
const 합본 = { ...coords, ...새로 };
writeFileSync(COORDS, JSON.stringify(합본, null, 2) + "\n");
console.log(`\n💾 coords.json 에 ${Object.keys(새로).length}곳을 더했다 (모두 ${Object.keys(합본).length}칸).`);
console.log("   다음 차례: find-nearest-station 을 돌려야 역이 붙는다.");
