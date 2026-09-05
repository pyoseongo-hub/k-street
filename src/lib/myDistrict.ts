// 내가 지금 서울 어느 구에 있는지 알아낸다.
//
// 사용자 지시(2026-09-01): "내위치가 어느구인지 내위치 지도위나 택스트로 용산구
// 이런식으로 표시".
//
// 🚨 왜 좌표로 직접 계산하지 않는가 —
// 우리가 가진 장소 좌표로 구별 중심점을 내고 "가장 가까운 구"를 고르는 방법이 있다.
// 계산은 쉽지만 **구 경계 근처에서 틀린다.** 한강을 사이에 둔 구, 좁고 긴 구
// (용산·중구·성동)가 서로 물려 있어서, 실제로 서 있는 구가 아니라 옆 구가 나올 수 있다.
// CLAUDE.md 정확도 원칙 — 틀린 정보는 빈 칸보다 나쁘다. "용산구에 계세요"가 틀리면
// 그 아래 목록을 통째로 못 믿게 된다.
//
// 그래서 **네이버 지도가 알려 주는 행정구역을 그대로 쓴다.** 앱이 이미 네이버 지도
// 열쇠를 갖고 있어 새 열쇠가 필요 없고(카카오 쪽은 이미 호출 한도를 넘겨 봤다),
// 경계 판정은 네이버가 공식 경계 자료로 한다.
//
// 결과는 네 가지뿐이다 — 구 이름 / 서울 밖 / 위치를 못 받음 / 조회 실패.
// 넷을 뭉뚱그리지 않는 이유는 화면에 적을 말이 각각 다르기 때문이다.

import { loadNaverMaps } from "./naverMaps";
import { getPositionOrNull } from "./userPosition";
import { SEOUL_HEX_ROWS } from "../data/seoulHexMap";

export type MyDistrict =
  /** 서울 안이고 구 이름까지 확인됐다. */
  | { kind: "gu"; gu: string }
  /** 위치는 받았는데 서울이 아니다 — 가장 가까운 구를 억지로 대지 않는다. */
  | { kind: "outside" }
  /** 위치를 못 받았다(권한 거절·실내·기기 미지원·시간 초과). */
  | { kind: "noPosition" }
  /**
   * 위치는 받았는데 구를 못 알아냈다.
   *
   * 🔍 **why 는 왜 붙었나** (2026-09-05) — 사장님이 의정부에서 눌렀더니
   *    「위치를 못 찾았어요」가 떴다. **의정부면 「서울 밖에 계세요」가 떠야 맞다.**
   *    즉 네이버 조회 자체가 실패했다는 뜻인데, 실패 갈래가 넷인데도 전부
   *    `null` 하나로 뭉개져 있어서 **어느 것인지 알 방법이 없었다.**
   *
   *    이 저장소가 이미 같은 걸로 한 번 데었다 — noPosition 과 failed 를 같은
   *    문구로 합쳐 뒀다가 원인을 못 찾았고, 그래서 문구를 갈랐다(translations.ts).
   *    그런데 **그 아래 한 겹을 안 갈라 두어** 같은 자리에서 또 막힌 것이다.
   *
   *    그래서 짧은 코드를 함께 들고 나온다. 번역하지 않는다 — 오류 번호에 가깝고,
   *    손님에게 뜻을 알리려는 게 아니라 **화면 캡처 한 장으로 원인을 가르려는** 것이다.
   */
  | { kind: "failed"; why?: FailWhy };

/** 조회가 실패한 갈래. 화면에 괄호로 그대로 붙는다. */
export type FailWhy =
  /** naver.maps.Service 가 없다 — geocoder 서브모듈이 안 붙었다. */
  | "no-geocoder"
  /** 네이버가 OK 가 아닌 상태를 돌려줬다. */
  | "naver-error"
  /** 5초 안에 답이 없었다. */
  | "timeout"
  /** 답은 왔는데 시·도나 시·군·구 칸이 비어 있다. */
  | "no-region"
  /** 서울이라는데 우리 25개 구 목록에 없는 이름이 왔다. */
  | "unknown-gu"
  /** SDK 를 부르다 예외가 났다(스크립트 자체를 못 불러온 경우 포함). */
  | "threw";

/** 앱이 아는 서울 25개 구. 네이버가 준 이름이 이 안에 있어야만 쓴다. */
const SEOUL_GUS = new Set(SEOUL_HEX_ROWS.flatMap((row) => row.gus));

let cached: MyDistrict | null = null;

/** 한 번 알아내면 다시 묻지 않는다. 걸어서 구를 넘는 데는 한참 걸린다. */
const MAX_AGE_MS = 10 * 60 * 1000;
let cachedAt = 0;

/** 네이버 조회가 늘어져 버튼이 멈춘 것처럼 보이지 않게 하는 한도. */
const LOOKUP_TIMEOUT_MS = 5000;

/** 조회 결과. 실패는 **왜 실패했는지까지** 들고 나온다(FailWhy 주석 참고). */
type GeoResult = { ok: true; gu: string } | { ok: false; why: FailWhy };

function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
  return new Promise((resolve) => {
    const naver = window.naver;
    // geocoder 서브모듈이 안 붙었으면 Service 자체가 없다.
    // 🚨 이게 가장 유력한 후보다 — 스크립트 주소에 submodules=geocoder 가 빠지거나,
    //    그 부분만 못 받아 오면 지도는 멀쩡한데 이 조회만 통째로 죽는다.
    if (!naver?.maps || !(naver.maps as any).Service) {
      resolve({ ok: false, why: "no-geocoder" });
      return;
    }
    const Service = (naver.maps as any).Service;
    let done = false;
    const finish = (r: GeoResult) => { if (!done) { done = true; resolve(r); } };
    const timer = setTimeout(() => finish({ ok: false, why: "timeout" }), LOOKUP_TIMEOUT_MS);
    try {
      Service.reverseGeocode(
        {
          coords: new (naver.maps as any).LatLng(lat, lng),
          // 법정동 기준 — 우리가 쓰는 구 이름과 같은 체계다.
          orders: "legalcode",
        },
        (status: unknown, response: any) => {
          clearTimeout(timer);
          if (status !== Service.Status.OK) {
            finish({ ok: false, why: "naver-error" });
            return;
          }
          const region = response?.v2?.results?.[0]?.region;
          // area1 = 시·도, area2 = 시·군·구.
          const sido = region?.area1?.name as string | undefined;
          const gu = region?.area2?.name as string | undefined;
          if (!sido || !gu) {
            finish({ ok: false, why: "no-region" });
            return;
          }
          // 서울이 아니면 빈 문자열을 돌려준다 → 부르는 쪽이 '서울 밖'으로 읽는다.
          // 다른 시에도 '중구'·'강서구'가 있어서 이름만 보고 받으면 부산 중구를
          // 서울 중구로 착각해 엉뚱한 칸이 켜진다.
          finish({ ok: true, gu: sido === "서울특별시" ? gu : "" });
        }
      );
    } catch {
      clearTimeout(timer);
      finish({ ok: false, why: "threw" });
    }
  });
}

/**
 * 내 위치의 구를 알아낸다. **버튼을 눌렀을 때만 부를 것** —
 * 앱을 켜자마자 위치를 물으면 대부분 거절하고, 한 번 거절하면 되돌리기 어렵다
 * (userPosition.ts의 같은 판단).
 */
export async function getMyDistrict(): Promise<MyDistrict> {
  if (cached && Date.now() - cachedAt < MAX_AGE_MS) return cached;

  const pos = await getPositionOrNull();
  if (!pos) return { kind: "noPosition" };

  let result: MyDistrict;
  try {
    await loadNaverMaps();
    const r = await reverseGeocode(pos.lat, pos.lng);
    if (!r.ok) result = { kind: "failed", why: r.why };
    else if (r.gu === "") result = { kind: "outside" };
    else if (SEOUL_GUS.has(r.gu)) result = { kind: "gu", gu: r.gu };
    // 서울인데 우리 목록에 없는 이름이 왔다 — 지어내지 않고 실패로 둔다.
    else result = { kind: "failed", why: "unknown-gu" };
  } catch {
    // loadNaverMaps 가 터진 경우도 여기로 온다 — 스크립트 자체를 못 불러온 것이다.
    result = { kind: "failed", why: "threw" };
  }

  // 실패는 캐시하지 않는다 — 잠깐 안 되던 것일 수 있으니 다시 눌러 보게 한다.
  if (result.kind === "gu" || result.kind === "outside") {
    cached = result;
    cachedAt = Date.now();
  }
  return result;
}
