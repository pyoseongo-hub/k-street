// K-Street 시드 데이터
// 출처: "K-Street" 기획 문서(claude.ai 아티팩트, 2026-08-24 리서치)의 25개 구 조사 결과.
// 전부 웹 검색 요약 기반이라 등록 전 공식 페이지 재확인이 필요하다 — CLAUDE.md 정확도 원칙 참고.
// confirmed:false 항목은 이번 조사에서 이름을 못 찾은 자리표시자이며, 값이 아니라 "빈 칸"으로 취급해야 한다.
//
// 출시 범위: 서울만(사용자 결정, 2026-08-24 — "일단 서울부터 출시, 호응 좋으면 전국").
// src/config/launchScope.ts 참고. 여기 있는 곳은 전부 서울이라 지금은 필터가 아무것도
// 걸러내지 않지만, 나중에 다른 도시 데이터를 추가해도 실수로 노출되지 않게 게이트를 미리 건다.
import { isInLaunchScope } from "../config/launchScope";
import { sidoOf } from "./districts";

export type Category = "festival" | "market" | "flower" | "walk" | "hike" | "museum";

export interface Place {
  id: string;
  gu: string;
  category: Category;
  name: string;
  note?: string;
  /** 축제 전용: 시작/종료 월(1-12). 여러 달에 걸치면 startMonth < endMonth */
  startMonth?: number;
  endMonth?: number;
  dateLabel?: string;
  confirmed: boolean;
}

let seq = 0;
const id = () => `ks_${(++seq).toString(36)}`;

// ── 01. 축제 (25/25 확인) ─────────────────────────────────────────
export const FESTIVALS: Place[] = [
  { id: id(), gu: "강남구", category: "festival", name: "강남페스티벌", startMonth: 9, endMonth: 10, dateLabel: "9월 말~10월 초", confirmed: true },
  { id: id(), gu: "강동구", category: "festival", name: "강동선사문화축제", startMonth: 10, endMonth: 10, dateLabel: "10월", note: "1996년 시작, 서울 유일 선사시대 테마 축제", confirmed: true },
  { id: id(), gu: "강북구", category: "festival", name: "4·19혁명 국민문화제", startMonth: 4, endMonth: 4, dateLabel: "4월", confirmed: true },
  { id: id(), gu: "강서구", category: "festival", name: "허준축제", startMonth: 9, endMonth: 9, confirmed: true },
  { id: id(), gu: "관악구", category: "festival", name: "관악강감찬축제", startMonth: 10, endMonth: 10, confirmed: true },
  { id: id(), gu: "광진구", category: "festival", name: "광진뮤직페스타", confirmed: true },
  { id: id(), gu: "구로구", category: "festival", name: "구로G페스티벌", startMonth: 9, endMonth: 9, dateLabel: "9월 말(2025: 9.26–28)", confirmed: true },
  { id: id(), gu: "금천구", category: "festival", name: "금천하모니축제", confirmed: true },
  { id: id(), gu: "노원구", category: "festival", name: "탈축제 · 댄싱노원 거리페스티벌", startMonth: 9, endMonth: 9, note: "댄싱노원은 9월 이틀간", confirmed: true },
  { id: id(), gu: "도봉구", category: "festival", name: "도봉별빛축제", startMonth: 6, endMonth: 6, dateLabel: "6월(2025: 6.13–17)", note: "중랑천(도봉구청~세월교 540m)", confirmed: true },
  { id: id(), gu: "동대문구", category: "festival", name: "동대문페스티벌", startMonth: 10, endMonth: 10, note: "공연예술축제 — 거리예술·음악공연", confirmed: true },
  { id: id(), gu: "동작구", category: "festival", name: "도심 속 바다축제", confirmed: true },
  { id: id(), gu: "마포구", category: "festival", name: "서울와우북페스티벌", startMonth: 10, endMonth: 10, dateLabel: "10월(2024: 10.11–13)", note: "책문화예술축제, 구의 유일한 축제는 아닐 수 있음", confirmed: true },
  { id: id(), gu: "서대문구", category: "festival", name: "신촌물총축제", startMonth: 7, endMonth: 7, dateLabel: "7월 이틀간", note: "2016년 서울시 브랜드축제 선정, 연세로", confirmed: true },
  { id: id(), gu: "서초구", category: "festival", name: "서초뮤직앤아트페스티벌", startMonth: 6, endMonth: 6, dateLabel: "6월(2024: 6.8–9)", confirmed: true },
  { id: id(), gu: "성동구", category: "festival", name: "서울숲 JAZZ페스티벌 · 세계민속춤축제", startMonth: 9, endMonth: 9, dateLabel: "9월 말", confirmed: true },
  { id: id(), gu: "성북구", category: "festival", name: "성북 세계음식축제 누리마실 · 다다페스타", startMonth: 5, endMonth: 6, note: "연도마다 5월 또는 6월(17회 2025.5.18, 18회 2026.6.7 예정)", confirmed: true },
  { id: id(), gu: "송파구", category: "festival", name: "한성백제문화제", startMonth: 10, endMonth: 10, dateLabel: "10.23–25", note: "올림픽공원", confirmed: true },
  { id: id(), gu: "양천구", category: "festival", name: "양천가족거리축제", note: "별도로 '우리동네축제'(14개 동 개별 개최)도 운영", confirmed: true },
  { id: id(), gu: "영등포구", category: "festival", name: "여의도 봄꽃축제", startMonth: 4, endMonth: 4, dateLabel: "4.3–4.7", note: "여의서로 국회 뒤편, 무료", confirmed: true },
  { id: id(), gu: "영등포구", category: "festival", name: "서울세계불꽃축제", startMonth: 9, endMonth: 9, dateLabel: "9.5", note: "여의도·이촌 한강공원, 무료", confirmed: true },
  { id: id(), gu: "용산구", category: "festival", name: "이태원 지구촌축제", startMonth: 10, endMonth: 10, note: "매년 10월경, 연도별 정확한 날짜는 미확정", confirmed: true },
  { id: id(), gu: "은평구", category: "festival", name: "은평누리축제", startMonth: 10, endMonth: 10, dateLabel: "10월 초", note: "불광천 일대", confirmed: true },
  { id: id(), gu: "종로구", category: "festival", name: "연등회", startMonth: 5, endMonth: 5, dateLabel: "5.16–17", note: "유네스코 인류무형문화유산, 조계사~종로 일대, 무료", confirmed: true },
  { id: id(), gu: "중구", category: "festival", name: "정동야행", startMonth: 5, endMonth: 5, note: "덕수궁 돌담길~정동 일대, 2025년 이틀간 13.3만 명", confirmed: true },
  { id: id(), gu: "중랑구", category: "festival", name: "중랑 서울장미축제", startMonth: 5, endMonth: 5, dateLabel: "5.15–23", note: "장미터널 5.45km, 국내 최대", confirmed: true },
  { id: id(), gu: "송파구", category: "festival", name: "석촌호수 호수벚꽃축제", startMonth: 4, endMonth: 4, dateLabel: "4.3–4.11", confirmed: true },
];

// ── 02. 전통시장 (25/25 확인, 대표 1곳씩) ─────────────────────────
export const MARKETS: Place[] = [
  { id: id(), gu: "강남구", category: "market", name: "영동전통시장", note: "구내 5곳 중 대표", confirmed: true },
  { id: id(), gu: "강동구", category: "market", name: "암사종합시장", note: "8호선 암사역 1·2번 출구 도보 5분", confirmed: true },
  { id: id(), gu: "강북구", category: "market", name: "수유전통시장", confirmed: true },
  { id: id(), gu: "강서구", category: "market", name: "화곡본동시장", note: "1969년 개설, 약 55개 점포", confirmed: true },
  { id: id(), gu: "관악구", category: "market", name: "신원시장", note: "신림동, 약 120개 점포", confirmed: true },
  { id: id(), gu: "광진구", category: "market", name: "중곡제일시장", confirmed: true },
  { id: id(), gu: "구로구", category: "market", name: "구로시장", note: "1962년, 한복 거리로 유명", confirmed: true },
  { id: id(), gu: "금천구", category: "market", name: "비단길 현대시장", note: "약 270개 점포, 금천구 최대", confirmed: true },
  { id: id(), gu: "노원구", category: "market", name: "공릉동도깨비시장", note: "일평균 4천명, 7호선 공릉역", confirmed: true },
  { id: id(), gu: "도봉구", category: "market", name: "방학동 도깨비시장", note: "서울 우수재래시장 8곳 선정", confirmed: true },
  { id: id(), gu: "동대문구", category: "market", name: "경동시장", confirmed: true },
  { id: id(), gu: "동작구", category: "market", name: "노량진수산시장", confirmed: true },
  { id: id(), gu: "마포구", category: "market", name: "망원시장", confirmed: true },
  { id: id(), gu: "서대문구", category: "market", name: "인왕시장", note: "홍제동, 1972년 개설", confirmed: true },
  { id: id(), gu: "서초구", category: "market", name: "양재종합시장", note: "1978년 개설, 양재역 5번 출구", confirmed: true },
  { id: id(), gu: "성동구", category: "market", name: "마장축산물시장", note: "서울 육류유통 60% 이상 담당", confirmed: true },
  { id: id(), gu: "성북구", category: "market", name: "정릉시장", confirmed: true },
  { id: id(), gu: "송파구", category: "market", name: "가락시장", note: "1985년, 서울 최대 농수산물도매시장", confirmed: true },
  { id: id(), gu: "양천구", category: "market", name: "오목교중앙시장", note: "신정동", confirmed: true },
  { id: id(), gu: "영등포구", category: "market", name: "영등포시장", note: "1956년, 서남권 최대", confirmed: true },
  { id: id(), gu: "용산구", category: "market", name: "용문전통시장", note: "1948년 개장", confirmed: true },
  { id: id(), gu: "은평구", category: "market", name: "대조시장", note: "약 172개 점포", confirmed: true },
  { id: id(), gu: "종로구", category: "market", name: "광장시장 · 통인시장", note: "광장시장은 100년 상설시장", confirmed: true },
  { id: id(), gu: "중구", category: "market", name: "남대문시장", confirmed: true },
  { id: id(), gu: "중랑구", category: "market", name: "우림시장", note: "구내 12곳 중 대표", confirmed: true },
];

// ── 03. 꽃길 (24/25 확인, 동작구는 확인 못함) ─────────────────────
export const FLOWERS: Place[] = [
  { id: id(), gu: "강남구", category: "flower", name: "양재천 벚꽃길(강남 구간)", confirmed: true },
  { id: id(), gu: "강동구", category: "flower", name: "명일동 삼익그린2차 벚꽃길", confirmed: true },
  { id: id(), gu: "강북구", category: "flower", name: "오동공원", note: "봄꽃길 175선 공식 예시", confirmed: true },
  { id: id(), gu: "강서구", category: "flower", name: "서울식물원", note: "봄꽃길 175선 공식 예시", confirmed: true },
  { id: id(), gu: "관악구", category: "flower", name: "도림천 벚꽃길", note: "신림동·봉천동 구간", confirmed: true },
  { id: id(), gu: "광진구", category: "flower", name: "서울어린이대공원 벚꽃길", confirmed: true },
  { id: id(), gu: "구로구", category: "flower", name: "안양천 벚꽃길(구로 구간)", confirmed: true },
  { id: id(), gu: "금천구", category: "flower", name: "안양천 벚꽃 뚝방길", note: "휠체어 접근 가능", confirmed: true },
  { id: id(), gu: "노원구", category: "flower", name: "중랑천 송정·응봉지구, 광진장미정원", confirmed: true },
  { id: id(), gu: "도봉구", category: "flower", name: "우이천변 벚꽃길·발바닥공원", confirmed: true },
  { id: id(), gu: "동대문구", category: "flower", name: "청계천 꽃길", confirmed: true },
  { id: id(), gu: "동작구", category: "flower", name: "국립서울현충원 수양벚꽃길", note: "06:00–18:00 개방, 상시 벚꽃놀이 장소는 아님 — 참배 예절 필요", confirmed: true },
  { id: id(), gu: "마포구", category: "flower", name: "난지천공원 · 홍제천", note: "난지천길 1.8km(개나리 위주)", confirmed: true },
  { id: id(), gu: "서대문구", category: "flower", name: "안산 자락길 벚꽃길", note: "약 3,000그루", confirmed: true },
  { id: id(), gu: "서초구", category: "flower", name: "양재천 벚꽃길(서초 구간)", confirmed: true },
  { id: id(), gu: "성동구", category: "flower", name: "서울숲 벚꽃길", note: "포토존 '바람의 언덕'", confirmed: true },
  { id: id(), gu: "성북구", category: "flower", name: "성북천", confirmed: true },
  { id: id(), gu: "송파구", category: "flower", name: "석촌호수 벚꽃길", confirmed: true },
  { id: id(), gu: "양천구", category: "flower", name: "안양천 벚꽃길(양천 구간)", confirmed: true },
  { id: id(), gu: "영등포구", category: "flower", name: "여의서로·여의천 벚꽃길", confirmed: true },
  { id: id(), gu: "용산구", category: "flower", name: "남산", note: "봄꽃길 175선 공식 예시", confirmed: true },
  { id: id(), gu: "은평구", category: "flower", name: "불광천 벚꽃길", note: "응암역 4번 출구~증산역", confirmed: true },
  { id: id(), gu: "종로구", category: "flower", name: "청계천", confirmed: true },
  { id: id(), gu: "중구", category: "flower", name: "남산", confirmed: true },
  { id: id(), gu: "중랑구", category: "flower", name: "사가정공원·중랑천변 벚꽃길", confirmed: true },
];

// ── 04. 산책로 (24/25 확인, 금천구는 확인 못함) ───────────────────
export const WALKS: Place[] = [
  { id: id(), gu: "강남구", category: "walk", name: "도산근린공원", confirmed: true },
  { id: id(), gu: "강동구", category: "walk", name: "고덕 자갈길", note: "3km, 도보 약 1시간", confirmed: true },
  { id: id(), gu: "강북구", category: "walk", name: "북서울꿈의숲", confirmed: true },
  { id: id(), gu: "강서구", category: "walk", name: "궁산근린공원", note: "소악루, 궁산공원둘레길 1.63km", confirmed: true },
  { id: id(), gu: "관악구", category: "walk", name: "낙성대공원 산책로", note: "6.2km", confirmed: true },
  { id: id(), gu: "광진구", category: "walk", name: "뚝섬한강공원 산책로", confirmed: true },
  { id: id(), gu: "구로구", category: "walk", name: "구로 해피트레일", note: "항동철길 포함, 9개 코스 9.54km", confirmed: true },
  { id: id(), gu: "금천구", category: "walk", name: "확인 필요", confirmed: false },
  { id: id(), gu: "노원구", category: "walk", name: "경춘선숲길", confirmed: true },
  { id: id(), gu: "도봉구", category: "walk", name: "무수골", confirmed: true },
  { id: id(), gu: "동대문구", category: "walk", name: "홍릉 두물길", confirmed: true },
  { id: id(), gu: "동작구", category: "walk", name: "국립서울현충원", confirmed: true },
  { id: id(), gu: "마포구", category: "walk", name: "경의선숲길(연남동 구간)", note: "'연트럴파크'", confirmed: true },
  { id: id(), gu: "서대문구", category: "walk", name: "연세로(차 없는 거리)", note: "금 14시~일 22시", confirmed: true },
  { id: id(), gu: "서초구", category: "walk", name: "서리풀근린공원", note: "3.31km", confirmed: true },
  { id: id(), gu: "성동구", category: "walk", name: "서울숲길", note: "보행자전용길 22km 지정", confirmed: true },
  { id: id(), gu: "성북구", category: "walk", name: "성북동 인문산책 코스", note: "길상사 등", confirmed: true },
  { id: id(), gu: "송파구", category: "walk", name: "올림픽공원 산책로", confirmed: true },
  { id: id(), gu: "양천구", category: "walk", name: "파리공원 산책로", confirmed: true },
  { id: id(), gu: "영등포구", category: "walk", name: "문래동 예술창작촌 산책로", confirmed: true },
  { id: id(), gu: "용산구", category: "walk", name: "경의선숲길(용산 구간)", confirmed: true },
  { id: id(), gu: "은평구", category: "walk", name: "진관사 계곡~삼천사 산책로", confirmed: true },
  { id: id(), gu: "종로구", category: "walk", name: "북촌로 · 삼청동길", confirmed: true },
  { id: id(), gu: "중구", category: "walk", name: "서울로7017 · 정동길", confirmed: true },
  { id: id(), gu: "중랑구", category: "walk", name: "망우역사문화공원 '사색의 길'", note: "4.7km", confirmed: true },
];

// ── 05. 둘레길·등산로 (23/25 확인) ─────────────────────────────
export const HIKES: Place[] = [
  { id: id(), gu: "종로구", category: "hike", name: "한양도성 순성길(백악·낙산·인왕 구간)", note: "18.6km, 창의문~혜화문~흥인지문~돈의문 터", confirmed: true },
  { id: id(), gu: "중구", category: "hike", name: "한양도성 순성길(목멱 구간) · 남산둘레길", note: "장충체육관~백범광장, 3.5km 순환", confirmed: true },
  { id: id(), gu: "성북구", category: "hike", name: "서울둘레길 19코스 — 북한산 성북", confirmed: true },
  { id: id(), gu: "강북구", category: "hike", name: "서울둘레길 20코스 — 북한산 강북", confirmed: true },
  { id: id(), gu: "도봉구", category: "hike", name: "서울둘레길 1·21코스 — 수락산·북한산 도봉", confirmed: true },
  { id: id(), gu: "노원구", category: "hike", name: "서울둘레길 1~4코스 — 수락산~망우용마산", confirmed: true },
  { id: id(), gu: "중랑구", category: "hike", name: "서울둘레길 4코스 — 망우·용마산", confirmed: true },
  { id: id(), gu: "광진구", category: "hike", name: "서울둘레길 5코스 — 아차산", confirmed: true },
  { id: id(), gu: "강동구", category: "hike", name: "서울둘레길 6·7코스 — 고덕산·일자산", confirmed: true },
  { id: id(), gu: "송파구", category: "hike", name: "서울둘레길 7·8코스 — 일자산·장지탄천", confirmed: true },
  { id: id(), gu: "강남구", category: "hike", name: "서울둘레길 8·9코스 — 장지탄천·대모구룡산", confirmed: true },
  { id: id(), gu: "서초구", category: "hike", name: "서울둘레길 9·10코스 — 대모구룡산·우면산", confirmed: true },
  { id: id(), gu: "관악구", category: "hike", name: "서울둘레길 11코스 — 관악산", confirmed: true },
  { id: id(), gu: "동작구", category: "hike", name: "서울둘레길 11코스 — 관악산(사당역 인근)", confirmed: true },
  { id: id(), gu: "금천구", category: "hike", name: "서울둘레길 13코스 — 안양천 상류", confirmed: true },
  { id: id(), gu: "구로구", category: "hike", name: "서울둘레길 13·14코스 — 안양천", confirmed: true },
  { id: id(), gu: "영등포구", category: "hike", name: "서울둘레길 14코스 — 안양천 하류", confirmed: true },
  { id: id(), gu: "양천구", category: "hike", name: "서울둘레길 14코스 — 안양천 하류", confirmed: true },
  { id: id(), gu: "강서구", category: "hike", name: "서울둘레길 14코스 종점 — 가양역 인근", confirmed: true },
  { id: id(), gu: "은평구", category: "hike", name: "서울둘레길 16·17코스 — 봉산·앵봉산·북한산 은평", confirmed: true },
  { id: id(), gu: "서대문구", category: "hike", name: "안산자락길", note: "무장애 둘레길", confirmed: true },
  { id: id(), gu: "성동구", category: "hike", name: "응봉산", note: "95.4m, 팔각정 — 매봉산과 이름 혼용 주의", confirmed: true },
  { id: id(), gu: "용산구", category: "hike", name: "남산둘레길", confirmed: true },
  { id: id(), gu: "동대문구", category: "hike", name: "확인 필요", note: "서울둘레길 미해당 도심 구, 대체 등산로 미확인", confirmed: false },
  { id: id(), gu: "마포구", category: "hike", name: "확인 필요", note: "서울둘레길 미해당 도심 구, 대체 등산로 미확인", confirmed: false },
];

// ── 06. 박물관·미술관 (20/25 확인) ─────────────────────────────
export const MUSEUMS: Place[] = [
  { id: id(), gu: "종로구", category: "museum", name: "국립현대미술관 서울관 · 딜쿠샤 · 백인제가옥", note: "서울 최다 56곳", confirmed: true },
  { id: id(), gu: "중구", category: "museum", name: "서울시립미술관 · 국립현대미술관 덕수궁관", note: "17곳", confirmed: true },
  { id: id(), gu: "용산구", category: "museum", name: "국립중앙박물관", confirmed: true },
  { id: id(), gu: "성북구", category: "museum", name: "간송미술관", note: "훈민정음 해례본 소장. 연 2회(5·10월) 특별전시 때만 유료 개방 — 상시 개방 아님", confirmed: true },
  { id: id(), gu: "마포구", category: "museum", name: "근현대디자인박물관 · 대안공간 루프 · 서강대박물관", confirmed: true },
  { id: id(), gu: "강남구", category: "museum", name: "관세박물관 · 호림박물관 신사분관 · 도산안창호기념관", note: "13곳", confirmed: true },
  { id: id(), gu: "송파구", category: "museum", name: "한성백제박물관 · 소마미술관", note: "11곳, 올림픽공원 인근", confirmed: true },
  { id: id(), gu: "금천구", category: "museum", name: "서울시립 서서울미술관", confirmed: true },
  { id: id(), gu: "양천구", category: "museum", name: "오목한미술관", note: "오목공원 내", confirmed: true },
  { id: id(), gu: "강서구", category: "museum", name: "허준박물관", note: "구립, 허준축제(03-1)와 연계", confirmed: true },
  { id: id(), gu: "강동구", category: "museum", name: "강동아트센터 갤러리 그림", confirmed: true },
  { id: id(), gu: "관악구", category: "museum", name: "서울대미술관", note: "렘 쿨하스 설계, 800점 이상 소장", confirmed: true },
  { id: id(), gu: "광진구", category: "museum", name: "서울상상나라 · 건국대박물관 · 세종대박물관", confirmed: true },
  { id: id(), gu: "노원구", category: "museum", name: "육군박물관", note: "태릉, 육군사관학교 내", confirmed: true },
  { id: id(), gu: "도봉구", category: "museum", name: "도봉구청 갤러리", note: "1층 로비, 무료대관 전시", confirmed: true },
  { id: id(), gu: "동대문구", category: "museum", name: "서울약령시한의약박물관", note: "경동시장(03-6) 한약재 거리와 연계", confirmed: true },
  { id: id(), gu: "서대문구", category: "museum", name: "서대문자연사박물관", confirmed: true },
  { id: id(), gu: "서초구", category: "museum", name: "예술의전당 서울서예박물관", note: "1988년, 국내 유일 서예 전문 전시장", confirmed: true },
  { id: id(), gu: "영등포구", category: "museum", name: "문래예술공장(갤러리M30)", note: "서울문화재단 운영", confirmed: true },
  { id: id(), gu: "은평구", category: "museum", name: "은평역사한옥박물관", confirmed: true },
  { id: id(), gu: "강북구", category: "museum", name: "확인 필요", confirmed: false },
  { id: id(), gu: "구로구", category: "museum", name: "확인 필요", confirmed: false },
  { id: id(), gu: "동작구", category: "museum", name: "확인 필요", confirmed: false },
  { id: id(), gu: "성동구", category: "museum", name: "확인 필요", confirmed: false },
  { id: id(), gu: "중랑구", category: "museum", name: "확인 필요", confirmed: false },
];

const ALL_PLACES_RAW: Place[] = [
  ...FESTIVALS,
  ...MARKETS,
  ...FLOWERS,
  ...WALKS,
  ...HIKES,
  ...MUSEUMS,
];

// 출시 범위 게이트(launchScope.ts) — 서울 외 지역이 seed.ts에 섞여 들어와도
// LAUNCH_REGIONS를 넓히기 전까지는 화면에 노출되지 않는다.
export const ALL_PLACES: Place[] = ALL_PLACES_RAW.filter((p) => isInLaunchScope(sidoOf(p.gu)));

export const CATEGORY_META: Record<Category, { label: string; icon: string; color: string }> = {
  festival: { label: "축제", icon: "🎪", color: "var(--festival)" },
  market: { label: "시장", icon: "🏮", color: "var(--market)" },
  flower: { label: "꽃길", icon: "🌸", color: "var(--flower)" },
  walk: { label: "산책로", icon: "🚶", color: "var(--walk)" },
  hike: { label: "둘레길", icon: "🥾", color: "var(--hike)" },
  museum: { label: "박물관", icon: "🏛", color: "var(--museum)" },
};
