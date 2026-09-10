import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../lib/useLanguage";
import { getMapLinks, openMapLink, type MapLinkTarget } from "../lib/mapLinks";
import { getPositionOrNull } from "../lib/userPosition";
import { LOCKER_PAGE } from "../lib/luggageFacts";

/**
 * 🧳 **짐 보관 — 가까운 역까지만 안내한다.**
 *
 * 사장님이 세 번에 걸쳐 크기를 정해 주셨다:
 *   ① "이거는 어플이 우리보다 서비스 질이 좋아 / 우리는 가까운 역까지만 안내하는 게 답이야
 *      ... 남은 락커를 우리가 관리할 수 없잖아"
 *   ② "역까지만 안내해"
 *   ③ "공식 페이지 링크 주고 역까지만 / 너무 많은 걸 할 수 없어"
 *
 * 그래서 이 화면에 있는 것은 **넷뿐**이다 —
 *   역 이름 · 거리 / 카카오맵 / 네이버지도 / 공식 페이지 링크.
 *
 * 🚨 넣지 않는 것과 그 까닭:
 *   · **빈 칸 수** — 실시간 값이다. 옮겨 적는 순간 틀리고, 손님은 빈 칸 없는 역에
 *     캐리어를 끌고 간다. 이 저장소가 값으로 데인 것과 같은 종류의 사고다.
 *   · **요금표·칸 크기** — 카드에 다 펴면 또 "칸차지가 심해"가 된다.
 *     공식 페이지에 다 있으니 그리로 보낸다.
 *   · **또타러기지 6개 지점** — 만들다 접었다. 사장님 판단이 옳았다:
 *     6개 역뿐이라 대부분의 곳에서는 "가까운 지점 없음"이 되고,
 *     그 한 줄을 위해 지점 좌표·거리·번역을 얹는 것은 크기가 안 맞는다.
 *
 * ⚠️ 「보관함이 있습니다」라고 단정하지 않는다 — 273개 역 / 약 340개 역이다.
 */
export interface LuggageStation {
  /** 역 이름. **한국어 그대로** 둔다 — 손님이 역 표지판에서 그 글자를 찾는다. */
  station?: string;
  dist?: number;
  lat?: number;
  lng?: number;
  /** 1.5km 안에 역이 없다. 🚨 빈칸이 아니라 **답**이다 */
  none?: boolean;
}

export default function LuggageCard({
  station,
  gu,
  onClose,
}: {
  station: LuggageStation | undefined;
  /** 길찾기 링크가 쓰는 구 이름. 곳과 같은 구로 둔다. */
  gu: string;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [locating, setLocating] = useState<"KAKAO" | "NAVER" | null>(null);

  // 뒤로 가기·Esc 로도 닫히게 한다. 화면을 덮는 창인데 닫는 길이 하나뿐이면
  // 손님이 갇혔다고 느낀다 (DriverCard 와 같은 이유).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const hasStation = !!station && !station.none && !!station.station && station.lat != null && station.lng != null;

  async function open(label: "KAKAO" | "NAVER") {
    if (!hasStation) return;
    setLocating(label);
    try {
      // 목적지는 **역**이다. 곳이 아니라.
      const target: MapLinkTarget = { name: station!.station!, gu, lat: station!.lat, lng: station!.lng };
      const from = await getPositionOrNull();
      const [kakao, naver] = getMapLinks(target, from);
      openMapLink(label === "KAKAO" ? kakao : naver);
    } finally {
      setLocating(null);
    }
  }

  // 🚨 body 로 옮겨 그린다(portal). 카드 안에서 그리면 조상의 transform 때문에
  //    position:fixed 가 화면이 아니라 그 카드를 기준으로 잡혀 갇힌다 —
  //    DriverCard 에서 이미 겪었다.
  return createPortal(
    <div className="luggage-back" role="dialog" aria-modal="true">
      <div className="luggage-card">
        <h2 className="lg-title">{t.luggageLinkLabel}</h2>

        {hasStation ? (
          <>
            <p className="lg-station">
              <span aria-hidden="true">🚇</span> {t.nearestStationLabel}
              <br />
              <strong lang="ko">{station!.station}</strong>
              <span className="lg-dist"> · {station!.dist}m</span>
            </p>
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
            <p className="lg-note">{t.lockerNote}</p>
          </>
        ) : (
          /* 🚨 역이 없어도 **빈 화면을 보이지 않는다.** "여긴 없구나"가 답이다 —
             미리 맡기고 오라는 뜻이니까 (사장님 말씀). */
          <p className="lg-station lg-station--none">
            <span aria-hidden="true">🚇</span> {t.stationNoneShort}
          </p>
        )}

        {/* 나머지는 우리가 안 적고 공식으로 보낸다 — 요금도 시간도 저쪽이 원본이다. */}
        <p className="lg-official">
          <a href={LOCKER_PAGE} target="_blank" rel="nofollow noopener">
            {t.lockerOfficialLabel}
            <span aria-hidden="true"> ↗</span>
          </a>
        </p>
      </div>

      <button type="button" className="lg-close" onClick={onClose}>
        {t.driverCardClose}
      </button>
    </div>,
    document.body
  );
}
