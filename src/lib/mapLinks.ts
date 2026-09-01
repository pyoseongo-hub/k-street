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

/** 출발지(내 위치). 없으면 목적지만 찍힌 화면으로 연다 — 지금까지의 동작 그대로다. */
export interface MapOrigin {
  lat: number;
  lng: number;
}

/**
 * 장소 **정보** 화면으로 가는 링크(길찾기가 아니다).
 *
 * 사용자 지시(2026-09-01): "정보가 작아 이름을 누르면 네이버 나 카카오 링크 연결해".
 * 이 앱이 한 곳에 대해 갖고 있는 건 이름·구·주소·사진뿐이라, 영업시간·전화·리뷰·
 * 사진 여러 장 같은 건 지도 앱이 훨씬 잘 갖고 있다. 우리가 그걸 베껴 오면 낡은 정보를
 * 퍼뜨리게 되므로(정확도 원칙: 해마다 바뀌는 값은 적지 않고 공식 창구로 안내한다),
 * **이름을 누르면 지도 앱의 그 장소 화면으로 넘긴다.**
 *
 * 네이버로 보내는 이유 — 국내 장소의 영업시간·메뉴·사진이 가장 두껍고, 이 앱이 이미
 * 네이버 지도 SDK를 쓰고 있어 사용자가 보는 지도와 결이 같다. 길찾기 버튼(카카오·네이버)은
 * 그대로 아래에 남으므로 역할이 겹치지 않는다.
 *
 * 앱 스킴은 `nmap://search`만 쓴다 — 좌표로 장소를 바로 여는 `nmap://place`는 네이버 쪽
 * place id가 있어야 하는데 우리는 그 값을 갖고 있지 않다. 없는 값을 지어내느니
 * 이름 검색으로 보내고, 좌표가 있으면 그 근처로 지도를 옮겨 엉뚱한 동네의 동명 장소가
 * 먼저 잡히지 않게 한다.
 */
export function getPlaceInfoLink(place: MapLinkTarget): MapLink {
  const encName = encodeURIComponent(place.name);
  const hasCoords = typeof place.lat === "number" && typeof place.lng === "number";
  if (hasCoords) {
    const { lat, lng } = place as { lat: number; lng: number };
    return {
      label: "NAVER",
      // c=경도,위도,줌,기울기,회전,틸트,표시방식 — 그 장소 근처를 보여준 상태로 검색된다.
      url: `https://map.naver.com/p/search/${encName}?c=${lng},${lat},16,0,0,0,dh`,
      appScheme: `nmap://search?query=${encName}&lat=${lat}&lng=${lng}&appname=com.kstreet.app`,
    };
  }
  return {
    label: "NAVER",
    url: `https://map.naver.com/p/search/${encName}`,
    appScheme: `nmap://search?query=${encName}&appname=com.kstreet.app`,
  };
}

export function getMapLinks(place: MapLinkTarget, from?: MapOrigin | null): MapLink[] {
  const hasCoords = typeof place.lat === "number" && typeof place.lng === "number";
  const encName = encodeURIComponent(place.name);

  if (hasCoords) {
    const { lat, lng } = place as { lat: number; lng: number };
    const encHere = encodeURIComponent("내 위치");
    const kakaoScheme = from
      ? `kakaomap://route?sp=${from.lat},${from.lng}&ep=${lat},${lng}&by=PUBLICTRANSIT`
      : `kakaomap://route?ep=${lat},${lng}&by=PUBLICTRANSIT`;
    const naverScheme = from
      ? `nmap://route/public?slat=${from.lat}&slng=${from.lng}&sname=${encHere}&dlat=${lat}&dlng=${lng}&dname=${encName}&appname=com.kstreet.app`
      : `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encName}&appname=com.kstreet.app`;
    const naverWeb = from
      ? `https://map.naver.com/p/directions/${from.lng},${from.lat},${encHere}/${lng},${lat},${encName}/-/transit`
      : `https://map.naver.com/p/directions/-/${lng},${lat},${encName}/-/transit`;
    const googleWeb = from
      ? `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    return [
      // 📍 검색 결과 화면(handle 한 번 더 눌러야 길찾기로 넘어감)이 아니라
      // **길찾기 단계로 바로** 가야 한다(2026-08-29 사용자 지적: "이 버튼 누른
      // 단계까지 가야한다고" — 카카오맵 검색 결과 바텀시트의 길찾기 아이콘을
      // 손으로 한 번 더 눌러야 했다). 앱이 깔려 있으면 kakaomap:// / nmap://
      // 스킴으로 곧장 길찾기 화면을 열고(appScheme), 앱이 없을 때만 이 웹
      // url(길찾기 웹페이지, 그래도 검색보다는 한 단계 앞선 화면)로 대신 간다.
      //
      // 🚩 그리고 **출발지까지 채운다**(사용자 지시 2026-09-01 — 카카오맵 길찾기
      // 캡처 두 장: 출발·도착이 모두 적혀 있고 자동차/버스 탭이 바로 뜨는 화면).
      // 앱 스킴은 두 지도 모두 출발지 인자를 받는다 — 카카오는 sp(start point),
      // 네이버는 slat/slng/sname.
      //
      // ⚠️ 웹 주소는 사정이 다르다. 네이버 길찾기 웹 주소는 경로 첫 칸이 출발지라
      // (지금까지 `-`로 비워 두던 자리) 그대로 채우면 되지만, 카카오 `link/to/`는
      // 도착지만 받는 형식이라 출발지를 넣을 자리가 없다. **카카오 웹 폴백은
      // 도착지만** 남는다 — 앱이 깔려 있으면 스킴이 먼저 뜨므로 실사용에선 거의 안 걸린다.
      { label: "KAKAO", url: `https://map.kakao.com/link/to/${encName},${lat},${lng}`, appScheme: kakaoScheme },
      { label: "NAVER", url: naverWeb, appScheme: naverScheme },
      { label: "GOOGLE", url: googleWeb },
    ];
  }

  // 좌표가 아직 없는 곳은(정확도 원칙상 지어내지 않는다) 이름+동네로만 안내한다.
  // 다만 셋의 사정이 다르다 — 구글의 공식 길찾기 URL(api=1&destination=)은
  // 좌표 없이 '이름 텍스트'만으로도 실제 경로 화면(출발지는 현재 위치로 자동,
  // 목적지는 이 이름)을 띄운다. 네이버·카카오의 길찾기 링크 형식은 좌표가
  // 있어야 목적지가 바로 찍힌다 — 좌표 없이 부르면 앱이 "직접 골라라"는
  // 화면만 띄운다(이미 dongne-hanip에서 겪은 문제, openNaverMap 주석 참고).
  // 그래서 네이버·카카오만 검색으로 폴백하고, 구글은 좌표 없이도 길찾기로 보낸다.
  // 🚨 2026-09-01 — 여기에 구·동을 붙이면 **오히려 검색이 0건**이 된다.
  // 사용자가 캡처로 확인해 줬다: 카카오맵에서 "댄싱노원 거리페스티벌 노원구"는
  // "검색 결과가 없어요"가 뜨는데, 지역명을 뗀 이름만으로는 나온다.
  // 카카오·네이버는 등록된 장소 이름으로 찾는 검색이라, 이름에 없는 행정구역을
  // 덧붙이면 그냥 안 맞는 검색어가 된다.
  //
  // 구를 떼면 다른 동네의 같은 이름이 섞일 수 있지만, 0건보다는 낫다.
  // 애초에 이 경로는 **좌표가 없는 곳만** 타는 폴백이고(좌표가 있으면 길찾기로
  // 바로 간다), 진짜 해결은 좌표를 채우는 것이다 — scripts/fetch-coords.mjs.
  const encQuery = encodeURIComponent(place.name);
  return [
    { label: "KAKAO", url: `https://map.kakao.com/link/search/${encQuery}` },
    { label: "NAVER", url: `https://map.naver.com/v5/search/${encQuery}` },
    { label: "GOOGLE", url: `https://www.google.com/maps/dir/?api=1&destination=${encQuery}` },
  ];
}
