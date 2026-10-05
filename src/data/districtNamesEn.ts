// 구·동 이름의 언어별 표기. 아직 개별 번역이 없는 대부분의 언어는 로마자
// 표기(국립국어원 기준)를 공통 폴백으로 쓴다(2026-08-28: 언어를 English로
// 바꿔도 구 이름만 한국어로 남아 있던 문제) — Kfood(dongne-hanip)의
// "번역이 없으면 영어로 대신 보여준다"는 방식과 같다.
//
// 일본어는 예외로 둔다(2026-08-28 사용자 지적: "일본어 선택해도 여긴
// 영어인데 맞나") — 서울 자치구 이름은 전부 한자어라 실제 일본 여행
// 자료·일본어 위키백과가 로마자가 아니라 한자 표기(예: 종로구 → 鍾路区)를
// 그대로 쓴다. 지어낸 게 아니라 그 표기를 그대로 옮긴 것이다.
// 🌊 **부산 16개 구·군** (2026-09-16에 넣었다).
//
//   🪪 근거 — 지어낸 것이 아니다.
//     · 로마자 = 국립국어원 로마자 표기(해운대구 = Haeundae-gu). 부산시 공식
//       영문 표기와 같고, 지하철·도로 안내판에 실제로 쓰는 말이다.
//     · 한자   = 그 구의 **공식 한자**(해운대구 = 海雲臺區). 일본어는 신자체로,
//       중국어 번체는 정체자로, 간체는 표준 간화자로 적는다 — 서울 25개 구에
//       쓴 것과 **같은 규칙**이다.
//
//   ⚠️ 「중구」와 「강서구」는 **서울에도 부산에도 있다.** 표기가 서로 같아
//      한 표에 담아도 부딪히지 않는다(中区 · 江西区). 그래서 서울 표 뒤에
//      그대로 이어 붙인다 — 도시별로 표를 나누면 같은 값을 두 번 적게 되고,
//      한쪽만 고치는 사고가 난다.
// 🪪 **시·군·구 한자 표기는 관광공사에서 받아 온다** (2026-10-01).
//
//   일곱 도시를 열면서 새 시·군 63곳이 들어왔다. 손으로 한자를 적을 수는 없다 —
//   「경주시=慶州市」는 알아도 「횡성군·장수군·임실군」까지 62곳을 외워 적으면
//   한둘은 틀린다. 그래서 **관광공사가 언어별로 내는 지역 목록**을 받아 둔다.
//   받는 법은 scripts/fetch-district-names.mjs 머리말에 있다(시군구 코드로 이어 붙인다).
//
//   🚨 **순서가 규칙이다** — 받아 온 것을 먼저 깔고, **손으로 확인한 것을 그 위에 덮는다.**
//      서울·부산 구 이름은 눈으로 맞춰 둔 것이라(아래 「근거」 주석) 기계보다 세다.
//      뒤집으면 확인해 둔 값이 되돌아간다. translate-places 의 save() 와 같은 순서다.
import DISTRICT_CJK from "./district-names-cjk.json";

const CJK = (DISTRICT_CJK as { 이름?: Record<string, Record<string, string>> })["이름"] ?? {};

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
  // 🌊 부산 (중구·강서구는 서울과 표기가 같아 위에 이미 있다)
  "서구": "Seo-gu", "동구": "Dong-gu", "영도구": "Yeongdo-gu",
  "부산진구": "Busanjin-gu", "동래구": "Dongnae-gu", "남구": "Nam-gu",
  "북구": "Buk-gu", "해운대구": "Haeundae-gu", "사하구": "Saha-gu",
  "금정구": "Geumjeong-gu", "연제구": "Yeonje-gu", "수영구": "Suyeong-gu",
  "사상구": "Sasang-gu", "기장군": "Gijang-gun",
  // 🏙️ **2026-10-01에 연 일곱 곳** — 제주·광주·대구·대전·경북·전북·강원 (75곳 중 새 이름 62개).
  //    🪪 로마자는 **국립국어원 표기**다. 지어낸 것이 아니라 규칙으로 정해지는 값이고,
  //       고속도로 안내판·KTX 역 이름에 그대로 쓰는 말이다.
  //    ⏳ **한자는 아직 안 넣었다.** 넣으려면 시·군마다 공식 한자를 확인해야 하는데
  //       (서울·부산은 그렇게 넣었다), 62곳을 확인 없이 적으면 틀린 글자가 섞인다.
  //       그때까지 일본어·중국어 화면에는 **이 로마자가 대신 나온다**(아래 폴백).
  //       빈 칸이 틀린 글자보다 낫다.
  "제주시": "Jeju-si",
  "서귀포시": "Seogwipo-si",
  "광산구": "Gwangsan-gu",
  "수성구": "Suseong-gu",
  "달서구": "Dalseo-gu",
  "달성군": "Dalseong-gun",
  "군위군": "Gunwi-gun",
  "유성구": "Yuseong-gu",
  "대덕구": "Daedeok-gu",
  "포항시": "Pohang-si",
  "경주시": "Gyeongju-si",
  "김천시": "Gimcheon-si",
  "안동시": "Andong-si",
  "구미시": "Gumi-si",
  "영주시": "Yeongju-si",
  "영천시": "Yeongcheon-si",
  "상주시": "Sangju-si",
  "문경시": "Mungyeong-si",
  "경산시": "Gyeongsan-si",
  "의성군": "Uiseong-gun",
  "청송군": "Cheongsong-gun",
  "영양군": "Yeongyang-gun",
  "영덕군": "Yeongdeok-gun",
  "청도군": "Cheongdo-gun",
  "고령군": "Goryeong-gun",
  "성주군": "Seongju-gun",
  "칠곡군": "Chilgok-gun",
  "예천군": "Yecheon-gun",
  "봉화군": "Bonghwa-gun",
  "울진군": "Uljin-gun",
  "울릉군": "Ulleung-gun",
  "전주시": "Jeonju-si",
  "군산시": "Gunsan-si",
  "익산시": "Iksan-si",
  "정읍시": "Jeongeup-si",
  "남원시": "Namwon-si",
  "김제시": "Gimje-si",
  "완주군": "Wanju-gun",
  "진안군": "Jinan-gun",
  "무주군": "Muju-gun",
  "장수군": "Jangsu-gun",
  "임실군": "Imsil-gun",
  "순창군": "Sunchang-gun",
  "고창군": "Gochang-gun",
  "부안군": "Buan-gun",
  "춘천시": "Chuncheon-si",
  "원주시": "Wonju-si",
  "강릉시": "Gangneung-si",
  "동해시": "Donghae-si",
  "태백시": "Taebaek-si",
  "속초시": "Sokcho-si",
  "삼척시": "Samcheok-si",
  "홍천군": "Hongcheon-gun",
  "횡성군": "Hoengseong-gun",
  "영월군": "Yeongwol-gun",
  "평창군": "Pyeongchang-gun",
  "정선군": "Jeongseon-gun",
  "철원군": "Cheorwon-gun",
  "화천군": "Hwacheon-gun",
  "양구군": "Yanggu-gun",
  "인제군": "Inje-gun",
  "고성군": "Goseong-gun",
  "양양군": "Yangyang-gun",

  // ── 🆕 2026-10-05에 연 여덟 시·도 (105곳) ────────────────────────────
  //   로마자는 **국립국어원 표기** 그대로다. 지어낸 것이 아니라 도로 표지판과
  //   역 안내에 실제로 쓰는 말이다.
  //   🚨 **영어 이름이 하나도 안 겹치는 것을 세어 확인했다** — 겹치면 주소의
  //      `?gu=…` 로 동네를 되찾을 때 엉뚱한 곳이 나온다(startParams.ts).
  // 🛳️ 인천 11곳 — 2026-10-05. 중구·동구·서구가 아니라 **제물포구·영종구·서해구·검단구**다
  //    (인천이 행정구역을 새로 짰다. cities.ts 의 인천 주석 참고).
  "제물포구": "Jemulpo-gu", "영종구": "Yeongjong-gu", "미추홀구": "Michuhol-gu",
  "연수구": "Yeonsu-gu", "남동구": "Namdong-gu", "부평구": "Bupyeong-gu",
  "계양구": "Gyeyang-gu", "서해구": "Seohae-gu", "검단구": "Geomdan-gu",
  "강화군": "Ganghwa-gun", "옹진군": "Ongjin-gun",
  // 🏭 울산 — 중구·남구·동구·북구는 다른 도시에 이미 있다. 울주군만 새것이다.
  "울주군": "Ulju-gun",
  // 🏛️ 세종 12곳 — **시·군·구가 없어 읍·면·동이다.** 그래서 접미사가 -eup/-myeon/-dong 이다.
  "조치원읍": "Jochiwon-eup", "연기면": "Yeongi-myeon", "연동면": "Yeondong-myeon",
  "부강면": "Bugang-myeon", "금남면": "Geumnam-myeon", "장군면": "Janggun-myeon",
  "연서면": "Yeonseo-myeon", "전의면": "Jeonui-myeon", "전동면": "Jeondong-myeon",
  "소정면": "Sojeong-myeon", "세종동": "Sejong-dong", "대평동": "Daepyeong-dong",
  // 🏙️ 경기 31곳
  "수원시": "Suwon-si", "성남시": "Seongnam-si", "의정부시": "Uijeongbu-si",
  "안양시": "Anyang-si", "부천시": "Bucheon-si", "광명시": "Gwangmyeong-si",
  "평택시": "Pyeongtaek-si", "동두천시": "Dongducheon-si", "안산시": "Ansan-si",
  "고양시": "Goyang-si", "과천시": "Gwacheon-si", "구리시": "Guri-si",
  "남양주시": "Namyangju-si", "오산시": "Osan-si", "시흥시": "Siheung-si",
  "군포시": "Gunpo-si", "의왕시": "Uiwang-si", "하남시": "Hanam-si",
  "용인시": "Yongin-si", "파주시": "Paju-si", "이천시": "Icheon-si",
  "안성시": "Anseong-si", "김포시": "Gimpo-si", "화성시": "Hwaseong-si",
  "광주시": "Gwangju-si", "양주시": "Yangju-si", "포천시": "Pocheon-si",
  "여주시": "Yeoju-si", "연천군": "Yeoncheon-gun", "가평군": "Gapyeong-gun",
  "양평군": "Yangpyeong-gun",
  // 🏞️ 충북 11곳
  "청주시": "Cheongju-si", "충주시": "Chungju-si", "제천시": "Jecheon-si",
  "보은군": "Boeun-gun", "옥천군": "Okcheon-gun", "영동군": "Yeongdong-gun",
  "증평군": "Jeungpyeong-gun", "진천군": "Jincheon-gun", "괴산군": "Goesan-gun",
  "음성군": "Eumseong-gun", "단양군": "Danyang-gun",
  // ⛰️ 경남 17곳 — 마산시·진해시는 **2010년에 창원시로 합쳐졌다.** 안 적는다.
  "창원시": "Changwon-si", "진주시": "Jinju-si", "통영시": "Tongyeong-si",
  "사천시": "Sacheon-si", "김해시": "Gimhae-si", "밀양시": "Miryang-si",
  "거제시": "Geoje-si", "양산시": "Yangsan-si", "의령군": "Uiryeong-gun",
  "함안군": "Haman-gun", "창녕군": "Changnyeong-gun", "남해군": "Namhae-gun",
  "하동군": "Hadong-gun", "산청군": "Sancheong-gun", "함양군": "Hamyang-gun",
  "거창군": "Geochang-gun", "합천군": "Hapcheon-gun",
  // 🏖️ **충남 15곳** (2026-10-05)
  "천안시": "Cheonan-si", "공주시": "Gongju-si", "보령시": "Boryeong-si",
  "아산시": "Asan-si", "서산시": "Seosan-si", "논산시": "Nonsan-si",
  "계룡시": "Gyeryong-si", "당진시": "Dangjin-si", "금산군": "Geumsan-gun",
  "부여군": "Buyeo-gun", "서천군": "Seocheon-gun", "청양군": "Cheongyang-gun",
  "홍성군": "Hongseong-gun", "예산군": "Yesan-gun", "태안군": "Taean-gun",
  // 🌊 전남 22곳 — 고성군(경남)과 달리 여기 **고흥군**이다. 비슷한 이름을 헷갈리지 말 것.
  "목포시": "Mokpo-si", "여수시": "Yeosu-si", "순천시": "Suncheon-si",
  "나주시": "Naju-si", "광양시": "Gwangyang-si", "담양군": "Damyang-gun",
  "곡성군": "Gokseong-gun", "구례군": "Gurye-gun", "고흥군": "Goheung-gun",
  "보성군": "Boseong-gun", "화순군": "Hwasun-gun", "장흥군": "Jangheung-gun",
  "강진군": "Gangjin-gun", "해남군": "Haenam-gun", "영암군": "Yeongam-gun",
  "무안군": "Muan-gun", "함평군": "Hampyeong-gun", "영광군": "Yeonggwang-gun",
  "장성군": "Jangseong-gun", "완도군": "Wando-gun", "진도군": "Jindo-gun",
  "신안군": "Sinan-gun",
};

export const DISTRICT_NAME_JA: Record<string, string> = {
  ...(CJK["ja"] ?? {}),   // 관광공사 — 아래 손으로 확인한 것이 이 위를 덮는다
  "종로구": "鍾路区", "중구": "中区", "용산구": "龍山区",
  "성동구": "城東区", "광진구": "広津区", "동대문구": "東大門区",
  "중랑구": "中浪区", "성북구": "城北区", "강북구": "江北区",
  "도봉구": "道峰区", "노원구": "蘆原区", "은평구": "恩平区",
  "서대문구": "西大門区", "마포구": "麻浦区", "양천구": "陽川区",
  "강서구": "江西区", "구로구": "九老区", "금천구": "衿川区",
  "영등포구": "永登浦区", "동작구": "銅雀区", "관악구": "冠岳区",
  "서초구": "瑞草区", "강남구": "江南区", "송파구": "松坡区",
  "강동구": "江東区",
  // 🌊 부산 (中区·江西区는 서울과 같아 위에 이미 있다)
  "서구": "西区", "동구": "東区", "영도구": "影島区",
  "부산진구": "釜山鎮区", "동래구": "東莱区", "남구": "南区",
  "북구": "北区", "해운대구": "海雲台区", "사하구": "沙下区",
  "금정구": "金井区", "연제구": "蓮堤区", "수영구": "水営区",
  "사상구": "沙上区", "기장군": "機張郡",
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
  ...(CJK["zh-TW"] ?? {}),   // 관광공사 — 아래 손으로 확인한 것이 이 위를 덮는다
  "종로구": "鍾路區", "중구": "中區", "용산구": "龍山區",
  "성동구": "城東區", "광진구": "廣津區", "동대문구": "東大門區",
  "중랑구": "中浪區", "성북구": "城北區", "강북구": "江北區",
  "도봉구": "道峰區", "노원구": "蘆原區", "은평구": "恩平區",
  "서대문구": "西大門區", "마포구": "麻浦區", "양천구": "陽川區",
  "강서구": "江西區", "구로구": "九老區", "금천구": "衿川區",
  "영등포구": "永登浦區", "동작구": "銅雀區", "관악구": "冠岳區",
  "서초구": "瑞草區", "강남구": "江南區", "송파구": "松坡區",
  "강동구": "江東區",
  // 🌊 부산 (中區·江西區는 서울과 같아 위에 이미 있다)
  "서구": "西區", "동구": "東區", "영도구": "影島區",
  "부산진구": "釜山鎮區", "동래구": "東萊區", "남구": "南區",
  "북구": "北區", "해운대구": "海雲臺區", "사하구": "沙下區",
  "금정구": "金井區", "연제구": "蓮堤區", "수영구": "水營區",
  "사상구": "沙上區", "기장군": "機張郡",
};

export const DISTRICT_NAME_ZH: Record<string, string> = {
  ...(CJK["zh"] ?? {}),   // 관광공사 — 아래 손으로 확인한 것이 이 위를 덮는다
  "종로구": "钟路区", "중구": "中区", "용산구": "龙山区",
  "성동구": "城东区", "광진구": "广津区", "동대문구": "东大门区",
  "중랑구": "中浪区", "성북구": "城北区", "강북구": "江北区",
  "도봉구": "道峰区", "노원구": "芦原区", "은평구": "恩平区",
  "서대문구": "西大门区", "마포구": "麻浦区", "양천구": "阳川区",
  "강서구": "江西区", "구로구": "九老区", "금천구": "衿川区",
  "영등포구": "永登浦区", "동작구": "铜雀区", "관악구": "冠岳区",
  "서초구": "瑞草区", "강남구": "江南区", "송파구": "松坡区",
  "강동구": "江东区",
  // 🌊 부산 (中区·江西区는 서울과 같아 위에 이미 있다)
  "서구": "西区", "동구": "东区", "영도구": "影岛区",
  "부산진구": "釜山镇区", "동래구": "东莱区", "남구": "南区",
  "북구": "北区", "해운대구": "海云台区", "사하구": "沙下区",
  "금정구": "金井区", "연제구": "莲堤区", "수영구": "水营区",
  "사상구": "沙上区", "기장군": "机张郡",
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
