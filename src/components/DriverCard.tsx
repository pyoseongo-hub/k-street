import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../lib/useLanguage";

/**
 * 🇰🇷 **택시 기사에게 보여 주는 화면.**
 *
 * 왜 만들었나 (2026-09-04 사용자 지시: "기사보여주기도 진행") —
 * 택시 앱 연동을 사장님 폰에서 하나씩 눌러 확인한 결과가 이랬다:
 *
 *   · `kakaomap://route?…&by=CAR` — 출발·도착은 잘 채워지는데 **택시 탭이 없다**
 *     (탭이 자동차/대중교통/도보/자전거뿐이다). 요금만 "택시 약 39,600원"으로 뜬다.
 *   · `uber://…` — 앱은 열리는데 **픽업·도착이 둘 다 비어 있었다.**
 *   · `m.uber.com/ul/…` — 브라우저에서 로그인 화면. 앱 세션과 웹 세션이 따로다.
 *
 * 사장님 말: "택시가 없네 자기네 아플끼리 연동을 안시켰네."
 * 그래서 **남의 앱이 고쳐 주기를 기다리지 않는다.** 손님이 길에서 실제로 겪는
 * 문제는 "앱에서 택시를 못 부른다"가 아니라 **"기사에게 목적지를 못 대겠다"**이다.
 * 그건 우리 화면 안에서 지금 당장 풀 수 있다.
 *
 * 설계에서 지킨 것 —
 *
 * 1. **기사가 읽는 부분은 언제나 한국어다.** 손님 언어로 번역하지 않는다.
 *    번역되는 것은 버튼 이름과 손님용 안내 한 줄뿐이다.
 * 2. **밝은 색으로 고정한다.** 택시 안은 어둡고 기사는 팔을 뻗어 흘끗 본다.
 *    손님 폰이 다크 모드여도 이 화면만은 흰 바탕·검은 글씨여야 한다 —
 *    그래서 색을 토큰이 아니라 여기서 직접 박는다.
 * 3. **주소가 없으면 지어내지 않는다.** 이 앱의 정확도 원칙 그대로다.
 *    307곳 중 263곳(86%)만 `addr`을 갖고 있고, 없는 곳은 상호와 구까지만 적는다.
 *    틀린 주소로 기사를 엉뚱한 데로 보내는 것이 빈칸보다 훨씬 나쁘다.
 * 4. **글자 크기를 화면 폭에 맡긴다**(clamp). 상호가 긴 곳("서울식물원 온실")도
 *    두 줄 안에 들어와야 한다.
 */
export interface DriverTarget {
  /** 한국어 상호. 기사가 읽는 글자다 — 번역하지 않는다. */
  name: string;
  gu: string;
  dong?: string;
  /** 도로명 주소. 관광공사에서 받은 곳만 값이 있다. 없으면 구·동까지만 적는다. */
  addr?: string;
}

/** 주소가 없는 곳에 적을 말. **지어내지 않고** 아는 데까지만 적는다. */
function addressLine(p: DriverTarget): string {
  if (p.addr) return p.addr;
  return ["서울특별시", p.gu, p.dong].filter(Boolean).join(" ");
}

export default function DriverCard({
  place,
  onClose,
}: {
  place: DriverTarget;
  onClose: () => void;
}) {
  const { t } = useLanguage();

  // 뒤로 가기(안드로이드 물리 버튼·제스처)로도 닫히게 한다. 전체 화면을 덮는
  // 창인데 닫는 길이 버튼 하나뿐이면 손님이 갇혔다고 느낀다.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // 화면이 떠 있는 동안 뒤 목록이 같이 스크롤되지 않게 잠근다.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // 🚨 **body 로 옮겨 그린다(portal).** 처음에는 버튼 옆에 그냥 그렸는데
  //    `position: fixed` 인데도 화면을 못 덮고 **카드 안에 갇혔다** — 축제 카드
  //    한 칸 안에서 상호가 옆으로 잘려 나갔다.
  //    까닭: 조상 중에 transform/filter 가 걸린 요소가 있으면 fixed 의 기준이
  //    화면이 아니라 **그 요소**가 된다. 이 앱은 카드에 애니메이션을 쓰고 있어
  //    딱 그 경우다. 목록 바깥(body)에 그리면 기준이 다시 화면이 된다.
  return createPortal(
    <div className="driver-card-back" role="dialog" aria-modal="true">
      <div className="driver-card">
        {/* 기사에게 건네는 말. 손님 언어와 무관하게 **늘 한국어**다. */}
        <div className="dc-hello" lang="ko">
          기사님, 여기로 가 주세요
        </div>
        <div className="dc-name" lang="ko">
          {place.name}
        </div>
        <div className="dc-addr" lang="ko">
          {addressLine(place)}
        </div>
        <div className="dc-thanks" lang="ko">
          감사합니다 🙏
        </div>
      </div>

      {/* 손님이 읽는 부분 — 여기만 손님 언어로 나온다. */}
      <p className="dc-hint">{t.driverCardHint}</p>
      <button type="button" className="dc-close" onClick={onClose}>
        {t.driverCardClose}
      </button>
    </div>,
    document.body
  );
}
