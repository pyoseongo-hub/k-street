import { getMapLinks, openMapLink, type MapLinkTarget } from "../lib/mapLinks";

// SeoulMap.tsx(네이버 지도 InfoWindow)는 raw HTML 문자열이라 이 컴포넌트를 못 쓴다 —
// 그쪽은 mapLinks.ts의 renderMapLinksHtml()이 같은 마크업을 문자열로 대신 만든다.
// 구조를 바꿀 땐 두 곳을 같이 고칠 것. 구글은 화면에서 뺐다(2026-08-28
// 사용자 지시 — 캡처에 빨간 X로 표시).
//
// 🚨 버튼(target="_blank" 링크)이 아니라 onClick으로 연다(2026-08-29 사용자
// 지적: "이 버튼 누른 단계까지 가야한다고" — 좌표가 있는데도 검색 결과
// 화면만 뜨고, 길찾기 아이콘을 손으로 한 번 더 눌러야 했다). openMapLink()가
// 앱 스킴으로 길찾기 화면을 바로 열고, 새 탭이 아니라 이동으로 예비 웹
// 주소를 열어야 타이머 안에서도 팝업 차단에 안 걸린다 — 그래서 <a>가 아니라
// <button onClick>이다.
export default function MapDirections({ place }: { place: MapLinkTarget }) {
  const [kakao, naver] = getMapLinks(place);
  return (
    <div className="place-directions">
      <div className="map-directions-row">
        <button
          type="button"
          className="map-btn map-btn--kakao"
          onClick={() => openMapLink(kakao)}
        >
          <span className="map-btn-icon">📍</span>카카오맵
        </button>
        <button
          type="button"
          className="map-btn map-btn--naver"
          onClick={() => openMapLink(naver)}
        >
          <span className="map-btn-badge map-btn-badge--naver">N</span>네이버지도
        </button>
      </div>
    </div>
  );
}
