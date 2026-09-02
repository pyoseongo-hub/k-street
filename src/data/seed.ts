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
import { getCoords } from "../lib/coords";
import { TOUR_PLACES, TOUR_BY_NAME } from "./tourPlaces";
import { getManualPhoto } from "../lib/manualPhotos";

// street(골목·거리)는 2026-09-01에 추가했다. 관광공사 자료에 경리단길·익선동 한옥거리·
// 종로귀금속거리처럼 구·사진·좌표가 다 붙은 골목이 40곳 있는데, 앱 이름이 K-Street인데도
// 정작 "거리" 칸이 없어서 전부 버려지고 있었다(사용자 지시).
export type Category = "festival" | "market" | "flower" | "walk" | "hike" | "museum" | "street";

export interface Place {
  id: string;
  gu: string;
  dong?: string; // 법정동 (법정동 이름, 예: "강남동", "서초동")
  category: Category;
  name: string;
  note?: string;
  /** 지번/도로명 주소. 관광공사에서 받은 곳만 값이 있다. */
  addr?: string;
  /** 관광공사 사진(공공누리 1유형). 없는 곳은 화면에서 작은 카드로 나온다. */
  image?: string;
  thumb?: string;
  /** 어디서 온 자료인가. 값이 없으면 사람이 직접 조사해 seed.ts에 적은 것이다. */
  source?: "tour";
  /** 사진 출처 표기. 구청 등에서 받은 사진은 공공누리상 출처를 반드시 띄워야 한다. */
  photoCredit?: string;
  /** 축제 전용: 시작/종료 월(1-12). 여러 달에 걸치면 startMonth < endMonth */
  startMonth?: number;
  endMonth?: number;
  dateLabel?: string;
  /**
   * 축제 전용: 그 달의 초·중·하순.
   *
   * 🚨 **정확한 날짜(10.17–19)는 일부러 안 적는다.** 관광공사에서 받은 날짜는
   * 지난 회차(2025년) 것이다 — 축제는 해마다 같은 시기에 열리므로 "10월 중순"까지는
   * 맞지만 날짜와 요일은 해마다 옮겨 간다. 지난해 날짜를 올해 것처럼 적으면
   * 손님이 그 날 헛걸음한다(CLAUDE.md: 해마다 바뀌는 값은 적지 않고 공식 창구로
   * 안내한다). 정확한 날짜는 이름을 눌러 구청 안내에서 보게 한다.
   */
  period?: "early" | "mid" | "late";
  /** 좌표: TourAPI 또는 공식 위치정보 기반 */
  lat?: number;
  lng?: number;
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
  // 8월 확인(2026-09-01): "한여름 밤의 음악축제"로 헤럴드경제·시정일보·청년개발자신문이
  // 모두 8월 29일 개최를 보도했고, 광진구청 포털 축제/행사 안내에도 같은 날짜가 있다.
  // 자양역 2·3번 출구 일대(뚝섬한강공원).
  { id: id(), gu: "광진구", category: "festival", name: "광진뮤직페스타", startMonth: 8, endMonth: 8, confirmed: true },
  { id: id(), gu: "구로구", category: "festival", name: "구로G페스티벌", startMonth: 9, endMonth: 9, dateLabel: "9월 말(2025: 9.26–28)", confirmed: true },
  // ⚠️ 달을 **비워 둔다**(2026-09-01). 회차마다 달라서다 —
  // 2023년 5월 13~14일 · 2024년 5월 · **2025년 10월 18~19일**.
  // 시기를 옮긴 것으로 보이지만 한 번뿐이라 "매년 10월"이라고 단정할 수 없다.
  // CLAUDE.md: 숫자가 엇갈리면 숫자를 적지 않는다. 2026년 회차가 공고되면 그때 넣는다.
  // (지금은 계절 화면에 안 나온다 — 그게 틀린 달로 나오는 것보다 낫다.)
  { id: id(), gu: "금천구", category: "festival", name: "금천하모니축제", confirmed: true },
  // "탈축제 · 댄싱노원 거리페스티벌"은 원래 서로 다른 두 축제인 줄 알고 나눴었는데
  // (2026-08-29), 다시 찾아보니 "탈축제"는 옛 이름이고 2023년 새이름 공모로
  // "댄싱노원 거리페스티벌"로 개명한 같은 행사였다(서울문화포털 등 확인, 2026-08-30) —
  // 지금 열리는 건 하나뿐이라 옛 이름은 빼고 지금 이름만 남긴다.
  { id: id(), gu: "노원구", category: "festival", name: "댄싱노원 거리페스티벌", startMonth: 9, endMonth: 9, note: "옛 이름 '노원탈축제', 2023년 개명. 9월 이틀간", confirmed: true },
  { id: id(), gu: "도봉구", category: "festival", name: "도봉별빛축제", startMonth: 6, endMonth: 6, dateLabel: "6월(2025: 6.13–17)", note: "중랑천(도봉구청~세월교 540m)", confirmed: true },
  { id: id(), gu: "동대문구", category: "festival", name: "동대문페스티벌", startMonth: 10, endMonth: 10, note: "공연예술축제 — 거리예술·음악공연", confirmed: true },
  // 10월 확인(2026-09-01): 제8회가 10월 25~26일 노량진수산시장 일대에서 열렸다.
  // 문화일보·헤럴드경제·시정일보와 서울문화포털 자치구브랜드축제 안내가 일치한다.
  { id: id(), gu: "동작구", category: "festival", name: "도심 속 바다축제", startMonth: 10, endMonth: 10, note: "노량진수산시장 일대", confirmed: true },
  { id: id(), gu: "마포구", category: "festival", name: "서울와우북페스티벌", startMonth: 10, endMonth: 10, dateLabel: "10월(2024: 10.11–13)", note: "책문화예술축제, 구의 유일한 축제는 아닐 수 있음", confirmed: true },
  { id: id(), gu: "서대문구", dong: "창천동", category: "festival", name: "신촌물총축제", startMonth: 7, endMonth: 7, dateLabel: "7월 이틀간", note: "2016년 서울시 브랜드축제 선정, 연세로", lat: 37.5526, lng: 126.9342, confirmed: true },
  { id: id(), gu: "서초구", category: "festival", name: "서초뮤직앤아트페스티벌", startMonth: 6, endMonth: 6, dateLabel: "6월(2024: 6.8–9)", confirmed: true },
  { id: id(), gu: "성동구", category: "festival", name: "서울숲 JAZZ페스티벌", startMonth: 9, endMonth: 9, dateLabel: "9월 말", confirmed: true },
  { id: id(), gu: "성동구", category: "festival", name: "세계민속춤축제", startMonth: 9, endMonth: 9, dateLabel: "9월 말", confirmed: true },
  // WebSearch로 확인(2026-08-29): 누리마실(성북동, 6월경, 세계 음식·문화)과
  // 다다페스타(석관동, 9월, 성북거리문화축제)는 서로 다른 장소·시기의 별개 행사다
  // — 하나로 합쳐 두면 지도 검색이 안 될뿐더러 시기 정보도 틀리게 섞여 있었다.
  { id: id(), gu: "성북구", dong: "성북동", category: "festival", name: "성북 세계음식축제 누리마실", startMonth: 5, endMonth: 6, note: "연도마다 5월 또는 6월(17회 2025.5.18, 18회 2026.6.7 예정)", confirmed: true },
  { id: id(), gu: "성북구", dong: "석관동", category: "festival", name: "성북거리문화축제 다다페스타", startMonth: 9, endMonth: 9, note: "이주민·다문화가정·청년이 함께하는 거리문화축제", confirmed: true },
  { id: id(), gu: "송파구", category: "festival", name: "한성백제문화제", startMonth: 10, endMonth: 10, dateLabel: "10.23–25", note: "올림픽공원", confirmed: true },
  { id: id(), gu: "양천구", dong: "신정동", category: "festival", name: "양천가족거리축제", startMonth: 10, endMonth: 10, note: "별도로 '우리동네축제'(14개 동 개별 개최)도 운영", lat: 37.5480, lng: 126.8490, confirmed: true },
  { id: id(), gu: "영등포구", dong: "여의도동", category: "festival", name: "여의도 봄꽃축제", startMonth: 4, endMonth: 4, dateLabel: "4.3–4.7", note: "여의서로 국회 뒤편, 무료", lat: 37.5275, lng: 126.9255, confirmed: true },
  { id: id(), gu: "영등포구", dong: "여의도동", category: "festival", name: "서울세계불꽃축제", startMonth: 9, endMonth: 9, dateLabel: "9.5", note: "여의도·이촌 한강공원, 무료", lat: 37.5255, lng: 126.9225, confirmed: true },
  { id: id(), gu: "용산구", category: "festival", name: "이태원 지구촌축제", startMonth: 10, endMonth: 10, note: "매년 10월경, 연도별 정확한 날짜는 미확정", confirmed: true },
  { id: id(), gu: "은평구", category: "festival", name: "은평누리축제", startMonth: 10, endMonth: 10, dateLabel: "10월 초", note: "불광천 일대", confirmed: true },
  { id: id(), gu: "종로구", dong: "종로1가동", category: "festival", name: "연등회", startMonth: 5, endMonth: 5, dateLabel: "5.16–17", note: "유네스코 인류무형문화유산, 조계사~종로 일대, 무료", lat: 37.5750, lng: 126.9922, confirmed: true },
  { id: id(), gu: "중구", category: "festival", name: "정동야행", startMonth: 5, endMonth: 5, note: "덕수궁 돌담길~정동 일대, 2025년 이틀간 13.3만 명", confirmed: true },
  { id: id(), gu: "중랑구", category: "festival", name: "중랑 서울장미축제", startMonth: 5, endMonth: 5, dateLabel: "5.15–23", note: "장미터널 5.45km, 국내 최대", confirmed: true },
  { id: id(), gu: "송파구", category: "festival", name: "석촌호수 호수벚꽃축제", startMonth: 4, endMonth: 4, dateLabel: "4.3–4.11", confirmed: true },
  // 아래 4개는 2026-08-28 사용자 지시("3월까지 빈것도 서치해서 채우기")로 추가 —
  // 1~3월 축제가 비어 있던 이유를 서치해 보니 실제로 이 시기 서울 자치구 축제는
  // 대부분 '정월대보름'(음력 1월 15일) 무렵에 몰려 있었다. 음력 기준이라 그레고리력
  // 날짜가 해마다 바뀐다(성북구 세계음식축제 항목과 같은 방식으로 표기) — 그래서
  // startMonth~endMonth를 2~3월 범위로 두고, 검증 시점 기준(2026년) 실제 날짜는
  // dateLabel에 참고로만 적는다. 뉴스 매체 다수(6곳 이상)가 겹치는 날짜만 채택했다.
  { id: id(), gu: "노원구", category: "festival", name: "정월대보름 한마당", startMonth: 2, endMonth: 3, dateLabel: "음력 정월대보름 무렵(2026: 3.2)", note: "당현천 하류 일대, 낙화놀이·달집태우기 — 음력 기준이라 해마다 날짜가 바뀜", confirmed: true },
  { id: id(), gu: "송파구", category: "festival", name: "정월대보름 행사(송파다리밟기 · 달집태우기)", startMonth: 2, endMonth: 3, dateLabel: "음력 정월대보름 무렵(2026: 3.3)", note: "석촌호수·서울놀이마당, 서울시 무형문화재 — 음력 기준이라 해마다 날짜가 바뀜", confirmed: true },
  { id: id(), gu: "양천구", category: "festival", name: "정월대보름 민속축제", startMonth: 2, endMonth: 3, dateLabel: "음력 정월대보름 무렵(2026: 2.28, 제24회)", note: "안양천 둔치 야구장(신정교 아래), 달집태우기 — 음력 기준이라 해마다 날짜가 바뀜", confirmed: true },
  { id: id(), gu: "종로구", dong: "운니동", category: "festival", name: "운현궁 설맞이", startMonth: 2, endMonth: 2, dateLabel: "설 연휴 무렵(2026: 2.16–18)", note: "운현궁 앞마당, 서울시 주관 — 음력설 기준이라 해마다 날짜가 바뀜", confirmed: true },
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
  { id: id(), gu: "금천구", category: "market", name: "비단길현대시장", note: "약 270개 점포, 금천구 최대", confirmed: true },
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
  { id: id(), gu: "종로구", category: "market", name: "광장시장", note: "100년 상설시장", confirmed: true },
  { id: id(), gu: "종로구", category: "market", name: "통인시장", confirmed: true },
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
  { id: id(), gu: "노원구", category: "flower", name: "중랑천 송정·응봉지구", confirmed: true },
  { id: id(), gu: "노원구", category: "flower", name: "광진장미정원", confirmed: true },
  { id: id(), gu: "도봉구", category: "flower", name: "우이천변 벚꽃길", confirmed: true },
  { id: id(), gu: "도봉구", category: "flower", name: "발바닥공원", confirmed: true },
  { id: id(), gu: "동대문구", category: "flower", name: "청계천 꽃길", confirmed: true },
  { id: id(), gu: "동작구", category: "flower", name: "국립서울현충원 수양벚꽃길", note: "06:00–18:00 개방, 상시 벚꽃놀이 장소는 아님 — 참배 예절 필요", confirmed: true },
  { id: id(), gu: "마포구", category: "flower", name: "난지천공원", note: "난지천길 1.8km(개나리 위주)", confirmed: true },
  { id: id(), gu: "마포구", category: "flower", name: "홍제천", confirmed: true },
  { id: id(), gu: "서대문구", category: "flower", name: "안산 자락길 벚꽃길", note: "약 3,000그루", confirmed: true },
  { id: id(), gu: "서초구", category: "flower", name: "양재천 벚꽃길(서초 구간)", confirmed: true },
  { id: id(), gu: "성동구", category: "flower", name: "서울숲 벚꽃길", note: "포토존 '바람의 언덕'", confirmed: true },
  { id: id(), gu: "성북구", category: "flower", name: "성북천", confirmed: true },
  { id: id(), gu: "송파구", category: "flower", name: "석촌호수 벚꽃길", confirmed: true },
  { id: id(), gu: "양천구", category: "flower", name: "안양천 벚꽃길(양천 구간)", confirmed: true },
  { id: id(), gu: "영등포구", category: "flower", name: "여의서로", confirmed: true },
  { id: id(), gu: "영등포구", category: "flower", name: "여의천 벚꽃길", confirmed: true },
  { id: id(), gu: "용산구", category: "flower", name: "남산", note: "봄꽃길 175선 공식 예시", confirmed: true },
  { id: id(), gu: "은평구", category: "flower", name: "불광천 벚꽃길", note: "응암역 4번 출구~증산역", confirmed: true },
  { id: id(), gu: "종로구", category: "flower", name: "청계천", confirmed: true },
  { id: id(), gu: "중구", category: "flower", name: "남산", confirmed: true },
  { id: id(), gu: "중랑구", category: "flower", name: "사가정공원", confirmed: true },
  { id: id(), gu: "중랑구", category: "flower", name: "중랑천변 벚꽃길", confirmed: true },
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
  { id: id(), gu: "종로구", category: "walk", name: "북촌로", confirmed: true },
  { id: id(), gu: "종로구", category: "walk", name: "삼청동길", confirmed: true },
  { id: id(), gu: "중구", category: "walk", name: "서울로7017", confirmed: true },
  { id: id(), gu: "중구", category: "walk", name: "정동길", confirmed: true },
  { id: id(), gu: "중랑구", category: "walk", name: "망우역사문화공원 '사색의 길'", note: "4.7km", confirmed: true },
];

// ── 05. 둘레길·등산로 (23/25 확인) ─────────────────────────────
export const HIKES: Place[] = [
  { id: id(), gu: "종로구", category: "hike", name: "한양도성 순성길(백악·낙산·인왕 구간)", note: "18.6km, 창의문~혜화문~흥인지문~돈의문 터", confirmed: true },
  { id: id(), gu: "중구", category: "hike", name: "한양도성 순성길(목멱 구간)", confirmed: true },
  { id: id(), gu: "중구", category: "hike", name: "남산둘레길", note: "장충체육관~백범광장, 3.5km 순환", confirmed: true },
  { id: id(), gu: "성북구", category: "hike", name: "서울둘레길 19코스 — 북한산 성북", confirmed: true },
  { id: id(), gu: "강북구", category: "hike", name: "서울둘레길 20코스 — 북한산 강북", confirmed: true },
  // 서울둘레길 코스명은 서울시 공식 코스 목록(gil.seoul.go.kr) 기준으로 나눴다 —
  // 1코스=수락산, 21코스=북한산 도봉으로 이미 공식적으로 서로 다른 코스다.
  { id: id(), gu: "도봉구", category: "hike", name: "서울둘레길 1코스 — 수락산", confirmed: true },
  { id: id(), gu: "도봉구", category: "hike", name: "서울둘레길 21코스 — 북한산 도봉", confirmed: true },
  { id: id(), gu: "노원구", category: "hike", name: "서울둘레길 1~4코스 — 수락산~망우용마산", confirmed: true },
  { id: id(), gu: "중랑구", category: "hike", name: "서울둘레길 4코스 — 망우·용마산", confirmed: true },
  { id: id(), gu: "광진구", category: "hike", name: "서울둘레길 5코스 — 아차산", confirmed: true },
  { id: id(), gu: "강동구", category: "hike", name: "서울둘레길 6코스 — 고덕산", confirmed: true },
  { id: id(), gu: "강동구", category: "hike", name: "서울둘레길 7코스 — 일자산", confirmed: true },
  { id: id(), gu: "송파구", category: "hike", name: "서울둘레길 7코스 — 일자산", confirmed: true },
  { id: id(), gu: "송파구", category: "hike", name: "서울둘레길 8코스 — 장지·탄천", confirmed: true },
  { id: id(), gu: "강남구", category: "hike", name: "서울둘레길 8코스 — 장지·탄천", confirmed: true },
  { id: id(), gu: "강남구", category: "hike", name: "서울둘레길 9코스 — 대모·구룡산", confirmed: true },
  { id: id(), gu: "서초구", category: "hike", name: "서울둘레길 9코스 — 대모·구룡산", confirmed: true },
  { id: id(), gu: "서초구", category: "hike", name: "서울둘레길 10코스 — 우면산", confirmed: true },
  { id: id(), gu: "관악구", category: "hike", name: "서울둘레길 11코스 — 관악산", confirmed: true },
  { id: id(), gu: "동작구", category: "hike", name: "서울둘레길 11코스 — 관악산(사당역 인근)", confirmed: true },
  { id: id(), gu: "금천구", category: "hike", name: "서울둘레길 13코스 — 안양천 상류", confirmed: true },
  { id: id(), gu: "구로구", category: "hike", name: "서울둘레길 13코스 — 안양천 상류", confirmed: true },
  { id: id(), gu: "구로구", category: "hike", name: "서울둘레길 14코스 — 안양천 하류", confirmed: true },
  { id: id(), gu: "영등포구", category: "hike", name: "서울둘레길 14코스 — 안양천 하류", confirmed: true },
  { id: id(), gu: "양천구", category: "hike", name: "서울둘레길 14코스 — 안양천 하류", confirmed: true },
  { id: id(), gu: "강서구", category: "hike", name: "서울둘레길 14코스 종점 — 가양역 인근", confirmed: true },
  { id: id(), gu: "은평구", category: "hike", name: "서울둘레길 16코스 — 봉산·앵봉산", confirmed: true },
  { id: id(), gu: "은평구", category: "hike", name: "서울둘레길 17코스 — 북한산 은평", confirmed: true },
  { id: id(), gu: "서대문구", category: "hike", name: "안산자락길", note: "무장애 둘레길", confirmed: true },
  { id: id(), gu: "성동구", category: "hike", name: "응봉산", note: "95.4m, 팔각정 — 매봉산과 이름 혼용 주의", confirmed: true },
  { id: id(), gu: "용산구", category: "hike", name: "남산둘레길", confirmed: true },
  { id: id(), gu: "동대문구", category: "hike", name: "확인 필요", note: "서울둘레길 미해당 도심 구, 대체 등산로 미확인", confirmed: false },
  { id: id(), gu: "마포구", category: "hike", name: "확인 필요", note: "서울둘레길 미해당 도심 구, 대체 등산로 미확인", confirmed: false },
];

// ── 06. 박물관·미술관 (20/25 확인) ─────────────────────────────
export const MUSEUMS: Place[] = [
  { id: id(), gu: "종로구", category: "museum", name: "국립현대미술관 서울관", note: "서울 최다 56곳", confirmed: true },
  { id: id(), gu: "종로구", category: "museum", name: "딜쿠샤", confirmed: true },
  { id: id(), gu: "종로구", category: "museum", name: "백인제가옥", confirmed: true },
  { id: id(), gu: "중구", category: "museum", name: "서울시립미술관", note: "17곳", confirmed: true },
  { id: id(), gu: "중구", category: "museum", name: "국립현대미술관 덕수궁관", confirmed: true },
  { id: id(), gu: "용산구", category: "museum", name: "국립중앙박물관", confirmed: true },
  { id: id(), gu: "성북구", category: "museum", name: "간송미술관", note: "훈민정음 해례본 소장. 연 2회(5·10월) 특별전시 때만 유료 개방 — 상시 개방 아님", confirmed: true },
  { id: id(), gu: "마포구", category: "museum", name: "근현대디자인박물관", confirmed: true },
  { id: id(), gu: "마포구", category: "museum", name: "대안공간 루프", confirmed: true },
  { id: id(), gu: "마포구", category: "museum", name: "서강대박물관", confirmed: true },
  { id: id(), gu: "강남구", category: "museum", name: "관세박물관", note: "13곳", confirmed: true },
  { id: id(), gu: "강남구", category: "museum", name: "호림박물관 신사분관", confirmed: true },
  { id: id(), gu: "강남구", category: "museum", name: "도산안창호기념관", confirmed: true },
  { id: id(), gu: "송파구", category: "museum", name: "한성백제박물관", note: "11곳, 올림픽공원 인근", confirmed: true },
  { id: id(), gu: "송파구", category: "museum", name: "소마미술관", confirmed: true },
  { id: id(), gu: "금천구", category: "museum", name: "서울시립 서서울미술관", confirmed: true },
  { id: id(), gu: "양천구", category: "museum", name: "오목한미술관", note: "오목공원 내", confirmed: true },
  { id: id(), gu: "강서구", category: "museum", name: "허준박물관", note: "구립, 허준축제(03-1)와 연계", confirmed: true },
  { id: id(), gu: "강동구", category: "museum", name: "강동아트센터 갤러리 그림", confirmed: true },
  { id: id(), gu: "관악구", category: "museum", name: "서울대미술관", note: "렘 쿨하스 설계, 800점 이상 소장", confirmed: true },
  { id: id(), gu: "광진구", category: "museum", name: "서울상상나라", confirmed: true },
  { id: id(), gu: "광진구", category: "museum", name: "건국대박물관", confirmed: true },
  { id: id(), gu: "광진구", category: "museum", name: "세종대박물관", confirmed: true },
  { id: id(), gu: "노원구", category: "museum", name: "육군박물관", note: "태릉, 육군사관학교 내", confirmed: true },
  { id: id(), gu: "도봉구", category: "museum", name: "도봉구청 갤러리", note: "1층 로비, 무료대관 전시", confirmed: true },
  { id: id(), gu: "동대문구", category: "museum", name: "서울약령시한의약박물관", note: "경동시장(03-6) 한약재 거리와 연계", confirmed: true },
  { id: id(), gu: "서대문구", category: "museum", name: "서대문자연사박물관", confirmed: true },
  { id: id(), gu: "서초구", category: "museum", name: "예술의전당 서울서예박물관", note: "1988년, 국내 유일 서예 전문 전시장", confirmed: true },
  { id: id(), gu: "영등포구", category: "museum", name: "문래예술공장(갤러리M30)", note: "서울문화재단 운영", confirmed: true },
  { id: id(), gu: "은평구", category: "museum", name: "은평역사한옥박물관", confirmed: true },
  // 북서울꿈의숲은 이미 산책로(04)에 별도 항목으로 있다 — 미술관 항목에 공원
  // 이름까지 합쳐 두면 지도 검색도 안 되고 두 카테고리에 같은 곳이 겹친다.
  { id: id(), gu: "강북구", category: "museum", name: "강북구립미술관", note: "북서울꿈의숲 내, 인수동", confirmed: true },
  { id: id(), gu: "구로구", category: "museum", name: "구로문화재단 갤러리", note: "항동철길·구로G페스티벌(03-1) 연계", confirmed: true },
  { id: id(), gu: "동작구", category: "museum", name: "국립서울현충원", note: "역사문화 전시 · 참배 시설", confirmed: true },
  { id: id(), gu: "성동구", category: "museum", name: "한양대학교박물관", note: "서울숲(04-2) 인근", confirmed: true },
  { id: id(), gu: "성동구", category: "museum", name: "성동구청 갤러리", confirmed: true },
  // 망우역사문화공원은 이미 산책로(04)에 별도 항목으로 있다 — 위 강북구
  // 항목과 같은 이유로 미술관 항목은 중랑역사문화센터만 남긴다.
  { id: id(), gu: "중랑구", category: "museum", name: "중랑역사문화센터", note: "망우역사문화공원 내, 서울장미축제(03-2) 인근", confirmed: true },
];

const ALL_PLACES_RAW: Place[] = [
  ...FESTIVALS,
  ...MARKETS,
  ...FLOWERS,
  ...WALKS,
  ...HIKES,
  ...MUSEUMS,
];

// scripts/fetch-coords.mjs가 채운 좌표를 덧씌운다 — seed.ts에 이미 직접 박아 둔
// 좌표(현재 5곳)는 그대로 두고, 없는 곳만 coords.json 값으로 채운다.
function withFetchedCoords(p: Place): Place {
  if (p.lat != null && p.lng != null) return p;
  const c = getCoords(p.id);
  return c ? { ...p, lat: c.lat, lng: c.lng } : p;
}

// ── 관광공사 자료와 합치기 (2026-09-01, 사용자 지시 "합치자") ──────────────
//
// 위 185곳은 사람이 25개 구를 직접 조사한 것이고, TOUR_PLACES는 관광공사에서 받은 269곳이다.
// 통째로 갈아엎지 않고 합치는 이유는 칸별로 강한 쪽이 다르기 때문이다 —
// 축제·시장·박물관·골목은 관광공사가 훨씬 많지만, **꽃길은 사람 조사가 30곳 대 2곳**이고
// 등산로(33 대 20)·산책로(27 대 21)도 사람 쪽이 많다. 어느 한쪽을 버리면 그만큼이 사라진다.
//
// 이름이 같은 곳은 10곳뿐이다(185곳의 5%). 그 10곳은 **사람이 적은 항목을 남기고**
// (note·축제 기간처럼 관광공사에 없는 정보가 붙어 있다), 관광공사 쪽에서는
// **사진과 좌표만 가져와 덧입힌다.**
function mergeWithTourPlaces(hand: Place[]): Place[] {
  const used = new Set<string>();
  const merged = hand.map((p) => {
    const t = TOUR_BY_NAME.get(p.name.normalize("NFC"));
    if (!t) return p;
    used.add(t.id);
    return {
      ...p,
      image: p.image ?? t.image,
      thumb: p.thumb ?? t.thumb,
      addr: p.addr ?? t.addr,
      lat: p.lat ?? t.lat,
      lng: p.lng ?? t.lng,
    };
  });
  return [...merged, ...TOUR_PLACES.filter((t) => !used.has(t.id))];
}

// 사람이 직접 찾아 넣은 사진(구청 공공누리 등)을 덧입힌다 — manual-photos.json.
// 관광공사에서 이미 사진을 받은 곳은 그대로 두고, 없는 곳만 채운다.
function withManualPhoto(p: Place): Place {
  if (p.image) return p;
  const m = getManualPhoto(p.id);
  return m ? { ...p, image: m.image, thumb: m.image, photoCredit: m.source } : p;
}

// 🚨 사진 게이트 (사용자 결정 2026-09-01: "사진 없는장소 일단 가리기 앱에 안보이게",
// "이미지 채운 것은 보임으로").
//
// 사진이 없다는 건 대체로 덜 알려진 곳이라는 뜻이고, 목록에서 자리만 차지한다.
// 그래서 **사진이 있는 곳만 화면에 내보낸다.** 자료를 지우는 게 아니라 가리는 것이라,
// manual-photos.json에 사진을 한 줄 넣는 순간 그 곳은 다시 나타난다.
//
// ⚠️ 지금은 이 게이트로 443곳 중 179곳이 가려진다. 특히 **꽃길이 32곳 → 2곳**으로
// 준다(사람이 조사한 25개 구 꽃길에 사진이 없어서다). 하루 3곳씩 채우는 작업에서
// 꽃길을 먼저 채우면 열흘이면 되살아난다 — docs가 아니라 여기 적어 두는 이유는,
// 다음 세션이 "꽃길 탭이 왜 비었지?" 하고 자료가 없어진 줄 오해하지 않게 하기 위해서다.
function hasPhoto(p: Place): boolean {
  return Boolean(p.image ?? p.thumb);
}

// 출시 범위 게이트(launchScope.ts) — 서울 외 지역이 seed.ts에 섞여 들어와도
// LAUNCH_REGIONS를 넓히기 전까지는 화면에 노출되지 않는다.
export const ALL_PLACES: Place[] = mergeWithTourPlaces(ALL_PLACES_RAW)
  .filter((p) => isInLaunchScope(sidoOf(p.gu)))
  .map(withFetchedCoords)
  .map(withManualPhoto)
  .filter(hasPhoto);

/** 사진이 없어 지금 가려져 있는 곳. 하루 3곳 채우기 작업의 대상 목록이다. */
export const HIDDEN_NO_PHOTO: Place[] = mergeWithTourPlaces(ALL_PLACES_RAW)
  .filter((p) => isInLaunchScope(sidoOf(p.gu)))
  .map(withManualPhoto)
  .filter((p) => !hasPhoto(p));

/**
 * 계절 화면(「봄 여름 가을 겨울 그리고 서울」)이 쓰는 축제 전체.
 *
 * 🚨 여기에는 **사진 게이트를 걸지 않는다** — 위 ALL_PLACES와 다른 점이다.
 * 사진 없는 곳을 가리기로 한 것은(2026-09-01) 장소 카드 이야기였다. 거기서는
 * 사진이 없으면 빈 상자가 남지만, 축제 카드는 사진이 없으면 **계절 일러스트**
 * (SeasonArt)가 대신 그려져 빈 자리가 안 생긴다.
 * 게다가 사진이 있는 축제는 관광공사에서 온 57곳뿐이고 그게 전부 9~12월이라,
 * 게이트를 걸면 **봄·여름이 통째로 비어 버린다**(2월 4곳·4월 3곳·5월 4곳이 전부
 * 사람이 조사한 것이다).
 *
 * 예전에는 이 화면이 seed.ts의 FESTIVALS 33곳만 봤다. 관광공사 축제 57곳은
 * ALL_PLACES 안에 들어 있었는데 어느 화면도 안 그려서 **통째로 안 보이고 있었다.**
 */
export const ALL_FESTIVALS: Place[] = (() => {
  // ⚠️ 위의 mergeWithTourPlaces를 그대로 쓰면 안 된다 — 그 함수는 안 쓰인 관광공사
  // 자료를 **전부**(시장·박물관·골목까지) 뒤에 붙인다. 여기서는 축제만 골라 합친다.
  const tourFestivals = TOUR_PLACES.filter((p) => p.category === "festival");
  const byName = new Map(tourFestivals.map((p) => [p.name.normalize("NFC"), p]));
  const used = new Set<string>();
  const merged = FESTIVALS.map((p) => {
    const t = byName.get(p.name.normalize("NFC"));
    if (!t) return p;
    used.add(t.id);
    // 사람이 적은 값이 이긴다 — note·기간처럼 관광공사에 없는 것이 붙어 있고,
    // 달도 사람이 근거를 확인해 적은 것이다. 관광공사에서는 빈 칸만 채워 온다.
    return {
      ...p,
      image: p.image ?? t.image,
      thumb: p.thumb ?? t.thumb,
      addr: p.addr ?? t.addr,
      lat: p.lat ?? t.lat,
      lng: p.lng ?? t.lng,
      startMonth: p.startMonth ?? t.startMonth,
      endMonth: p.endMonth ?? t.endMonth,
      period: p.period ?? t.period,
    };
  });
  return [...merged, ...tourFestivals.filter((t) => !used.has(t.id))];
})()
  .filter((p) => isInLaunchScope(sidoOf(p.gu)))
  .map(withFetchedCoords)
  .map(withManualPhoto);

export const CATEGORY_META: Record<
  Category,
  { label: string; icon: string; iconImage?: string; color: string }
> = {
  festival: { label: "축제", icon: "🎪", color: "var(--festival)" },
  market: { label: "시장", icon: "🏮", iconImage: "icons/categories/market.png", color: "var(--market)" },
  flower: { label: "꽃길", icon: "🌸", iconImage: "icons/categories/flower.png", color: "var(--flower)" },
  walk: { label: "산책로", icon: "🚶", iconImage: "icons/categories/walk.png", color: "var(--walk)" },
  hike: { label: "둘레길", icon: "🥾", iconImage: "icons/categories/hike.png", color: "var(--hike)" },
  museum: { label: "박물관", icon: "🏛", iconImage: "icons/categories/museum.png", color: "var(--museum)" },
  // 전용 아이콘 이미지는 아직 없다 — 만들기 전까지 이모지로 둔다(icons/categories/ 참고).
  street: { label: "골목·거리", icon: "🍢", color: "var(--street)" },
};
