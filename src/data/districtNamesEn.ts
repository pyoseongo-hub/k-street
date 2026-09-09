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

// 🇹🇼🇨🇳 중국어도 예외로 둔다 (2026-09-10). 일본어와 **같은 이유**다 —
//    서울 자치구 이름은 전부 한자어라서, 중국어권 여행 자료는 로마자가 아니라
//    한자를 그대로 쓴다. 중국어 페이지 한가운데에 「Dobong-gu」가 박혀 있으면
//    중국 손님에게는 읽을 수 없는 글자다(묶음 페이지를 중국어로 만들다가 발견했다 —
//    일본어 페이지는 道峰区인데 중국어 페이지만 Dobong-gu 였다).
//
// 🪪 **근거** — 지어낸 것이 아니다. 위 DISTRICT_NAME_JA 에 있는 것이 곧
//    이 구들의 **공식 한자**(종로구=鍾路區)이고, 일본어 표기는 그 한자를
//    일본 신자체로 쓴 것이다. 그래서:
//      · 번체(zh-TW) = 그 공식 한자 그대로, 접미사만 정체자 「區」.
//        일본 신자체만 되돌린다 — 広津区 → 廣津區.
//      · 간체(zh)    = 같은 한자의 표준 간화자.
//        鍾→钟 · 龍→龙 · 廣→广 · 東→东 · 蘆→芦 · 門→门 · 陽→阳 · 銅→铜
//    두 표를 나란히 놓고 25개가 한 글자씩 대응하는지 맞춰 봤다.
//
// ⚠️ **동(洞) 이름은 손대지 않는다.** 동은 한자가 없는 것도 있고(가리봉·개봉)
//    표기가 갈리는 것도 많아, 넣으면 확인 못 한 것을 넣는 셈이 된다. 동은 로마자로 둔다.
export const DISTRICT_NAME_ZH_TW: Record<string, string> = {
  "종로구": "鍾路區", "중구": "中區", "용산구": "龍山區",
  "성동구": "城東區", "광진구": "廣津區", "동대문구": "東大門區",
  "중랑구": "中浪區", "성북구": "城北區", "강북구": "江北區",
  "도봉구": "道峰區", "노원구": "蘆原區", "은평구": "恩平區",
  "서대문구": "西大門區", "마포구": "麻浦區", "양천구": "陽川區",
  "강서구": "江西區", "구로구": "九老區", "금천구": "衿川區",
  "영등포구": "永登浦區", "동작구": "銅雀區", "관악구": "冠岳區",
  "서초구": "瑞草區", "강남구": "江南區", "송파구": "松坡區",
  "강동구": "江東區",
};

export const DISTRICT_NAME_ZH: Record<string, string> = {
  "종로구": "钟路区", "중구": "中区", "용산구": "龙山区",
  "성동구": "城东区", "광진구": "广津区", "동대문구": "东大门区",
  "중랑구": "中浪区", "성북구": "城北区", "강북구": "江北区",
  "도봉구": "道峰区", "노원구": "芦原区", "은평구": "恩平区",
  "서대문구": "西大门区", "마포구": "麻浦区", "양천구": "阳川区",
  "강서구": "江西区", "구로구": "九老区", "금천구": "衿川区",
  "영등포구": "永登浦区", "동작구": "铜雀区", "관악구": "冠岳区",
  "서초구": "瑞草区", "강남구": "江南区", "송파구": "松坡区",
  "강동구": "江东区",
};

// 언어별 표(로마자 접미사 "-gu", 한자 접미사 "区")를 한곳에 묶어서,
// 새 언어를 추가할 때 아래 함수들을 안 건드리고 여기에만 추가하면 되게 한다.
const NAME_TABLES: Record<string, { names: Record<string, string>; suffix: RegExp }> = {
  en: { names: DISTRICT_NAME_EN, suffix: /-gu$/ },
  ja: { names: DISTRICT_NAME_JA, suffix: /区$/ },
  zh: { names: DISTRICT_NAME_ZH, suffix: /区$/ },
  "zh-TW": { names: DISTRICT_NAME_ZH_TW, suffix: /區$/ },
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
