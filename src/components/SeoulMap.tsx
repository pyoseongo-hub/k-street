import { useEffect, useRef, useState } from "react";
import { loadNaverMaps, SEOUL_CENTER } from "../lib/naverMaps";

// 지금은 서울 전체를 보여주는 실제 지도 배경일 뿐이다. 구별·장소별 마커는 아직 없다 —
// 좌표를 검증된 출처 없이 지어낼 수 없어서다(CLAUDE.md 정확도 원칙). 아래 구 그리드가
// 여전히 실제 탐색 수단이다. 마커는 구 좌표를 공식 출처로 확인한 뒤 추가한다.
export default function SeoulMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    loadNaverMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        new window.naver!.maps.Map(ref.current, {
          center: new window.naver!.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
          zoom: 11,
          minZoom: 10,
          maxZoom: 16,
          zoomControl: true,
          scaleControl: false,
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
    </div>
  );
}
