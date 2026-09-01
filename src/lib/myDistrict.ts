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
  /** 위치는 받았는데 구를 못 알아냈다(SDK 실패·응답 이상). */
  | { kind: "failed" };

/** 앱이 아는 서울 25개 구. 네이버가 준 이름이 이 안에 있어야만 쓴다. */
const SEOUL_GUS = new Set(SEOUL_HEX_ROWS.flatMap((row) => row.gus));

let cached: MyDistrict | null = null;

/** 한 번 알아내면 다시 묻지 않는다. 걸어서 구를 넘는 데는 한참 걸린다. */
const MAX_AGE_MS = 10 * 60 * 1000;
let cachedAt = 0;

/** 네이버 조회가 늘어져 버튼이 멈춘 것처럼 보이지 않게 하는 한도. */
const LOOKUP_TIMEOUT_MS = 5000;

function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  return new Promise((resolve) => {
    const naver = window.naver;
    // geocoder 서브모듈이 안 붙었으면 Service 자체가 없다 — 조용히 포기한다.
    if (!naver?.maps || !(naver.maps as any).Service) {
      resolve(null);
      return;
    }
    const Service = (naver.maps as any).Service;
    const timer = setTimeout(() => resolve(null), LOOKUP_TIMEOUT_MS);
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
            resolve(null);
            return;
          }
          const region = response?.v2?.results?.[0]?.region;
          // area1 = 시·도, area2 = 시·군·구.
          const sido = region?.area1?.name as string | undefined;
          const gu = region?.area2?.name as string | undefined;
          if (!sido || !gu) {
            resolve(null);
            return;
          }
          // 서울이 아니면 구 이름을 돌려주지 않는다. 다른 시에도 '중구'·'강서구'가 있어서
          // 이름만 보고 받으면 부산 중구를 서울 중구로 착각해 엉뚱한 칸이 켜진다.
          resolve(sido === "서울특별시" ? gu : "");
        }
      );
    } catch {
      clearTimeout(timer);
      resolve(null);
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
    const gu = await reverseGeocode(pos.lat, pos.lng);
    if (gu === null) result = { kind: "failed" };
    else if (gu === "") result = { kind: "outside" };
    else if (SEOUL_GUS.has(gu)) result = { kind: "gu", gu };
    // 서울인데 우리 목록에 없는 이름이 왔다 — 지어내지 않고 실패로 둔다.
    else result = { kind: "failed" };
  } catch {
    result = { kind: "failed" };
  }

  // 실패는 캐시하지 않는다 — 잠깐 안 되던 것일 수 있으니 다시 눌러 보게 한다.
  if (result.kind === "gu" || result.kind === "outside") {
    cached = result;
    cachedAt = Date.now();
  }
  return result;
}
