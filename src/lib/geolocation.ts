// 사용자 위치 기반 거리 계산

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

/**
 * Haversine 공식으로 두 좌표 사이의 거리 계산 (km)
 */
export function calculateDistance(
  loc1: { lat: number; lng: number },
  loc2: { lat: number; lng: number }
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 사용자의 현재 위치 가져오기
 */
export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  });
}

/**
 * 사용자 위치 감시 시작
 */
export function watchUserLocation(
  callback: (location: UserLocation) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): number {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser");
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    errorCallback,
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
    }
  );
}
