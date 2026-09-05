// 네이버 지도 JS SDK(v3) 로더.
// 스크립트 태그를 동적으로 추가하고, 한 번만 로드되도록 프라미스를 캐싱한다.
// 쿼리 파라미터명은 ncpKeyId다(예전 문서의 ncpClientId는 구버전 이름 — 지금은 이 이름이 맞다).

let loadPromise: Promise<void> | null = null;

/**
 * 🗺️ **네이버가 "이 도메인은 허용 안 됐다"고 말하는 유일한 통로.**
 *
 * 2026-09-04에 도메인을 옮긴 뒤 「내 위치」가 조용히 실패했는데, 원인을 알 방법이
 * 없었다. 러너에서 SDK 주소를 불러 봤더니 **스크립트는 멀쩡히 내려왔다** —
 * 네이버 v3는 **스크립트를 먼저 주고 인증은 브라우저에서 확인**하기 때문이다.
 * 즉 바깥에서 아무리 불러 봐도 도메인 허용 여부는 알 수 없다.
 *
 * 네이버는 그 결과를 **이 전역 함수 하나로만** 알려 준다. 안 달아 두면
 * 실패가 어디에도 안 남고, 화면에는 "다시 눌러 보세요"만 뜬다 —
 * 손님은 아무리 눌러도 안 되는데 헛수고를 하게 된다.
 */
let authFailed = false;

/** 네이버 지도 인증이 막혔나. 막혔으면 손님이 다시 눌러도 소용없다. */
export const isNaverAuthFailed = () => authFailed;

/**
 * 서브모듈(geocoder)까지 붙었는지 보려고 `naver.maps` 에서 들여다보는 두 칸.
 * 타입 선언(types/naver-maps.d.ts)에는 우리가 쓰는 만큼만 적혀 있어 여기서 좁혀 쓴다.
 */
interface GeocoderReady {
  /** geocoder 서브모듈이 붙으면 생긴다. reverseGeocode 가 여기 달려 있다. */
  Service?: unknown;
  /** 서브모듈까지 다 붙으면 네이버가 불러 주는 손잡이. */
  onJSContentLoaded?: () => void;
}

/** 서브모듈을 이만큼 기다려 본다. 넘으면 그냥 진행한다(아래 onload 주석 참고). */
const SUBMODULE_WAIT_MS = 4000;


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
    // 이미 서브모듈까지 다 붙어 있으면 그냥 쓴다.
    // ⚠️ `naver.maps` 만 보고 끝내면 안 된다 — 본체는 붙었는데 geocoder 가 아직
    //    안 온 상태에서 "다 됐다"고 답해 버린다(아래 onload 주석과 같은 사고).
    if (window.naver?.maps && (window.naver.maps as unknown as GeocoderReady).Service) {
      resolve();
      return;
    }
    // 인증 실패 손잡이는 **스크립트를 붙이기 전에** 달아 둔다 — 실패는 로드 직후
    // 곧바로 불려서, 나중에 달면 놓친다.
    (window as unknown as Record<string, unknown>).navermap_authFailure = () => {
      authFailed = true;
      console.error(
        "[네이버 지도] 인증 실패 — 이 도메인이 Web 서비스 URL 에 없거나 열쇠가 안 맞는다. " +
          "console.ncloud.com → Maps → Application → 수정 에서 확인할 것."
      );
    };
    const script = document.createElement("script");
    // submodules=geocoder — 좌표를 행정구역 이름으로 바꾸는 기능(reverseGeocode)이
    // 기본 번들에 안 들어 있다. 이걸 빼면 naver.maps.Service 자체가 undefined다.
    // 내 위치가 어느 구인지 띄우는 데 쓴다(2026-09-01 사용자 지시:
    // "내위치가 어느구인지 … 용산구 이런식으로 표시").
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
    script.async = true;
    // 🐞 **여기가 「내 위치」가 안 되던 진짜 원인이었다** (2026-09-05).
    //
    //    예전에는 `script.onload = () => resolve()` 한 줄이었다. 그런데 네이버
    //    v3 는 **서브모듈을 본체와 따로 받아 온다** — onload 는 maps.js 본체가
    //    붙은 시점일 뿐이고, 그때 `naver.maps.Service` 는 아직 없다.
    //    그래서 곧바로 reverseGeocode 를 부르면 Service 가 undefined 라
    //    조용히 실패했다. 사장님 화면에 뜬 (no-geocoder) 가 바로 이것이다.
    //
    //    지도 자체는 멀쩡히 그려지니 **티가 안 나는** 종류의 사고다. 열쇠도
    //    도메인도 주소도 다 맞았는데 안 됐던 이유가 이 한 박자였다.
    //
    //    네이버가 주는 공식 손잡이가 `naver.maps.onJSContentLoaded` 다 —
    //    서브모듈까지 다 붙으면 부른다. 다만 그 손잡이는 `naver.maps` 가 생긴
    //    뒤에야 달 수 있어서, **onload 안에서** 단다.
    script.onload = () => {
      const maps = window.naver?.maps as unknown as GeocoderReady | undefined;
      if (maps?.Service) {
        resolve();
        return;
      }
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearInterval(tick);
        resolve();
      };
      // ① 공식 손잡이.
      if (maps) maps.onJSContentLoaded = done;
      // ② 예비 — 손잡이를 못 달았거나 안 불릴 때를 대비해 짧게 지켜본다.
      //    끝까지 안 오면 그대로 진행한다: 그 경우 조회가 (no-geocoder)로
      //    실패하고 화면이 그렇게 말해 준다. 여기서 영영 멈추는 것보다 낫다.
      const t0 = Date.now();
      const tick = setInterval(() => {
        const m = window.naver?.maps as unknown as GeocoderReady | undefined;
        if (m?.Service || Date.now() - t0 > SUBMODULE_WAIT_MS) done();
      }, 100);
    };
    script.onerror = () => reject(new Error("네이버 지도 SDK 로드 실패"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

// 서울시청 — 지도 초기 중심점. 축제·시장 등 개별 장소 좌표는 아직 없다(지어내지 않음).
// 실제 위경도를 지도 위에 찍으려면 구별 좌표를 공식 출처(서울 열린데이터광장 등)로
// 확인한 뒤 별도 데이터 파일로 추가할 것 — CLAUDE.md 정확도 원칙 참고.
export const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
