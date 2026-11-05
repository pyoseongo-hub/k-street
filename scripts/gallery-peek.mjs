// 🔎 **관광사진 갤러리를 낱말 하나로 찾아 사진을 받아 둔다** — 사람이 눈으로 고르려고.
//
// 사장님 (2026-11-05): 「벚꽃길 사진부터 하는데 없는 건 대표 이미지로 대처한다.
//   풍경이 아닌 벚꽃 사진 나온 거로 대처해서 처리해」.
//   서울 벚꽃길 22곳은 갤러리에 **그 길의 사진이 0장**이었다. 그래서 「벚꽃」으로 찾아
//   꽃을 가까이 찍은 사진을 사람이 고른다. fetch-photo-gallery 는 **곳 이름이 제목에
//   든 사진만** 붙이므로 이 일을 못 한다 — 그 잣대를 느슨하게 하면 남의 곳 사진이 붙는다.
//
// 받은 그림은 peek/<tag>/ 에 두고, 같은 자리에 list.json(제목·촬영지·주소)을 남긴다.
//   node scripts/gallery-peek.mjs --keyword 벚꽃 --tag cherry --rows 40
import { mkdirSync, writeFileSync } from "node:fs";

const KEY = process.env.TOUR_API_KEY ?? "";
if (!KEY) { console.error("❌ TOUR_API_KEY 가 없다"); process.exit(1); }
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const KW = arg("--keyword");
const TAG = arg("--tag") ?? "gallery";
const ROWS = arg("--rows") ?? "40";
if (!KW) { console.error("❌ --keyword 가 없다"); process.exit(1); }

const q = new URLSearchParams({ MobileOS: "ETC", MobileApp: "KStreet", _type: "json", numOfRows: ROWS, pageNo: "1", arrange: "A", keyword: KW });
const r = await fetch(`https://apis.data.go.kr/B551011/PhotoGalleryService1/gallerySearchList1?serviceKey=${KEY}&${q}`);
const j = await r.json();
const raw = j?.response?.body?.items?.item ?? [];
const items = Array.isArray(raw) ? raw : [raw];
console.log(`🔎 「${KW}」 — ${items.length}장`);

const dir = `peek/${TAG}`;
mkdirSync(dir, { recursive: true });
const list = [];
let n = 0;
for (const it of items) {
  n++;
  const url = it.galWebImageUrl;
  const file = `${String(n).padStart(2, "0")}.jpg`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(`${dir}/${file}`, Buffer.from(await res.arrayBuffer()));
    console.log(`✅ ${n} ${it.galTitle} · ${it.galPhotographyLocation ?? ""} · ${it.galPhotographyMonth ?? ""}`);
  } catch (e) {
    console.log(`❌ ${n} ${it.galTitle} — ${e.message}`);
    continue;
  }
  list.push({ n, file, id: it.galContentId, title: it.galTitle, place: it.galPhotographyLocation, month: it.galPhotographyMonth, by: it.galPhotographer, url, keywords: it.galSearchKeyword });
}
writeFileSync(`${dir}/list.json`, JSON.stringify(list, null, 1) + "\n");
console.log(`📦 ${list.length}장을 ${dir}/ 에 받았다`);
