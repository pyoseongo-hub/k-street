import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../lib/useLanguage";
import { getMapLinks, openMapLink, type MapLinkTarget } from "../lib/mapLinks";
import { getPositionOrNull } from "../lib/userPosition";
import {
  LOCKER_PAGE,
  OFFICIAL_PAGE,
  OFFICIAL_BRANCHES,
  OFFICIAL_PRICES,
  OFFICIAL_BASE_HOURS,
  OFFICIAL_EXTRA_PER_HOUR,
  OFFICIAL_OPEN,
  OFFICIAL_CLOSE,
  OFFICIAL_CHECKED,
  BOOKING_SITE,
  BOOKING_SITE_BY_LANG,
} from "../lib/luggageFacts";
import BRANCHES from "../data/luggage-branches.json";

/** 지점 좌표 — 역 이름을 열쇠로 찾는다. 단추를 누르면 **길찾기**가 떠야 하고,
 *  좌표가 없으면 카카오·네이버는 검색 화면만 띄운다(mapLinks.ts 주석). */
const BRANCH_COORDS: Record<string, { lat: number; lng: number }> = Object.fromEntries(
  (BRANCHES as { 곳: { station: string; lat: number; lng: number }[] }).곳.map((b) => [
    b.station,
    { lat: b.lat, lng: b.lng },
  ]),
);

/**
 * 🧳 **짐 보관 — 가까운 역까지만 안내한다.**
 *
 * 사장님이 세 번에 걸쳐 크기를 정해 주셨다:
 *   ① "이거는 어플이 우리보다 서비스 질이 좋아 / 우리는 가까운 역까지만 안내하는 게 답이야
 *      ... 남은 락커를 우리가 관리할 수 없잖아"
 *   ② "역까지만 안내해"
 *   ③ "공식 페이지 링크 주고 역까지만 / 너무 많은 걸 할 수 없어"
 *
 * 그래서 첫째 카드는 **역까지만** 안내한다 —
 *   역 이름 · 거리 / 카카오맵 / 네이버지도 / 공식 페이지 링크.
 *
 * 그리고 2026-09-11 에 사장님이 **둘째 카드**를 시키셨다:
 *   ④ "서울시 교통공사는 따로 카드해서 버튼 만들어줘 / 6군데 버튼 만들어"
 *   ⑤ "없으면 역까지 안내하고 이거 만들어붙여" (+ 공식 요금표 화면)
 *
 * 🚨 **두 카드를 섞지 않는다.** 둘은 다른 것이다 —
 *   · 또타라커  무인 보관함 · 273개 역 · 05~24시   (첫째 카드)
 *   · 또타러기지 **사람이 받아 주는 곳** · 6개 역 · 09~22시 (둘째 카드)
 *   섞어 적으면 손님이 밤 11시에 닫힌 창구 앞에 선다.
 *
 * 🚨 여전히 안 적는 것: **빈 칸 수**. 실시간 값이라 옮겨 적는 순간 틀리고,
 *   손님은 빈 칸 없는 역에 캐리어를 끌고 간다. 값으로 데인 저장소다.
 * 🚨 값(요금)을 적은 이상 **「바뀔 수 있다 + 확인한 날」**을 반드시 함께 띄운다.
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
  const { t, language } = useLanguage();
  const [locating, setLocating] = useState<"KAKAO" | "NAVER" | null>(null);
  // 🧳 고른 또타러기지 지점. **고른 뒤에** 지도 단추가 뜬다 —
  //    여섯 곳 × 지도 둘이면 단추가 열두 개가 되어 아무것도 안 읽힌다.
  const [picked, setPicked] = useState<string | null>(null);
  const pickedCoord = picked ? BRANCH_COORDS[picked] : undefined;

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

  /** 고른 또타러기지 지점까지 길찾기. 목적지는 **그 역**이다. */
  async function openBranch(label: "KAKAO" | "NAVER") {
    if (!picked || !pickedCoord) return;
    setLocating(label);
    try {
      const target: MapLinkTarget = { name: picked, gu: "", lat: pickedCoord.lat, lng: pickedCoord.lng };
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

      {/* 🧳 **또타러기지 — 따로 카드** (2026-09-11 사장님: "서울시 교통공사는 따로
          카드해서 버튼 만들어줘 / 6군데 버튼 만들어").

          🚨 위 카드(또타라커)와 **섞으면 안 된다.** 둘은 다른 것이다 —
             또타라커: 무인 보관함, 273개 역, 05~24시
             또타러기지: **사람이 받아 주는 곳**, 6개 역, 09~22시
             섞어 적으면 손님이 밤 11시에 닫힌 창구 앞에 선다. 그래서 카드를 갈랐다. */}
      <div className="luggage-card">
        <h2 className="lg-title">{t.luggageOfficialTitle}</h2>
        <p className="lg-note lg-note--top">{t.luggageOfficialWhat}</p>

        <div className="lg-branches">
          {OFFICIAL_BRANCHES.map((b) => {
            const coord = BRANCH_COORDS[b.station];
            // ⚠️ 김포공항역은 출구가 숫자가 아니라 **「I-센터」**다.
            //    무조건 "번 출구"를 붙였다가 「I-센터번 출구 방면」이 나온 적이 있다.
            const towards = /^[\d,]+$/.test(b.exit) ? t.exitNumber(b.exit) : b.exit;
            return (
              <button
                key={b.station}
                type="button"
                className={"lg-branch" + (picked === b.station ? " picked" : "")}
                onClick={() => setPicked(picked === b.station ? null : b.station)}
              >
                {/* 🚇 **「김포공항역 5호선」** — 역 표지판에 적힌 그대로 둔다.
                    첫째 카드의 가까운 역도 같은 모양이다(카카오가 그렇게 준다).
                    호선만 「5」로 떼어 적었더니 무슨 숫자인지 알 수 없었다. */}
                <span className="lg-branch-name" lang="ko">
                  {b.station} {b.line}호선
                </span>
                <span className="lg-branch-where">{t.branchWhere(b.floor, towards)}</span>
                {/* 🚨 좌표를 아직 못 받은 지점은 **길찾기가 안 된다는 것을 숨기지 않는다.**
                    눌러도 아무 일 없으면 손님은 앱이 고장 난 줄 안다. */}
                {!coord && <span className="lg-branch-where">· · ·</span>}
              </button>
            );
          })}
        </div>

        {/* 고른 지점으로 가는 길찾기. **고른 뒤에 뜬다** — 여섯 곳 × 지도 둘이면
            단추가 열두 개가 되어 아무것도 안 읽힌다. */}
        {pickedCoord && (
          <div className="map-directions-row lg-branch-maps">
            <button
              type="button"
              className="map-btn map-btn--kakao"
              onClick={() => openBranch("KAKAO")}
              disabled={locating !== null}
            >
              <span className="map-btn-icon">📍</span>
              {locating === "KAKAO" ? t.mapLocating : t.kakaoMapLabel}
            </button>
            <button
              type="button"
              className="map-btn map-btn--naver"
              onClick={() => openBranch("NAVER")}
              disabled={locating !== null}
            >
              <span className="map-btn-badge map-btn-badge--naver">N</span>
              {locating === "NAVER" ? t.mapLocating : t.naverMapLabel}
            </button>
          </div>
        )}

        {/* 💰 **요금표** (2026-09-11 사장님이 공식 페이지 화면을 주시며 "이거 만들어붙여").
            🚨 값을 적은 이상 **「바뀔 수 있다 + 확인한 날」**을 반드시 같이 띄운다.
               이 저장소는 값으로 이미 크게 데었다 — 메뉴판 여섯 장 중 다섯 장이 틀렸다.
            🚨 여기는 **인치**다(가방 크기). 또타라커는 cm 다 — 섞으면 안 된다. */}
        <p className="lg-price-head">{t.priceBaseHours(OFFICIAL_BASE_HOURS)}</p>
        <table className="lg-prices">
          <thead>
            <tr>
              <th />
              <th>{t.priceWeekdayLabel}</th>
              <th>{t.priceWeekendLabel}</th>
            </tr>
          </thead>
          <tbody>
            {OFFICIAL_PRICES.map((p) => (
              <tr key={p.size}>
                <th scope="row">{p.size}</th>
                <td>₩{p.weekday.toLocaleString()}</td>
                <td>₩{p.weekend.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="lg-note">{t.priceExtraLine(OFFICIAL_EXTRA_PER_HOUR.toLocaleString())}</p>
        <p className="lg-note">{t.openHoursLine(OFFICIAL_OPEN, OFFICIAL_CLOSE)}</p>
        <p className="lg-note">{t.priceMayChangeOn(OFFICIAL_CHECKED)}</p>

        {/* 📖 예약·안내는 저쪽 사이트가 원본이다. **손님 언어 페이지가 있으면 그리로** 보낸다
            (영어·중국어·일본어). 없으면 한국어 첫 화면으로 간다. */}
        <p className="lg-official">
          <a href={BOOKING_SITE_BY_LANG[language] ?? BOOKING_SITE} target="_blank" rel="nofollow noopener">
            {t.bookOnlineLabel}
            <span aria-hidden="true"> ↗</span>
          </a>
        </p>
        <p className="lg-official">
          <a href={OFFICIAL_PAGE} target="_blank" rel="nofollow noopener">
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
