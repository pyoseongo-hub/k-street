// 네이버 지도 JS SDK(v3) 최소 타입 선언 — 공식 @types 패키지가 없어서
// 이 프로젝트에서 실제로 쓰는 만큼만 앰비언트로 선언해 둔다. 런타임 코드는 없다(타입 전용).
export {};

declare global {
  namespace naver {
    namespace maps {
      class LatLng {
        constructor(lat: number, lng: number);
      }
      class Map {
        constructor(element: HTMLElement | string, options: NaverMapOptions);
        setCenter(latlng: LatLng): void;
      }
      interface NaverMapOptions {
        center: LatLng;
        zoom?: number;
        minZoom?: number;
        maxZoom?: number;
        zoomControl?: boolean;
        scaleControl?: boolean;
      }
    }
  }

  interface Window {
    naver?: typeof naver;
  }
}
