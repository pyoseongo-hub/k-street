import { useEffect, useRef, useState } from "react";
import { loadNaverMaps, SEOUL_CENTER } from "../lib/naverMaps";
import { ALL_PLACES, CATEGORY_META } from "../data/seed";

export default function SeoulMap() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    loadNaverMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        const map = new window.naver!.maps.Map(ref.current, {
          center: new window.naver!.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
          zoom: 11,
          minZoom: 10,
          maxZoom: 16,
          zoomControl: true,
          scaleControl: false,
        });
        mapRef.current = map;

        // 좌표가 있는 모든 장소에 마커 추가
        const placesWithCoords = ALL_PLACES.filter((p) => p.lat && p.lng);
        placesWithCoords.forEach((place) => {
          const marker = new window.naver!.maps.Marker({
            position: new window.naver!.maps.LatLng(place.lat!, place.lng!),
            map: map,
            title: place.name,
            icon: {
              content: `<div class="map-marker" style="background: ${CATEGORY_META[place.category].color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;"><span>${CATEGORY_META[place.category].icon}</span></div>`,
              anchor: new window.naver!.maps.Point(14, 14),
            },
          });

          // 마커 클릭시 정보 윈도우 표시
          window.naver!.maps.Event.addListener(marker, "click", () => {
            const infoWindow = new window.naver!.maps.InfoWindow({
              content: `<div class="map-info-window"><strong>${place.name}</strong><br/><small>${place.gu}${place.dong ? ` ${place.dong}` : ""}</small><br/><em>${CATEGORY_META[place.category].label}</em></div>`,
              position: marker.getPosition(),
            });
            infoWindow.open(map);
          });
        });

        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="seoul-map-wrap">
      <div ref={ref} className="seoul-map" aria-label="서울 지도" />
      {status === "error" && (
        <div className="seoul-map-fallback">지도를 불러오지 못했다 — 아래 구 목록으로 탐색할 것.</div>
      )}
      {status === "ready" && (
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-label">좌표 확인된 장소 {ALL_PLACES.filter((p) => p.lat && p.lng).length}곳</span>
          </div>
        </div>
      )}
    </div>
  );
}
