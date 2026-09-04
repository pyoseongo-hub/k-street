// 앱이 실제로 손님에게 내보내는 **모든 바깥 주소**를 한 파일로 뽑아낸다.
//
// 왜 따로 만들지 않고 앱 코드를 그대로 부르나 — 링크를 만드는 규칙(mapLinks.ts)을
// 검사 스크립트에 다시 적으면 **잣대가 둘이 된다.** 한쪽만 고치면 검사는 통과하는데
// 화면은 틀린 상황이 생긴다. 그래서 여기서는 앱과 똑같은 함수를 부른다.
//
// 이 파일은 브라우저용이 아니라 **Node에서 돌리는 용도**라 vite의 --ssr로 빌드한다:
//   npx vite build --ssr scripts/dump-links.ts --outDir .linkdump --logLevel error
//   node .linkdump/dump-links.js > links.json
// (scripts/check-links.mjs가 그 links.json을 읽어 실제로 열리는지 확인한다.)

import { ALL_PLACES, ALL_FESTIVALS, HIDDEN_NO_PHOTO, type Place } from "../src/data/seed";
import { getMapLinks, getPlaceInfoLink } from "../src/lib/mapLinks";

const shape = (p: Place) => ({
  id: p.id,
  name: p.name,
  gu: p.gu,
  dong: p.dong,
  category: p.category,
  lat: p.lat,
  lng: p.lng,
  addr: p.addr,
  source: p.source,
  image: p.image,
  thumb: p.thumb,
  officialUrl: p.officialUrl,
  startMonth: p.startMonth,
  endMonth: p.endMonth,
  monthSource: p.monthSource,
  info: getPlaceInfoLink(p),
  maps: getMapLinks(p),
});

console.log(
  JSON.stringify({
    counts: {
      all: ALL_PLACES.length,
      festivals: ALL_FESTIVALS.length,
      hiddenNoPhoto: HIDDEN_NO_PHOTO.length,
    },
    // 화면에 나오는 장소 카드
    rows: ALL_PLACES.map(shape),
    // 계절 화면의 축제 (사진 게이트가 없어 목록이 다르다)
    festivals: ALL_FESTIVALS.map(shape),
    // 사진이 없어 지금 가려져 있는 곳 (채우면 화면에 나온다)
    hidden: HIDDEN_NO_PHOTO.map(shape),
  })
);
