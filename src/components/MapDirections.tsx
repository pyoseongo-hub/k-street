import { useState } from "react";
import DriverCard from "./DriverCard";
import { getMapLinks, openMapLink, type MapLinkTarget } from "../lib/mapLinks";
import { getPositionOrNull } from "../lib/userPosition";
import { slugFor } from "../lib/shareLink";
// 🍚 밥집으로 가는 주소는 **표 한 장**에서만 온다(partnerLinks.ts).
import { eatUrlForPlace } from "../lib/partnerLinks";
import { useLanguage } from "../lib/useLanguage";
import NEAREST_STATION from "../data/nearest-station.json";

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
/** 곳마다 미리 받아 둔 「가장 가까운 지하철역」 (카카오 지역검색 SW8). */
const STATIONS = (NEAREST_STATION as {
  곳: Record<string, { station?: string; dist?: number; none?: boolean }>;
}).곳;

/**
 * 🚇 카드 맨 아래 한 줄.
 *
 * ⚠️ 「보관함이 있습니다」라고 **단정하지 않는다** — 273개 역 / 약 340개 역이다.
 *    그래서 이 줄은 역과 거리만 말하고, 나머지는 짐 보관 안내로 넘긴다.
 * ⚠️ 빈 칸 수는 **적지 않는다.** 또타라커 앱에 실시간으로 나오는 값이라
 *    우리가 옮겨 적으면 그 순간부터 틀린다 (사장님: "남은 락커를 우리가 관리할 수 없잖아").
 */
function StationLine({ id }: { id?: string }) {
  const { t, language } = useLanguage();
  // id 가 없는 자리도 있다(지도 팝업 등). 없으면 조용히 안 그린다 —
  // **모르는 것을 아는 척하지 않는다**가 이 저장소의 잣대다.
  const r = id ? STATIONS[id] : undefined;
  if (!r) return null;

  // 영어는 뿌리(/seoul/…), 나머지는 언어 칸을 앞에 붙인다 — 만들어 둔 낱장 구조 그대로다.
  const luggage = `${language === "en" ? "" : `/${language}`}/seoul/luggage/`;

  if (r.none)
    return (
      <p className="place-station place-station--none">
        <span aria-hidden="true">🚇</span> {t.stationNoneShort}
      </p>
    );
  if (!r.station || r.dist == null) return null;

  return (
    <p className="place-station">
      <span aria-hidden="true">🚇</span> {t.nearestStationLabel}{" "}
      {/* 역 이름은 **한국어 그대로** 둔다 — 손님이 역 표지판에서 그 글자를 찾는다 */}
      <strong lang="ko">{r.station}</strong> · {r.dist}m ·{" "}
      <a href={luggage}>
        {t.luggageLinkLabel}
        <span aria-hidden="true"> ↗</span>
      </a>
    </p>
  );
}

export default function MapDirections({ place }: { place: MapLinkTarget }) {
  const { t, language } = useLanguage();
  const [locating, setLocating] = useState<"KAKAO" | "NAVER" | null>(null);
  // 🇰🇷 기사에게 보여 주는 화면(DriverCard.tsx). 왜 만들었는지는 그쪽 주석에 있다 —
  // 요약하면 **카카오맵에도 우버에도 택시 호출로 가는 길이 없었다**(사장님 폰에서
  // 직접 확인). 남의 앱 연동을 기다리는 대신 원래 문제(기사와 말이 안 통함)를
  // 우리 화면에서 푼다.
  const [driver, setDriver] = useState(false);

  // 🔗 공유는 **카드 맨 윗줄로 옮겼다**(2026-09-09 사장님 지시) — ShareButton.tsx.
  //    이 줄에 셋을 두면 자리가 298px 뿐이라 셋 다 좁아져 아무것도 안 읽힌다.

  // 🍚 그 동네 밥집. **동네를 알면 동네로, 모르면 그 구로** 보낸다.
  //    손님이 쓰는 언어를 그대로 넘긴다(대만은 zhTW 로 갈아 끼운다 — partnerLinks.ts).
  //    저쪽 주소가 없으면 null 이라 단추를 아예 안 그린다.
  const eat = eatUrlForPlace(
    { slug: slugFor(place.id), addr: place.addr, gu: place.gu },
    language
  );

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
      {/* 🚕🍚 지도 두 개와 **한 줄 아래**에 따로 둔다. 지도 버튼과 성격이 다르기
          때문이다 — 저 둘은 "남의 지도 앱을 연다"이고, 이 둘은 "여기서 다음에
          할 일"이다(기사에게 보여 주기 · 밥 먹으러 가기).

          🧹 **둘을 같은 칸으로 나눠 갖는다** (2026-09-09 사장님: "두개 같은칸으로").
             자리는 298px 이라 낱말 단추 **둘까지만** 들어간다 — 셋을 욱여넣으면
             316~426px 이 필요해서 어느 언어에서도 안 맞고, 셋 다 좁아져 아무것도
             안 읽힌다. 그래서 공유는 카드 맨 윗줄로 올렸다(ShareButton.tsx). */}
      <div className="map-directions-row">
        <button type="button" className="map-btn map-btn--driver" onClick={() => setDriver(true)}>
          {t.showToDriver}
        </button>
        {eat && (
          <a
            className="map-btn map-btn--eat"
            href={eat.href}
            target="_blank"
            rel="noopener"
            title={eat.label}
          >
            {/* 🚫 그림(🍚)을 뺐다 (2026-09-09 사장님: "가독성 떨어지고 아이콘빼").
                낱말만 남기면 글자가 커 보이고 옆 단추와 무게가 같아진다.
                ↗ 는 남긴다 — 남의 앱으로 나간다는 표시고, 이 앱이 이미 쓰는 것이다. */}
            {t.eatNearbyLabel}
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
      {/* 🚇 **가까운 지하철역 한 줄** (2026-09-10).
          사장님이 "안 보여"라고 하셔서 알았다 — 이 줄을 **검색용 낱장에만** 넣어 뒀다.
          앱을 열어서 보는 사람에게는 안 보이고, 구글에서 들어온 사람에게만 보였다.
          사장님이 처음 짚어 주신 자리가 바로 여기(목적지 카드 밑)였는데 말이다.

          📏 **한 줄만 넣는다.** 이 화면은 이미 "칸 차지가 심해"라는 말을 들은 자리다
             (2026-09-02). 요금·칸 크기·앱 단추는 짐 보관 안내 화면에 이미 다 있으니
             거기로 보낸다 — 카드에 다 펴 놓으면 목록이 또 길어진다.
          🚨 역이 멀면 **빈칸으로 두지 않는다.** "여긴 역이 없다"도 답이다(사장님 말씀). */}
      <StationLine id={place.id} />
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
