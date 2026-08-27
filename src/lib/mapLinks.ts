// K-Street는 자체 길찾기(도보·대중교통 경로 계산)를 만들지 않는다 — 정확한 경로
// 안내는 지도 3사가 이미 잘 하고 있고, 직접 만들면 정확도를 보장할 수 없다.
// 대신 koreatravel.guru 같은 여행 사이트들이 쓰는 방식대로, 네이버·카카오·구글
// 지도로 바로 넘기는 링크만 준다. 구글은 한국 대중교통 데이터가 약하지만
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

export function getMapLinks(place: MapLinkTarget): MapLink[] {
  const hasCoords = typeof place.lat === "number" && typeof place.lng === "number";
  const encName = encodeURIComponent(place.name);

  if (hasCoords) {
    const { lat, lng } = place as { lat: number; lng: number };
    return [
      { label: "NAVER", url: `https://map.naver.com/p/directions/-/${lng},${lat},${encName}/-/transit` },
      { label: "KAKAO", url: `https://map.kakao.com/link/to/${encName},${lat},${lng}` },
      { label: "GOOGLE", url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` },
    ];
  }

  // 좌표가 아직 없는 곳은(정확도 원칙상 지어내지 않는다) 이름+동네로 검색만 걸어 준다 —
  // 경로 안내는 못 해줘도 위치를 스스로 찾을 수 있게는 해 준다.
  const query = `${place.name} ${place.dong ?? place.gu}`;
  const encQuery = encodeURIComponent(query);
  return [
    { label: "NAVER", url: `https://map.naver.com/v5/search/${encQuery}` },
    { label: "KAKAO", url: `https://map.kakao.com/link/search/${encQuery}` },
    { label: "GOOGLE", url: `https://www.google.com/maps/search/?api=1&query=${encQuery}` },
  ];
}
