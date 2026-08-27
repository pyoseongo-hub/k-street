interface NaverMapLatLng {
  lat: () => number;
  lng: () => number;
}

interface NaverMapPoint {
  x: number;
  y: number;
}

interface NaverMapMarkerOptions {
  position: NaverMapLatLng;
  map: any;
  title: string;
  icon: {
    content: string;
    anchor: NaverMapPoint;
  };
}

interface NaverMapMarker {
  getPosition(): NaverMapLatLng;
}

interface NaverMapEvent {
  addListener(target: any, eventName: string, callback: () => void): void;
}

interface NaverMapInfoWindowOptions {
  content: string;
  position: NaverMapLatLng;
}

interface NaverMapsMaps {
  Map: new (element: HTMLElement, options: any) => any;
  LatLng: new (lat: number, lng: number) => NaverMapLatLng;
  Marker: new (options: NaverMapMarkerOptions) => NaverMapMarker;
  Point: new (x: number, y: number) => NaverMapPoint;
  Event: NaverMapEvent;
  InfoWindow: new (options: NaverMapInfoWindowOptions) => any;
}

declare global {
  interface Window {
    naver?: {
      maps: NaverMapsMaps;
    };
  }
}

export {};
