// 구·동 이름의 로마자 표기(국립국어원 로마자 표기법 기준) — 한국어가 아닌
// 언어에서 공통으로 쓰는 대체값이다(2026-08-28 사용자 지적: 언어를 영어로
// 바꿔도 화면 문구는 English인데 구 이름·동 이름만 한국어로 남아 있었다).
// Kfood(dongne-hanip)가 "번역이 없는 언어는 영어로 대신 보여준다"는 방식과
// 같은 결로, 아직 개별 언어 번역이 없는 지금은 로마자 표기 하나를
// 12개 비한국어 언어 전체의 폴백으로 쓴다 — 지어낸 값이 아니라 표준
// 로마자 표기이므로 정확도 원칙에 어긋나지 않는다.
export const DISTRICT_NAME_EN: Record<string, string> = {
  "종로구": "Jongno-gu", "중구": "Jung-gu", "용산구": "Yongsan-gu",
  "성동구": "Seongdong-gu", "광진구": "Gwangjin-gu", "동대문구": "Dongdaemun-gu",
  "중랑구": "Jungnang-gu", "성북구": "Seongbuk-gu", "강북구": "Gangbuk-gu",
  "도봉구": "Dobong-gu", "노원구": "Nowon-gu", "은평구": "Eunpyeong-gu",
  "서대문구": "Seodaemun-gu", "마포구": "Mapo-gu", "양천구": "Yangcheon-gu",
  "강서구": "Gangseo-gu", "구로구": "Guro-gu", "금천구": "Geumcheon-gu",
  "영등포구": "Yeongdeungpo-gu", "동작구": "Dongjak-gu", "관악구": "Gwanak-gu",
  "서초구": "Seocho-gu", "강남구": "Gangnam-gu", "송파구": "Songpa-gu",
  "강동구": "Gangdong-gu",
};

export const DONG_NAME_EN: Record<string, string> = {
  "신정동": "Sinjeong-dong",
  "여의도동": "Yeouido-dong",
  "운니동": "Unni-dong",
  "종로1가동": "Jongno 1(il)-ga-dong",
  "창천동": "Changcheon-dong",
};

// 육각형 타일처럼 자리가 좁은 곳엔 "-gu" 접미사를 뗀 짧은 형태를 쓴다.
export function districtShortName(gu: string, language: string): string {
  if (language === "ko") return gu.slice(0, -1);
  const en = DISTRICT_NAME_EN[gu];
  return en ? en.replace(/-gu$/, "") : gu.slice(0, -1);
}

export function districtFullName(gu: string, language: string): string {
  if (language === "ko") return gu;
  return DISTRICT_NAME_EN[gu] ?? gu;
}

export function dongName(dong: string, language: string): string {
  if (language === "ko") return dong;
  return DONG_NAME_EN[dong] ?? dong;
}
