// 출시 범위 — 사용자 결정 (2026-08-24)
//
//   "일단 서울부터 출시하고 무료배포. 호응이 좋으면 전국 단위 진행.
//    서울 외 지역은 일단 안 보이게."
//
// Kfood가 "적은 비용으로 오래"·"수익화보다 커버리지"를 원칙으로 삼은 것과 같은 논리다 —
// 서울 하나를 제대로 채우지 않은 채 전국으로 벌리지 않는다.
//
// 지금은 seed.ts 자체가 서울 25개 구만 갖고 있어서 이 상수가 없어도 결과는 같다.
// 다만 나중에 다른 도시 데이터를 seed.ts에 추가하더라도, **이 상수를 지역·서울 이외로
// 넓히기 전까지는 화면에 노출되지 않아야 한다** — 그래서 지금부터 명시적인 게이트로 둔다.
export const LAUNCH_REGIONS: readonly string[] = ["서울"];

export function isInLaunchScope(sido: string): boolean {
  return LAUNCH_REGIONS.includes(sido);
}
