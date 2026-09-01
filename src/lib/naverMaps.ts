// 네이버 지도 JS SDK(v3) 로더.
// 스크립트 태그를 동적으로 추가하고, 한 번만 로드되도록 프라미스를 캐싱한다.
// 쿼리 파라미터명은 ncpKeyId다(예전 문서의 ncpClientId는 구버전 이름 — 지금은 이 이름이 맞다).

let loadPromise: Promise<void> | null = null;

export function loadNaverMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  // 개발 환경: import.meta.env / 배포 환경: window.__CONFIG__
  const clientId = (import.meta.env.VITE_NAVER_MAPS_CLIENT_ID as string | undefined) ||
                   (window as any).__CONFIG__?.VITE_NAVER_MAPS_CLIENT_ID as string | undefined;

  if (!clientId) {
    return Promise.reject(
      new Error("VITE_NAVER_MAPS_CLIENT_ID가 없다 — .env.local을 확인할 것(.env.example 참고).")
    );
  }

  loadPromise = new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    // submodules=geocoder — 좌표를 행정구역 이름으로 바꾸는 기능(reverseGeocode)이
    // 기본 번들에 안 들어 있다. 이걸 빼면 naver.maps.Service 자체가 undefined다.
    // 내 위치가 어느 구인지 띄우는 데 쓴다(2026-09-01 사용자 지시:
    // "내위치가 어느구인지 … 용산구 이런식으로 표시").
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("네이버 지도 SDK 로드 실패"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

// 서울시청 — 지도 초기 중심점. 축제·시장 등 개별 장소 좌표는 아직 없다(지어내지 않음).
// 실제 위경도를 지도 위에 찍으려면 구별 좌표를 공식 출처(서울 열린데이터광장 등)로
// 확인한 뒤 별도 데이터 파일로 추가할 것 — CLAUDE.md 정확도 원칙 참고.
export const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
