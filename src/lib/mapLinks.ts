// K-Street는 자체 길찾기(도보·대중교통 경로 계산)를 만들지 않는다 — 정확한 경로
// 안내는 지도 3사가 이미 잘 하고 있고, 직접 만들면 정확도를 보장할 수 없다.
// 대신 koreatravel.guru 같은 여행 사이트들이 쓰는 방식대로, 카카오·네이버·구글
// 지도로 바로 넘기는 링크만 준다(2026-08-27 사용자 지시로 카카오를 맨 앞에 둔다).
// 구글은 한국 대중교통 데이터가 약하지만
// (참고 사이트도 셋을 나란히 준다) 도보 길찾기·이미 구글에 익숙한 외국인
// 관광객에게는 여전히 쓸모가 있어 뺴지 않는다.
import { isOfficialSite } from "./officialSite";

export interface MapLinkTarget {
  name: string;
  gu: string;
  dong?: string;
  lat?: number;
  lng?: number;
  /** 공식 안내 주소가 있으면 이름을 눌렀을 때 검색 대신 여기로 간다(seed.ts 참고). */
  officialUrl?: string;
  /**
   * 도로명 주소. **택시 기사에게 보여 주는 화면**(DriverCard.tsx)이 이걸 읽는다.
   * 길찾기 링크는 좌표로 찍으므로 주소를 안 쓰지만, 사람에게 말로 대는 목적지는
   * 좌표가 아니라 주소다. 365곳 중 319곳(87%)만 값이 있고, 없는 곳은
   * 지어내지 않고 구·동까지만 적는다.
   */
  addr?: string;
}

export interface MapLink {
  // OFFICIAL = 그 축제·기관이 직접 운영하는 공식 안내 주소(seed.ts의 officialUrl).
  label: "NAVER" | "KAKAO" | "GOOGLE" | "OFFICIAL";
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
function kakaoBtn(url: string, label: string): string {
  return `<a class="map-btn map-btn--kakao" href="${url}" target="_blank" rel="noopener noreferrer"><span class="map-btn-icon">📍</span>${label}</a>`;
}

function naverBtn(url: string, label: string): string {
  return `<a class="map-btn map-btn--naver" href="${url}" target="_blank" rel="noopener noreferrer"><span class="map-btn-badge map-btn-badge--naver">N</span>${label}</a>`;
}

/** HTML 속성 안에 넣을 값. 상호에 따옴표가 섞여도 마크업이 안 깨지게 막는다. */
function attr(v: string | undefined): string {
  return (v ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * 🇰🇷 기사에게 보여 주기 — 지도 팝업(InfoWindow) 안에서도 같은 버튼을 준다.
 *
 * ⚠️ 여기는 React 가 아니라 **문자열**이라 onClick 을 못 붙인다. 그래서 값을
 *    data- 속성에 담아 두고, 지도 화면(SeoulMap.tsx)이 등록해 둔 손잡이
 *    `window.__ksDriverCard` 에 그 버튼을 그대로 넘긴다.
 *    손잡이가 없으면(등록 전) 아무 일도 안 일어난다 — 오류를 내는 것보다 낫다.
 *
 * 🚨 **버튼을 한쪽에만 달지 않는다.** 목록 카드(MapDirections.tsx)에만 달아 두면
 *    지도에서 마커를 눌러 들어온 손님은 이 기능을 영영 못 본다 — 이 저장소가
 *    여러 번 당한 '반쪽 적용'이다.
 */
function driverBtn(place: MapLinkTarget, label: string): string {
  return (
    `<button type="button" class="map-btn map-btn--driver"` +
    ` data-dc-name="${attr(place.name)}" data-dc-gu="${attr(place.gu)}"` +
    ` data-dc-dong="${attr(place.dong)}" data-dc-addr="${attr(place.addr)}"` +
    ` onclick="window.__ksDriverCard&&window.__ksDriverCard(this)">${label}</button>`
  );
}

/** 버튼 이름은 밖에서 받는다 — 이 파일은 raw HTML 문자열이라 훅(useLanguage)을 못 쓴다. */
export function renderMapLinksHtml(
  place: MapLinkTarget,
  labels: { kakao: string; naver: string; driver: string } = {
    kakao: "KakaoMap",
    naver: "Naver Map",
    driver: "🇰🇷 Show to driver",
  }
): string {
  const [kakao, naver] = getMapLinks(place);
  return (
    `<div class="place-directions"><div class="map-directions-row">` +
    `${kakaoBtn(kakao.url, labels.kakao)}${naverBtn(naver.url, labels.naver)}</div>` +
    `${driverBtn(place, labels.driver)}</div>`
  );
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
 * 이름을 눌렀을 때 가는 **정보 링크**(길찾기가 아니다).
 *
 * 사용자 지시(2026-09-01 오전): "정보가 작아 이름을 누르면 네이버 나 카카오 링크 연결해".
 * 그래서 처음에는 **네이버 지도**의 장소 검색으로 보냈다. 그런데 같은 날 오후에
 * 사용자가 캡처 네 장으로 그게 틀렸다는 걸 보여 줬다:
 *
 *   "링크 지도 띄우지말고 부정확해 / 네이버 검색후 해당 자치제 행사 안내나
 *    그에 맞는 사이트로 이동하게해"
 *
 * 🚨 **지도에는 '축제'라는 장소가 없다.** 서울숲 JAZZ페스티벌을 네이버 지도에서 찾으면
 * "검색결과가 없습니다 / 신규장소 등록 요청하기"만 뜬다 — 축제는 한 해에 며칠만 열리는
 * 행사라 지도에 상호로 등록되지 않기 때문이다. 골목·꽃길·산책길도 사정이 같다.
 * 지도는 '가게·건물'을 담는 그릇이지 '행사·길'을 담는 그릇이 아니다.
 *
 * ✅ 같은 이름으로 **네이버 통합검색**을 하면 바로 나온다 — 캡처 2번째 장에서
 * `성동구청 www.sd.go.kr › tour` 의 "서울숲 JAZZ페스티벌 - 대표축제 - 성동구 문화관광"
 * 페이지가 상단에 떴고, 그 페이지에는 일시·장소·주최·문의 전화까지 다 있다(3번째 장).
 * 이게 우리가 보내고 싶은 곳이다 — **그 자치구가 직접 운영하는 공식 행사 안내**.
 *
 * 이 앱의 정확도 원칙과도 맞는다: 해마다 바뀌는 날짜·요금은 우리가 적지 않고
 * 공식 창구로 안내한다. 통합검색은 지도와 달리 **0건이 나오지 않는다** —
 * 구청 페이지가 없는 곳이라도 최소한 뉴스·블로그가 잡힌다.
 *
 * 지도 앱 스킴(nmap://)은 쓰지 않는다. 앱을 열면 결국 그 "검색결과가 없습니다" 화면이라
 * 웹 통합검색 하나로 통일한다. 좌표를 쓰는 **길찾기 버튼은 아래에 그대로 남는다** —
 * 그건 좌표로 찍으므로 정확하고, 이 링크와 역할이 다르다.
 */
/**
 * 🔎 그 이름의 **네이버 통합검색** 주소. 축제 카드의 「날짜 확인」이 여기로 간다.
 *
 * 사용자 지시(2026-09-02): "날짜에 너무 신경쓰지말고 네이버 링크 달아서 직접
 * 확인해야한다".
 *
 * 왜 공식 홈페이지가 아니라 네이버인가 — 공식 사이트는 회차가 끝나면 그대로
 * 멈춰 있는 곳이 많은데, 네이버 축제정보 카드는 **올해 날짜가 같은 자리에**
 * 뜬다. 사장님이 오늘 캡처로 확인해 준 것도 전부 이 카드였다.
 * 이름을 누르는 쪽(getPlaceInfoLink)은 공식 창구로 그대로 두고, 날짜만 이쪽으로
 * 보낸다 — 둘은 손님이 알고 싶은 것이 다르다.
 */
export const naverSearchUrl = (name: string) =>
  `https://search.naver.com/search.naver?query=${encodeURIComponent(name)}`;

export function getPlaceInfoLink(place: MapLinkTarget): MapLink {
  // 🔗 공식 주소를 적어 둔 곳은 검색을 거치지 않고 **곧장 그리로** 간다
  //    (2026-09-02 사용자가 서울숲 재즈페스티벌 공식 주소를 줬다).
  //    검색은 대개 잘 맞지만, 이름이 비슷한 다른 행사가 있으면 그쪽이 먼저 뜬다 —
  //    「서울숲 JAZZ페스티벌」을 검색하면 올림픽공원에서 하는 「서울재즈페스티벌」
  //    자료가 섞여 나온다. 날짜가 해마다 바뀌는 축제라 **손님이 가장 최신을 보는
  //    자리**로 보내는 게 중요하다.
  //    다만 블로그·SNS 주소는 여기서 한 번 더 걸러 낸다(officialSite.ts). 자료 쪽에서
  //    이미 거르지만, 손으로 적어 넣는 자리(seed.ts)가 따로 있어 **화면에서도 같은
  //    잣대를 통과해야** 반쪽 적용이 생기지 않는다.
  if (isOfficialSite(place.officialUrl)) {
    return { label: "OFFICIAL", url: place.officialUrl };
  }
  // 검색어는 **이름 그대로**만 쓴다. 구·동을 덧붙이지 않는 이유는 지도 검색 때와 같다
  // (아래 getMapLinks의 2026-09-01 주석 참고) — 이름에 없는 말을 붙이면 검색이 흐려진다.
  // 사용자가 캡처로 보여 준 것도 이름만 넣은 검색이었고, 그걸로 성동구청 페이지가 떴다.
  const encName = encodeURIComponent(place.name);
  return {
    label: "NAVER",
    url: `https://search.naver.com/search.naver?query=${encName}`,
  };
}

/** 이름 링크는 **새 탭**으로 연다 — 길찾기(openMapLink)와 다른 점이다.
 *  길찾기는 지도 '앱'을 띄우는 거라 같은 탭 이동이어야 하지만(앱 스킴이 팝업으로
 *  막히지 않게), 이건 그냥 웹페이지다. 홈 화면에 설치해 쓰는 경우 같은 탭으로 나가면
 *  앱 창 자체가 네이버로 바뀌어 돌아올 길이 없어진다. 클릭 안에서 바로 부르므로
 *  브라우저가 팝업으로 막지 않는다. */
export function openPlaceInfo(place: MapLinkTarget) {
  const { url } = getPlaceInfoLink(place);
  window.open(url, "_blank", "noopener,noreferrer");
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
