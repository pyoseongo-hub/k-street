// K-Street는 자체 길찾기(도보·대중교통 경로 계산)를 만들지 않는다 — 정확한 경로
// 안내는 지도 3사가 이미 잘 하고 있고, 직접 만들면 정확도를 보장할 수 없다.
// 대신 koreatravel.guru 같은 여행 사이트들이 쓰는 방식대로, 카카오·네이버·구글
// 지도로 바로 넘기는 링크만 준다(2026-08-27 사용자 지시로 카카오를 맨 앞에 둔다).
// 구글은 한국 대중교통 데이터가 약하지만
// (참고 사이트도 셋을 나란히 준다) 도보 길찾기·이미 구글에 익숙한 외국인
// 관광객에게는 여전히 쓸모가 있어 뺴지 않는다.
export interface MapLinkTarget {
  name: string;
  gu: string;
  dong?: string;
  lat?: number;
  lng?: number;
}

export interface MapLink {
  label: "NAVER" | "KAKAO" | "GOOGLE";
  url: string;
  /** 좌표가 있을 때만 채워진다 — 앱을 직접 열어 "길찾기 단계"로 바로 데려가는 스킴 URL.
   *  없으면(좌표 미확보) url(검색 링크)만 쓴다 — 검색으로는 앱 스킴이 없다. */
  appScheme?: string;
}

// 카카오맵·네이버지도만 같은 규격의 주요 액션으로 나란히 둔다. 구글은
// 화면에서 아예 뺀다(2026-08-28 사용자가 캡처에 빨간 X로 직접 표시해
// 지시 — 한국 대중교통 길찾기 정확도가 낮아 실제로 잘 안 쓰인다).
// getMapLinks()는 구글 URL도 계속 반환하지만(다른 화면이 나중에 쓸 수
// 있게) 아래 렌더링 두 곳(패널·구 탐색은 MapDirections.tsx, 지도
// InfoWindow는 이 함수)은 카카오·네이버만 그린다.
function kakaoBtn(url: string): string {
  return `<a class="map-btn map-btn--kakao" href="${url}" target="_blank" rel="noopener noreferrer"><span class="map-btn-icon">📍</span>카카오맵</a>`;
}

function naverBtn(url: string): string {
  return `<a class="map-btn map-btn--naver" href="${url}" target="_blank" rel="noopener noreferrer"><span class="map-btn-badge map-btn-badge--naver">N</span>네이버지도</a>`;
}

export function renderMapLinksHtml(place: MapLinkTarget): string {
  const [kakao, naver] = getMapLinks(place);
  return `<div class="place-directions"><div class="map-directions-row">${kakaoBtn(kakao.url)}${naverBtn(naver.url)}</div></div>`;
}

// 🚨 앱이 깔려 있으면 그 앱의 "길찾기 화면"으로 바로 데려가고, 없을 때만
// 웹으로 대신 간다(dongne-hanip의 openNaverMap에서 이미 검증된 방식,
// 2026-08-06 "링크가 안 열린다" 제보로 만들어짐 — 같은 문제를 카카오·네이버
// 둘 다에 적용). **새 창(window.open)이 아니라 '이동'으로 열어야 한다** —
// 예비 이동이 클릭 순간이 아니라 타이머 안에서 실행되므로, 새 탭으로 열면
// 브라우저가 팝업으로 보고 막는다. 같은 탭 이동은 팝업 판정을 받지 않는다.
// 앱이 정상적으로 열렸으면 화면이 가려지므로(document.hidden) 예비 이동을
// 건너뛴다.
export function openMapLink(link: MapLink) {
  if (!link.appScheme) {
    window.location.href = link.url;
    return;
  }
  const start = Date.now();
  window.location.href = link.appScheme;
  setTimeout(() => {
    if (Date.now() - start < 2200 && !document.hidden) {
      window.location.href = link.url;
    }
  }, 1200);
}

export function getMapLinks(place: MapLinkTarget): MapLink[] {
  const hasCoords = typeof place.lat === "number" && typeof place.lng === "number";
  const encName = encodeURIComponent(place.name);

  if (hasCoords) {
    const { lat, lng } = place as { lat: number; lng: number };
    return [
      // 📍 검색 결과 화면(handle 한 번 더 눌러야 길찾기로 넘어감)이 아니라
      // **길찾기 단계로 바로** 가야 한다(2026-08-29 사용자 지적: "이 버튼 누른
      // 단계까지 가야한다고" — 카카오맵 검색 결과 바텀시트의 길찾기 아이콘을
      // 손으로 한 번 더 눌러야 했다). 앱이 깔려 있으면 kakaomap:// / nmap://
      // 스킴으로 곧장 길찾기 화면을 열고(appScheme), 앱이 없을 때만 이 웹
      // url(길찾기 웹페이지, 그래도 검색보다는 한 단계 앞선 화면)로 대신 간다.
      { label: "KAKAO", url: `https://map.kakao.com/link/to/${encName},${lat},${lng}`, appScheme: `kakaomap://route?ep=${lat},${lng}&by=PUBLICTRANSIT` },
      { label: "NAVER", url: `https://map.naver.com/p/directions/-/${lng},${lat},${encName}/-/transit`, appScheme: `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encName}&appname=com.kstreet.app` },
      { label: "GOOGLE", url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` },
    ];
  }

  // 좌표가 아직 없는 곳은(정확도 원칙상 지어내지 않는다) 이름+동네로만 안내한다.
  // 다만 셋의 사정이 다르다 — 구글의 공식 길찾기 URL(api=1&destination=)은
  // 좌표 없이 '이름 텍스트'만으로도 실제 경로 화면(출발지는 현재 위치로 자동,
  // 목적지는 이 이름)을 띄운다. 네이버·카카오의 길찾기 링크 형식은 좌표가
  // 있어야 목적지가 바로 찍힌다 — 좌표 없이 부르면 앱이 "직접 골라라"는
  // 화면만 띄운다(이미 dongne-hanip에서 겪은 문제, openNaverMap 주석 참고).
  // 그래서 네이버·카카오만 검색으로 폴백하고, 구글은 좌표 없이도 길찾기로 보낸다.
  const query = `${place.name} ${place.dong ?? place.gu}`;
  const encQuery = encodeURIComponent(query);
  return [
    { label: "KAKAO", url: `https://map.kakao.com/link/search/${encQuery}` },
    { label: "NAVER", url: `https://map.naver.com/v5/search/${encQuery}` },
    { label: "GOOGLE", url: `https://www.google.com/maps/dir/?api=1&destination=${encQuery}` },
  ];
}
