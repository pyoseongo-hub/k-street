// 서울 25개 자치구. seed.ts와 DistrictExplorer가 이 목록을 공유한다 —
// "서울만 보이게" 게이트(launchScope.ts)가 실제로 걸리려면 두 군데서 따로
// 자치구 목록을 들고 있으면 안 된다(하나만 고치고 하나는 안 고치는 사고가 난다).
export const SEOUL_DISTRICTS: readonly string[] = [
  "종로구", "중구", "용산구", "성동구", "광진구",
  "동대문구", "중랑구", "성북구", "강북구", "도봉구",
  "노원구", "은평구", "서대문구", "마포구", "양천구",
  "강서구", "구로구", "금천구", "영등포구", "동작구",
  "관악구", "서초구", "강남구", "송파구", "강동구",
];

// 지금 seed.ts에 있는 곳은 전부 서울이다. 다른 시·도 데이터가 들어오면
// 여기에 그 구·군 목록과 소속 시·도를 추가해야 launchScope 필터가 제대로 작동한다.
export function sidoOf(gu: string): string {
  if (SEOUL_DISTRICTS.includes(gu)) return "서울";
  return "미확인"; // launchScope에 없는 시·도이므로 어차피 화면에서 걸러진다
}
