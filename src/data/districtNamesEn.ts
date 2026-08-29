// 구·동 이름의 언어별 표기. 아직 개별 번역이 없는 대부분의 언어는 로마자
// 표기(국립국어원 기준)를 공통 폴백으로 쓴다(2026-08-28: 언어를 English로
// 바꿔도 구 이름만 한국어로 남아 있던 문제) — Kfood(dongne-hanip)의
// "번역이 없으면 영어로 대신 보여준다"는 방식과 같다.
//
// 일본어는 예외로 둔다(2026-08-28 사용자 지적: "일본어 선택해도 여긴
// 영어인데 맞나") — 서울 자치구 이름은 전부 한자어라 실제 일본 여행
// 자료·일본어 위키백과가 로마자가 아니라 한자 표기(예: 종로구 → 鍾路区)를
// 그대로 쓴다. 지어낸 게 아니라 그 표기를 그대로 옮긴 것이다.
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

export const DISTRICT_NAME_JA: Record<string, string> = {
  "종로구": "鍾路区", "중구": "中区", "용산구": "龍山区",
  "성동구": "城東区", "광진구": "広津区", "동대문구": "東大門区",
  "중랑구": "中浪区", "성북구": "城北区", "강북구": "江北区",
  "도봉구": "道峰区", "노원구": "蘆原区", "은평구": "恩平区",
  "서대문구": "西大門区", "마포구": "麻浦区", "양천구": "陽川区",
  "강서구": "江西区", "구로구": "九老区", "금천구": "衿川区",
  "영등포구": "永登浦区", "동작구": "銅雀区", "관악구": "冠岳区",
  "서초구": "瑞草区", "강남구": "江南区", "송파구": "松坡区",
  "강동구": "江東区",
};

// 언어별 표(로마자 접미사 "-gu", 한자 접미사 "区")를 한곳에 묶어서,
// 새 언어를 추가할 때 아래 함수들을 안 건드리고 여기에만 추가하면 되게 한다.
const NAME_TABLES: Record<string, { names: Record<string, string>; suffix: RegExp }> = {
  en: { names: DISTRICT_NAME_EN, suffix: /-gu$/ },
  ja: { names: DISTRICT_NAME_JA, suffix: /区$/ },
};

export const DONG_NAME_EN: Record<string, string> = {
  "신정동": "Sinjeong-dong",
  "여의도동": "Yeouido-dong",
  "운니동": "Unni-dong",
  "종로1가동": "Jongno 1(il)-ga-dong",
  "창천동": "Changcheon-dong",
};

// 육각형 타일처럼 자리가 좁은 곳엔 구·区·-gu 접미사를 뗀 짧은 형태를 쓴다.
// 다만 "중구"는 한글도 한자도 떼면 한 글자만 남아 무슨 뜻인지 안 보인다
// (2026-08-28 사용자 지적: "한글도 구 붙여 중구인데 중 이상해") — 접미사를
// 뗀 결과가 한 글자뿐이면 그 언어에서도 접미사를 떼지 않는다. 이름을
// 하드코딩하는 대신 글자 수로 가르므로 다른 도시가 들어와도 같은 함정을
// 자동으로 피한다.
export function districtShortName(gu: string, language: string): string {
  const koShort = gu.slice(0, -1);
  const keepFull = koShort.length <= 1;
  if (language === "ko") return keepFull ? gu : koShort;
  const table = NAME_TABLES[language] ?? NAME_TABLES.en;
  const full = table.names[gu];
  if (!full) return keepFull ? gu : koShort;
  return keepFull ? full : full.replace(table.suffix, "");
}

export function districtFullName(gu: string, language: string): string {
  if (language === "ko") return gu;
  const table = NAME_TABLES[language] ?? NAME_TABLES.en;
  return table.names[gu] ?? DISTRICT_NAME_EN[gu] ?? gu;
}

export function dongName(dong: string, language: string): string {
  if (language === "ko") return dong;
  return DONG_NAME_EN[dong] ?? dong;
}
