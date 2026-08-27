import { useEffect, useRef, useState } from "react";
import { loadNaverMaps, SEOUL_CENTER } from "../lib/naverMaps";
import { ALL_PLACES, CATEGORY_META } from "../data/seed";
import { getUserLocation, calculateDistance, type UserLocation } from "../lib/geolocation";
import { getMapLinks } from "../lib/mapLinks";

export default function SeoulMap() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

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

          // 마커 클릭시 정보 윈도우 표시 — 우리는 자체 길찾기가 없으니
          // 네이버·카카오·구글로 바로 넘기는 링크를 함께 보여준다.
          window.naver!.maps.Event.addListener(marker, "click", () => {
            const linksHtml = getMapLinks(place)
              .map(
                (l) =>
                  `<a class="map-link" href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`
              )
              .join("");
            const infoWindow = new window.naver!.maps.InfoWindow({
              content: `<div class="map-info-window"><strong>${place.name}</strong><br/><small>${place.gu}${place.dong ? ` ${place.dong}` : ""}</small><br/><em>${CATEGORY_META[place.category].label}</em><div class="place-directions">${linksHtml}</div></div>`,
              position: marker.getPosition(),
            });
            infoWindow.open(map);
          });
        });

        // 사용자 위치 가져오기
        getUserLocation()
          .then((location) => {
            if (cancelled) return;
            setUserLocation(location);

            // 사용자 위치 마커 추가
            const userMarker = new window.naver!.maps.Marker({
              position: new window.naver!.maps.LatLng(location.lat, location.lng),
              map: map,
              title: "내 위치",
              icon: {
                content: `<div class="user-location-marker" style="width: 40px; height: 40px; background: radial-gradient(circle, rgba(76,175,219,0.8), rgba(76,175,219,0.2)); border: 3px solid #4CAF9B; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(76,175,219,0.4);"><div style="width: 12px; height: 12px; background: #4CAF9B; border-radius: 50%;"></div></div>`,
                anchor: new window.naver!.maps.Point(20, 20),
              },
            });
            userMarkerRef.current = userMarker;

            // 사용자 위치 정보 윈도우
            window.naver!.maps.Event.addListener(userMarker, "click", () => {
              const infoWindow = new window.naver!.maps.InfoWindow({
                content: `<div class="map-info-window"><strong>내 위치</strong><br/><small>정확도: ±${Math.round(location.accuracy || 0)}m</small></div>`,
                position: userMarker.getPosition(),
              });
              infoWindow.open(map);
            });
          })
          .catch((err) => {
            console.log("위치 권한 거부 또는 사용 불가:", err.message);
            setLocationError(err.message);
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

  const handleLocateUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setCenter(
        new window.naver!.maps.LatLng(userLocation.lat, userLocation.lng)
      );
      mapRef.current.setZoom(14);
    }
  };

  const nearbyPlaces = userLocation
    ? ALL_PLACES.filter((p) => p.lat && p.lng)
        .map((p) => ({
          ...p,
          distance: calculateDistance(
            { lat: userLocation.lat, lng: userLocation.lng },
            { lat: p.lat!, lng: p.lng! }
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
    : [];

  return (
    <div className="seoul-map-wrap">
      <div ref={ref} className="seoul-map" aria-label="서울 지도" />
      {status === "error" && (
        <div className="seoul-map-fallback">지도를 불러오지 못했다 — 아래 구 목록으로 탐색할 것.</div>
      )}
      {status === "ready" && (
        <>
          <button
            className="map-locate-btn"
            onClick={handleLocateUser}
            title={userLocation ? "내 위치로 이동" : "위치를 가져올 수 없습니다"}
            aria-label="내 위치로 이동"
            disabled={!userLocation}
          >
            📍
          </button>
          <div className="map-info-chip">
            마커 {ALL_PLACES.filter((p) => p.lat && p.lng).length}곳
            {userLocation && ` · 근처 ${nearbyPlaces.length}곳`}
          </div>
          {locationError && <div className="map-location-error">📍 {locationError}</div>}
        </>
      )}
    </div>
  );
}
