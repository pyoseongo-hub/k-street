// 길찾기 버튼이 "출발지 + 목적지"가 모두 채워진 화면을 열려면 내 위치가 필요하다
// (사용자 지시 2026-09-01: "네이버 카카오 둘다 예시 이미지처럼 출발지 목적지 나올수 있게").
//
// 위치를 화면 열자마자 물어보지는 않는다 — 앱을 켜자마자 권한 창이 뜨면 대부분 거절하고,
// 한 번 거절하면 다시 물어볼 방법이 마땅치 않다. **길찾기를 누른 그 순간**에만 물어본다.
//
// 받은 좌표는 이 모듈에 캐시해 둔다. 버튼을 누를 때마다 GPS를 다시 켜면 몇 초씩 멈추고,
// 그동안 사용자는 버튼이 고장 난 줄 안다.
//
// ⚠️ 위치를 못 받아도 길찾기는 그대로 열려야 한다. 권한 거절·실내·기기 미지원은
// 드물지 않고, 그때는 목적지만 찍힌 화면으로 가면 된다(지금까지의 동작).

import { getUserLocation, type UserLocation } from "./geolocation";

let cached: UserLocation | null = null;
let cachedAt = 0;

/** 캐시를 다시 쓰는 시간. 걷는 속도로는 5분 안에 길찾기 출발지가 달라질 만큼 못 움직인다. */
const MAX_AGE_MS = 5 * 60 * 1000;

/** 위치를 기다리는 한도. 이보다 오래 걸리면 그냥 목적지만으로 연다 — 버튼이 멈춰 보이면 안 된다. */
const TIMEOUT_MS = 4000;

/**
 * 내 위치를 준다. 못 받으면 null — **호출부는 반드시 null을 정상 경로로 다뤄야 한다.**
 * 실패해도 예외를 던지지 않는다(길찾기가 통째로 막히면 안 되므로).
 */
export async function getPositionOrNull(): Promise<UserLocation | null> {
  if (cached && Date.now() - cachedAt < MAX_AGE_MS) return cached;
  try {
    const pos = await Promise.race([
      getUserLocation(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS)),
    ]);
    if (pos) {
      cached = pos;
      cachedAt = Date.now();
    }
    return pos;
  } catch {
    // 권한 거절·기기 미지원 — 조용히 넘어간다.
    return null;
  }
}

/** 이미 받아 둔 위치가 있으면 준다(기다리지 않음). 화면 표시용. */
export function peekPosition(): UserLocation | null {
  return cached && Date.now() - cachedAt < MAX_AGE_MS ? cached : null;
}
