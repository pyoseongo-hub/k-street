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
}

// 카카오·네이버·구글 세 버튼을 같은 크기의 알약으로 한 줄에 나란히 둔다
// (2026-08-28 사용자가 참고 캡처를 다시 짚으며 "이 모양으로 만들어라" — 가로형
// 리스트 카드의 좁은 폭엔 큰 버튼 2개+링크 1개 조합보다 이 쪽이 맞았다).
// 화면 3곳(패널·구 탐색·지도 InfoWindow)이 아래 HTML 조각을 그대로 써서 한
// 곳만 고치면 전부 맞춰진다 — React 두 곳은 MapDirections.tsx가, 지도
// InfoWindow(raw HTML)는 이 함수가 담당한다.
function kakaoBtn(url: string): string {
  return `<a class="map-btn map-btn--kakao" href="${url}" target="_blank" rel="noopener noreferrer"><span class="map-btn-icon">📍</span>카카오맵</a>`;
}

function naverBtn(url: string): string {
  return `<a class="map-btn map-btn--naver" href="${url}" target="_blank" rel="noopener noreferrer"><span class="map-btn-badge map-btn-badge--naver">N</span>네이버지도</a>`;
}

function googleBtn(url: string): string {
  return `<a class="map-btn map-btn--google" href="${url}" target="_blank" rel="noopener noreferrer"><span class="map-btn-badge map-btn-badge--google">G</span>Google</a>`;
}

export function renderMapLinksHtml(place: MapLinkTarget): string {
  const [kakao, naver, google] = getMapLinks(place);
  return `<div class="place-directions"><div class="map-directions-row">${kakaoBtn(kakao.url)}${naverBtn(naver.url)}${googleBtn(google.url)}</div></div>`;
}

export function getMapLinks(place: MapLinkTarget): MapLink[] {
  const hasCoords = typeof place.lat === "number" && typeof place.lng === "number";
  const encName = encodeURIComponent(place.name);

  if (hasCoords) {
    const { lat, lng } = place as { lat: number; lng: number };
    return [
      { label: "KAKAO", url: `https://map.kakao.com/link/to/${encName},${lat},${lng}` },
      { label: "NAVER", url: `https://map.naver.com/p/directions/-/${lng},${lat},${encName}/-/transit` },
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
