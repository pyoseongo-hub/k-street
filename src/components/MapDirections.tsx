import { useState } from "react";
import DriverCard from "./DriverCard";
import { getMapLinks, openMapLink, type MapLinkTarget } from "../lib/mapLinks";
import { getPositionOrNull } from "../lib/userPosition";
import { useLanguage } from "../lib/useLanguage";

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
//
// 🚩 2026-09-01 — 여기서 **내 위치를 먼저 받아 출발지까지 채운다**(사용자 지시:
// "네이버 카카오 둘다 예시 이미지처럼 출발지 목적지 나올수 있게" — 카카오맵
// 길찾기 캡처 두 장, 출발·도착이 모두 적힌 화면). 위치 권한은 화면을 열 때가
// 아니라 **이 버튼을 누른 순간**에만 묻는다. 앱을 켜자마자 권한 창이 뜨면
// 대부분 거절하고, 한 번 거절하면 되돌리기 어렵다.
// 위치를 못 받아도(거절·실내·미지원·4초 초과) 목적지만으로 그대로 연다 —
// 길찾기가 통째로 막히는 것보다 낫다.
export default function MapDirections({ place }: { place: MapLinkTarget }) {
  const { t } = useLanguage();
  const [locating, setLocating] = useState<"KAKAO" | "NAVER" | null>(null);
  // 🇰🇷 기사에게 보여 주는 화면(DriverCard.tsx). 왜 만들었는지는 그쪽 주석에 있다 —
  // 요약하면 **카카오맵에도 우버에도 택시 호출로 가는 길이 없었다**(사장님 폰에서
  // 직접 확인). 남의 앱 연동을 기다리는 대신 원래 문제(기사와 말이 안 통함)를
  // 우리 화면에서 푼다.
  const [driver, setDriver] = useState(false);

  async function open(label: "KAKAO" | "NAVER") {
    setLocating(label);
    try {
      const from = await getPositionOrNull();
      const [kakao, naver] = getMapLinks(place, from);
      openMapLink(label === "KAKAO" ? kakao : naver);
    } finally {
      setLocating(null);
    }
  }

  return (
    <div className="place-directions">
      <div className="map-directions-row">
        <button
          type="button"
          className="map-btn map-btn--kakao"
          onClick={() => open("KAKAO")}
          disabled={locating !== null}
        >
          <span className="map-btn-icon">📍</span>
          {locating === "KAKAO" ? t.mapLocating : t.kakaoMapLabel}
        </button>
        <button
          type="button"
          className="map-btn map-btn--naver"
          onClick={() => open("NAVER")}
          disabled={locating !== null}
        >
          <span className="map-btn-badge map-btn-badge--naver">N</span>
          {locating === "NAVER" ? t.mapLocating : t.naverMapLabel}
        </button>
      </div>
      {/* 🚕 지도 두 개와 **한 줄 아래**에 따로 둔다. 지도 버튼과 성격이 다르기
          때문이다 — 저 둘은 "앱을 연다"이고 이건 "이 자리에서 보여 준다"이다.
          같은 줄에 셋을 욱여넣으면 글자가 줄어 셋 다 안 읽힌다(칸 차지 지적을
          받은 적이 있어 줄 높이는 최소로 잡았다). */}
      <button type="button" className="map-btn map-btn--driver" onClick={() => setDriver(true)}>
        {t.showToDriver}
      </button>
      {driver && <DriverCard place={place} onClose={() => setDriver(false)} />}
      {/* 📏 "지도 앱이 바로 안 열리면…" 안내는 **여기서 뺐다**(2026-09-02 사용자
          지적: "칸차지가 심해"). 카드마다 두 줄씩 반복되어 목록 절반을 먹고
          있었다. 안내 자체는 여전히 필요하므로(앱 스킴이 안 먹는 폰이 있다 —
          2026-08-29 "내가 다 확인 못하니 안내문구 넣어 사용자가 할수있게")
          목록 맨 위 안내 줄에 **한 번만** 붙인다. 지도 위 팝업(InfoWindow)은
          목록이 아니라 혼자 뜨는 창이라 mapLinks.ts 쪽에 그대로 둔다. */}
    </div>
  );
}
