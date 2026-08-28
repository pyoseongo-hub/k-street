import { getMapLinks, type MapLinkTarget } from "../lib/mapLinks";

// SeoulMap.tsx(네이버 지도 InfoWindow)는 raw HTML 문자열이라 이 컴포넌트를 못 쓴다 —
// 그쪽은 mapLinks.ts의 renderMapLinksHtml()이 같은 마크업을 문자열로 대신 만든다.
// 구조를 바꿀 땐 두 곳을 같이 고칠 것. 구글은 화면에서 뺐다(2026-08-28
// 사용자 지시 — 캡처에 빨간 X로 표시).
export default function MapDirections({ place }: { place: MapLinkTarget }) {
  const [kakao, naver] = getMapLinks(place);
  return (
    <div className="place-directions">
      <div className="map-directions-row">
        <a
          className="map-btn map-btn--kakao"
          href={kakao.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="map-btn-icon">📍</span>카카오맵
        </a>
        <a
          className="map-btn map-btn--naver"
          href={naver.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="map-btn-badge map-btn-badge--naver">N</span>네이버지도
        </a>
      </div>
    </div>
  );
}
