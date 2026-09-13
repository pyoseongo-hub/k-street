//#region src/config/launchScope.ts
var LAUNCH_REGIONS = ["서울"];
function isInLaunchScope(sido) {
	return LAUNCH_REGIONS.includes(sido);
}
//#endregion
//#region src/data/districts.ts
var SEOUL_DISTRICTS = [
	"종로구",
	"중구",
	"용산구",
	"성동구",
	"광진구",
	"동대문구",
	"중랑구",
	"성북구",
	"강북구",
	"도봉구",
	"노원구",
	"은평구",
	"서대문구",
	"마포구",
	"양천구",
	"강서구",
	"구로구",
	"금천구",
	"영등포구",
	"동작구",
	"관악구",
	"서초구",
	"강남구",
	"송파구",
	"강동구"
];
function sidoOf(gu) {
	if (SEOUL_DISTRICTS.includes(gu)) return "서울";
	return "미확인";
}
//#endregion
//#region src/lib/coords.ts
var COORDS = {
	ks_2: {
		"lat": 37.5605464139303,
		"lng": 127.130257802123,
		"source": "kakao+naver",
		"matchedName": "강동선사문화축제",
		"for": "강동선사문화축제"
	},
	ks_5: {
		"lat": 37.47215523409015,
		"lng": 126.95931754074891,
		"source": "kakao",
		"matchedName": "관악강감찬축제",
		"for": "관악강감찬축제"
	},
	ks_7: {
		"lat": 37.4994597699782,
		"lng": 126.870852611389,
		"source": "kakao+naver",
		"matchedName": "구로G페스티벌",
		"for": "구로G페스티벌"
	},
	ks_8: {
		"lat": 37.4564517676336,
		"lng": 126.89529456752109,
		"source": "kakao+naver",
		"matchedName": "금천하모니축제",
		"for": "금천하모니축제"
	},
	ks_b: {
		"lat": 37.5693012458811,
		"lng": 127.069818250445,
		"source": "kakao+naver",
		"matchedName": "2026 동대문페스티벌",
		"for": "동대문페스티벌"
	},
	ks_g: {
		"lat": 37.5443222301513,
		"lng": 127.037617759165,
		"source": "kakao+naver",
		"matchedName": "서울숲",
		"for": "서울숲 JAZZ페스티벌"
	},
	ks_p: {
		"lat": 37.595983411417976,
		"lng": 126.91527212642877,
		"source": "kakao+naver",
		"matchedName": "은평누리축제",
		"for": "은평누리축제"
	},
	ks_t: {
		"lat": 37.5076807262772,
		"lng": 127.099112837006,
		"source": "kakao",
		"matchedName": "석촌호수 서호",
		"for": "석촌호수 호수벚꽃축제"
	},
	ks_y: {
		"lat": 37.509885050791176,
		"lng": 127.02366486128717,
		"source": "kakao+naver",
		"matchedName": "영동전통시장",
		"for": "영동전통시장"
	},
	ks_z: {
		"lat": 37.5508604719985,
		"lng": 127.128819574465,
		"source": "kakao+naver",
		"matchedName": "암사종합시장",
		"for": "암사종합시장"
	},
	ks_10: {
		"lat": 37.6307995708701,
		"lng": 127.023445986404,
		"source": "kakao+naver",
		"matchedName": "수유전통시장",
		"for": "수유전통시장"
	},
	ks_11: {
		"lat": 37.5432550860872,
		"lng": 126.843533944782,
		"source": "kakao+naver",
		"matchedName": "화곡본동시장",
		"for": "화곡본동시장"
	},
	ks_12: {
		"lat": 37.4825831435359,
		"lng": 126.926766602033,
		"source": "kakao+naver",
		"matchedName": "신원시장",
		"for": "신원시장"
	},
	ks_13: {
		"lat": 37.563918547280025,
		"lng": 127.08131407116785,
		"source": "kakao+naver",
		"matchedName": "중곡제일시장",
		"for": "중곡제일시장"
	},
	ks_14: {
		"lat": 37.4896296933168,
		"lng": 126.885620029839,
		"source": "kakao+naver",
		"matchedName": "구로시장",
		"for": "구로시장"
	},
	ks_15: {
		"lat": 37.4577266926762,
		"lng": 126.90487738542274,
		"source": "kakao+naver",
		"matchedName": "비단길현대시장",
		"for": "비단길현대시장"
	},
	ks_16: {
		"lat": 37.62223342424176,
		"lng": 127.0759131838009,
		"source": "kakao+naver",
		"matchedName": "공릉동도깨비시장",
		"for": "공릉동도깨비시장"
	},
	ks_18: {
		"lat": 37.579039740933176,
		"lng": 127.03943411053307,
		"source": "kakao",
		"matchedName": "경동시장",
		"for": "경동시장"
	},
	ks_1a: {
		"lat": 37.555885964724716,
		"lng": 126.90626589039096,
		"source": "kakao+naver",
		"matchedName": "망원시장",
		"for": "망원시장"
	},
	ks_1b: {
		"lat": 37.59093296706887,
		"lng": 126.94317699687126,
		"source": "kakao+naver",
		"matchedName": "인왕시장",
		"for": "인왕시장"
	},
	ks_1d: {
		"lat": 37.57068418982381,
		"lng": 127.04127141025155,
		"source": "kakao+naver",
		"matchedName": "마장축산물시장",
		"for": "마장축산물시장"
	},
	ks_1e: {
		"lat": 37.60840566256222,
		"lng": 127.00951216588793,
		"source": "kakao+naver",
		"matchedName": "정릉시장",
		"for": "정릉시장"
	},
	ks_1f: {
		"lat": 37.4938884413034,
		"lng": 127.110927336635,
		"source": "kakao",
		"matchedName": "가락시장",
		"for": "가락시장"
	},
	ks_1g: {
		"lat": 37.521299011452,
		"lng": 126.876570609796,
		"source": "kakao+naver",
		"matchedName": "오목교중앙시장",
		"for": "오목교중앙시장"
	},
	ks_1k: {
		"lat": 37.57005529646949,
		"lng": 126.99894728223626,
		"source": "kakao+naver",
		"matchedName": "광장시장",
		"for": "광장시장"
	},
	ks_1m: {
		"lat": 37.55918176072071,
		"lng": 126.9776267740439,
		"source": "kakao+naver",
		"matchedName": "남대문시장",
		"for": "남대문시장"
	},
	ks_1n: {
		"lat": 37.5970099681642,
		"lng": 127.098252841871,
		"source": "kakao+naver",
		"matchedName": "우림시장",
		"for": "우림시장"
	},
	ks_1o: {
		"lat": 37.4818037639471,
		"lng": 127.046595188917,
		"source": "kakao",
		"matchedName": "양재천",
		"for": "양재천 벚꽃길(강남 구간)"
	},
	ks_1r: {
		"lat": 37.5693958477101,
		"lng": 126.835037244018,
		"source": "kakao+naver",
		"matchedName": "서울식물원",
		"for": "서울식물원"
	},
	ks_1s: {
		"lat": 37.4717760936514,
		"lng": 126.933822240006,
		"source": "kakao+naver",
		"matchedName": "도림천",
		"for": "도림천 벚꽃길"
	},
	ks_1t: {
		"lat": 37.5499772549675,
		"lng": 127.080235171998,
		"source": "kakao+naver",
		"matchedName": "서울어린이대공원",
		"for": "서울어린이대공원 벚꽃길"
	},
	ks_1u: {
		"lat": 37.5092339002167,
		"lng": 126.874219829815,
		"source": "kakao",
		"matchedName": "안양천",
		"for": "안양천 벚꽃길(구로 구간)"
	},
	ks_1v: {
		"lat": 37.4549899165436,
		"lng": 126.892828210117,
		"source": "kakao+naver",
		"matchedName": "안양천",
		"for": "안양천 벚꽃 뚝방길"
	},
	ks_1w: {
		"lat": 37.6674832700593,
		"lng": 127.049231777697,
		"source": "kakao",
		"matchedName": "중랑천",
		"for": "중랑천 송정·응봉지구"
	},
	ks_20: {
		"lat": 37.5691469686793,
		"lng": 126.978647068151,
		"source": "kakao+naver",
		"matchedName": "청계천",
		"for": "청계천 꽃길"
	},
	ks_21: {
		"lat": 37.50255501820018,
		"lng": 126.97462182443368,
		"source": "kakao+naver",
		"matchedName": "국립서울현충원",
		"for": "국립서울현충원 수양벚꽃길"
	},
	ks_22: {
		"lat": 37.57213335842017,
		"lng": 126.88740136782069,
		"source": "kakao+naver",
		"matchedName": "난지천공원",
		"for": "난지천공원"
	},
	ks_25: {
		"lat": 37.4818037639471,
		"lng": 127.046595188917,
		"source": "kakao",
		"matchedName": "양재천",
		"for": "양재천 벚꽃길(서초 구간)"
	},
	ks_26: {
		"lat": 37.5443222301513,
		"lng": 127.037617759165,
		"source": "kakao+naver",
		"matchedName": "서울숲",
		"for": "서울숲 벚꽃길"
	},
	ks_27: {
		"lat": 37.5896369994549,
		"lng": 127.010901313346,
		"source": "kakao",
		"matchedName": "성북천",
		"for": "성북천"
	},
	ks_28: {
		"lat": 37.5076807262772,
		"lng": 127.099112837006,
		"source": "kakao",
		"matchedName": "석촌호수 서호",
		"for": "석촌호수 벚꽃길"
	},
	ks_29: {
		"lat": 37.5092339002167,
		"lng": 126.874219829815,
		"source": "kakao",
		"matchedName": "안양천",
		"for": "안양천 벚꽃길(양천 구간)"
	},
	ks_2d: {
		"lat": 37.5800209041095,
		"lng": 126.906234509821,
		"source": "kakao",
		"matchedName": "불광천",
		"for": "불광천 벚꽃길"
	},
	ks_2e: {
		"lat": 37.5691469686793,
		"lng": 126.978647068151,
		"source": "kakao+naver",
		"matchedName": "청계천",
		"for": "청계천"
	},
	ks_2f: {
		"lat": 37.5524979951415,
		"lng": 126.989316855952,
		"source": "kakao+naver",
		"matchedName": "남산공원",
		"for": "남산"
	},
	ks_2g: {
		"lat": 37.5797811776291,
		"lng": 127.096083733232,
		"source": "kakao+naver",
		"matchedName": "사가정공원",
		"for": "사가정공원"
	},
	ks_2i: {
		"lat": 37.52455769460598,
		"lng": 127.03528760485077,
		"source": "kakao+naver",
		"matchedName": "도산근린공원",
		"for": "도산근린공원"
	},
	ks_2j: {
		"lat": 37.57031028608262,
		"lng": 127.15640943958527,
		"source": "kakao+naver",
		"matchedName": "서울테마산책길 고덕 자갈길",
		"for": "고덕 자갈길"
	},
	ks_2k: {
		"lat": 37.62360650548208,
		"lng": 127.04157251496886,
		"source": "kakao+naver",
		"matchedName": "북서울꿈의숲",
		"for": "북서울꿈의숲"
	},
	ks_2l: {
		"lat": 37.5738000661701,
		"lng": 126.839068805614,
		"source": "kakao+naver",
		"matchedName": "궁산근린공원",
		"for": "궁산근린공원"
	},
	ks_2m: {
		"lat": 37.471296925982,
		"lng": 126.960361423801,
		"source": "kakao+naver",
		"matchedName": "낙성대공원",
		"for": "낙성대공원 산책로"
	},
	ks_2n: {
		"lat": 37.5292974433415,
		"lng": 127.06892112991,
		"source": "kakao+naver",
		"matchedName": "뚝섬한강공원",
		"for": "뚝섬한강공원 산책로"
	},
	ks_3: {
		"lat": 37.648576279141,
		"lng": 127.007655529176,
		"source": "kakao+naver",
		"matchedName": "국립4.19민주묘지",
		"venueFor": "4·19혁명 국민문화제",
		"venueWhy": "국립4·19민주묘지 일대 — 강북구 보도자료, 헤럴드경제",
		"for": "4·19혁명 국민문화제"
	},
	ks_4: {
		"lat": 37.5678799742891,
		"lng": 126.850998403189,
		"source": "kakao+naver",
		"matchedName": "허준박물관",
		"venueFor": "허준축제",
		"venueWhy": "가양동 허준근린공원·허준박물관·허준테마거리 일대 — 강서구 문화관광",
		"for": "허준축제"
	},
	ks_6: {
		"lat": 37.5292974433415,
		"lng": 127.06892112991,
		"source": "kakao+naver",
		"matchedName": "뚝섬한강공원",
		"venueFor": "광진뮤직페스타",
		"venueWhy": "뚝섬한강공원(자양역 2·3번 출구 일대) — 광진구 보도자료, 헤럴드경제·시정일보",
		"for": "광진뮤직페스타"
	},
	ks_9: {
		"lat": 37.6563403513278,
		"lng": 127.063449137455,
		"source": "kakao+naver",
		"matchedName": "노원역 4호선",
		"venueFor": "댄싱노원 거리페스티벌",
		"venueWhy": "노원역(KB국민은행 사거리) 일원 — 노원문화재단, 서울문화포털",
		"for": "댄싱노원 거리페스티벌"
	},
	ks_a: {
		"lat": 37.6686914100331,
		"lng": 127.04721049936,
		"source": "kakao+naver",
		"matchedName": "도봉구청",
		"venueFor": "도봉별빛축제",
		"venueWhy": "중랑천(도봉구청~세월교 540m) — 도봉구 문화관광, 아시아경제",
		"for": "도봉별빛축제"
	},
	ks_c: {
		"lat": 37.514766187527776,
		"lng": 126.93777601640095,
		"source": "kakao+naver",
		"matchedName": "노량진수산물도매시장",
		"venueFor": "도심 속 바다축제",
		"venueWhy": "노량진수산시장(축구장·야구장) — 동작구 보도자료, 디지털동작문화대전. 지도에는 '노량진수산시장'이라는 이름이 없고 '노량진수산시장성당'이 먼저 잡혀서(2026-09-02), 정식 명칭과 역을 후보로 함께 둔다",
		"for": "도심 속 바다축제"
	},
	ks_d: {
		"lat": 37.550813816795745,
		"lng": 126.91649455618185,
		"source": "kakao+naver",
		"matchedName": "서울생활문화센터 서교",
		"venueFor": "서울와우북페스티벌",
		"venueWhy": "서울생활문화센터 서교(양화로 72) — 서울문화포털. 2019년까지는 홍대거리였다가 2022년부터 이곳으로 옮겼다",
		"for": "서울와우북페스티벌"
	},
	ks_f: {
		"lat": 37.506192165253054,
		"lng": 127.00745095957775,
		"source": "kakao",
		"matchedName": "서울고속버스터미널(경부)",
		"venueFor": "서초뮤직앤아트페스티벌",
		"venueWhy": "서울고속버스터미널 광장 — 서초문화재단, 서울문화포털",
		"for": "서초뮤직앤아트페스티벌"
	},
	ks_i: {
		"lat": 37.58842461354086,
		"lng": 127.00601781685579,
		"source": "kakao",
		"matchedName": "한성대입구역 4호선",
		"venueFor": "성북 세계음식축제 누리마실",
		"venueWhy": "성북로 일대(성북천 분수마루) — 성북문화재단, 아시아경제·헤럴드경제",
		"for": "성북 세계음식축제 누리마실"
	},
	ks_j: {
		"lat": 37.6110662949573,
		"lng": 127.059079685143,
		"source": "kakao+naver",
		"matchedName": "서울석관초등학교",
		"venueFor": "성북거리문화축제 다다페스타",
		"venueWhy": "석관초등학교 앞 돌곶이로22길 일대와 학교운동장 — 성북구 보도자료",
		"for": "성북거리문화축제 다다페스타"
	},
	ks_k: {
		"lat": 37.5205340628851,
		"lng": 127.120812783275,
		"source": "kakao",
		"matchedName": "올림픽공원",
		"venueFor": "한성백제문화제",
		"venueWhy": "올림픽공원(평화의광장·88잔디마당) — 송파구 축제 공식 페이지, 한성백제박물관",
		"for": "한성백제문화제"
	},
	ks_o: {
		"lat": 37.5345252050511,
		"lng": 126.994333861918,
		"source": "kakao",
		"matchedName": "이태원역 6호선",
		"venueFor": "이태원 지구촌축제",
		"venueWhy": "이태원관광특구 일원(이태원로) — 용산구, 한국관광공사 대한민국구석구석",
		"for": "이태원 지구촌축제"
	},
	ks_r: {
		"lat": 37.5655638710672,
		"lng": 126.974894754989,
		"source": "kakao+naver",
		"matchedName": "덕수궁",
		"venueFor": "정동야행",
		"venueWhy": "덕수궁·정동길 일대 — 중구 보도자료, 서울문화포털",
		"for": "정동야행"
	},
	ks_s: {
		"lat": 37.615527242263454,
		"lng": 127.07326843949663,
		"source": "kakao+naver",
		"matchedName": "중랑장미공원",
		"venueFor": "중랑 서울장미축제",
		"venueWhy": "중랑장미공원(묵동교~겸재교 중랑천 일원) — 중랑구청 문화행사 안내",
		"for": "중랑 서울장미축제"
	},
	ks_u: {
		"lat": 37.6403309941757,
		"lng": 127.059580986248,
		"source": "kakao",
		"matchedName": "시립노원청소년센터",
		"venueFor": "정월대보름 한마당",
		"venueWhy": "당현천 하류(노원청소년센터 앞~중계동성당 앞) — 노원구 보도자료 2026",
		"for": "정월대보름 한마당"
	},
	ks_v: {
		"lat": 37.5093789801021,
		"lng": 127.098201204291,
		"source": "kakao+naver",
		"matchedName": "서울놀이마당",
		"venueFor": "정월대보름 행사(송파다리밟기 · 달집태우기)",
		"venueWhy": "석촌호수 일대 서울놀이마당 — 송파구 보도자료, 시정일보·딜라이브뉴스",
		"for": "정월대보름 행사(송파다리밟기 · 달집태우기)"
	},
	ks_w: {
		"lat": 37.5174334563325,
		"lng": 126.878061056982,
		"source": "kakao+naver",
		"matchedName": "신정교 공영주차장",
		"venueFor": "정월대보름 민속축제",
		"venueWhy": "안양천 둔치 신정교 아래 제1·2야구장 — 양천구청 축제 안내, 헤럴드경제",
		"for": "정월대보름 민속축제"
	},
	ks_x: {
		"lat": 37.576226410093,
		"lng": 126.987085596535,
		"source": "kakao+naver",
		"matchedName": "운현궁",
		"venueFor": "운현궁 설맞이",
		"venueWhy": "운현궁 앞마당 — 종로문화플랫폼, 서울한옥포털",
		"for": "운현궁 설맞이"
	},
	ks_17: {
		"lat": 37.66507369343768,
		"lng": 127.0351012728891,
		"source": "kakao+naver",
		"matchedName": "방학동도깨비시장",
		"for": "방학동 도깨비시장"
	},
	ks_1h: {
		"lat": 37.522709383885,
		"lng": 126.905179566968,
		"source": "kakao",
		"matchedName": "영등포시장역 5호선",
		"for": "영등포시장"
	},
	ks_1l: {
		"lat": 37.580769707479256,
		"lng": 126.96994796046572,
		"source": "kakao+naver",
		"matchedName": "통인시장",
		"for": "통인시장"
	},
	ks_1: {
		"lat": 37.5230412388766,
		"lng": 127.03551653311649,
		"source": "kakao+naver",
		"matchedName": "도산공원공영주차장",
		"venueFor": "강남페스티벌",
		"venueWhy": "도산공원 — 사용자 지시(2026-09-02). 전에는 코엑스로 잡아 뒀었다(강남구 보도자료의 개막제 장소). 이 축제는 코엑스·영동대로·마루공원 등 강남 여러 곳에서 열흘간 열려 '한 점'이 없는데, 손님이 찾아갈 기준점으로 도산공원을 쓴다",
		"for": "강남페스티벌"
	},
	ks_1z: {
		"lat": 37.6596867039654,
		"lng": 127.032013855648,
		"source": "kakao+naver",
		"matchedName": "발바닥공원",
		"for": "발바닥공원"
	},
	ks_23: {
		"lat": 37.5663859671922,
		"lng": 126.914288083984,
		"source": "kakao",
		"matchedName": "홍제천",
		"for": "홍제천"
	},
	ks_2a: {
		"lat": 37.53351080966769,
		"lng": 126.91493215270192,
		"source": "kakao",
		"matchedName": "여의서로",
		"for": "여의서로"
	},
	ks_2c: {
		"lat": 37.548940860784064,
		"lng": 126.98939657811628,
		"source": "kakao+naver",
		"matchedName": "남산",
		"for": "남산"
	},
	ks_2p: {
		"lat": 37.620691807133,
		"lng": 127.078706040469,
		"source": "kakao+naver",
		"matchedName": "경춘선숲길",
		"for": "경춘선숲길"
	},
	ks_34: {
		"lat": 37.5906452023744,
		"lng": 126.981743337459,
		"source": "kakao",
		"matchedName": "삼청동길",
		"for": "삼청동길"
	},
	ks_35: {
		"lat": 37.557109027019116,
		"lng": 126.97541367376364,
		"source": "kakao",
		"matchedName": "서울로7017",
		"for": "서울로7017"
	},
	ks_3a: {
		"lat": 37.5537585658907,
		"lng": 126.982413256957,
		"source": "kakao",
		"matchedName": "남산둘레길",
		"for": "남산둘레길"
	},
	ks_40: {
		"lat": 37.575422861783345,
		"lng": 126.94816634534915,
		"source": "kakao",
		"matchedName": "안산자락길",
		"for": "안산자락길"
	},
	ks_41: {
		"lat": 37.5482528089186,
		"lng": 127.029834156041,
		"source": "kakao",
		"matchedName": "응봉산",
		"for": "응봉산"
	},
	ks_43: {
		"lat": 37.5685396959502,
		"lng": 126.886883825534,
		"source": "kakao",
		"matchedName": "하늘공원",
		"for": "하늘공원"
	},
	ks_44: {
		"lat": 37.578627489574416,
		"lng": 126.9800979573524,
		"source": "kakao+naver",
		"matchedName": "국립현대미술관 서울",
		"for": "국립현대미술관 서울관"
	},
	ks_45: {
		"lat": 37.573031041794664,
		"lng": 126.96346810881765,
		"source": "kakao+naver",
		"matchedName": "딜쿠샤",
		"for": "딜쿠샤"
	},
	ks_46: {
		"lat": 37.5808175214949,
		"lng": 126.984172997364,
		"source": "kakao+naver",
		"matchedName": "가회동백인제가옥",
		"for": "백인제가옥"
	},
	ks_47: {
		"lat": 37.56410579887691,
		"lng": 126.9736988634857,
		"source": "kakao+naver",
		"matchedName": "서울시립미술관 서소문본관",
		"for": "서울시립미술관"
	},
	ks_48: {
		"lat": 37.5659384342432,
		"lng": 126.973740099183,
		"source": "kakao+naver",
		"matchedName": "국립현대미술관 덕수궁",
		"for": "국립현대미술관 덕수궁관"
	},
	ks_49: {
		"lat": 37.52392249364415,
		"lng": 126.98018716127058,
		"source": "kakao+naver",
		"matchedName": "국립중앙박물관",
		"for": "국립중앙박물관"
	},
	ks_4a: {
		"lat": 37.59357930433219,
		"lng": 126.99696540704932,
		"source": "kakao+naver",
		"matchedName": "간송미술관",
		"for": "간송미술관"
	},
	ks_4e: {
		"lat": 37.51845542521429,
		"lng": 127.03453476229417,
		"source": "kakao+naver",
		"matchedName": "국립관세박물관",
		"for": "관세박물관"
	},
	ks_4f: {
		"lat": 37.5225509345279,
		"lng": 127.036041194408,
		"source": "kakao+naver",
		"matchedName": "호림박물관 신사분관",
		"for": "호림박물관 신사분관"
	},
	ks_4g: {
		"lat": 37.5239206199026,
		"lng": 127.035507899928,
		"source": "kakao+naver",
		"matchedName": "도산공원 도산안창호기념관",
		"for": "도산안창호기념관"
	},
	ks_4h: {
		"lat": 37.5154126785182,
		"lng": 127.120895017165,
		"source": "kakao+naver",
		"matchedName": "한성백제박물관",
		"for": "한성백제박물관"
	},
	ks_4i: {
		"lat": 37.51688595123324,
		"lng": 127.1180921409908,
		"source": "kakao+naver",
		"matchedName": "소마미술관",
		"for": "소마미술관"
	},
	ks_4j: {
		"lat": 37.45774583773384,
		"lng": 126.89553915985154,
		"source": "kakao+naver",
		"matchedName": "서울시립 서서울미술관",
		"for": "서울시립 서서울미술관"
	},
	ks_4k: {
		"lat": 37.5276400128879,
		"lng": 126.873777133469,
		"source": "kakao+naver",
		"matchedName": "오목한미술관",
		"for": "오목한미술관"
	},
	ks_4l: {
		"lat": 37.5678799742891,
		"lng": 126.850998403189,
		"source": "kakao+naver",
		"matchedName": "허준박물관",
		"for": "허준박물관"
	},
	ks_4o: {
		"lat": 37.5508665042994,
		"lng": 127.077592558039,
		"source": "kakao",
		"matchedName": "서울상상나라",
		"for": "서울상상나라"
	},
	ks_4t: {
		"lat": 37.580632384055335,
		"lng": 127.03763602036537,
		"source": "kakao+naver",
		"matchedName": "서울약령시한의약박물관",
		"for": "서울약령시한의약박물관"
	},
	ks_4u: {
		"lat": 37.576752258195064,
		"lng": 126.93785805574039,
		"source": "kakao+naver",
		"matchedName": "서대문자연사박물관",
		"for": "서대문자연사박물관"
	},
	ks_4v: {
		"lat": 37.47833986691578,
		"lng": 127.01186193751934,
		"source": "kakao",
		"matchedName": "예술의전당 서울서예박물관",
		"for": "예술의전당 서울서예박물관"
	},
	ks_4x: {
		"lat": 37.6404045181413,
		"lng": 126.937978427932,
		"source": "kakao+naver",
		"matchedName": "은평역사한옥박물관",
		"for": "은평역사한옥박물관"
	},
	ks_50: {
		"lat": 37.50255501820018,
		"lng": 126.97462182443368,
		"source": "kakao+naver",
		"matchedName": "국립서울현충원",
		"for": "국립서울현충원"
	},
	ks_51: {
		"lat": 37.5551677747939,
		"lng": 127.04472141627,
		"source": "kakao",
		"matchedName": "한양대학교 박물관",
		"for": "한양대학교박물관"
	},
	ks_n: {
		"lat": 37.52638860108943,
		"lng": 126.93512931714196,
		"source": "kakao",
		"for": "서울세계불꽃축제",
		"matchedName": "여의도한강공원",
		"venueFor": "서울세계불꽃축제",
		"venueWhy": "여의도 한강공원 일대 — 네이버 지도·한화 공식(2026 9.5) 모두 '여의도 한강공원 일대'로만 적는다. 사용자 지적(2026-09-02): \"특정 장소가 아닌 여의도 한강공원\". 손으로 박아 둔 좌표(37.5255, 126.9225)를 빼고 공원 자체를 기준점으로 삼는다 — 불꽃은 강 위에서 터지고 사람은 공원 잔디에서 본다"
	},
	ks_2q: {
		"lat": 37.6781213031547,
		"lng": 127.029945030295,
		"source": "kakao",
		"for": "무수골",
		"matchedName": "무수골"
	},
	ks_2s: {
		"lat": 37.50255501820018,
		"lng": 126.97462182443368,
		"source": "kakao+naver",
		"for": "국립서울현충원",
		"matchedName": "국립서울현충원"
	},
	ks_2t: {
		"lat": 37.558803479324,
		"lng": 126.925338455597,
		"source": "kakao+naver",
		"for": "경의선숲길(연남동 구간)",
		"matchedName": "경의선숲길"
	},
	ks_q: {
		"lat": 37.5739480070481,
		"lng": 126.981851559609,
		"source": "kakao+naver",
		"for": "연등회",
		"matchedName": "연등회"
	},
	ks_h: {
		"lat": 37.561762068795,
		"lng": 127.037232649446,
		"source": "kakao+naver",
		"for": "세계민속춤축제",
		"matchedName": "왕십리광장",
		"venueFor": "세계민속춤축제",
		"venueWhy": "왕십리광장 — 성동구 문화관광에 장소가 '왕십리광장'으로 적혀 있다(사용자가 화면으로 확인, 2026-09-02). 2015년부터 이 광장에서 열려 왔다"
	},
	ks_l: {
		"lat": 37.5202231231721,
		"lng": 126.852889567642,
		"source": "kakao",
		"for": "양천가족거리축제",
		"matchedName": "신정네거리역 2호선",
		"venueFor": "양천가족거리축제",
		"venueWhy": "신정네거리역 일대(서울남부지방법원 방향 약 900m 구간) — 네이버 축제정보(2025 10.26)에 장소가 그대로 적혀 있다(사용자가 화면으로 확인, 2026-09-02). 900m 길 구간이라 한 점이 없어 역을 기준점으로 삼는다. 손으로 박아 둔 좌표(37.5480, 126.8490)는 근거가 없어 뺐다"
	},
	ks_m: {
		"lat": 37.5285721,
		"lng": 126.9125276,
		"source": "naver-address",
		"for": "여의도 봄꽃축제",
		"matchedName": "서울특별시 영등포구 여의도동 8",
		"venueFor": "여의도 봄꽃축제",
		"venueWhy": "여의도동 8 (지번) — 사용자가 알려 준 주소(2026-09-02). 네이버 지도에는 도로명 '여의서로 60-2 여의서로윤중로 벚꽃길'로도 나오는데, **지번이 그 자리를 더 정확히 가리킨다** — 도로명은 길 전체에 걸쳐 있어 어느 지점인지 흐려진다(CLAUDE.md: 동네는 도로명으로 추측하지 말고 지번을 본다). venues(윤중로·여의서로)는 주소를 좌표로 못 바꿨을 때를 위해 남겨 둔다. 손으로 박아 둔 좌표(37.5275, 126.9255)는 근거가 없어 뺐다"
	}
};
var sameName$1 = (a, b) => String(a ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "") === String(b ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "");
/**
* 🚨 **id만 믿지 않는다** (2026-09-02에 실제로 당했다).
*
* seed.ts의 id는 `ks_1, ks_2 …`로 **파일에 적힌 순서**로 매겨진다. 그래서 항목
* 하나를 지우거나 끼워 넣으면 **그 뒤가 전부 한 칸씩 밀린다.** 좌표는 옛 번호를
* 그대로 들고 있으므로, 밀린 자리의 좌표가 조용히 남의 것이 된다:
*
*     무수골(도봉구)        → 경춘선숲길 좌표
*     홍릉 두물길(동대문구)  → 무수골 좌표
*     국립서울현충원(동작구) → 홍릉 두물길 좌표
*
* 화면도 안 깨지고 문법도 안 틀려서 **눈으로는 절대 못 잡는다** — 손님만 엉뚱한
* 데로 간다. CLAUDE.md에 Kfood에서 같은 사고를 겪었다고 적혀 있는 바로 그것이다.
*
* 그래서 좌표에 **그때의 장소 이름을 함께 적어 두고, 지금 이름과 다르면 버린다.**
* 버리면 좌표가 빈 칸이 되고 길찾기는 이름 검색으로 간다 — 남의 좌표로 보내는
* 것보다 낫다(틀린 좌표 < 빈 칸). 다음 fetch-coords 실행이 제 이름으로 다시 채운다.
*
* `for`가 없는 옛 항목은 검사를 건너뛴다 — 다 지우면 멀쩡한 좌표까지 날아간다.
* 새로 받는 것부터 이름이 붙으므로 시간이 지나면 저절로 다 검사 대상이 된다.
*/
function getCoords(id, name) {
	const c = COORDS[id];
	if (!c) return void 0;
	if (name && c.for && !sameName$1(c.for, name)) return void 0;
	return c;
}
var gu_festival_dates_default = {
	설명: "구청·구 문화재단이 서울시 문화포털에 직접 올린 축제 확정 날짜. scripts/fetch-gu-festival-dates.ts 가 받는다. 손으로 고치지 말 것.",
	받은날: "2026-09-12",
	곳: {
		"ks_7": {
			"start": "2026-09-19",
			"end": "2026-09-20",
			"title": "[구로구] 구로G페스티벌(아시아문화축제)",
			"gu": "구로구",
			"place": "안양천(구일역) ~ 안양천 생태초화원(도림천역)",
			"lat": 37.502964337383354,
			"lng": 126.87261084179218,
			"time": "토,일 9:00~22:00",
			"org": "구로구청",
			"orgLink": "https://www.gfestival.co.kr/default/index.php",
			"page": "https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=159254&menuNo=200010",
			"registered": "2026-08-27",
			"source": "seoul-culture-portal",
			"fetchedAt": "2026-09-12"
		},
		"ks_54": {
			"start": "2026-09-19",
			"end": "2026-09-20",
			"title": "서울거리예술축제 2026",
			"gu": "광진구",
			"place": "뚝섬한강공원, 서울숲",
			"lat": 37.52928843663254,
			"lng": 127.06891546493314,
			"time": "추후 공개",
			"org": "서울문화재단",
			"orgLink": "https://www.instagram.com/ssaf.official/",
			"page": "https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=159119&menuNo=200010",
			"registered": "2026-08-19",
			"source": "seoul-culture-portal",
			"fetchedAt": "2026-09-12"
		},
		"ks_55": {
			"start": "2026-09-25",
			"end": "2026-09-27",
			"title": "[남산골한옥마을] 2026 남산골 추석축제 [남산달빛마당]",
			"gu": "중구",
			"place": "남산골한옥마을 일대",
			"lat": 37.559304933707146,
			"lng": 126.994440072131,
			"time": "10:00~20:00",
			"org": "남산골한옥마을",
			"orgLink": "https://www.hanokmaeul.co.kr/event-now/?bmode=view&idx=173313006&back_url=Lw%3D%3D&t=board&page=1",
			"page": "https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=159263&menuNo=200010",
			"registered": "2026-08-27",
			"source": "seoul-culture-portal",
			"fetchedAt": "2026-09-12"
		},
		"ks_56": {
			"start": "2026-10-01",
			"end": "2026-10-04",
			"title": "2026 인사동 엔틱&아트페어",
			"gu": "종로구",
			"place": "인사아트프라자, 안녕인사동 및 인사동 문화지구 전 지역",
			"lat": 37.5738579749684,
			"lng": 126.985609522118,
			"time": "10:00 ~ 18:00 (프로그램별 상이)",
			"org": "종로구청",
			"orgLink": "http://www.hiinsa.com",
			"page": "https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=159036&menuNo=200010",
			"registered": "2026-08-12",
			"source": "seoul-culture-portal",
			"fetchedAt": "2026-09-12"
		},
		"ks_57": {
			"start": "2026-10-24",
			"end": "2026-10-25",
			"title": "2026 서울 바비큐 페스티벌",
			"gu": "마포구",
			"place": "난지캠핑장",
			"lat": 37.5628372373648,
			"lng": 126.885422860585,
			"time": "12:00~20:30",
			"org": "서울시청",
			"orgLink": "https://www.seoulbbqfesta.com/",
			"page": "https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=159406&menuNo=200010",
			"registered": "2026-09-08",
			"source": "seoul-culture-portal",
			"fetchedAt": "2026-09-12"
		},
		"tour_3012095": {
			"start": "2026-10-02",
			"end": "2026-10-11",
			"title": "[서울시청] 2026 서울라이트 한강 빛섬축제 ",
			"gu": "용산구",
			"place": "노들섬",
			"lat": 37.5176638307111,
			"lng": 126.958036465507,
			"time": "18:30~22:30",
			"org": "서울시청",
			"orgLink": "https://bitseomfestival.com",
			"page": "https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=159242&menuNo=200010",
			"registered": "2026-08-27",
			"source": "seoul-culture-portal",
			"fetchedAt": "2026-09-12"
		},
		"tour_2621558": {
			"start": "2026-10-10",
			"title": "[중랑문화재단] 2026 중랑용마폭포축제",
			"gu": "중랑구",
			"place": "용마폭포공원(중랑구 용마산로 250-12)",
			"lat": 37.5733520089552,
			"lng": 127.089122137473,
			"time": "11:00~21:00",
			"org": "중랑문화재단",
			"orgLink": "https://www.instagram.com/yongma_fe/",
			"page": "https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=159251&menuNo=200010",
			"registered": "2026-08-27",
			"source": "seoul-culture-portal",
			"fetchedAt": "2026-09-12"
		}
	}
};
var dead_links_default = {
	_읽어보세요: [
		"🪦 **죽은 것을 확인한 공식 홈페이지 주소.** 여기 적힌 주소는 안 쓴다 —",
		"이름을 누르면 네이버 검색으로 넘어간다.",
		"",
		"왜 빼나 — 죽은 주소로 보내는 것은 네이버 검색으로 보내느니만 못하다.",
		"손님은 '이 앱은 링크도 안 되네' 하고 닫는다. 네이버 검색은 적어도",
		"그 축제 카드와 올해 날짜를 보여 준다.",
		"",
		"🚨 **한 번 실패했다고 넣지 않는다.** 관공서 홈페이지는 로봇을 막거나",
		"잠깐 끊기는 일이 잦다. 실제로 2026-09-04 검수에서 중랑문화재단은 1차에",
		"정상(200)이었다가 3차에 시간 초과가 났다 — 우리가 연달아 두드려서 그런 것이지",
		"죽은 게 아니다.",
		"",
		"여기 넣는 기준은 **서로 다른 두 번의 실행에서 모두 DNS 단계로 실패**한 것뿐이다",
		"(ENOTFOUND·EAI_AGAIN = 그 도메인이 인터넷에 아예 없다). 시간 초과·403·400은",
		"넣지 않는다 — 그건 '살아 있는데 우리를 안 받아 준' 것일 수 있다.",
		"",
		"다시 살아나면(축제가 새 회차 사이트를 열면) 여기서 지우면 된다.",
		"확인은 Actions의 «Prelaunch check» 로."
	],
	"http://youthfestival.or.kr/": {
		"name": "강북청소년축제 강추",
		"why": "도메인이 인터넷에 없다. 2026-09-04 두 번의 실행에서 EAI_AGAIN(DNS 조회 실패)이 여섯 번 연속. 출처는 관광공사가 등록해 둔 홈페이지 칸이라 자료를 직접 못 고친다(다시 받아지면 되돌아온다)"
	},
	"https://sgf2025.kr/": {
		"name": "2025 과학영재교육 페스티벌",
		"why": "도메인이 인터넷에 없다 (ENOTFOUND). 주소에 2025가 박혀 있는 그 해 전용 사이트라, 회차가 끝나고 도메인을 안 늘린 것으로 보인다. 2026-09-04 두 번의 실행에서 모두 실패"
	}
};
//#endregion
//#region src/lib/officialSite.ts
var NOT_OFFICIAL_HOST = /^(blog\.naver\.com|m\.blog\.naver\.com|cafe\.naver\.com|m\.cafe\.naver\.com|blog\.daum\.net|[\w-]+\.tistory\.com|instagram\.com|facebook\.com|m\.facebook\.com|youtube\.com|youtu\.be|band\.us|twitter\.com|x\.com|tiktok\.com|naver\.me|linktr\.ee)$/i;
var DEAD = new Set(Object.keys(dead_links_default).filter((k) => !k.startsWith("_")));
function isOfficialSite(url) {
	if (!url) return false;
	if (DEAD.has(url)) return false;
	try {
		const host = new URL(url).hostname.replace(/^www\./, "");
		return !NOT_OFFICIAL_HOST.test(host);
	} catch {
		return false;
	}
}
//#endregion
//#region src/lib/guFestival.ts
var RAW$1 = gu_festival_dates_default["곳"] ?? {};
/** 오늘(현지 시각) YYYY-MM-DD. 서울에서 보는 앱이라 UTC 로 자르면 하루가 밀린다. */
function todayYmd() {
	const d = /* @__PURE__ */ new Date();
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
/**
* 그 축제의 **확정 일정**. 없거나 이미 끝났으면 undefined.
*
* ⏳ **끝난 회차는 안 쓴다.** 받아 온 파일에도 지난 것은 안 남기지만, 화면에서도
*    한 번 더 본다 — 손님 폰은 며칠씩 안 켜질 수 있고, 그 사이에 끝난다.
*    잣대가 하나뿐이면 그 틈에 지난 날짜가 뜬다.
*/
function guFestivalDate(id) {
	const d = RAW$1[id];
	if (!d?.start) return void 0;
	return (d.end ?? d.start) >= todayYmd() ? d : void 0;
}
/**
* 🔗 손님이 **직접 확인할** 공식 주소.
*
* 주최 측이 적은 홈페이지를 먼저 쓰되, 블로그·SNS면 거른다(officialSite.ts —
* 자료 쪽·화면 쪽이 **같은 잣대 하나**를 쓴다). 걸리면 문화포털 안내로 보낸다.
* 문화포털은 구청이 직접 등록한 자리라 **늘 있고 늘 공식**이다 —
* 그래서 이 함수는 확정 일정이 있는 축제에 대해 빈손으로 돌아오지 않는다.
*/
function guOfficialLink(d) {
	if (isOfficialSite(d.orgLink)) return d.orgLink;
	return d.page ?? void 0;
}
var tour_places_raw_default = {
	festival: [
		{
			"name": "가락옥토버페스트 미식야행",
			"gu": "송파구",
			"addr": "서울특별시 송파구 양재대로 932 (가락동)",
			"contentId": "3379778",
			"image": "https://tong.visitkorea.or.kr/cms/resource/73/3553073_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/73/3553073_image3_1.png",
			"lng": 127.1107693087,
			"lat": 37.4960786971
		},
		{
			"name": "가을 , 명동으로",
			"gu": "중구",
			"addr": "서울특별시 중구 퇴계로 지하126 (충무로2가)",
			"contentId": "3021762",
			"image": "https://tong.visitkorea.or.kr/cms/resource/65/3559865_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/65/3559865_image3_1.png",
			"lng": 126.985959388,
			"lat": 37.5609633613
		},
		{
			"name": "강남 미디어 윈터페스타",
			"gu": "강남구",
			"addr": "서울특별시 강남구 영동대로 511 (삼성동)",
			"contentId": "3439947",
			"image": "https://tong.visitkorea.or.kr/cms/resource/54/3579654_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/54/3579654_image3_1.jpg",
			"lng": 127.0610512042,
			"lat": 37.5103955843
		},
		{
			"name": "강동북페스티벌",
			"gu": "강동구",
			"addr": "서울특별시 강동구 양재대로84길 63 (둔촌동)",
			"contentId": "1806376",
			"image": "https://tong.visitkorea.or.kr/cms/resource/89/3567889_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/89/3567889_image3_1.jpg",
			"lng": 127.1369827856,
			"lat": 37.5244036592
		},
		{
			"name": "강북청소년축제 강추",
			"gu": "강북구",
			"addr": "서울특별시 강북구 도봉로76가길 55 (미아동)",
			"contentId": "3354973",
			"image": "https://tong.visitkorea.or.kr/cms/resource/50/3539950_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/50/3539950_image3_1.jpg",
			"lng": 127.0274174771,
			"lat": 37.6321225012
		},
		{
			"name": "겨울, 청계천의 빛",
			"gu": "중구",
			"addr": "서울특별시 중구 태평로1가 1",
			"contentId": "2785797",
			"image": "https://tong.visitkorea.or.kr/cms/resource/36/3567636_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/36/3567636_image3_1.jpg",
			"lng": 126.9776154729,
			"lat": 37.5691317067
		},
		{
			"name": "공공미술 빛조각축제 <노원 달빛산책>",
			"gu": "노원구",
			"addr": "서울특별시 노원구 동일로 1322-70 (상계동)",
			"contentId": "2862358",
			"image": "https://tong.visitkorea.or.kr/cms/resource/35/3547735_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/35/3547735_image3_1.jpg",
			"lng": 127.0657023804,
			"lat": 37.6494961706
		},
		{
			"name": "관악별빛산책",
			"gu": "관악구",
			"addr": "서울특별시 관악구 신림동 1642-7",
			"contentId": "2778088",
			"image": "https://tong.visitkorea.or.kr/cms/resource/88/3580588_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/88/3580588_image3_1.jpg",
			"lng": 126.9276196866,
			"lat": 37.4827825101
		},
		{
			"name": "광화문 마켓",
			"gu": "종로구",
			"addr": "서울특별시 종로구 세종대로 지하172 (세종로)",
			"contentId": "3035607",
			"image": "https://tong.visitkorea.or.kr/cms/resource/03/3573403_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/03/3573403_image3_1.png",
			"lng": 126.9767821434,
			"lat": 37.5716786179
		},
		{
			"name": "구로청소년축제",
			"gu": "구로구",
			"addr": "서울특별시 구로구 구로중앙로 48 (구로동)",
			"contentId": "2618971",
			"image": "https://tong.visitkorea.or.kr/cms/resource/06/3562606_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/06/3562606_image3_1.jpg",
			"lng": 126.8900783422,
			"lat": 37.4941610735
		},
		{
			"name": "그린칩스 페스티벌",
			"gu": "마포구",
			"addr": "서울특별시 마포구 성미산로 151-1 (연남동)",
			"contentId": "3548994",
			"image": "https://tong.visitkorea.or.kr/cms/resource/93/3548993_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/93/3548993_image3_1.png",
			"lng": 126.9232288927,
			"lat": 37.5645590416
		},
		{
			"name": "노원 북 페스티벌",
			"gu": "노원구",
			"addr": "서울특별시 노원구 공릉로55길 88 (하계동)",
			"contentId": "2865258",
			"image": "https://tong.visitkorea.or.kr/cms/resource/61/3559561_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/61/3559561_image3_1.png",
			"lng": 127.0679693368,
			"lat": 37.6320954567
		},
		{
			"name": "도곡 메타세쿼이아 로드 페스타",
			"gu": "강남구",
			"addr": "서울특별시 강남구 양재천로 199 (도곡동)",
			"contentId": "3018924",
			"image": "https://tong.visitkorea.or.kr/cms/resource/62/3543062_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/62/3543062_image3_1.jpg",
			"lng": 127.0472810057,
			"lat": 37.4831568326
		},
		{
			"name": "도봉한글잔치",
			"gu": "도봉구",
			"addr": "서울특별시 도봉구 해등로32가길 16 (방학동)",
			"contentId": "2601242",
			"image": "https://tong.visitkorea.or.kr/cms/resource/25/3550325_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/25/3550325_image3_1.JPG",
			"lng": 127.0222810312,
			"lat": 37.6603441259
		},
		{
			"name": "동궐동락",
			"gu": "종로구",
			"addr": "서울특별시 종로구 창경궁로 185 (와룡동)",
			"contentId": "3572025",
			"image": "https://tong.visitkorea.or.kr/cms/resource/22/3572022_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/22/3572022_image3_1.jpg",
			"lng": 126.9964634775,
			"lat": 37.5789336838
		},
		{
			"name": "방배카페 골목페스타",
			"gu": "서초구",
			"addr": "서울특별시 서초구 방배중앙로 193 (방배동)",
			"contentId": "3563444",
			"image": "https://tong.visitkorea.or.kr/cms/resource/52/3564652_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/52/3564652_image3_1.png",
			"lng": 126.9854168201,
			"lat": 37.4963319705
		},
		{
			"name": "서대문 국가유산 야행",
			"gu": "서대문구",
			"addr": "서울특별시 서대문구 통일로 지하247 (현저동)",
			"contentId": "2733405",
			"image": "https://tong.visitkorea.or.kr/cms/resource/47/3366647_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/47/3366647_image3_1.jpg",
			"lng": 126.9577643533,
			"lat": 37.5744612869
		},
		{
			"name": "서울라이트 광화문",
			"gu": "종로구",
			"addr": "서울특별시 종로구 세종로 1-68 5호선 광화문역",
			"contentId": "3073454",
			"image": "https://tong.visitkorea.or.kr/cms/resource/04/3581704_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/04/3581704_image3_1.jpg",
			"lng": 126.9767821434,
			"lat": 37.5716786179
		},
		{
			"name": "서울라이트 한강 빛섬축제",
			"gu": "광진구",
			"addr": "서울특별시 광진구 강변북로 2273 (자양동)",
			"contentId": "3012095",
			"image": "https://tong.visitkorea.or.kr/cms/resource/17/3579117_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/17/3579117_image3_1.jpg",
			"lng": 127.0739939307,
			"lat": 37.5294186076
		},
		{
			"name": "서울발레페스티벌 서울국제발레위크",
			"gu": "송파구",
			"addr": "서울특별시 송파구 석촌호수로 191 (잠실동)",
			"contentId": "3021908",
			"image": "https://tong.visitkorea.or.kr/cms/resource/69/3546369_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/69/3546369_image3_1.jpg",
			"lng": 127.0982534743,
			"lat": 37.5068688853
		},
		{
			"name": "서울생활예술페스티벌",
			"gu": "용산구",
			"addr": "서울특별시 용산구 양녕로 445 (이촌동)",
			"contentId": "3113548",
			"image": "https://tong.visitkorea.or.kr/cms/resource/52/3542852_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/52/3542852_image3_1.jpg",
			"lng": 126.9580520415,
			"lat": 37.5177178854
		},
		{
			"name": "서울아프리카페스티벌",
			"gu": "중구",
			"addr": "서울특별시 중구 을지로 281 (을지로7가)",
			"contentId": "2487791",
			"image": "https://tong.visitkorea.or.kr/cms/resource/10/3558510_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/10/3558510_image3_1.jpg",
			"lng": 127.0095709797,
			"lat": 37.566107632
		},
		{
			"name": "서울억새축제",
			"gu": "마포구",
			"addr": "서울특별시 마포구 하늘공원로 95 (상암동)",
			"contentId": "626944",
			"image": "https://tong.visitkorea.or.kr/cms/resource/81/3544281_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/81/3544281_image3_1.JPG",
			"lng": 126.8861432556,
			"lat": 37.569152288
		},
		{
			"name": "서울와우북페스티벌",
			"gu": "마포구",
			"addr": "서울특별시 마포구 양화로 72 (서교동, 서교동 효성 해링턴 타워)",
			"contentId": "229057",
			"image": "https://tong.visitkorea.or.kr/cms/resource/11/3547511_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/11/3547511_image3_1.png",
			"lng": 126.9167298722,
			"lat": 37.5508549625
		},
		{
			"name": "성북거리문화축제 <다다페스타>",
			"gu": "성북구",
			"addr": "서울특별시 성북구 석관동",
			"contentId": "3348362",
			"image": "https://tong.visitkorea.or.kr/cms/resource/54/3527554_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/54/3527554_image3_1.jpg",
			"lng": 127.0605761839,
			"lat": 37.6104117333
		},
		{
			"name": "세계유산 조선왕릉축전",
			"gu": "강남구",
			"addr": "서울특별시 강남구 선릉로100길 1 (삼성동)",
			"contentId": "2756476",
			"image": "https://tong.visitkorea.or.kr/cms/resource/15/3423615_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/15/3423615_image3_1.jpg",
			"lng": 127.0475969642,
			"lat": 37.5071957139
		},
		{
			"name": "양천가족 거리축제",
			"gu": "양천구",
			"addr": "서울특별시 양천구 중앙로 지하261 (신정동)",
			"contentId": "3384023",
			"image": "https://tong.visitkorea.or.kr/cms/resource/32/3544832_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/32/3544832_image3_1.jpg",
			"lng": 126.8530059985,
			"lat": 37.5198490944
		},
		{
			"name": "엔터테크 서울 2025",
			"gu": "중구",
			"addr": "서울특별시 중구 을지로 281 (을지로7가)",
			"contentId": "3533382",
			"image": "https://tong.visitkorea.or.kr/cms/resource/81/3533381_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/81/3533381_image3_1.png",
			"lng": 127.0095709797,
			"lat": 37.566107632
		},
		{
			"name": "연남동 주민화합 대축제",
			"gu": "마포구",
			"addr": "서울특별시 마포구 동교로 233 (연남동, 이트라이브연남빌딩)",
			"contentId": "3368863",
			"image": "https://tong.visitkorea.or.kr/cms/resource/86/3542886_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/86/3542886_image3_1.jpg",
			"lng": 126.9240400306,
			"lat": 37.561012246
		},
		{
			"name": "영등포선유도원축제",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 선유로 343 (당산동)",
			"contentId": "3387201",
			"image": "https://tong.visitkorea.or.kr/cms/resource/25/3552525_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/25/3552525_image3_1.JPG",
			"lng": 126.902442527,
			"lat": 37.5422918129
		},
		{
			"name": "온 가족 책 잔치",
			"gu": "종로구",
			"addr": "서울특별시 종로구 북촌로5길 48 (화동)",
			"contentId": "3113222",
			"image": "https://tong.visitkorea.or.kr/cms/resource/51/3564751_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/51/3564751_image3_1.jpg",
			"lng": 126.982378627,
			"lat": 37.5797361152
		},
		{
			"name": "용마루 숲길 축제",
			"gu": "용산구",
			"addr": "서울특별시 용산구 효창원로55길 8 (용문동)",
			"contentId": "3551526",
			"image": "https://tong.visitkorea.or.kr/cms/resource/93/3551493_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/93/3551493_image3_1.jpg",
			"lng": 126.9605734386,
			"lat": 37.5388210345
		},
		{
			"name": "용산청년축제",
			"gu": "용산구",
			"addr": "서울특별시 용산구 서빙고로 221 (용산동6가)",
			"contentId": "3359144",
			"image": "https://tong.visitkorea.or.kr/cms/resource/31/3536331_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/31/3536331_image3_1.png",
			"lng": 126.9883603092,
			"lat": 37.520662531
		},
		{
			"name": "은평청년축제",
			"gu": "은평구",
			"addr": "서울특별시 은평구 은평로 195 (녹번동)",
			"contentId": "3000221",
			"image": "https://tong.visitkorea.or.kr/cms/resource/90/3534390_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/90/3534390_image3_1.jpg",
			"lng": 126.929352269,
			"lat": 37.6022297707
		},
		{
			"name": "정동문화축제",
			"gu": "중구",
			"addr": "서울특별시 중구 정동",
			"contentId": "142233",
			"image": "https://tong.visitkorea.or.kr/cms/resource/15/3552215_image2_1.jpeg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/15/3552215_image3_1.jpeg",
			"lng": 126.9753629579,
			"lat": 37.5670957913
		},
		{
			"name": "제2회 고메 잇 강남",
			"gu": "강남구",
			"addr": "서울특별시 강남구 영동대로 513 (삼성동)",
			"contentId": "3524418",
			"image": "https://tong.visitkorea.or.kr/cms/resource/24/3563924_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/24/3563924_image3_1.png",
			"lng": 127.059217995,
			"lat": 37.5119175967
		},
		{
			"name": "제46회 서울무용제",
			"gu": "종로구",
			"addr": "서울특별시 종로구 대학로8길 7 (동숭동)",
			"contentId": "629742",
			"image": "https://tong.visitkorea.or.kr/cms/resource/87/3567087_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/87/3567087_image3_1.jpg",
			"lng": 127.0029878163,
			"lat": 37.5812640855
		},
		{
			"name": "제6회 푸른하늘의 날 기념행사",
			"gu": "중구",
			"addr": "서울특별시 중구 을지로 지하12 (을지로1가)",
			"contentId": "3526695",
			"image": "https://tong.visitkorea.or.kr/cms/resource/94/3526694_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/94/3526694_image3_1.jpg",
			"lng": 126.9787960237,
			"lat": 37.5655015943
		},
		{
			"name": "제7회 금천과학축제",
			"gu": "금천구",
			"addr": "서울특별시 금천구 시흥대로73길 70 (시흥동)",
			"contentId": "2844254",
			"image": "https://tong.visitkorea.or.kr/cms/resource/75/3537175_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/75/3537175_image3_1.png",
			"lng": 126.8955205706,
			"lat": 37.4564933229
		},
		{
			"name": "종로K축제",
			"gu": "종로구",
			"addr": "서울특별시 종로구 세종대로 지하172 (세종로)",
			"contentId": "2405329",
			"image": "https://tong.visitkorea.or.kr/cms/resource/64/3563664_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/64/3563664_image3_1.jpg",
			"lng": 126.9767821434,
			"lat": 37.5716786179
		},
		{
			"name": "중랑용마폭포축제",
			"gu": "중랑구",
			"addr": "서울특별시 중랑구 용마산로 250-12 (면목동)",
			"contentId": "2621558",
			"image": "https://tong.visitkorea.or.kr/cms/resource/95/3540195_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/95/3540195_image3_1.JPG",
			"lng": 127.0891385242,
			"lat": 37.5734054382
		},
		{
			"name": "창덕궁 약다방",
			"gu": "종로구",
			"addr": "서울특별시 종로구 율곡로 99 (와룡동)",
			"contentId": "3489468",
			"image": "https://tong.visitkorea.or.kr/cms/resource/51/3489451_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/51/3489451_image3_1.jpg",
			"lng": 126.9902446339,
			"lat": 37.5777031595
		},
		{
			"name": "케미스트릿 강남역 페스티벌",
			"gu": "서초구",
			"addr": "서울특별시 서초구 서초대로77길 17 (서초동)",
			"contentId": "3383832",
			"image": "https://tong.visitkorea.or.kr/cms/resource/64/3553464_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/64/3553464_image3_1.jpg",
			"lng": 127.0257686102,
			"lat": 37.4996073141
		},
		{
			"name": "한강 종이비행기 축제",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 여의도동",
			"contentId": "3001045",
			"image": "https://tong.visitkorea.or.kr/cms/resource/11/3554311_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/11/3554311_image3_1.jpg",
			"lng": 126.9377509138,
			"lat": 37.5248000326
		},
		{
			"name": "한복문화주간",
			"gu": "종로구",
			"addr": "서울특별시 종로구 종로1길 45 (세종로)",
			"contentId": "2740046",
			"image": "https://tong.visitkorea.or.kr/cms/resource/99/3547199_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/99/3547199_image3_1.jpg",
			"lng": 126.9783985779,
			"lat": 37.5746727436
		},
		{
			"name": "허준축제",
			"gu": "강서구",
			"addr": "서울특별시 강서구 마곡동로 161 (마곡동)",
			"contentId": "2028176",
			"image": "https://tong.visitkorea.or.kr/cms/resource/63/3557963_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/63/3557963_image3_1.jpg",
			"lng": 126.8360144928,
			"lat": 37.5692236076
		},
		{
			"name": "2025 K-웨이브 댄스 페스티벌",
			"gu": "서초구",
			"addr": "서울특별시 서초구 올림픽대로 2085-14 (반포동)",
			"contentId": "3367338",
			"image": "https://tong.visitkorea.or.kr/cms/resource/65/3546365_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/65/3546365_image3_1.jpg",
			"lng": 126.9965764639,
			"lat": 37.5123025381
		},
		{
			"name": "2025 경북사과홍보행사",
			"gu": "중구",
			"addr": "서울특별시 중구 을지로 지하12 (을지로1가)",
			"contentId": "2622167",
			"image": "https://tong.visitkorea.or.kr/cms/resource/59/3550559_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/59/3550559_image3_1.jpg",
			"lng": 126.9787960237,
			"lat": 37.5655015943
		},
		{
			"name": "2025 과학영재교육 페스티벌",
			"gu": "강남구",
			"addr": "서울특별시 강남구 테헤란로7길 22 (역삼동)",
			"contentId": "2802077",
			"image": "https://tong.visitkorea.or.kr/cms/resource/28/3572728_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/28/3572728_image3_1.jpg",
			"lng": 127.0307542337,
			"lat": 37.5007739351
		},
		{
			"name": "2025 대한민국 관광기념품 박람회",
			"gu": "중구",
			"addr": "서울특별시 중구 을지로 281 (을지로7가)",
			"contentId": "2854855",
			"image": "https://tong.visitkorea.or.kr/cms/resource/83/3550583_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/83/3550583_image3_1.jpg",
			"lng": 127.0095709797,
			"lat": 37.566107632
		},
		{
			"name": "2025 대한민국 김장대축제",
			"gu": "서초구",
			"addr": "서울특별시 서초구 강남대로 27 (양재동)",
			"contentId": "3554794",
			"image": "https://tong.visitkorea.or.kr/cms/resource/85/3562885_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/85/3562885_image3_1.jpg",
			"lng": 127.0407514903,
			"lat": 37.467391878
		},
		{
			"name": "2025 대한민국 우리술 대축제",
			"gu": "서초구",
			"addr": "서울특별시 서초구 강남대로 27 (양재동)",
			"contentId": "2769990",
			"image": "https://tong.visitkorea.or.kr/cms/resource/72/3550272_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/72/3550272_image3_1.jpg",
			"lng": 127.0407514903,
			"lat": 37.467391878
		},
		{
			"name": "2025 로맨틱 한강 크리스마스 마켓",
			"gu": "광진구",
			"addr": "서울특별시 광진구 강변북로 2202 (자양동)",
			"contentId": "3069470",
			"image": "https://tong.visitkorea.or.kr/cms/resource/34/3578234_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/34/3578234_image3_1.jpg",
			"lng": 127.0655391172,
			"lat": 37.5304044529
		},
		{
			"name": "2025 서울한옥위크",
			"gu": "종로구",
			"addr": "서울특별시 종로구 계동길 37 (계동)",
			"contentId": "3546110",
			"image": "https://tong.visitkorea.or.kr/cms/resource/09/3546109_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/09/3546109_image3_1.jpg",
			"lng": 126.9867060298,
			"lat": 37.5790529392
		},
		{
			"name": "2025 제14회 강남구 아름다운 건축물 전시회",
			"gu": "강남구",
			"addr": "서울특별시 강남구 영동대로 513 (삼성동)",
			"contentId": "3540355",
			"image": "https://tong.visitkorea.or.kr/cms/resource/47/3540747_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/47/3540747_image3_1.png",
			"lng": 127.059217995,
			"lat": 37.5119175967
		},
		{
			"name": "2025 한강명산트레킹(2차)",
			"gu": "중랑구",
			"addr": "서울특별시 중랑구 용마산로 250-12 (면목동)",
			"contentId": "2384776",
			"image": "https://tong.visitkorea.or.kr/cms/resource/24/3547824_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/24/3547824_image3_1.png",
			"lng": 127.0891385242,
			"lat": 37.5734054382
		},
		{
			"name": "DDP 가을축제: 디자인 라운지",
			"gu": "중구",
			"addr": "서울특별시 중구 을지로 281 (을지로7가)",
			"contentId": "3351622",
			"image": "https://tong.visitkorea.or.kr/cms/resource/46/3542846_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/46/3542846_image3_1.jpg",
			"lng": 127.0095709797,
			"lat": 37.566107632
		}
	],
	market: [
		{
			"name": "가락농수산물종합도매시장",
			"gu": "송파구",
			"addr": "서울특별시 송파구 양재대로 932 (가락동)",
			"contentId": "132215",
			"image": "https://tong.visitkorea.or.kr/cms/resource/37/3568037_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/37/3568037_image3_1.jpg",
			"lng": 127.1107693087,
			"lat": 37.4960786971
		},
		{
			"name": "가락수산시장",
			"gu": "송파구",
			"addr": "서울특별시 송파구 양재대로 932 (가락동)",
			"contentId": "2757640",
			"image": "https://tong.visitkorea.or.kr/cms/resource/34/3567934_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/34/3567934_image3_1.jpg",
			"lng": 127.1107693087,
			"lat": 37.4960786971
		},
		{
			"name": "강서농산물도매시장",
			"gu": "강서구",
			"addr": "서울특별시 강서구 발산로 40 (외발산동)",
			"contentId": "2741626",
			"image": "https://tong.visitkorea.or.kr/cms/resource/22/3589922_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/22/3589922_image3_1.jpg",
			"lng": 126.8216495158,
			"lat": 37.5557499181
		},
		{
			"name": "개봉중앙시장",
			"gu": "구로구",
			"addr": "서울특별시 구로구 개봉로17길 34 (개봉동)",
			"contentId": "2758193",
			"image": "https://tong.visitkorea.or.kr/cms/resource/61/3558661_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/61/3558661_image3_1.jpg",
			"lng": 126.8538844883,
			"lat": 37.4916357215
		},
		{
			"name": "고분다리전통시장",
			"gu": "강동구",
			"addr": "서울특별시 강동구 구천면로34길 8 (천호동)",
			"contentId": "2741571",
			"image": "https://tong.visitkorea.or.kr/cms/resource/31/3571731_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/31/3571731_image3_1.jpg",
			"lng": 127.1316577579,
			"lat": 37.5424098057
		},
		{
			"name": "고척근린시장",
			"gu": "구로구",
			"addr": "서울특별시 구로구 고척로32길 11-3 (고척동)",
			"contentId": "2743854",
			"image": "https://tong.visitkorea.or.kr/cms/resource/74/3463574_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/74/3463574_image3_1.jpg",
			"lng": 126.8498040086,
			"lat": 37.5021872007
		},
		{
			"name": "공릉동도깨비시장",
			"gu": "노원구",
			"addr": "서울특별시 노원구 동일로180길 53 (공릉동)",
			"contentId": "2743742",
			"image": "https://tong.visitkorea.or.kr/cms/resource/99/2779699_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/99/2779699_image2_1.jpg",
			"lng": 127.0771743155,
			"lat": 37.6229161347
		},
		{
			"name": "광장시장",
			"gu": "종로구",
			"addr": "서울특별시 종로구 창경궁로 88",
			"contentId": "132183",
			"image": "https://tong.visitkorea.or.kr/cms/resource/81/2668981_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/81/2668981_image3_1.jpg",
			"lng": 126.9997217621,
			"lat": 37.5701653166
		},
		{
			"name": "광장시장 한복매장",
			"gu": "종로구",
			"addr": "서울특별시 종로구 창경궁로 88 (예지동)",
			"contentId": "1013527",
			"image": "https://tong.visitkorea.or.kr/cms/resource/80/1015080_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/80/1015080_image3_1.jpg",
			"lng": 126.9980663554,
			"lat": 37.5702347233
		},
		{
			"name": "구로시장",
			"gu": "구로구",
			"addr": "서울특별시 구로구 구로동로22길 17-4 (구로동)",
			"contentId": "2592394",
			"image": "https://tong.visitkorea.or.kr/cms/resource/48/3400248_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/48/3400248_image3_1.JPG",
			"lng": 126.8856260957,
			"lat": 37.4896837364
		},
		{
			"name": "금남시장",
			"gu": "성동구",
			"addr": "서울특별시 성동구 독서당로 303-7 (금호동3가)",
			"contentId": "2743748",
			"image": "https://tong.visitkorea.or.kr/cms/resource/59/3414159_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/59/3414159_image3_1.jpg",
			"lng": 127.022728613,
			"lat": 37.548507136
		},
		{
			"name": "길동복조리시장",
			"gu": "강동구",
			"addr": "서울특별시 강동구 천호대로187길 62 (길동)",
			"contentId": "2741605",
			"image": "https://tong.visitkorea.or.kr/cms/resource/74/2779574_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/74/2779574_image3_1.png",
			"lng": 127.1431985291,
			"lat": 37.5369606466
		},
		{
			"name": "남구로시장",
			"gu": "구로구",
			"addr": "서울특별시 구로구 구로동로26길 58 (구로동)",
			"contentId": "2591755",
			"image": "https://tong.visitkorea.or.kr/cms/resource/67/3581067_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/67/3581067_image3_1.jpg",
			"lng": 126.8872731601,
			"lat": 37.4899615113
		},
		{
			"name": "남대문시장",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장4길 21",
			"contentId": "132180",
			"image": "https://tong.visitkorea.or.kr/cms/resource/67/2612867_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/67/2612867_image3_1.jpg",
			"lng": 126.9776796357,
			"lat": 37.5592467455
		},
		{
			"name": "남대문인삼시장",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장길 25-8 (남대문로4가)",
			"contentId": "132225",
			"image": "https://tong.visitkorea.or.kr/cms/resource/31/3065131_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/31/3065131_image3_1.JPG",
			"lng": 126.977504615,
			"lat": 37.5605299268
		},
		{
			"name": "노량진수산물도매시장",
			"gu": "동작구",
			"addr": "서울특별시 동작구 노들로 674",
			"contentId": "132216",
			"image": "https://tong.visitkorea.or.kr/cms/resource/54/2382954_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/54/2382954_image2_1.JPG",
			"lng": 126.9368207234,
			"lat": 37.5148539488
		},
		{
			"name": "노룬산골목시장",
			"gu": "광진구",
			"addr": "서울특별시 광진구 자양동 816-79",
			"contentId": "2751406",
			"image": "https://tong.visitkorea.or.kr/cms/resource/56/2779656_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/56/2779656_image2_1.png",
			"lng": 127.064750115,
			"lat": 37.5369286806
		},
		{
			"name": "대신시장",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 도신로60길 7 (신길동)",
			"contentId": "2753117",
			"image": "https://tong.visitkorea.or.kr/cms/resource/25/3463525_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/25/3463525_image3_1.jpg",
			"lng": 126.9176003574,
			"lat": 37.5111234834
		},
		{
			"name": "도곡시장",
			"gu": "강남구",
			"addr": "서울특별시 강남구 역삼동",
			"contentId": "2782194",
			"image": "https://tong.visitkorea.or.kr/cms/resource/08/3571708_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/08/3571708_image3_1.jpg",
			"lng": 127.0518163002,
			"lat": 37.497452476
		},
		{
			"name": "독립문영천시장",
			"gu": "서대문구",
			"addr": "서울특별시 서대문구 통일로 189-1 (영천동)",
			"contentId": "2789102",
			"image": "https://tong.visitkorea.or.kr/cms/resource/79/2789779_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/79/2789779_image2_1.jpg",
			"lng": 126.9618613174,
			"lat": 37.5703868337
		},
		{
			"name": "독산동 우시장",
			"gu": "금천구",
			"addr": "서울특별시 금천구 범안로 1209 (독산동)",
			"contentId": "2743857",
			"image": "https://tong.visitkorea.or.kr/cms/resource/48/3573148_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/48/3573148_image3_1.jpg",
			"lng": 126.8963118743,
			"lat": 37.4668782419
		},
		{
			"name": "동대문종합시장",
			"gu": "종로구",
			"addr": "서울특별시 종로구 종로 266 (종로6가)",
			"contentId": "132200",
			"image": "https://tong.visitkorea.or.kr/cms/resource/55/3571855_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/55/3571855_image3_1.jpg",
			"lng": 127.0073349346,
			"lat": 37.5709736927
		},
		{
			"name": "동대문종합시장 액세서리상가",
			"gu": "종로구",
			"addr": "서울특별시 종로구 종로 266 (종로6가)",
			"contentId": "1013559",
			"image": "https://tong.visitkorea.or.kr/cms/resource/11/3571811_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/11/3571811_image2_1.jpg",
			"lng": 127.0073349346,
			"lat": 37.5709736927
		},
		{
			"name": "동대문종합시장 한복상가",
			"gu": "종로구",
			"addr": "서울특별시 종로구 종로 266 (종로6가)",
			"contentId": "1013584",
			"image": "https://tong.visitkorea.or.kr/cms/resource/19/1015219_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/19/1015219_image3_1.jpg",
			"lng": 127.0073349346,
			"lat": 37.5709736927
		},
		{
			"name": "동묘벼룩시장",
			"gu": "종로구",
			"addr": "서울특별시 종로구 숭인동",
			"contentId": "2765213",
			"image": "https://tong.visitkorea.or.kr/cms/resource/73/3571873_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/73/3571873_image3_1.jpg",
			"lng": 127.0177144794,
			"lat": 37.5732541699
		},
		{
			"name": "둔촌역전통시장",
			"gu": "강동구",
			"addr": "서울특별시 강동구 풍성로58길 34 (성내동)",
			"contentId": "2751863",
			"image": "https://tong.visitkorea.or.kr/cms/resource/00/3463700_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/00/3463700_image3_1.jpg",
			"lng": 127.1351717503,
			"lat": 37.5275365958
		},
		{
			"name": "마장 축산물시장",
			"gu": "성동구",
			"addr": "서울특별시 성동구 마장로33길 53 (마장동)",
			"contentId": "1253230",
			"image": "https://tong.visitkorea.or.kr/cms/resource/38/3463038_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/38/3463038_image3_1.jpg",
			"lng": 127.040020862,
			"lat": 37.5703743501
		},
		{
			"name": "마천시장",
			"gu": "송파구",
			"addr": "서울특별시 송파구 마천로45길 23 (마천동)",
			"contentId": "2759129",
			"image": "https://tong.visitkorea.or.kr/cms/resource/21/3567921_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/21/3567921_image3_1.jpg",
			"lng": 127.1505795216,
			"lat": 37.4980180786
		},
		{
			"name": "만리시장",
			"gu": "용산구",
			"addr": "서울특별시 용산구 효창원로 276",
			"contentId": "2761474",
			"image": "https://tong.visitkorea.or.kr/cms/resource/74/3564974_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/74/3564974_image3_1.jpg",
			"lng": 126.9632283903,
			"lat": 37.5516390373
		},
		{
			"name": "망원월드컵시장",
			"gu": "마포구",
			"addr": "서울특별시 마포구 망원동",
			"contentId": "2907085",
			"image": "https://tong.visitkorea.or.kr/cms/resource/67/2906867_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/67/2906867_image3_1.jpg",
			"lng": 126.9059167761,
			"lat": 37.5576900854
		},
		{
			"name": "면목시장",
			"gu": "중랑구",
			"addr": "서울특별시 중랑구 면목로37길 5 (면목동)",
			"contentId": "2759985",
			"image": "https://tong.visitkorea.or.kr/cms/resource/68/3539768_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/68/3539768_image3_1.jpg",
			"lng": 127.0859581012,
			"lat": 37.5789352941
		},
		{
			"name": "방산 종합시장",
			"gu": "중구",
			"addr": "서울특별시 중구 동호로37길 20 (주교동)",
			"contentId": "132241",
			"image": "https://tong.visitkorea.or.kr/cms/resource/79/2667479_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/79/2667479_image3_1.jpg",
			"lng": 127.0008217013,
			"lat": 37.5687766093
		},
		{
			"name": "방신전통시장",
			"gu": "강서구",
			"addr": "서울특별시 강서구 방화동로16길 31 (방화동)",
			"contentId": "2759655",
			"image": "https://tong.visitkorea.or.kr/cms/resource/87/3566887_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/87/3566887_image3_1.jpg",
			"lng": 126.8123638102,
			"lat": 37.5714757018
		},
		{
			"name": "사당시장",
			"gu": "동작구",
			"addr": "서울특별시 동작구 사당로 244 (사당동)",
			"contentId": "2759106",
			"lng": 126.9747681614,
			"lat": 37.4831388673
		},
		{
			"name": "상계중앙시장",
			"gu": "노원구",
			"addr": "서울특별시 노원구 상계로23나길 33 (상계동)",
			"contentId": "2758191",
			"image": "https://tong.visitkorea.or.kr/cms/resource/93/3566893_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/93/3566893_image3_1.jpg",
			"lng": 127.0702933369,
			"lat": 37.6597006221
		},
		{
			"name": "서울 중부시장",
			"gu": "중구",
			"addr": "서울특별시 중구 을지로36길 35",
			"contentId": "132217",
			"image": "https://tong.visitkorea.or.kr/cms/resource/46/1984446_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/46/1984446_image3_1.jpg",
			"lng": 127.0019383691,
			"lat": 37.5651409407
		},
		{
			"name": "서울 중앙시장",
			"gu": "중구",
			"addr": "서울특별시 중구 퇴계로85길 36",
			"contentId": "2589070",
			"image": "https://tong.visitkorea.or.kr/cms/resource/44/3414144_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/44/3414144_image3_1.jpg",
			"lng": 127.0197783639,
			"lat": 37.5667827371
		},
		{
			"name": "서울 평화시장",
			"gu": "중구",
			"addr": "서울특별시 중구 청계천로 274",
			"contentId": "132182",
			"image": "https://tong.visitkorea.or.kr/cms/resource/19/3077619_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/19/3077619_image3_1.JPG",
			"lng": 127.0080126943,
			"lat": 37.5694211079
		},
		{
			"name": "서울풍물시장",
			"gu": "동대문구",
			"addr": "서울특별시 동대문구 천호대로4길 21 (신설동)",
			"contentId": "1754832",
			"image": "https://tong.visitkorea.or.kr/cms/resource/63/3107663_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/63/3107663_image3_1.jpg",
			"lng": 127.0255193372,
			"lat": 37.5727654781
		},
		{
			"name": "송화벽화시장",
			"gu": "강서구",
			"addr": "서울특별시 강서구 내발산동",
			"contentId": "2741624",
			"image": "https://tong.visitkorea.or.kr/cms/resource/46/2779746_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/46/2779746_image3_1.jpg",
			"lng": 126.8357150763,
			"lat": 37.5494536785
		},
		{
			"name": "수유시장",
			"gu": "강북구",
			"addr": "서울특별시 강북구 도봉로67길 18 (수유동)",
			"contentId": "2741592",
			"image": "https://tong.visitkorea.or.kr/cms/resource/40/2779640_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/40/2779640_image3_1.png",
			"lng": 127.0232678952,
			"lat": 37.6307392541
		},
		{
			"name": "수유중앙시장",
			"gu": "강북구",
			"addr": "서울특별시 강북구 노해로17길 21 (수유동)",
			"contentId": "2741594",
			"image": "https://tong.visitkorea.or.kr/cms/resource/67/2779667_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/67/2779667_image2_1.png",
			"lng": 127.0212566863,
			"lat": 37.6406214014
		},
		{
			"name": "숭인시장",
			"gu": "강북구",
			"addr": "서울특별시 강북구 도봉로 45 (미아동)",
			"contentId": "2741591",
			"image": "https://tong.visitkorea.or.kr/cms/resource/86/2779686_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/86/2779686_image2_1.png",
			"lng": 127.0298594613,
			"lat": 37.6131469738
		},
		{
			"name": "신곡종합시장",
			"gu": "양천구",
			"addr": "서울특별시 양천구 남부순환로79길 37 (신월동)",
			"contentId": "2760228",
			"image": "https://tong.visitkorea.or.kr/cms/resource/57/3568157_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/57/3568157_image3_1.jpg",
			"lng": 126.8432097098,
			"lat": 37.5184213081
		},
		{
			"name": "신성종합시장",
			"gu": "광진구",
			"addr": "서울특별시 광진구 용마산로 50 (중곡동)",
			"contentId": "2774440",
			"image": "https://tong.visitkorea.or.kr/cms/resource/72/3467172_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/72/3467172_image3_1.jpg",
			"lng": 127.0880668343,
			"lat": 37.5581349705
		},
		{
			"name": "신영시장(서울)",
			"gu": "양천구",
			"addr": "서울특별시 양천구 월정로 161-5 (신월동)",
			"contentId": "2611323",
			"image": "https://tong.visitkorea.or.kr/cms/resource/45/3568145_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/45/3568145_image3_1.jpg",
			"lng": 126.8360377297,
			"lat": 37.5330667003
		},
		{
			"name": "신창시장",
			"gu": "도봉구",
			"addr": "서울특별시 도봉구 덕릉로57길 17 (창동)",
			"contentId": "2751420",
			"image": "https://tong.visitkorea.or.kr/cms/resource/01/2779701_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/01/2779701_image3_1.jpg",
			"lng": 127.0374719063,
			"lat": 37.6394884919
		},
		{
			"name": "아현시장",
			"gu": "마포구",
			"addr": "서울특별시 마포구 굴레방로9길 11-1 (아현동)",
			"contentId": "2751432",
			"image": "https://tong.visitkorea.or.kr/cms/resource/19/2779719_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/19/2779719_image3_1.jpg",
			"lng": 126.9549928834,
			"lat": 37.5567994008
		},
		{
			"name": "암사종합시장",
			"gu": "강동구",
			"addr": "서울특별시 강동구 상암로11길 25 (암사동)",
			"contentId": "2741602",
			"image": "https://tong.visitkorea.or.kr/cms/resource/68/2787768_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/68/2787768_image2_1.jpg",
			"lng": 127.1288355503,
			"lat": 37.5509115448
		},
		{
			"name": "양재꽃시장",
			"gu": "서초구",
			"addr": "서울특별시 서초구 강남대로 27 (양재동)",
			"contentId": "2784052",
			"image": "https://tong.visitkorea.or.kr/cms/resource/89/2796289_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/89/2796289_image3_1.jpg",
			"lng": 127.0407514903,
			"lat": 37.467391878
		},
		{
			"name": "영등포전통시장",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 영등포동2가",
			"contentId": "2764364",
			"image": "https://tong.visitkorea.or.kr/cms/resource/82/2779882_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/82/2779882_image3_1.png",
			"lng": 126.908114865,
			"lat": 37.5198528553
		},
		{
			"name": "영등포청과시장",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 영신로41길 5-1 (당산동1가, 에이원하우징)",
			"contentId": "2764375",
			"image": "https://tong.visitkorea.or.kr/cms/resource/92/2779892_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/92/2779892_image3_1.png",
			"lng": 126.900601604,
			"lat": 37.5218580438
		},
		{
			"name": "영일시장",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 문래로30길 27",
			"contentId": "2763905",
			"image": "https://tong.visitkorea.or.kr/cms/resource/42/3463442_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/42/3463442_image3_1.jpg",
			"lng": 126.9007600806,
			"lat": 37.5162531419
		},
		{
			"name": "오류시장",
			"gu": "구로구",
			"addr": "서울특별시 구로구 경인로19가길 14-1 (오류동)",
			"contentId": "2777893",
			"image": "https://tong.visitkorea.or.kr/cms/resource/83/3558683_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/83/3558683_image3_1.jpg",
			"lng": 126.8433408649,
			"lat": 37.4966071783
		},
		{
			"name": "우이시장",
			"gu": "강북구",
			"addr": "서울특별시 강북구 노해로23길 68",
			"contentId": "2741590",
			"image": "https://tong.visitkorea.or.kr/cms/resource/04/2779704_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/04/2779704_image3_1.png",
			"lng": 127.0200427521,
			"lat": 37.6460929656
		},
		{
			"name": "이태원시장",
			"gu": "용산구",
			"addr": "서울특별시 용산구 이태원로14길 6 (이태원동)",
			"contentId": "1253279",
			"image": "https://tong.visitkorea.or.kr/cms/resource/63/3568563_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/63/3568563_image3_1.jpg",
			"lng": 126.9900792234,
			"lat": 37.5338832483
		},
		{
			"name": "인현시장",
			"gu": "중구",
			"addr": "서울특별시 중구 인현동2가 192-1",
			"contentId": "2522037",
			"image": "https://tong.visitkorea.or.kr/cms/resource/87/3568387_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/87/3568387_image3_1.jpg",
			"lng": 126.9953417794,
			"lat": 37.5640409493
		},
		{
			"name": "정릉아리랑시장",
			"gu": "성북구",
			"addr": "서울특별시 성북구 아리랑로19길 10 (정릉동)",
			"contentId": "2758176",
			"image": "https://tong.visitkorea.or.kr/cms/resource/51/3463551_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/51/3463551_image3_1.jpg",
			"lng": 127.0128390879,
			"lat": 37.6027034367
		},
		{
			"name": "중곡제일골목시장",
			"gu": "광진구",
			"addr": "서울특별시 광진구 능동로47길 30 (중곡동)",
			"contentId": "2751414",
			"image": "https://tong.visitkorea.or.kr/cms/resource/66/2779666_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/66/2779666_image2_1.png",
			"lng": 127.0811367531,
			"lat": 37.5636397621
		},
		{
			"name": "청량리청과물시장",
			"gu": "동대문구",
			"addr": "서울특별시 동대문구 왕산로33길 4 (제기동)",
			"contentId": "2759652",
			"image": "https://tong.visitkorea.or.kr/cms/resource/82/3474682_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/82/3474682_image3_1.jpg",
			"lng": 127.0424148233,
			"lat": 37.579712197
		},
		{
			"name": "충신시장",
			"gu": "종로구",
			"addr": "서울특별시 종로구 충신동",
			"contentId": "2759976",
			"image": "https://tong.visitkorea.or.kr/cms/resource/66/3571866_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/66/3571866_image3_1.jpg",
			"lng": 127.0053155583,
			"lat": 37.5750537379
		},
		{
			"name": "태릉시장",
			"gu": "중랑구",
			"addr": "서울특별시 중랑구 동일로129길 35",
			"contentId": "2761478",
			"image": "https://tong.visitkorea.or.kr/cms/resource/11/3463411_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/11/3463411_image3_1.jpg",
			"lng": 127.0775638424,
			"lat": 37.5992605586
		},
		{
			"name": "풍납도깨비시장",
			"gu": "송파구",
			"addr": "서울특별시 송파구 바람드리길 37-1 (풍납동)",
			"contentId": "2758811",
			"image": "https://tong.visitkorea.or.kr/cms/resource/24/3568024_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/24/3568024_image3_1.jpg",
			"lng": 127.1201506098,
			"lat": 37.5375518286
		},
		{
			"name": "화곡본동시장",
			"gu": "강서구",
			"addr": "서울특별시 강서구 까치산로 35 (화곡동)",
			"contentId": "2753917",
			"image": "https://tong.visitkorea.or.kr/cms/resource/82/3566882_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/82/3566882_image3_1.jpg",
			"lng": 126.8441422693,
			"lat": 37.5429379198
		},
		{
			"name": "후암시장",
			"gu": "용산구",
			"addr": "서울특별시 용산구 후암로35길 24 (후암동)",
			"contentId": "2760240",
			"image": "https://tong.visitkorea.or.kr/cms/resource/69/3520069_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/69/3520069_image3_1.jpg",
			"lng": 126.9760189231,
			"lat": 37.5505143975
		}
	],
	museum: [
		{
			"name": "고촌이종근기념관",
			"gu": "서대문구",
			"addr": "서울특별시 서대문구 충정로 8",
			"contentId": "2453179",
			"image": "https://tong.visitkorea.or.kr/cms/resource/45/3462945_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/45/3462945_image3_1.jpg",
			"lng": 126.9631392793,
			"lat": 37.5597464264
		},
		{
			"name": "국립중앙박물관 전통염료식물원",
			"gu": "용산구",
			"addr": "서울특별시 용산구 서빙고로 137 (용산동6가)",
			"contentId": "1604580",
			"image": "https://tong.visitkorea.or.kr/cms/resource/52/3505552_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/52/3505552_image3_1.jpg",
			"lng": 126.9791278024,
			"lat": 37.5211706397
		},
		{
			"name": "K-컬처 스크린(대한민국역사박물관)",
			"gu": "종로구",
			"addr": "서울특별시 종로구 세종대로 198 (세종로)",
			"contentId": "2992823",
			"image": "https://tong.visitkorea.or.kr/cms/resource/06/2987806_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/06/2987806_image3_1.jpg",
			"lng": 126.977573668,
			"lat": 37.5741339024
		},
		{
			"name": "가회민화박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 북촌로 52 (가회동)",
			"contentId": "130446",
			"image": "https://tong.visitkorea.or.kr/cms/resource/90/3355090_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/90/3355090_image3_1.png",
			"lng": 126.9852783115,
			"lat": 37.58154429
		},
		{
			"name": "간송미술관(서울 보화각)",
			"gu": "성북구",
			"addr": "서울특별시 성북구 성북로 102-11 (성북동)",
			"contentId": "130511",
			"image": "https://tong.visitkorea.or.kr/cms/resource/43/3464643_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/43/3464643_image3_1.jpg",
			"lng": 126.9973796423,
			"lat": 37.5936764304
		},
		{
			"name": "경기여고 경운박물관(서울)",
			"gu": "강남구",
			"addr": "서울특별시 강남구 삼성로 29",
			"contentId": "2552251",
			"image": "https://tong.visitkorea.or.kr/cms/resource/99/3393799_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/99/3393799_image3_1.JPG",
			"lng": 127.0656764529,
			"lat": 37.4867511901
		},
		{
			"name": "경희대학교 자연사박물관",
			"gu": "동대문구",
			"addr": "서울특별시 동대문구 경희대로 26 (회기동)",
			"contentId": "130920",
			"image": "https://tong.visitkorea.or.kr/cms/resource/01/3540401_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/01/3540401_image3_1.jpg",
			"lng": 127.0527301456,
			"lat": 37.5939357294
		},
		{
			"name": "고려대학교 박물관",
			"gu": "성북구",
			"addr": "서울특별시 성북구 안암로 145 (안암동5가)",
			"contentId": "129831",
			"image": "https://tong.visitkorea.or.kr/cms/resource/24/3540424_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/24/3540424_image3_1.jpg",
			"lng": 127.0340403438,
			"lat": 37.5882471654
		},
		{
			"name": "공평도시유적전시관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 우정국로 26",
			"contentId": "2606224",
			"image": "https://tong.visitkorea.or.kr/cms/resource/18/3514018_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/18/3514018_image3_1.jpg",
			"lng": 126.9835704148,
			"lat": 37.5716231906
		},
		{
			"name": "국립국악박물관",
			"gu": "서초구",
			"addr": "서울특별시 서초구 남부순환로 2364 (서초동)",
			"contentId": "130125",
			"image": "https://tong.visitkorea.or.kr/cms/resource/74/3540474_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/74/3540474_image3_1.jpg",
			"lng": 127.0090512856,
			"lat": 37.4784066973
		},
		{
			"name": "국립기상박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 송월동 1-1 국립기상박물관",
			"contentId": "3038260",
			"image": "https://tong.visitkorea.or.kr/cms/resource/38/3456038_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/38/3456038_image3_1.jpg",
			"lng": 126.9666303489,
			"lat": 37.5696203417
		},
		{
			"name": "국립항공박물관 항공도서관",
			"gu": "강서구",
			"addr": "서울특별시 강서구 하늘길 177 (공항동)",
			"contentId": "3441464",
			"image": "https://tong.visitkorea.or.kr/cms/resource/71/3441671_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/71/3441671_image3_1.JPG",
			"lng": 126.8088867586,
			"lat": 37.5569217768
		},
		{
			"name": "국립현대미술관 서울",
			"gu": "종로구",
			"addr": "서울특별시 종로구 삼청로 30",
			"contentId": "1934593",
			"image": "https://tong.visitkorea.or.kr/cms/resource/02/2991502_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/02/2991502_image3_1.jpg",
			"lng": 126.9800038741,
			"lat": 37.5786500878
		},
		{
			"name": "근현대사기념관",
			"gu": "강북구",
			"addr": "서울특별시 강북구 4.19로 114 (수유동)",
			"contentId": "2535347",
			"image": "https://tong.visitkorea.or.kr/cms/resource/35/3400835_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/35/3400835_image3_1.JPG",
			"lng": 127.0028443946,
			"lat": 37.6434957358
		},
		{
			"name": "김달진미술자료박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 홍지문1길 4 (홍지동)",
			"contentId": "2553377",
			"image": "https://tong.visitkorea.or.kr/cms/resource/70/3412170_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/70/3412170_image3_1.JPG",
			"lng": 126.9566637277,
			"lat": 37.600105508
		},
		{
			"name": "김세중미술관",
			"gu": "용산구",
			"addr": "서울특별시 용산구 효창원로70길 35 (효창동)",
			"contentId": "3080721",
			"lng": 126.9638980442,
			"lat": 37.5420707165
		},
		{
			"name": "대한민국역사박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 세종대로 198 (세종로)",
			"contentId": "1849416",
			"image": "https://tong.visitkorea.or.kr/cms/resource/89/3082989_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/89/3082989_image3_1.JPG",
			"lng": 126.977573668,
			"lat": 37.5741339024
		},
		{
			"name": "동덕여자대학교 박물관",
			"gu": "성북구",
			"addr": "서울특별시 성북구 화랑로13길 60 (하월곡동)",
			"contentId": "1628531",
			"image": "https://tong.visitkorea.or.kr/cms/resource/50/3533050_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/50/3533050_image3_1.jpg",
			"lng": 127.0413558418,
			"lat": 37.6058952457
		},
		{
			"name": "떡박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 돈화문로 71 (와룡동)",
			"contentId": "130365",
			"image": "https://tong.visitkorea.or.kr/cms/resource/39/3540839_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/39/3540839_image3_1.jpg",
			"lng": 126.9906530083,
			"lat": 37.574953486
		},
		{
			"name": "매헌 윤봉길의사 기념관",
			"gu": "서초구",
			"addr": "서울특별시 서초구 매헌로 99 (양재동)",
			"contentId": "753972",
			"image": "https://tong.visitkorea.or.kr/cms/resource/39/3521639_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/39/3521639_image3_1.jpg",
			"lng": 127.0368379074,
			"lat": 37.4691610476
		},
		{
			"name": "목인박물관 목석원",
			"gu": "종로구",
			"addr": "서울특별시 종로구 창의문로5길 46-1 (부암동)",
			"contentId": "231976",
			"image": "https://tong.visitkorea.or.kr/cms/resource/15/3540815_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/15/3540815_image3_1.jpg",
			"lng": 126.9633051014,
			"lat": 37.5890707988
		},
		{
			"name": "밀알미술관",
			"gu": "강남구",
			"addr": "서울특별시 강남구 일원로 90",
			"contentId": "130627",
			"image": "https://tong.visitkorea.or.kr/cms/resource/83/3589983_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/83/3589983_image3_1.jpg",
			"lng": 127.0823082922,
			"lat": 37.4860793454
		},
		{
			"name": "배재학당역사박물관",
			"gu": "중구",
			"addr": "서울특별시 중구 서소문로11길 19 (정동)",
			"contentId": "1198901",
			"image": "https://tong.visitkorea.or.kr/cms/resource/19/3533219_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/19/3533219_image3_1.jpg",
			"lng": 126.9728160596,
			"lat": 37.5638516791
		},
		{
			"name": "백범김구기념관",
			"gu": "용산구",
			"addr": "서울특별시 용산구 임정로 26 (효창동)",
			"contentId": "130473",
			"image": "https://tong.visitkorea.or.kr/cms/resource/98/3521598_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/98/3521598_image3_1.jpg",
			"lng": 126.9592678461,
			"lat": 37.5443314817
		},
		{
			"name": "백악미술관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 인사동9길 16 (관훈동)",
			"contentId": "130629",
			"image": "https://tong.visitkorea.or.kr/cms/resource/95/3590795_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/95/3590795_image3_1.jpg",
			"lng": 126.9841536365,
			"lat": 37.5736924051
		},
		{
			"name": "분재박물관",
			"gu": "서초구",
			"addr": "서울특별시 서초구 신흥안길 40-10 (내곡동)",
			"contentId": "130179",
			"image": "https://tong.visitkorea.or.kr/cms/resource/97/3540597_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/97/3540597_image3_1.jpg",
			"lng": 127.0753292756,
			"lat": 37.4541495916
		},
		{
			"name": "삼성출판박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 비봉길 2-2 (구기동)",
			"contentId": "130931",
			"image": "https://tong.visitkorea.or.kr/cms/resource/50/3540850_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/50/3540850_image3_1.jpg",
			"lng": 126.9571134414,
			"lat": 37.6087517327
		},
		{
			"name": "상상톡톡 미술관",
			"gu": "강북구",
			"addr": "서울특별시 강북구 월계로 173 (번동)",
			"contentId": "1106194",
			"image": "https://tong.visitkorea.or.kr/cms/resource/70/3366370_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/70/3366370_image3_1.jpg",
			"lng": 127.0445440464,
			"lat": 37.619724251
		},
		{
			"name": "서소문성지역사박물관",
			"gu": "중구",
			"addr": "서울특별시 중구 칠패로 5 (의주로2가)",
			"contentId": "2765202",
			"image": "https://tong.visitkorea.or.kr/cms/resource/75/3430175_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/75/3430175_image3_1.JPG",
			"lng": 126.9693637143,
			"lat": 37.5596854342
		},
		{
			"name": "서울공예박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 율곡로3길 4",
			"contentId": "2738571",
			"image": "https://tong.visitkorea.or.kr/cms/resource/87/3083687_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/87/3083687_image3_1.JPG",
			"lng": 126.9835480508,
			"lat": 37.5767003779
		},
		{
			"name": "서울대학교 박물관",
			"gu": "관악구",
			"addr": "서울특별시 관악구 관악로 1 서울대학교",
			"contentId": "129839",
			"image": "https://tong.visitkorea.or.kr/cms/resource/99/3574499_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/99/3574499_image3_1.jpg",
			"lng": 126.9483849253,
			"lat": 37.4663514558
		},
		{
			"name": "서울생활사박물관",
			"gu": "노원구",
			"addr": "서울특별시 노원구 동일로174길 27 (공릉동)",
			"contentId": "2638474",
			"image": "https://tong.visitkorea.or.kr/cms/resource/84/3540384_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/84/3540384_image3_1.jpg",
			"lng": 127.0769772183,
			"lat": 37.6191332378
		},
		{
			"name": "서울시립 북서울미술관",
			"gu": "노원구",
			"addr": "서울특별시 노원구 동일로 1238 (중계동)",
			"contentId": "1866427",
			"image": "https://tong.visitkorea.or.kr/cms/resource/02/3332402_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/02/3332402_image3_1.jpg",
			"lng": 127.0668719687,
			"lat": 37.6407111019
		},
		{
			"name": "서울역사박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 새문안로 55 (신문로2가)",
			"contentId": "130361",
			"image": "https://tong.visitkorea.or.kr/cms/resource/87/2661487_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/87/2661487_image2_1.JPG",
			"lng": 126.9707771853,
			"lat": 37.5698981615
		},
		{
			"name": "성균관대학교 인문사회과학캠퍼스박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 성균관로 25-2 (명륜3가)",
			"contentId": "129838",
			"image": "https://tong.visitkorea.or.kr/cms/resource/09/3556509_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/09/3556509_image3_1.jpg",
			"lng": 126.9969632609,
			"lat": 37.5849607702
		},
		{
			"name": "성신여자대학교박물관",
			"gu": "성북구",
			"addr": "서울특별시 성북구 보문로34다길 2 (돈암동)",
			"contentId": "129822",
			"image": "https://tong.visitkorea.or.kr/cms/resource/90/3393190_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/90/3393190_image3_1.jpg",
			"lng": 127.0209803351,
			"lat": 37.5913410151
		},
		{
			"name": "세계장신구박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 북촌로5나길 2 (화동)",
			"contentId": "130688",
			"image": "https://tong.visitkorea.or.kr/cms/resource/63/3574663_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/63/3574663_image3_1.jpg",
			"lng": 126.9818203079,
			"lat": 37.5810303992
		},
		{
			"name": "손기정기념관",
			"gu": "중구",
			"addr": "서울특별시 중구 손기정로 101-4 (만리동2가)",
			"contentId": "1799798",
			"image": "https://tong.visitkorea.or.kr/cms/resource/54/3504754_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/54/3504754_image3_1.jpg",
			"lng": 126.964722579,
			"lat": 37.5558524631
		},
		{
			"name": "수도박물관",
			"gu": "성동구",
			"addr": "서울특별시 성동구 왕십리로 27 (성수동1가)",
			"contentId": "2453996",
			"image": "https://tong.visitkorea.or.kr/cms/resource/76/3309176_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/76/3309176_image3_1.jpg",
			"lng": 127.0422770776,
			"lat": 37.5398807113
		},
		{
			"name": "신문박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 세종대로 152",
			"contentId": "130418",
			"image": "https://tong.visitkorea.or.kr/cms/resource/15/3556615_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/15/3556615_image3_1.jpg",
			"lng": 126.9776487818,
			"lat": 37.5698760651
		},
		{
			"name": "아르코미술관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 동숭길 3 아르코 미술관",
			"contentId": "130403",
			"image": "https://tong.visitkorea.or.kr/cms/resource/28/2993428_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/28/2993428_image3_1.jpg",
			"lng": 127.0025212349,
			"lat": 37.579753142
		},
		{
			"name": "아모레퍼시픽미술관",
			"gu": "용산구",
			"addr": "서울특별시 용산구 한강대로 100 (한강로2가)",
			"contentId": "2773303",
			"image": "https://tong.visitkorea.or.kr/cms/resource/57/2780457_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/57/2780457_image3_1.jpg",
			"lng": 126.9686896475,
			"lat": 37.5288445615
		},
		{
			"name": "양화진홀 전시관",
			"gu": "마포구",
			"addr": "서울특별시 마포구 양화진길 46",
			"contentId": "1413224",
			"image": "https://tong.visitkorea.or.kr/cms/resource/21/3565321_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/21/3565321_image3_1.jpg",
			"lng": 126.911699899,
			"lat": 37.546477603
		},
		{
			"name": "용산도시기억전시관",
			"gu": "용산구",
			"addr": "서울특별시 용산구 서빙고로 17 (한강로3가)",
			"contentId": "2714284",
			"image": "https://tong.visitkorea.or.kr/cms/resource/81/3437081_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/81/3437081_image3_1.jpg",
			"lng": 126.9667565805,
			"lat": 37.525656008
		},
		{
			"name": "우리옛돌박물관",
			"gu": "성북구",
			"addr": "서울특별시 성북구 대사관로13길 66 (성북동)",
			"contentId": "2372228",
			"image": "https://tong.visitkorea.or.kr/cms/resource/15/3503215_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/15/3503215_image3_1.jpg",
			"lng": 126.9901495387,
			"lat": 37.6009504556
		},
		{
			"name": "유금와당박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 창의문로11가길 4 (부암동)",
			"contentId": "2554142",
			"image": "https://tong.visitkorea.or.kr/cms/resource/81/3384781_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/81/3384781_image3_1.JPG",
			"lng": 126.9626772472,
			"lat": 37.593767464
		},
		{
			"name": "이한열기념관",
			"gu": "마포구",
			"addr": "서울특별시 마포구 신촌로12나길 26",
			"contentId": "130961",
			"image": "https://tong.visitkorea.or.kr/cms/resource/06/3505706_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/06/3505706_image3_1.jpg",
			"lng": 126.9338531935,
			"lat": 37.5550242286
		},
		{
			"name": "이화여고100주년기념관",
			"gu": "중구",
			"addr": "서울특별시 중구 정동길 26",
			"contentId": "2762871",
			"image": "https://tong.visitkorea.or.kr/cms/resource/47/3412247_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/47/3412247_image3_1.JPG",
			"lng": 126.9713189165,
			"lat": 37.5658819712
		},
		{
			"name": "이화여대 자연사박물관",
			"gu": "서대문구",
			"addr": "서울특별시 서대문구 이화여대길 52",
			"contentId": "130949",
			"image": "https://tong.visitkorea.or.kr/cms/resource/46/3305246_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/46/3305246_image3_1.jpg",
			"lng": 126.9465962863,
			"lat": 37.5617625629
		},
		{
			"name": "일민미술관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 세종대로 152 (세종로)",
			"contentId": "130227",
			"image": "https://tong.visitkorea.or.kr/cms/resource/25/3412025_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/25/3412025_image3_1.JPG",
			"lng": 126.9776737786,
			"lat": 37.5699121725
		},
		{
			"name": "전기박물관",
			"gu": "서초구",
			"addr": "서울특별시 서초구 효령로72길 60 (서초동)",
			"contentId": "130951",
			"image": "https://tong.visitkorea.or.kr/cms/resource/11/3540611_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/11/3540611_image3_1.jpg",
			"lng": 127.0280882379,
			"lat": 37.4856423108
		},
		{
			"name": "전쟁기념관",
			"gu": "용산구",
			"addr": "서울특별시 용산구 이태원로 29",
			"contentId": "130431",
			"image": "https://tong.visitkorea.or.kr/cms/resource/29/3465929_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/29/3465929_image3_1.JPG",
			"lng": 126.9784385198,
			"lat": 37.5373270838
		},
		{
			"name": "전태일기념관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 청계천로 105 (관수동)",
			"contentId": "2739478",
			"image": "https://tong.visitkorea.or.kr/cms/resource/26/3412126_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/26/3412126_image3_1.JPG",
			"lng": 126.9893144237,
			"lat": 37.5685208763
		},
		{
			"name": "짚풀생활사박물관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 성균관로4길 45 (명륜2가)",
			"contentId": "129804",
			"image": "https://tong.visitkorea.or.kr/cms/resource/26/3540826_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/26/3540826_image3_1.jpg",
			"lng": 126.9998574414,
			"lat": 37.5849580441
		},
		{
			"name": "초전섬유·퀼트박물관",
			"gu": "중구",
			"addr": "서울특별시 중구 퇴계로18길 66 (남산동1가)",
			"contentId": "130263",
			"image": "https://tong.visitkorea.or.kr/cms/resource/51/3109351_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/51/3109351_image3_1.JPG",
			"lng": 126.9842429564,
			"lat": 37.5581803204
		},
		{
			"name": "포스코미술관",
			"gu": "강남구",
			"addr": "서울특별시 강남구 테헤란로 440",
			"contentId": "130226",
			"image": "https://tong.visitkorea.or.kr/cms/resource/54/684154_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/54/684154_image3_1.jpg",
			"lng": 127.056076785,
			"lat": 37.505876575
		},
		{
			"name": "한국미술관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 인사동길 12",
			"contentId": "2739479",
			"image": "https://tong.visitkorea.or.kr/cms/resource/76/3412076_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/76/3412076_image3_1.JPG",
			"lng": 126.9872645136,
			"lat": 37.5719509965
		},
		{
			"name": "한생연 생명과학박물관",
			"gu": "양천구",
			"addr": "서울특별시 양천구 목동동로 206-1 (목동)",
			"contentId": "2760301",
			"image": "https://tong.visitkorea.or.kr/cms/resource/81/3589481_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/81/3589481_image3_1.jpg",
			"lng": 126.8720291483,
			"lat": 37.5239767319
		},
		{
			"name": "한성백제박물관",
			"gu": "송파구",
			"addr": "서울특별시 송파구 위례성대로 71 (방이동)",
			"contentId": "1916296",
			"image": "https://tong.visitkorea.or.kr/cms/resource/55/3502855_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/55/3502855_image3_1.jpg",
			"lng": 127.1206650789,
			"lat": 37.5154988428
		},
		{
			"name": "한양대학교 박물관",
			"gu": "성동구",
			"addr": "서울특별시 성동구 왕십리로 222 (사근동)",
			"contentId": "130958",
			"image": "https://tong.visitkorea.or.kr/cms/resource/29/3537629_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/29/3537629_image3_1.jpg",
			"lng": 127.0429292967,
			"lat": 37.5574647913
		},
		{
			"name": "호림박물관 신림본관",
			"gu": "관악구",
			"addr": "서울특별시 관악구 남부순환로152길 53 (신림동)",
			"contentId": "129799",
			"image": "https://tong.visitkorea.or.kr/cms/resource/80/3540180_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/80/3540180_image3_1.jpg",
			"lng": 126.9187927683,
			"lat": 37.4808186916
		},
		{
			"name": "화랑대역사 전시관",
			"gu": "노원구",
			"addr": "서울특별시 노원구 화랑로 610 (공릉동)",
			"contentId": "3456876",
			"image": "https://tong.visitkorea.or.kr/cms/resource/62/3456862_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/62/3456862_image3_1.jpg",
			"lng": 127.0932978062,
			"lat": 37.6243079306
		},
		{
			"name": "환기미술관",
			"gu": "종로구",
			"addr": "서울특별시 종로구 자하문로40길 63",
			"contentId": "129760",
			"image": "https://tong.visitkorea.or.kr/cms/resource/52/3488552_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/52/3488552_image3_1.jpg",
			"lng": 126.9661269237,
			"lat": 37.5940980426
		},
		{
			"name": "K현대미술관",
			"gu": "강남구",
			"addr": "서울특별시 강남구 선릉로 807 (신사동)",
			"contentId": "2773265",
			"image": "https://tong.visitkorea.or.kr/cms/resource/79/2778979_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/79/2778979_image2_1.jpg",
			"lng": 127.0391861299,
			"lat": 37.5244324498
		}
	],
	flower: [{
		"name": "안양천제방벚꽃길",
		"gu": "영등포구",
		"addr": "서울특별시 영등포구 양평동1가",
		"contentId": "2774291",
		"image": "https://tong.visitkorea.or.kr/cms/resource/44/3540444_image2_1.jpg",
		"thumb": "https://tong.visitkorea.or.kr/cms/resource/44/3540444_image3_1.jpg",
		"lng": 126.8812144059,
		"lat": 37.524551829
	}, {
		"name": "푸른수목원",
		"gu": "구로구",
		"addr": "서울특별시 구로구 연동로 240",
		"contentId": "2675098",
		"image": "https://tong.visitkorea.or.kr/cms/resource/46/3545146_image2_1.jpg",
		"thumb": "https://tong.visitkorea.or.kr/cms/resource/46/3545146_image3_1.jpg",
		"lng": 126.8240846662,
		"lat": 37.483080629
	}],
	walk: [
		{
			"name": "개봉유수지 생태공원",
			"gu": "구로구",
			"addr": "서울특별시 구로구 개봉동",
			"contentId": "2591792",
			"image": "https://tong.visitkorea.or.kr/cms/resource/55/3558655_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/55/3558655_image3_1.jpg",
			"lng": 126.8632141714,
			"lat": 37.4924524597
		},
		{
			"name": "궁동저수지 생태공원",
			"gu": "구로구",
			"addr": "서울특별시 구로구 궁동",
			"contentId": "2591809",
			"image": "https://tong.visitkorea.or.kr/cms/resource/02/3570402_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/02/3570402_image3_1.jpg",
			"lng": 126.8293197915,
			"lat": 37.5012175047
		},
		{
			"name": "남산순환나들길",
			"gu": "중구",
			"addr": "서울특별시 중구 남산공원길 609 (예장동)",
			"contentId": "2783557",
			"image": "https://tong.visitkorea.or.kr/cms/resource/60/3458860_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/60/3458860_image3_1.jpg",
			"lng": 126.9866844934,
			"lat": 37.5549112997
		},
		{
			"name": "덕수궁 돌담길",
			"gu": "중구",
			"addr": "서울특별시 중구 세종대로 지하 101",
			"contentId": "129186",
			"image": "https://tong.visitkorea.or.kr/cms/resource/50/2658350_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/50/2658350_image3_1.jpg",
			"lng": 126.9748935853,
			"lat": 37.5660820124
		},
		{
			"name": "무수골계곡",
			"gu": "도봉구",
			"addr": "서울특별시 도봉구 도봉동",
			"contentId": "2759649",
			"image": "https://tong.visitkorea.or.kr/cms/resource/58/3571758_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/58/3571758_image3_1.jpg",
			"lng": 127.0338156248,
			"lat": 37.6766535473
		},
		{
			"name": "서울로 7017",
			"gu": "중구",
			"addr": "서울특별시 중구 한강대로 405",
			"contentId": "2495561",
			"image": "https://tong.visitkorea.or.kr/cms/resource/09/3081409_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/09/3081409_image3_1.jpg",
			"lng": 126.9706609645,
			"lat": 37.5545193912
		},
		{
			"name": "수성동계곡",
			"gu": "종로구",
			"addr": "서울특별시 종로구 옥인동 185-3",
			"contentId": "2733962",
			"lng": 126.9631997475,
			"lat": 37.5822799198
		},
		{
			"name": "여의도샛강생태공원",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 여의동로 48 (여의도동)",
			"contentId": "809596",
			"image": "https://tong.visitkorea.or.kr/cms/resource/74/3569374_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/74/3569374_image3_1.jpg",
			"lng": 126.9219608556,
			"lat": 37.5187726724
		},
		{
			"name": "연남동끝자락길",
			"gu": "마포구",
			"addr": "서울특별시 마포구 성미산로17길",
			"contentId": "2784040",
			"image": "https://tong.visitkorea.or.kr/cms/resource/63/3467763_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/63/3467763_image3_1.jpg",
			"lng": 126.9170794124,
			"lat": 37.5660143173
		},
		{
			"name": "우면산자연생태공원",
			"gu": "서초구",
			"addr": "서울특별시 서초구 우면동",
			"contentId": "2757831",
			"image": "https://tong.visitkorea.or.kr/cms/resource/96/3540696_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/96/3540696_image3_1.jpg",
			"lng": 127.0171146993,
			"lat": 37.4692523493
		},
		{
			"name": "우이동계곡",
			"gu": "강북구",
			"addr": "서울특별시 강북구 삼양로181길 141-5 (우이동)",
			"contentId": "758299",
			"image": "https://tong.visitkorea.or.kr/cms/resource/54/3568554_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/54/3568554_image3_1.jpg",
			"lng": 127.0076182199,
			"lat": 37.6694622455
		},
		{
			"name": "경춘선숲길",
			"gu": "노원구",
			"addr": "서울특별시 노원구 하계동 107-2",
			"contentId": "2704696",
			"image": "https://tong.visitkorea.or.kr/cms/resource/58/2650858_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/58/2650858_image3_1.jpg",
			"lng": 127.0694164404,
			"lat": 37.6316233163
		},
		{
			"name": "북한산 자락길",
			"gu": "서대문구",
			"addr": "서울특별시 서대문구 홍은동",
			"contentId": "2406564",
			"image": "https://tong.visitkorea.or.kr/cms/resource/43/2405143_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/43/2405143_image3_1.jpg",
			"lng": 126.9429290191,
			"lat": 37.5948003229
		},
		{
			"name": "여의도 둘레길(여의도 자전거도로)",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 여의동로 330",
			"contentId": "1054888",
			"image": "https://tong.visitkorea.or.kr/cms/resource/87/3551287_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/87/3551287_image3_1.jpg",
			"lng": 126.933612357,
			"lat": 37.5263886632
		},
		{
			"name": "워커힐숲길",
			"gu": "광진구",
			"addr": "서울특별시 광진구 워커힐로 177",
			"contentId": "2773297",
			"image": "https://tong.visitkorea.or.kr/cms/resource/72/2780772_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/72/2780772_image3_1.png",
			"lng": 127.1107898477,
			"lat": 37.5552218298
		},
		{
			"name": "[북악하늘길 2산책로] 하늘교~성북천발원지",
			"gu": "성북구",
			"addr": "서울특별시 성북구 대사관로 1 (성북동)",
			"contentId": "1037020",
			"image": "https://tong.visitkorea.or.kr/cms/resource/15/1868115_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/15/1868115_image3_1.jpg",
			"lng": 126.9841946526,
			"lat": 37.5965036428
		},
		{
			"name": "[북악하늘길 3산책로] 북카페~숲속다리",
			"gu": "성북구",
			"addr": "서울특별시 성북구 성북동",
			"contentId": "1037027",
			"image": "https://tong.visitkorea.or.kr/cms/resource/33/1868133_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/33/1868133_image3_1.jpg",
			"lng": 126.9858969827,
			"lat": 37.6068219183
		},
		{
			"name": "[북악하늘길 스카이웨이] 하늘한마당~하늘마루",
			"gu": "성북구",
			"addr": "서울특별시 성북구 성북동",
			"contentId": "1037031",
			"image": "https://tong.visitkorea.or.kr/cms/resource/09/1568109_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/09/1568109_image3_1.jpg",
			"lng": 127.0068155826,
			"lat": 37.569354427
		},
		{
			"name": "[북한산 둘레길 10구간] 내시묘역길",
			"gu": "은평구",
			"addr": "서울특별시 은평구 진관동",
			"contentId": "1197225",
			"image": "https://tong.visitkorea.or.kr/cms/resource/22/3511822_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/22/3511822_image3_1.jpg",
			"lng": 126.9382140738,
			"lat": 37.6472524711
		},
		{
			"name": "[북한산 둘레길 4구간] 솔샘길",
			"gu": "성북구",
			"addr": "서울특별시 성북구 솔샘로25길 121-50",
			"contentId": "1196871",
			"image": "https://tong.visitkorea.or.kr/cms/resource/07/3500007_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/07/3500007_image3_1.jpg",
			"lng": 127.0069335488,
			"lat": 37.6210484201
		},
		{
			"name": "[양천구 둘레길] 하천형코스",
			"gu": "양천구",
			"addr": "서울특별시 양천구 목동",
			"contentId": "2612154",
			"image": "https://tong.visitkorea.or.kr/cms/resource/29/2612129_image2_1.bmp",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/29/2612129_image2_1.bmp",
			"lng": 126.8808138178,
			"lat": 37.5467520196
		}
	],
	hike: [
		{
			"name": "관악산",
			"gu": "관악구",
			"addr": "서울특별시 관악구 관악로",
			"contentId": "126480",
			"image": "https://tong.visitkorea.or.kr/cms/resource/74/3589374_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/74/3589374_image3_1.jpg",
			"lng": 126.9540987991,
			"lat": 37.4484036407
		},
		{
			"name": "관악산자연공원",
			"gu": "관악구",
			"addr": "서울특별시 관악구 신림동",
			"contentId": "3081140",
			"image": "https://tong.visitkorea.or.kr/cms/resource/38/3081138_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/38/3081138_image3_1.JPG",
			"lng": 126.9455546273,
			"lat": 37.4663402951
		},
		{
			"name": "관음사국기봉",
			"gu": "관악구",
			"addr": "서울특별시 관악구 신림동",
			"contentId": "2779550",
			"image": "https://tong.visitkorea.or.kr/cms/resource/56/2796456_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/56/2796456_image2_1.jpg",
			"lng": 126.9383143508,
			"lat": 37.4403515161
		},
		{
			"name": "구룡산(서울)",
			"gu": "서초구",
			"addr": "서울특별시 서초구 염곡동",
			"contentId": "2357761",
			"image": "https://tong.visitkorea.or.kr/cms/resource/90/3530390_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/90/3530390_image3_1.jpg",
			"lng": 127.0615995465,
			"lat": 37.4690781677
		},
		{
			"name": "남산 팔각정",
			"gu": "중구",
			"addr": "서울특별시 중구 예장동 8-1",
			"contentId": "1603336",
			"image": "https://tong.visitkorea.or.kr/cms/resource/25/3539625_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/25/3539625_image3_1.jpg",
			"lng": 126.9876206116,
			"lat": 37.5516394747
		},
		{
			"name": "남산공원(서울)",
			"gu": "중구",
			"addr": "서울특별시 중구 삼일대로 231 (예장동)",
			"contentId": "126485",
			"image": "https://tong.visitkorea.or.kr/cms/resource/56/3539656_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/56/3539656_image3_1.jpg",
			"lng": 126.9922311881,
			"lat": 37.5556863093
		},
		{
			"name": "대모산도시자연공원",
			"gu": "강남구",
			"addr": "서울특별시 강남구 일원동",
			"contentId": "1602451",
			"image": "https://tong.visitkorea.or.kr/cms/resource/45/3589845_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/45/3589845_image3_1.jpg",
			"lng": 127.081014136,
			"lat": 37.4800522436
		},
		{
			"name": "배봉산",
			"gu": "동대문구",
			"addr": "서울특별시 동대문구 전농동",
			"contentId": "2661483",
			"lng": 127.0638156159,
			"lat": 37.580954105
		},
		{
			"name": "봉화산(서울)",
			"gu": "중랑구",
			"addr": "서울특별시 중랑구 묵동",
			"contentId": "1115042",
			"image": "https://tong.visitkorea.or.kr/cms/resource/23/3573123_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/23/3573123_image3_1.jpg",
			"lng": 127.0870155001,
			"lat": 37.608354116
		},
		{
			"name": "북악산",
			"gu": "종로구",
			"addr": "서울특별시 종로구 청운동",
			"contentId": "809190",
			"image": "https://tong.visitkorea.or.kr/cms/resource/31/3590031_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/31/3590031_image3_1.jpg",
			"lng": 126.9737151476,
			"lat": 37.5931538442
		},
		{
			"name": "북악산 숙정문",
			"gu": "종로구",
			"addr": "서울특별시 종로구 삼청동",
			"contentId": "129500",
			"image": "https://tong.visitkorea.or.kr/cms/resource/41/3350341_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/41/3350341_image3_1.jpg",
			"lng": 126.9811144048,
			"lat": 37.5955536984
		},
		{
			"name": "북한산 백운대(우이동)",
			"gu": "강북구",
			"addr": "서울특별시 강북구 도선사길 234 (우이동)",
			"contentId": "2783363",
			"image": "https://tong.visitkorea.or.kr/cms/resource/83/2795083_image2_1.jpeg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/83/2795083_image2_1.jpeg",
			"lng": 126.9909450591,
			"lat": 37.6583104651
		},
		{
			"name": "북한산 족두리봉",
			"gu": "은평구",
			"addr": "서울특별시 은평구 진흥로 325 (불광동)",
			"contentId": "2779558",
			"image": "https://tong.visitkorea.or.kr/cms/resource/13/2796513_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/13/2796513_image2_1.jpg",
			"lng": 126.9449506033,
			"lat": 37.6108068309
		},
		{
			"name": "불암산",
			"gu": "노원구",
			"addr": "서울특별시 노원구 상계동",
			"contentId": "126482",
			"image": "https://tong.visitkorea.or.kr/cms/resource/61/3589961_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/61/3589961_image3_1.jpg",
			"lng": 127.0949159758,
			"lat": 37.6637533728
		},
		{
			"name": "아차산 어울림정원",
			"gu": "광진구",
			"addr": "서울특별시 광진구 워커힐로 127",
			"contentId": "742972",
			"image": "https://tong.visitkorea.or.kr/cms/resource/35/3499235_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/35/3499235_image3_1.jpg",
			"lng": 127.1012880282,
			"lat": 37.5519609256
		},
		{
			"name": "우면산 소망탑",
			"gu": "서초구",
			"addr": "서울특별시 서초구 서초동 419-3",
			"contentId": "2779508",
			"image": "https://tong.visitkorea.or.kr/cms/resource/59/3467859_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/59/3467859_image3_1.jpg",
			"lng": 127.0181503561,
			"lat": 37.4820092204
		},
		{
			"name": "지양산",
			"gu": "양천구",
			"addr": "서울특별시 양천구 지양로7길 28-29 (신월동)",
			"contentId": "2612198",
			"image": "https://tong.visitkorea.or.kr/cms/resource/28/3539028_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/28/3539028_image3_1.jpg",
			"lng": 126.8296969684,
			"lat": 37.5214151638
		},
		{
			"name": "청계산",
			"gu": "서초구",
			"addr": "서울특별시 서초구 원지동",
			"contentId": "125452",
			"image": "https://tong.visitkorea.or.kr/cms/resource/25/1796725_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/25/1796725_image3_1.jpg",
			"lng": 127.0553147223,
			"lat": 37.4437532162
		},
		{
			"name": "초안산",
			"gu": "노원구",
			"addr": "서울특별시 노원구 월계동",
			"contentId": "2031668",
			"image": "https://tong.visitkorea.or.kr/cms/resource/46/3466146_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/46/3466146_image3_1.jpg",
			"lng": 127.0467405109,
			"lat": 37.6392914596
		},
		{
			"name": "호암산성",
			"gu": "금천구",
			"addr": "서울특별시 금천구 시흥동",
			"contentId": "1116022",
			"image": "https://tong.visitkorea.or.kr/cms/resource/31/2675531_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/31/2675531_image2_1.jpg",
			"lng": 126.9145135735,
			"lat": 37.4462531839
		}
	],
	street: [
		{
			"name": "강서역사문화거리",
			"gu": "강서구",
			"addr": "서울특별시 강서구 양천로 291 (마곡동)",
			"contentId": "3043735",
			"image": "https://tong.visitkorea.or.kr/cms/resource/09/3045109_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/09/3045109_image3_1.jpg",
			"lng": 126.8366643489,
			"lat": 37.5722343802
		},
		{
			"name": "경리단길",
			"gu": "용산구",
			"addr": "서울특별시 용산구 이태원동",
			"contentId": "2930839",
			"image": "https://tong.visitkorea.or.kr/cms/resource/85/3568185_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/85/3568185_image3_1.jpg",
			"lng": 126.987515439,
			"lat": 37.538452116
		},
		{
			"name": "경의선책거리",
			"gu": "마포구",
			"addr": "서울특별시 마포구 와우산로37길 35",
			"contentId": "2500229",
			"image": "https://tong.visitkorea.or.kr/cms/resource/79/3381279_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/79/3381279_image3_1.jpg",
			"lng": 126.9290369242,
			"lat": 37.5564989709
		},
		{
			"name": "공덕동 족발골목",
			"gu": "마포구",
			"addr": "서울특별시 마포구 만리재로 19 (공덕동)",
			"contentId": "749192",
			"image": "https://tong.visitkorea.or.kr/cms/resource/23/3384423_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/23/3384423_image3_1.JPG",
			"lng": 126.953343379,
			"lat": 37.5445785695
		},
		{
			"name": "국제음식문화거리(INTERNATIONAL FOOD STREET)",
			"gu": "구로구",
			"addr": "서울특별시 구로구 새말로 102",
			"contentId": "2591805",
			"image": "https://tong.visitkorea.or.kr/cms/resource/28/3467228_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/28/3467228_image3_1.jpg",
			"lng": 126.8914195585,
			"lat": 37.5058319638
		},
		{
			"name": "남대문 갈치조림골목",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장길 16-17 (남창동)",
			"contentId": "748018",
			"image": "https://tong.visitkorea.or.kr/cms/resource/35/3082835_image2_1.png",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/35/3082835_image3_1.png",
			"lng": 126.9769408005,
			"lat": 37.5597300093
		},
		{
			"name": "대림동 차이나타운",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 대림동",
			"contentId": "2402981",
			"image": "https://tong.visitkorea.or.kr/cms/resource/92/3526892_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/92/3526892_image3_1.jpg",
			"lng": 126.8975138236,
			"lat": 37.4924530714
		},
		{
			"name": "로렌스길",
			"gu": "마포구",
			"addr": "서울특별시 마포구 상수동",
			"contentId": "2500214",
			"image": "https://tong.visitkorea.or.kr/cms/resource/37/3464837_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/37/3464837_image3_1.jpg",
			"lng": 126.9214545083,
			"lat": 37.5484886553
		},
		{
			"name": "상수동 카페거리",
			"gu": "마포구",
			"addr": "서울특별시 마포구 상수동",
			"contentId": "2500207",
			"image": "https://tong.visitkorea.or.kr/cms/resource/77/3590377_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/77/3590377_image3_1.jpg",
			"lng": 126.9214545083,
			"lat": 37.5484886553
		},
		{
			"name": "서순라길",
			"gu": "종로구",
			"addr": "서울특별시 종로구 종로 150-3 (종로3가)",
			"contentId": "3019162",
			"image": "https://tong.visitkorea.or.kr/cms/resource/56/3019156_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/56/3019156_image3_1.jpg",
			"lng": 126.9942167014,
			"lat": 37.5704207437
		},
		{
			"name": "서울 동대문 닭한마리 골목",
			"gu": "종로구",
			"addr": "서울특별시 종로구 종로40가길 14",
			"contentId": "704507",
			"image": "https://tong.visitkorea.or.kr/cms/resource/53/2601453_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/53/2601453_image3_1.jpg",
			"lng": 127.0058684191,
			"lat": 37.5703487391
		},
		{
			"name": "서울 삼각지 대구탕 골목",
			"gu": "용산구",
			"addr": "서울특별시 용산구 한강대로62가길 4 (한강로1가)",
			"contentId": "704506",
			"image": "https://tong.visitkorea.or.kr/cms/resource/28/3568228_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/28/3568228_image3_1.jpg",
			"lng": 126.9741028792,
			"lat": 37.534649539
		},
		{
			"name": "서울 종로 낙지볶음 골목",
			"gu": "종로구",
			"addr": "서울특별시 종로구 종로 19 (종로1가)",
			"contentId": "735749",
			"image": "https://tong.visitkorea.or.kr/cms/resource/46/3478546_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/46/3478546_image3_1.jpg",
			"lng": 126.9799374337,
			"lat": 37.5708982096
		},
		{
			"name": "신당동 떡볶이타운",
			"gu": "중구",
			"addr": "서울특별시 중구 다산로33길 10-18 (신당동)",
			"contentId": "699249",
			"image": "https://tong.visitkorea.or.kr/cms/resource/93/3589993_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/93/3589993_image3_1.jpg",
			"lng": 127.0146067184,
			"lat": 37.563058077
		},
		{
			"name": "신사동 가로수길",
			"gu": "강남구",
			"addr": "서울특별시 강남구 가로수길 23 (신사동)",
			"contentId": "987720",
			"image": "https://tong.visitkorea.or.kr/cms/resource/61/3566961_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/61/3566961_image3_1.jpg",
			"lng": 127.0227572041,
			"lat": 37.5197049261
		},
		{
			"name": "아현동 전골목",
			"gu": "마포구",
			"addr": "서울특별시 마포구 굴레방로9길 15 (아현동)",
			"contentId": "749280",
			"image": "https://tong.visitkorea.or.kr/cms/resource/98/3465898_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/98/3465898_image3_1.jpg",
			"lng": 126.9548484519,
			"lat": 37.5568021757
		},
		{
			"name": "양천구 로데오거리",
			"gu": "양천구",
			"addr": "서울특별시 양천구 목동로25길 23 (신정동)",
			"contentId": "2612107",
			"image": "https://tong.visitkorea.or.kr/cms/resource/87/3467787_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/87/3467787_image3_1.jpg",
			"lng": 126.861474442,
			"lat": 37.5279899658
		},
		{
			"name": "연남동 공방거리",
			"gu": "마포구",
			"addr": "서울특별시 마포구 성미산로28길 18",
			"contentId": "2500201",
			"image": "https://tong.visitkorea.or.kr/cms/resource/21/3550521_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/21/3550521_image3_1.jpg",
			"lng": 126.9236205874,
			"lat": 37.5623009774
		},
		{
			"name": "영등포 신길동 홍어거리",
			"gu": "영등포구",
			"addr": "서울특별시 영등포구 신길로 200-20 (신길동)",
			"contentId": "749355",
			"image": "https://tong.visitkorea.or.kr/cms/resource/25/3464425_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/25/3464425_image3_1.jpg",
			"lng": 126.9115648107,
			"lat": 37.5106012142
		},
		{
			"name": "왕십리맛골목",
			"gu": "성동구",
			"addr": "서울특별시 성동구 마조로 17 (행당동)",
			"contentId": "3444605",
			"image": "https://tong.visitkorea.or.kr/cms/resource/01/3444601_image2_1.jpeg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/01/3444601_image3_1.jpeg",
			"lng": 127.040871095,
			"lat": 37.5594339699
		},
		{
			"name": "용두동 쭈꾸미골목",
			"gu": "동대문구",
			"addr": "서울특별시 동대문구 용두동",
			"contentId": "2721231",
			"image": "https://tong.visitkorea.or.kr/cms/resource/51/3567851_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/51/3567851_image3_1.jpg",
			"lng": 127.0372154044,
			"lat": 37.5759403196
		},
		{
			"name": "음식문화특화거리(깔깔거리)",
			"gu": "구로구",
			"addr": "서울특별시 구로구 디지털로32길 97-21",
			"contentId": "2591826",
			"image": "https://tong.visitkorea.or.kr/cms/resource/54/3392954_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/54/3392954_image3_1.JPG",
			"lng": 126.9008665369,
			"lat": 37.4838874594
		},
		{
			"name": "응암동 감자국 거리",
			"gu": "은평구",
			"addr": "서울특별시 은평구 응암로 172 (응암동)",
			"contentId": "713110",
			"image": "https://tong.visitkorea.or.kr/cms/resource/38/3465038_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/38/3465038_image3_1.jpg",
			"lng": 126.9167149563,
			"lat": 37.5872673957
		},
		{
			"name": "이대거리",
			"gu": "서대문구",
			"addr": "서울특별시 서대문구 대현동",
			"contentId": "2667611",
			"image": "https://tong.visitkorea.or.kr/cms/resource/29/3467629_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/29/3467629_image3_1.jpg",
			"lng": 126.9424606606,
			"lat": 37.5579323782
		},
		{
			"name": "이태원 우사단길",
			"gu": "용산구",
			"addr": "서울특별시 용산구 한남동",
			"contentId": "2650771",
			"image": "https://tong.visitkorea.or.kr/cms/resource/39/3467539_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/39/3467539_image3_1.jpg",
			"lng": 126.9984451642,
			"lat": 37.5326085465
		},
		{
			"name": "익선동 한옥거리",
			"addr": "",
			"contentId": "2946228",
			"image": "https://tong.visitkorea.or.kr/cms/resource/22/2947522_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/22/2947522_image3_1.jpg",
			"lng": 126.9901419773,
			"lat": 37.5737675037
		},
		{
			"name": "자양동 양꼬치거리 (중국음식문화거리)",
			"gu": "광진구",
			"addr": "서울특별시 광진구 자양동",
			"contentId": "2401757",
			"image": "https://tong.visitkorea.or.kr/cms/resource/63/2372563_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/63/2372563_image3_1.jpg",
			"lng": 127.0629835156,
			"lat": 37.5402227106
		},
		{
			"name": "장충동 족발 골목",
			"gu": "중구",
			"addr": "서울특별시 중구 장충단로 174 (장충동1가)",
			"contentId": "699279",
			"image": "https://tong.visitkorea.or.kr/cms/resource/72/3589072_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/72/3589072_image3_1.jpg",
			"lng": 127.0058964795,
			"lat": 37.560291575
		},
		{
			"name": "창신동골목길",
			"gu": "종로구",
			"addr": "서울특별시 종로구 창신동 23-268",
			"contentId": "2946517",
			"image": "https://tong.visitkorea.or.kr/cms/resource/32/2947132_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/32/2947132_image3_1.jpg",
			"lng": 127.0134286483,
			"lat": 37.5771453074
		},
		{
			"name": "천호자전거거리",
			"gu": "강동구",
			"addr": "서울특별시 강동구 천호동",
			"contentId": "2741610",
			"image": "https://tong.visitkorea.or.kr/cms/resource/76/3566876_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/76/3566876_image3_1.jpg",
			"lng": 127.1221585024,
			"lat": 37.5466313659
		},
		{
			"name": "청담패션거리",
			"gu": "강남구",
			"addr": "서울특별시 강남구 청담동",
			"contentId": "1310950",
			"image": "https://tong.visitkorea.or.kr/cms/resource/40/3397540_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/40/3397540_image3_1.JPG",
			"lng": 127.044316187,
			"lat": 37.5255518567
		},
		{
			"name": "충무로 인쇄골목",
			"gu": "중구",
			"addr": "서울특별시 중구 퇴계로37길 14 (충무로4가)",
			"contentId": "2865186",
			"image": "https://tong.visitkorea.or.kr/cms/resource/65/3566265_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/65/3566265_image3_1.jpg",
			"lng": 126.9940169582,
			"lat": 37.5619856094
		},
		{
			"name": "견지동 불교용품거리",
			"gu": "종로구",
			"addr": "서울특별시 종로구 우정국로 55",
			"contentId": "132205",
			"image": "https://tong.visitkorea.or.kr/cms/resource/01/3589201_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/01/3589201_image3_1.jpg",
			"lng": 126.9819927,
			"lat": 37.574478386
		},
		{
			"name": "논현 가구거리",
			"gu": "강남구",
			"addr": "서울특별시 강남구 학동로 125 (논현동)",
			"contentId": "132235",
			"image": "https://tong.visitkorea.or.kr/cms/resource/28/3571728_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/28/3571728_image3_1.jpg",
			"lng": 127.0248794386,
			"lat": 37.5124558057
		},
		{
			"name": "대학천 책방거리",
			"gu": "종로구",
			"addr": "서울특별시 종로구 종로 258 (종로6가)",
			"contentId": "132202",
			"image": "https://tong.visitkorea.or.kr/cms/resource/97/3571897_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/97/3571897_image3_1.jpg",
			"lng": 127.0064961295,
			"lat": 37.5707098195
		},
		{
			"name": "문정동 로데오거리",
			"gu": "송파구",
			"addr": "서울특별시 송파구 동남로4길 10 (문정동)",
			"contentId": "706303",
			"image": "https://tong.visitkorea.or.kr/cms/resource/93/3571793_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/93/3571793_image3_1.jpg",
			"lng": 127.1239099771,
			"lat": 37.4891519596
		},
		{
			"name": "을지로 철제가구거리",
			"gu": "중구",
			"addr": "서울특별시 중구 창경궁로 34-1 (예관동)",
			"contentId": "132238",
			"image": "https://tong.visitkorea.or.kr/cms/resource/34/3077634_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/34/3077634_image3_1.JPG",
			"lng": 126.9984164588,
			"lat": 37.5654602842
		},
		{
			"name": "인사동 문화의 거리",
			"gu": "종로구",
			"addr": "서울특별시 종로구 인사동",
			"contentId": "132219",
			"image": "https://tong.visitkorea.or.kr/cms/resource/86/3571886_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/86/3571886_image3_1.jpg",
			"lng": 126.9850146618,
			"lat": 37.5739535014
		},
		{
			"name": "종로귀금속거리",
			"gu": "종로구",
			"addr": "서울특별시 종로구 봉익동",
			"contentId": "132421",
			"image": "https://tong.visitkorea.or.kr/cms/resource/58/3571858_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/58/3571858_image3_1.jpg",
			"lng": 126.9926140374,
			"lat": 37.5715539165
		},
		{
			"name": "중곡동 가구거리",
			"gu": "광진구",
			"addr": "서울특별시 광진구 능동",
			"contentId": "132502",
			"image": "https://tong.visitkorea.or.kr/cms/resource/11/3478411_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/11/3478411_image3_1.jpg",
			"lng": 127.0809147499,
			"lat": 37.5566516806
		},
		{
			"name": "북촌한옥마을 감고당길",
			"gu": "종로구",
			"addr": "서울특별시 종로구 송현동",
			"contentId": "2946075",
			"image": "https://tong.visitkorea.or.kr/cms/resource/06/2945806_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/06/2945806_image3_1.jpg",
			"lng": 126.9824147854,
			"lat": 37.5779529898
		},
		{
			"name": "세종마을 음식문화거리",
			"gu": "종로구",
			"addr": "서울특별시 종로구 자하문로1길 24 (체부동)",
			"contentId": "2992822",
			"image": "https://tong.visitkorea.or.kr/cms/resource/62/3535062_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/62/3535062_image3_1.jpg",
			"lng": 126.9710825243,
			"lat": 37.576569614
		}
	],
	shop: [
		{
			"name": "동대문디자인플라자(DDP)",
			"gu": "중구",
			"addr": "서울특별시 중구 을지로 281 (을지로7가)",
			"contentId": "2470006",
			"image": "https://tong.visitkorea.or.kr/cms/resource/06/3539606_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/06/3539606_image3_1.jpg",
			"lng": 127.0095709797,
			"lat": 37.566107632
		},
		{
			"name": "세운상가",
			"gu": "종로구",
			"addr": "서울특별시 종로구 청계천로 159 (장사동)",
			"contentId": "2553876",
			"image": "https://tong.visitkorea.or.kr/cms/resource/60/3569460_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/60/3569460_image3_1.jpg",
			"lng": 126.9952555258,
			"lat": 37.5693347773
		},
		{
			"name": "강남고속터미널 혼수상가",
			"gu": "서초구",
			"addr": "서울특별시 서초구 신반포로 194 (반포동)",
			"contentId": "132201",
			"image": "https://tong.visitkorea.or.kr/cms/resource/32/3527832_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/32/3527832_image3_1.jpg",
			"lng": 127.0055841495,
			"lat": 37.5062061855
		},
		{
			"name": "갤러리아백화점 명품관",
			"gu": "강남구",
			"addr": "서울특별시 강남구 압구정로 343 (압구정동)",
			"contentId": "273772",
			"image": "https://tong.visitkorea.or.kr/cms/resource/74/3495074_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/74/3495074_image3_1.jpg",
			"lng": 127.0400692668,
			"lat": 37.5285292127
		},
		{
			"name": "낙원 악기상가",
			"gu": "종로구",
			"addr": "서울특별시 종로구 삼일대로 428 (낙원동)",
			"contentId": "132226",
			"image": "https://tong.visitkorea.or.kr/cms/resource/19/923719_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/19/923719_image3_1.jpg",
			"lng": 126.9880310857,
			"lat": 37.5728259087
		},
		{
			"name": "남대문 문구상가",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문로 6-2 (남대문로4가)",
			"contentId": "985961",
			"image": "https://tong.visitkorea.or.kr/cms/resource/37/3573137_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/37/3573137_image3_1.jpg",
			"lng": 126.9765019308,
			"lat": 37.5604465848
		},
		{
			"name": "남대문 본동의류상가",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장2길 3-2 (남창동)",
			"contentId": "986011",
			"image": "https://tong.visitkorea.or.kr/cms/resource/76/3568376_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/76/3568376_image3_1.jpg",
			"lng": 126.9766574889,
			"lat": 37.559868877
		},
		{
			"name": "남대문 액세사리상가",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장4길 21",
			"contentId": "132211",
			"image": "https://tong.visitkorea.or.kr/cms/resource/73/1984373_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/73/1984373_image3_1.jpg",
			"lng": 126.9776157542,
			"lat": 37.5591939725
		},
		{
			"name": "남대문 종합상가",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장4길 21",
			"contentId": "1013076",
			"image": "https://tong.visitkorea.or.kr/cms/resource/04/1015004_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/04/1015004_image3_1.jpg",
			"lng": 126.9776518607,
			"lat": 37.5592134153
		},
		{
			"name": "남대문 중앙상가",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장4길 21",
			"contentId": "986038",
			"image": "https://tong.visitkorea.or.kr/cms/resource/87/1009887_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/87/1009887_image3_1.jpg",
			"lng": 126.9776157542,
			"lat": 37.5591939725
		},
		{
			"name": "남평화상가",
			"gu": "중구",
			"addr": "서울특별시 중구 장충단로 282-10 (신당동)",
			"contentId": "2761466",
			"image": "https://tong.visitkorea.or.kr/cms/resource/64/3568464_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/64/3568464_image3_1.jpg",
			"lng": 127.0108429971,
			"lat": 37.5692239587
		},
		{
			"name": "답십리 고미술상가",
			"gu": "동대문구",
			"addr": "서울특별시 동대문구 고미술로 39",
			"contentId": "282011",
			"image": "https://tong.visitkorea.or.kr/cms/resource/98/3055898_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/98/3055898_image3_1.JPG",
			"lng": 127.0522448086,
			"lat": 37.5682581489
		},
		{
			"name": "대도종합상가",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장4길 9 (남창동)",
			"contentId": "985952",
			"image": "https://tong.visitkorea.or.kr/cms/resource/39/3570439_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/39/3570439_image3_1.jpg",
			"lng": 126.9776907326,
			"lat": 37.5597216902
		},
		{
			"name": "동화상가",
			"gu": "중구",
			"addr": "서울특별시 중구 장충단로13길 34 (을지로6가)",
			"contentId": "2762868",
			"image": "https://tong.visitkorea.or.kr/cms/resource/70/3570470_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/70/3570470_image3_1.jpg",
			"lng": 127.0069017178,
			"lat": 37.5682434466
		},
		{
			"name": "롯데백화점 건대스타시티점",
			"gu": "광진구",
			"addr": "서울특별시 광진구 능동로 92 롯데백화점",
			"contentId": "2979848",
			"image": "https://tong.visitkorea.or.kr/cms/resource/52/3007052_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/52/3007052_image3_1.jpg",
			"lng": 127.0712300203,
			"lat": 37.5390535504
		},
		{
			"name": "롯데백화점 김포공항점",
			"gu": "강서구",
			"addr": "서울특별시 강서구 하늘길 38 (방화동)",
			"contentId": "2997813",
			"image": "https://tong.visitkorea.or.kr/cms/resource/04/2997804_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/04/2997804_image3_1.jpg",
			"lng": 117.9925662504,
			"lat": 19.69442748
		},
		{
			"name": "롯데백화점 본점 에비뉴엘",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문로 81 (소공동)",
			"contentId": "273806",
			"image": "https://tong.visitkorea.or.kr/cms/resource/09/3589509_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/09/3589509_image3_1.jpg",
			"lng": 126.9817485525,
			"lat": 37.5647822864
		},
		{
			"name": "롯데월드 쇼핑몰",
			"gu": "송파구",
			"addr": "서울특별시 송파구 올림픽로 300 (신천동)",
			"contentId": "132248",
			"image": "https://tong.visitkorea.or.kr/cms/resource/29/1920629_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/29/1920629_image3_1.jpg",
			"lng": 127.1040749597,
			"lat": 37.5141653654
		},
		{
			"name": "마리오아울렛",
			"gu": "금천구",
			"addr": "서울특별시 금천구 디지털로9길 23 (가산동)",
			"contentId": "132593",
			"image": "https://tong.visitkorea.or.kr/cms/resource/71/3538871_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/71/3538871_image3_1.jpg",
			"lng": 126.8865152102,
			"lat": 37.4787739084
		},
		{
			"name": "삼익패션타운",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장8길 7 (남창동)",
			"contentId": "1019638",
			"image": "https://tong.visitkorea.or.kr/cms/resource/57/3064057_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/57/3064057_image3_1.JPG",
			"lng": 126.9788489464,
			"lat": 37.5601966561
		},
		{
			"name": "서울고속버스터미널 꽃도매상가",
			"gu": "서초구",
			"addr": "서울특별시 서초구 신반포로 194 (반포동)",
			"contentId": "132230",
			"image": "https://tong.visitkorea.or.kr/cms/resource/24/3527824_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/24/3527824_image3_1.jpg",
			"lng": 127.0055841495,
			"lat": 37.5062061855
		},
		{
			"name": "서울고속버스터미널 의류도매상가",
			"gu": "서초구",
			"addr": "서울특별시 서초구 신반포로 194 (반포동)",
			"contentId": "132184",
			"image": "https://tong.visitkorea.or.kr/cms/resource/41/3527841_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/41/3527841_image3_1.jpg",
			"lng": 127.0055841495,
			"lat": 37.5062061855
		},
		{
			"name": "세운전자상가",
			"gu": "종로구",
			"addr": "서울특별시 종로구 청계천로 159 (장사동)",
			"contentId": "132231",
			"image": "https://tong.visitkorea.or.kr/cms/resource/21/3571821_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/21/3571821_image3_1.jpg",
			"lng": 126.9952555258,
			"lat": 37.5693347773
		},
		{
			"name": "숭례문(남대문) 수입상가",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장4길 21 (남창동)",
			"contentId": "1013079",
			"image": "https://tong.visitkorea.or.kr/cms/resource/29/3083029_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/29/3083029_image3_1.JPG",
			"lng": 126.9776685255,
			"lat": 37.5592411902
		},
		{
			"name": "신사상가",
			"gu": "강남구",
			"addr": "서울특별시 강남구 압구정로29길 72-1",
			"contentId": "2752555",
			"lng": 127.0284174418,
			"lat": 37.5323396711
		},
		{
			"name": "신세계백화점 본점",
			"gu": "중구",
			"addr": "서울특별시 중구 소공로 63 (충무로1가)",
			"contentId": "132642",
			"image": "https://tong.visitkorea.or.kr/cms/resource/99/3589499_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/99/3589499_image3_1.jpg",
			"lng": 126.9810181709,
			"lat": 37.5609966018
		},
		{
			"name": "신평화패션타운",
			"gu": "중구",
			"addr": "서울특별시 중구 청계천로 298 (신당동)",
			"contentId": "2762844",
			"image": "https://tong.visitkorea.or.kr/cms/resource/22/3569022_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/22/3569022_image3_1.jpg",
			"lng": 127.0110679692,
			"lat": 37.5694989313
		},
		{
			"name": "장안 악세사리상가",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장4길 42-2 (남창동)",
			"contentId": "1013388",
			"image": "https://tong.visitkorea.or.kr/cms/resource/43/1015043_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/43/1015043_image3_1.jpg",
			"lng": 126.9767630795,
			"lat": 37.5583023944
		},
		{
			"name": "청계 조명기구상가",
			"gu": "종로구",
			"addr": "서울특별시 종로구 청계천로 155",
			"contentId": "132244",
			"image": "https://tong.visitkorea.or.kr/cms/resource/41/3064041_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/41/3064041_image3_1.JPG",
			"lng": 126.9954361275,
			"lat": 37.5671405907
		},
		{
			"name": "청오가방도매상가",
			"gu": "종로구",
			"addr": "서울특별시 종로구 청계천로 229",
			"contentId": "132207",
			"image": "https://tong.visitkorea.or.kr/cms/resource/26/3109826_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/26/3109826_image3_1.JPG",
			"lng": 127.0029909094,
			"lat": 37.5701348234
		},
		{
			"name": "청자 수입상가",
			"gu": "중구",
			"addr": "서울특별시 중구 남대문시장4길 29",
			"contentId": "1013394",
			"image": "https://tong.visitkorea.or.kr/cms/resource/53/1015053_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/53/1015053_image3_1.jpg",
			"lng": 126.9773491223,
			"lat": 37.5588356763
		},
		{
			"name": "청평화패션몰",
			"gu": "중구",
			"addr": "서울특별시 중구 청계천로 334 (신당동)",
			"contentId": "2761460",
			"image": "https://tong.visitkorea.or.kr/cms/resource/08/3568408_image2_1.jpg",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/08/3568408_image3_1.jpg",
			"lng": 127.0149565033,
			"lat": 37.5695212208
		},
		{
			"name": "퇴계로 오토바이상가",
			"gu": "중구",
			"addr": "서울특별시 중구 충무로4가",
			"contentId": "132198",
			"image": "https://tong.visitkorea.or.kr/cms/resource/47/3077647_image2_1.JPG",
			"thumb": "https://tong.visitkorea.or.kr/cms/resource/47/3077647_image3_1.JPG",
			"lng": 126.9273224518,
			"lat": 36.9844568739
		}
	]
};
//#endregion
//#region src/data/festival-dates.json
var festival_dates_default = {
	"142233": {
		"name": "정동문화축제",
		"gu": "중구",
		"addr": "서울특별시 중구 정동",
		"start": "20251023",
		"end": "20251025",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/15/3552215_image2_1.jpeg",
		"lat": 37.5670957913,
		"lng": 126.9753629579,
		"homepage": "https://business.khan.co.kr/jeongdong/festival/introduce"
	},
	"229057": {
		"name": "서울와우북페스티벌",
		"gu": "마포구",
		"addr": "서울특별시 마포구 양화로 72 (서교동, 서교동 효성 해링턴 타워)",
		"start": "20251017",
		"end": "20251019",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/11/3547511_image2_1.png",
		"lat": 37.5508549625,
		"lng": 126.9167298722,
		"homepage": "https://wowlab.or.kr/wowbook-festival/"
	},
	"626944": {
		"name": "서울억새축제",
		"gu": "마포구",
		"addr": "서울특별시 마포구 하늘공원로 95 (상암동)",
		"start": "20251018",
		"end": "20251024",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/81/3544281_image2_1.JPG",
		"lat": 37.569152288,
		"lng": 126.8861432556,
		"homepage": "https://parks.seoul.go.kr/story/news/detailView.do?searchTp=all&searchWd=&currentPage=1&bIdx=3598&SH_C_START_DATE=&SH_C_END_DATE=&SH_C_CODE=&SH_C_PARK_CODE"
	},
	"629742": {
		"name": "제46회 서울무용제",
		"gu": "종로구",
		"addr": "서울특별시 종로구 대학로8길 7 (동숭동)",
		"start": "20251121",
		"end": "20251207",
		"startMonth": 11,
		"endMonth": 12,
		"image": "https://tong.visitkorea.or.kr/cms/resource/87/3567087_image2_1.jpg",
		"lat": 37.5812640855,
		"lng": 127.0029878163,
		"homepage": "https://sdf1979.koreadanceassociation.org/v2/"
	},
	"1806376": {
		"name": "강동북페스티벌",
		"gu": "강동구",
		"addr": "서울특별시 강동구 양재대로84길 63 (둔촌동)",
		"start": "20251101",
		"end": "20251101",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/89/3567889_image2_1.jpg",
		"lat": 37.5244036592,
		"lng": 127.1369827856,
		"homepage": "https://www.gdlibrary.or.kr/portal/menu/10/book-festival"
	},
	"2028176": {
		"name": "허준축제",
		"gu": "강서구",
		"addr": "서울특별시 강서구 마곡동로 161 (마곡동)",
		"start": "20251018",
		"end": "20251019",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/63/3557963_image2_1.jpg",
		"lat": 37.5692236076,
		"lng": 126.8360144928,
		"homepage": "http://www.허준축제.com"
	},
	"2384776": {
		"name": "2025 한강명산트레킹(2차)",
		"gu": "중랑구",
		"addr": "서울특별시 중랑구 용마산로 250-12 (면목동)",
		"start": "20251109",
		"end": "20251109",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/24/3547824_image2_1.png",
		"lat": 37.5734054382,
		"lng": 127.0891385242,
		"homepage": "https://seoulsports.or.kr"
	},
	"2405329": {
		"name": "종로K축제",
		"gu": "종로구",
		"addr": "서울특별시 종로구 세종대로 지하172 (세종로)",
		"start": "20251017",
		"end": "20251018",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/64/3563664_image2_1.jpg",
		"lat": 37.5716786179,
		"lng": 126.9767821434,
		"homepage": "https://jongnofestival.kr/2025/html/?p=0601"
	},
	"2487791": {
		"name": "서울아프리카페스티벌",
		"gu": "중구",
		"addr": "서울특별시 중구 을지로 281 (을지로7가)",
		"start": "20250912",
		"end": "20250913",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/10/3558510_image2_1.jpg",
		"lat": 37.566107632,
		"lng": 127.0095709797,
		"homepage": "https://africafestival.kr/"
	},
	"2601242": {
		"name": "도봉한글잔치",
		"gu": "도봉구",
		"addr": "서울특별시 도봉구 해등로32가길 16 (방학동)",
		"start": "20251002",
		"end": "20251019",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/25/3550325_image2_1.JPG",
		"lat": 37.6603441259,
		"lng": 127.0222810312,
		"homepage": "https://www.dobong.or.kr/main/main.php?categoryid=02&menuid=02&groupid=01"
	},
	"2618971": {
		"name": "구로청소년축제",
		"gu": "구로구",
		"addr": "서울특별시 구로구 구로중앙로 48 (구로동)",
		"start": "20251018",
		"end": "20251018",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/06/3562606_image2_1.jpg",
		"lat": 37.4941610735,
		"lng": 126.8900783422,
		"homepage": "https://blog.naver.com/onon0313"
	},
	"2621558": {
		"name": "중랑용마폭포축제",
		"gu": "중랑구",
		"addr": "서울특별시 중랑구 용마산로 250-12 (면목동)",
		"start": "20250926",
		"end": "20250927",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/95/3540195_image2_1.JPG",
		"lat": 37.5734054382,
		"lng": 127.0891385242,
		"homepage": "https://www.jnfac.or.kr/contents/1335"
	},
	"2622167": {
		"name": "2025 경북사과홍보행사",
		"gu": "중구",
		"addr": "서울특별시 중구 을지로 지하12 (을지로1가)",
		"start": "20251110",
		"end": "20251112",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/59/3550559_image2_1.jpg",
		"lat": 37.5655015943,
		"lng": 126.9787960237,
		"homepage": null
	},
	"2733405": {
		"name": "서대문 국가유산 야행",
		"gu": "서대문구",
		"addr": "서울특별시 서대문구 통일로 지하247 (현저동)",
		"start": "20251003",
		"end": "20251004",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/47/3366647_image2_1.jpg",
		"lat": 37.5744612869,
		"lng": 126.9577643533,
		"homepage": "https://sdmyh.co.kr/"
	},
	"2740046": {
		"name": "한복문화주간",
		"gu": "종로구",
		"addr": "서울특별시 종로구 종로1길 45 (세종로)",
		"start": "20251021",
		"end": "20251026",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/99/3547199_image2_1.jpg",
		"lat": 37.5746727436,
		"lng": 126.9783985779,
		"homepage": "https://www.kcdf.or.kr/hanbokcultureweek/main"
	},
	"2756476": {
		"name": "세계유산 조선왕릉축전",
		"gu": "강남구",
		"addr": "서울특별시 강남구 선릉로100길 1 (삼성동)",
		"start": "20251018",
		"end": "20251026",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/15/3423615_image2_1.jpg",
		"lat": 37.5071957139,
		"lng": 127.0475969642,
		"homepage": "https://www.jrtf.or.kr/"
	},
	"2769990": {
		"name": "2025 대한민국 우리술 대축제",
		"gu": "서초구",
		"addr": "서울특별시 서초구 강남대로 27 (양재동)",
		"start": "20251114",
		"end": "20251116",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/72/3550272_image2_1.jpg",
		"lat": 37.467391878,
		"lng": 127.0407514903,
		"homepage": "https://thesool.com/front/home/M000000000/index.do"
	},
	"2778088": {
		"name": "관악별빛산책",
		"gu": "관악구",
		"addr": "서울특별시 관악구 신림동 1642-7",
		"start": "20251201",
		"end": "20251231",
		"startMonth": 12,
		"endMonth": 12,
		"image": "https://tong.visitkorea.or.kr/cms/resource/88/3580588_image2_1.jpg",
		"lat": 37.4827825101,
		"lng": 126.9276196866,
		"homepage": "https://gfac.or.kr/site/main/performance/FESTIVAL/view/276"
	},
	"2785797": {
		"name": "겨울, 청계천의 빛",
		"gu": "중구",
		"addr": "서울특별시 중구 태평로1가 1",
		"start": "20251212",
		"end": "20251231",
		"startMonth": 12,
		"endMonth": 12,
		"image": "https://tong.visitkorea.or.kr/cms/resource/36/3567636_image2_1.jpg",
		"lat": 37.5691317067,
		"lng": 126.9776154729,
		"homepage": "http://www.seoulcl.kr/main/index.html"
	},
	"2802077": {
		"name": "2025 과학영재교육 페스티벌",
		"gu": "강남구",
		"addr": "서울특별시 강남구 테헤란로7길 22 (역삼동)",
		"start": "20251223",
		"end": "20251223",
		"startMonth": 12,
		"endMonth": 12,
		"image": "https://tong.visitkorea.or.kr/cms/resource/28/3572728_image2_1.jpg",
		"lat": 37.5007739351,
		"lng": 127.0307542337,
		"homepage": "https://sgf2025.kr/"
	},
	"2844254": {
		"name": "제7회 금천과학축제",
		"gu": "금천구",
		"addr": "서울특별시 금천구 시흥대로73길 70 (시흥동)",
		"start": "20250926",
		"end": "20250927",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/75/3537175_image2_1.png",
		"lat": 37.4564933229,
		"lng": 126.8955205706,
		"homepage": "http://www.gscience.or.kr/"
	},
	"2854855": {
		"name": "2025 대한민국 관광기념품 박람회",
		"gu": "중구",
		"addr": "서울특별시 중구 을지로 281 (을지로7가)",
		"start": "20251121",
		"end": "20251123",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/83/3550583_image2_1.jpg",
		"lat": 37.566107632,
		"lng": 127.0095709797,
		"homepage": "https://kto.visitkorea.or.kr/kor/souvenir/main.kto"
	},
	"2862358": {
		"name": "공공미술 빛조각축제 <노원 달빛산책>",
		"gu": "노원구",
		"addr": "서울특별시 노원구 동일로 1322-70 (상계동)",
		"start": "20251017",
		"end": "20251116",
		"startMonth": 10,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/35/3547735_image2_1.jpg",
		"lat": 37.6494961706,
		"lng": 127.0657023804,
		"homepage": "https://moonlightwalk.kr/"
	},
	"2865258": {
		"name": "노원 북 페스티벌",
		"gu": "노원구",
		"addr": "서울특별시 노원구 공릉로55길 88 (하계동)",
		"start": "20251017",
		"end": "20251102",
		"startMonth": 10,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/61/3559561_image2_1.png",
		"lat": 37.6320954567,
		"lng": 127.0679693368,
		"homepage": "https://www.nowonlib.kr/NoticeInfoDetail/15101"
	},
	"3000221": {
		"name": "은평청년축제",
		"gu": "은평구",
		"addr": "서울특별시 은평구 은평로 195 (녹번동)",
		"start": "20250913",
		"end": "20250913",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/90/3534390_image2_1.jpg",
		"lat": 37.6022297707,
		"lng": 126.929352269,
		"homepage": null
	},
	"3001045": {
		"name": "한강 종이비행기 축제",
		"gu": "영등포구",
		"addr": "서울특별시 영등포구 여의도동",
		"start": "20251019",
		"end": "20251019",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/11/3554311_image2_1.jpg",
		"lat": 37.5248000326,
		"lng": 126.9377509138,
		"homepage": "https://hangang.seoul.go.kr/www/eventMng/detail.do?mid=538&evntSn=329"
	},
	"3012095": {
		"name": "서울라이트 한강 빛섬축제",
		"gu": "광진구",
		"addr": "서울특별시 광진구 강변북로 2273 (자양동)",
		"start": "20251003",
		"end": "20251012",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/17/3579117_image2_1.jpg",
		"lat": 37.5294186076,
		"lng": 127.0739939307,
		"homepage": "https://bitseomfestival.com/2025/"
	},
	"3018924": {
		"name": "도곡 메타세쿼이아 로드 페스타",
		"gu": "강남구",
		"addr": "서울특별시 강남구 양재천로 199 (도곡동)",
		"start": "20250927",
		"end": "20250927",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/62/3543062_image2_1.jpg",
		"lat": 37.4831568326,
		"lng": 127.0472810057,
		"homepage": null
	},
	"3021762": {
		"name": "가을 , 명동으로",
		"gu": "중구",
		"addr": "서울특별시 중구 퇴계로 지하126 (충무로2가)",
		"start": "20251115",
		"end": "20251115",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/65/3559865_image2_1.png",
		"lat": 37.5609633613,
		"lng": 126.985959388,
		"homepage": null
	},
	"3021908": {
		"name": "서울발레페스티벌 서울국제발레위크",
		"gu": "송파구",
		"addr": "서울특별시 송파구 석촌호수로 191 (잠실동)",
		"start": "20251017",
		"end": "20251019",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/69/3546369_image2_1.jpg",
		"lat": 37.5068688853,
		"lng": 127.0982534743,
		"homepage": "https://www.seoulballetfestival.com/"
	},
	"3035607": {
		"name": "광화문 마켓",
		"gu": "종로구",
		"addr": "서울특별시 종로구 세종대로 지하172 (세종로)",
		"start": "20251212",
		"end": "20251231",
		"startMonth": 12,
		"endMonth": 12,
		"image": "https://tong.visitkorea.or.kr/cms/resource/03/3573403_image2_1.png",
		"lat": 37.5716786179,
		"lng": 126.9767821434,
		"homepage": "https://www.stolantern.com/"
	},
	"3069470": {
		"name": "2025 로맨틱 한강 크리스마스 마켓",
		"gu": "광진구",
		"addr": "서울특별시 광진구 강변북로 2202 (자양동)",
		"start": "20251219",
		"end": "20251225",
		"startMonth": 12,
		"endMonth": 12,
		"image": "https://tong.visitkorea.or.kr/cms/resource/34/3578234_image2_1.jpg",
		"lat": 37.5304044529,
		"lng": 127.0655391172,
		"homepage": "https://www.instagram.com/hangang.christmas?igsh=NGdvazVzb2dhN2dz&utm_source=qr"
	},
	"3073454": {
		"name": "서울라이트 광화문",
		"gu": "종로구",
		"addr": "서울특별시 종로구 세종로 1-68 5호선 광화문역",
		"start": "20251212",
		"end": "20260104",
		"startMonth": 12,
		"endMonth": 1,
		"image": "https://tong.visitkorea.or.kr/cms/resource/04/3581704_image2_1.jpg",
		"lat": 37.5716786179,
		"lng": 126.9767821434,
		"homepage": "https://www.seoullightgwanghwamun.com/"
	},
	"3113222": {
		"name": "온 가족 책 잔치",
		"gu": "종로구",
		"addr": "서울특별시 종로구 북촌로5길 48 (화동)",
		"start": "20251018",
		"end": "20251018",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/51/3564751_image2_1.jpg",
		"lat": 37.5797361152,
		"lng": 126.982378627,
		"homepage": "https://jdlib.sen.go.kr/jdlib/board/index.do?menu_idx=242&manage_idx=2478"
	},
	"3113548": {
		"name": "서울생활예술페스티벌",
		"gu": "용산구",
		"addr": "서울특별시 용산구 양녕로 445 (이촌동)",
		"start": "20251011",
		"end": "20251011",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/52/3542852_image2_1.jpg",
		"lat": 37.5177178854,
		"lng": 126.9580520415,
		"homepage": "https://www.sfac.or.kr/opensquare/notice/notice_list.do?cbIdx=955&bcIdx=137044&type="
	},
	"3348362": {
		"name": "성북거리문화축제 <다다페스타>",
		"gu": "성북구",
		"addr": "서울특별시 성북구 석관동",
		"start": "20250927",
		"end": "20250927",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/54/3527554_image2_1.jpg",
		"lat": 37.6104117333,
		"lng": 127.0605761839,
		"homepage": null
	},
	"3351622": {
		"name": "DDP 가을축제: 디자인 라운지",
		"gu": "중구",
		"addr": "서울특별시 중구 을지로 281 (을지로7가)",
		"start": "20250926",
		"end": "20250928",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/46/3542846_image2_1.jpg",
		"lat": 37.566107632,
		"lng": 127.0095709797,
		"homepage": "https://ddp.or.kr/index.html?menuno=230&siteno=2&bbsno=709&boardno=16&bbstopno=709&act=view&subno="
	},
	"3354973": {
		"name": "강북청소년축제 강추",
		"gu": "강북구",
		"addr": "서울특별시 강북구 도봉로76가길 55 (미아동)",
		"start": "20250927",
		"end": "20250927",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/50/3539950_image2_1.jpg",
		"lat": 37.6321225012,
		"lng": 127.0274174771,
		"homepage": "http://youthfestival.or.kr/"
	},
	"3359144": {
		"name": "용산청년축제",
		"gu": "용산구",
		"addr": "서울특별시 용산구 서빙고로 221 (용산동6가)",
		"start": "20250920",
		"end": "20250920",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/31/3536331_image2_1.png",
		"lat": 37.520662531,
		"lng": 126.9883603092,
		"homepage": null
	},
	"3367338": {
		"name": "2025 K-웨이브 댄스 페스티벌",
		"gu": "서초구",
		"addr": "서울특별시 서초구 올림픽대로 2085-14 (반포동)",
		"start": "20251011",
		"end": "20251012",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/65/3546365_image2_1.jpg",
		"lat": 37.5123025381,
		"lng": 126.9965764639,
		"homepage": "https://www.k-wavedance.com/"
	},
	"3368863": {
		"name": "연남동 주민화합 대축제",
		"gu": "마포구",
		"addr": "서울특별시 마포구 동교로 233 (연남동, 이트라이브연남빌딩)",
		"start": "20250927",
		"end": "20250927",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/86/3542886_image2_1.jpg",
		"lat": 37.561012246,
		"lng": 126.9240400306,
		"homepage": "https://mobing.kr/yn_festival2025"
	},
	"3379778": {
		"name": "가락옥토버페스트 미식야행",
		"gu": "송파구",
		"addr": "서울특별시 송파구 양재대로 932 (가락동)",
		"start": "20251024",
		"end": "20251026",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/73/3553073_image2_1.png",
		"lat": 37.4960786971,
		"lng": 127.1107693087,
		"homepage": "https://www.garak.co.kr/homepage/M0000075/board/view.do?atcSn=17462&pageIndex=1"
	},
	"3383832": {
		"name": "케미스트릿 강남역 페스티벌",
		"gu": "서초구",
		"addr": "서울특별시 서초구 서초대로77길 17 (서초동)",
		"start": "20251102",
		"end": "20251102",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/64/3553464_image2_1.jpg",
		"lat": 37.4996073141,
		"lng": 127.0257686102,
		"homepage": null
	},
	"3384023": {
		"name": "양천가족 거리축제",
		"gu": "양천구",
		"addr": "서울특별시 양천구 중앙로 지하261 (신정동)",
		"start": "20251026",
		"end": "20251026",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/32/3544832_image2_1.jpg",
		"lat": 37.5198490944,
		"lng": 126.8530059985,
		"homepage": "https://yfac.kr/main/contents.do?idx=2719"
	},
	"3387201": {
		"name": "영등포선유도원축제",
		"gu": "영등포구",
		"addr": "서울특별시 영등포구 선유로 343 (당산동)",
		"start": "20251024",
		"end": "20251026",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/25/3552525_image2_1.JPG",
		"lat": 37.5422918129,
		"lng": 126.902442527,
		"homepage": "https://www.ydpcf.or.kr/festival/seonyudo.do"
	},
	"3439947": {
		"name": "강남 미디어 윈터페스타",
		"gu": "강남구",
		"addr": "서울특별시 강남구 영동대로 511 (삼성동)",
		"start": "20251219",
		"end": "20260103",
		"startMonth": 12,
		"endMonth": 1,
		"image": "https://tong.visitkorea.or.kr/cms/resource/54/3579654_image2_1.jpg",
		"lat": 37.5103955843,
		"lng": 127.0610512042,
		"homepage": "https://gangnameyes.com/event/festival"
	},
	"3489468": {
		"name": "창덕궁 약다방",
		"gu": "종로구",
		"addr": "서울특별시 종로구 율곡로 99 (와룡동)",
		"start": "20251001",
		"end": "20251023",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/51/3489451_image2_1.jpg",
		"lat": 37.5777031595,
		"lng": 126.9902446339,
		"homepage": "https://www.kh.or.kr/cont/view/all/day/menu/361?thisPage=1&idx=110216&searchField=all&searchDate=20251001&weekSel=&searchText=%EC%95%BD%EB%8B%A4%EB%B0%A9"
	},
	"3524418": {
		"name": "제2회 고메 잇 강남",
		"gu": "강남구",
		"addr": "서울특별시 강남구 영동대로 513 (삼성동)",
		"start": "20251104",
		"end": "20251116",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/24/3563924_image2_1.png",
		"lat": 37.5119175967,
		"lng": 127.059217995,
		"homepage": "https://www.instagram.com/gourmet_eat_gangnam/"
	},
	"3526695": {
		"name": "제6회 푸른하늘의 날 기념행사",
		"gu": "중구",
		"addr": "서울특별시 중구 을지로 지하12 (을지로1가)",
		"start": "20250903",
		"end": "20250903",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/94/3526694_image2_1.jpg",
		"lat": 37.5655015943,
		"lng": 126.9787960237,
		"homepage": "https://www.instagram.com/blueskymamo/"
	},
	"3533382": {
		"name": "엔터테크 서울 2025",
		"gu": "중구",
		"addr": "서울특별시 중구 을지로 281 (을지로7가)",
		"start": "20250919",
		"end": "20250921",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/81/3533381_image2_1.png",
		"lat": 37.566107632,
		"lng": 127.0095709797,
		"homepage": null
	},
	"3540355": {
		"name": "2025 제14회 강남구 아름다운 건축물 전시회",
		"gu": "강남구",
		"addr": "서울특별시 강남구 영동대로 513 (삼성동)",
		"start": "20250922",
		"end": "20250928",
		"startMonth": 9,
		"endMonth": 9,
		"image": "https://tong.visitkorea.or.kr/cms/resource/47/3540747_image2_1.png",
		"lat": 37.5119175967,
		"lng": 127.059217995,
		"homepage": "https://gbae.kr/"
	},
	"3546110": {
		"name": "2025 서울한옥위크",
		"gu": "종로구",
		"addr": "서울특별시 종로구 계동길 37 (계동)",
		"start": "20250926",
		"end": "20251005",
		"startMonth": 9,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/09/3546109_image2_1.jpg",
		"lat": 37.5790529392,
		"lng": 126.9867060298,
		"homepage": "https://hanok.seoul.go.kr/"
	},
	"3548994": {
		"name": "그린칩스 페스티벌",
		"gu": "마포구",
		"addr": "서울특별시 마포구 성미산로 151-1 (연남동)",
		"start": "20251015",
		"end": "20251026",
		"startMonth": 10,
		"endMonth": 10,
		"image": "https://tong.visitkorea.or.kr/cms/resource/93/3548993_image2_1.png",
		"lat": 37.5645590416,
		"lng": 126.9232288927,
		"homepage": "https://greenchipsseoul.com/"
	},
	"3551526": {
		"name": "용마루 숲길 축제",
		"gu": "용산구",
		"addr": "서울특별시 용산구 효창원로55길 8 (용문동)",
		"start": "20251024",
		"end": "20251109",
		"startMonth": 10,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/93/3551493_image2_1.jpg",
		"lat": 37.5388210345,
		"lng": 126.9605734386,
		"homepage": "https://www.yongsan.go.kr/portal/bbs/B0000041/view.do?nttId=718229&menuNo=200228"
	},
	"3554794": {
		"name": "2025 대한민국 김장대축제",
		"gu": "서초구",
		"addr": "서울특별시 서초구 강남대로 27 (양재동)",
		"start": "20251122",
		"end": "20251122",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/85/3562885_image2_1.jpg",
		"lat": 37.467391878,
		"lng": 127.0407514903,
		"homepage": "https://kimjang-festa.com/default/"
	},
	"3563444": {
		"name": "방배카페 골목페스타",
		"gu": "서초구",
		"addr": "서울특별시 서초구 방배중앙로 193 (방배동)",
		"start": "20251115",
		"end": "20251115",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/52/3564652_image2_1.png",
		"lat": 37.4963319705,
		"lng": 126.9854168201,
		"homepage": "https://www.seocho.go.kr/site/seocho/ex/bbs/View.do?pageIndex=1&pageUnit=10&cbIdx=59&searchMedia=&bcIdx=405392&searchCondition=subCont&searchKeyword="
	},
	"3572025": {
		"name": "동궐동락",
		"gu": "종로구",
		"addr": "서울특별시 종로구 창경궁로 185 (와룡동)",
		"start": "20251111",
		"end": "20251116",
		"startMonth": 11,
		"endMonth": 11,
		"image": "https://tong.visitkorea.or.kr/cms/resource/22/3572022_image2_1.jpg",
		"lat": 37.5789336838,
		"lng": 126.9964634775,
		"homepage": "https://www.kh.or.kr/cont/view/fest/month/menu/210?thisPage=1&idx=110321&searchCategory1=600&searchCategory2=&searchCategory3=&searchField=all&searchDate=202511&weekSel=undefined&searchType=&searchText="
	}
};
var name_aliases_default = {
	_읽어보세요: [
		"같은 곳인데 사람이 적은 이름과 관광공사 이름이 다를 때, 여기에 이어 준다.",
		"왼쪽이 seed.ts에 적힌 이름, 오른쪽이 관광공사(tour-places-raw.json) 이름이다.",
		"",
		"합치기는 기본적으로 **기호·공백을 털어낸 이름**으로 맞춘다. 그것만으로도",
		"'양천가족 거리축제'·'마장 축산물시장'·'서울로 7017'·'<다다페스타>'는 붙는다.",
		"여기 적는 것은 **글자 자체가 다른** 경우뿐이다.",
		"",
		"⚠️ 넣기 전에 반드시 같은 곳인지 확인할 것. 이름이 비슷해도 다른 곳이 있다 —",
		"'구로시장'과 '남구로시장'은 서로 다른 시장이고, '광장시장'과 '광장시장 한복매장'은",
		"시장과 그 안의 매장이다. 둘 다 여기 넣으면 안 된다(node scripts/audit-duplicates.mjs가",
		"이 둘을 '중복 아님'으로 따로 적어 두므로 매번 다시 고민하지 않아도 된다)."
	],
	_다른곳: [["구로시장", "남구로시장"], ["광장시장", "광장시장 한복매장"]],
	"국립현대미술관 서울관": "국립현대미술관 서울",
	간송미술관: "간송미술관(서울 보화각)"
};
var display_names_default = {
	_읽어보세요: [
		"🏷️ 관광공사가 준 이름을 **화면에 쓸 이름**으로 다듬는 표.",
		"왼쪽이 tour-places-raw.json 에 들어 있는 원래 이름, 오른쪽이 화면에 띄울 이름이다.",
		"",
		"왜 필요한가 (2026-09-04 사장님 지시: \"강추는 빼\") —",
		"관광공사 자료의 이름에는 홍보 문구가 붙어 오는 경우가 있다.",
		"「강북청소년축제 강추」의 '강추'가 그것이다. 이게 그냥 못생긴 이름으로만",
		"끝나지 않고 **번역까지 망가뜨린다** — 구글이 '강추'를 문장으로 읽어",
		"영어 이름이 \"I highly recommend Gangbuk Youth Festival.\" 이 돼 있었다.",
		"장소 이름 자리에 문장이 들어가 있으면 손님은 그게 이름인지 설명인지 모른다.",
		"그리고 택시 기사에게 보여 주는 화면에도 그대로 나간다.",
		"",
		"⚠️ **원본(tour-places-raw.json)은 고치지 않는다.** 그건 관광공사가 실제로",
		"   준 답을 적어 둔 것이고, 스크립트를 다시 돌리면 어차피 덮어써진다.",
		"   다듬기는 앱이 읽는 자리(tourPlaces.ts의 toPlace)에서 한 번만 한다.",
		"",
		"⚠️ **이름을 바꾸면 이름을 열쇠로 쓰는 표도 같이 바꿔야 한다.**",
		"   지금 이름을 열쇠로 쓰는 것은 place-translations.json 하나뿐이다",
		"   (tour-gallery·festival-dates 는 contentId, dead-links 는 주소가 열쇠라 안전하다).",
		"   빠뜨리면 그 곳만 번역이 사라져 외국인 화면에 한글이 그대로 뜬다.",
		"",
		"⚠️ **줄이는 것만 한다.** 없는 말을 붙이거나 다른 이름으로 바꾸지 않는다.",
		"   손님이 현지에서 그 이름을 대야 하므로, 실제로 통하는 이름이어야 한다."
	],
	"강북청소년축제 강추": "강북청소년축제",
	_청량리: [
		"🏪 **사장님 지시 2026-09-12: \"15 청량리 종합시장으로 바꿔\"**",
		"",
		"위 ⚠️ 「줄이는 것만 한다」의 **유일한 예외**다. 왜 예외로 두는지 적어 둔다 —",
		"청량리에는 청량리종합시장과 청량리청과물시장이 **따로** 있고, 둘은 왕산로33길",
		"같은 골목에 붙어 있다. 사장님이 68곳을 직접 보고 「여긴 종합시장이다」라고",
		"정해 주셨다. 현장을 아는 사람의 판단이 관광공사 이름표보다 앞선다.",
		"",
		"🚨 **다음 사람이 알아야 할 두 가지 — 안 고친 것들이다:**",
		"  · 주소(slug)는 cheongnyangni-fruit-and-vegetable-market 그대로다.",
		"    **한 번 낸 주소는 안 바꾼다** — 남이 걸어 둔 링크가 깨진다.",
		"  · 사진은 관광공사가 **청과물시장**으로 준 것이다. 바로 옆 시장이라 크게",
		"    어긋나지는 않지만, 종합시장 사진을 구하면 manual-photos 로 바꿔 넣을 것."
	],
	청량리청과물시장: "청량리종합시장"
};
var bad_coords_default = {
	_읽어보세요: [
		"🚫 **믿지 않기로 한 좌표.** 여기 적힌 곳은 좌표를 아예 안 쓴다(빈 칸으로 둔다).",
		"",
		"왜 필요한가 (2026-09-04 출시 전 검수) — 좌표를 거꾸로 주소로 바꿔",
		"(카카오 coord2regioncode) 우리가 적어 둔 구와 대조해 봤더니, 관광공사가 준",
		"좌표 중에 **자기가 적은 주소와 아예 다른 곳**을 가리키는 것이 나왔다.",
		"숫자라서 화면에서는 멀쩡해 보인다 — 손님이 도착한 뒤에야 알게 된다.",
		"",
		"왜 tour-places-raw.json을 직접 안 고치나 — 그 파일은 fetch-tour-places가",
		"통째로 다시 받아 덮어쓴다. 손으로 고쳐 두면 다음 실행에 조용히 되돌아온다.",
		"그래서 **따로 적어 두고 앱이 읽을 때 뺀다.**",
		"",
		"⚠️ 경계에 걸친 곳은 여기 넣지 않는다. 산·고가·능선은 두 구를 걸치는 것이",
		"정상이고, 그건 좌표가 틀린 게 아니라 구 하나로 적을 수 없는 것뿐이다",
		"(서울로7017=중구·용산 / 구룡산=서초·강남 / 북악하늘길 3산책로=성북·종로).",
		"여기 넣는 것은 **가리키는 곳 자체가 엉뚱한 경우**뿐이다.",
		"",
		"열쇠는 관광공사 contentId를 쓴 앱 id(tour_…)다 — 이름은 바뀔 수 있지만",
		"contentId는 관광공사가 고정으로 준다."
	],
	tour_1037031: {
		"name": "[북악하늘길 스카이웨이] 하늘한마당~하늘마루",
		"why": "관광공사 주소는 '서울특별시 성북구 성북동'인데 같이 준 좌표(37.569354, 127.006816)는 중구 을지로6가 — 북악산에서 8km 떨어진 동대문 옆이다. 같은 북악하늘길 2·3산책로는 성북동 근처(37.59~37.60)로 맞게 들어와 있어, 이 항목만 값이 잘못 들어간 것으로 본다. 틀린 좌표 < 빈 칸 (2026-09-04 출시 전 검수)"
	},
	"_2026-09-12에-배운-것": [
		"🚇 아래 둘은 **가까운 지하철역을 계산하다가** 걸렸다.",
		"우리 자료(서울 지하철역 580곳)로 재 보니 「1.5km 안에 역이 없다」고 나왔는데,",
		"한 곳은 중구 한복판이고 한 곳은 김포공항역 위다 — **그럴 수가 없는 답**이다.",
		"좌표를 열어 보니 서울이 아니었다.",
		"",
		"📌 배운 것: **「역이 없다」는 답이 좌표 검사도 된다.** 서울 안이라면 1.5km에",
		"역이 없는 곳은 거의 없다. 그래서 그 답이 나오면 **좌표를 먼저 의심한다.**",
		"구 대조(카카오 coord2regioncode)는 호출이 드는데 이건 공짜로 딸려 온다."
	],
	tour_2997813: {
		"name": "롯데백화점 김포공항점",
		"why": "관광공사 주소는 '서울특별시 강서구 하늘길 38 (방화동)'인데 같이 준 좌표는 19.694427, 117.992566 — **남중국해**다(하이난 남쪽 바다, 서울에서 2,500km). 지도 핀이 바다에 찍힌다. 주소는 맞으니 곳을 뺀 게 아니라 **좌표만** 뺀다. 틀린 좌표 < 빈 칸 (2026-09-12)"
	},
	tour_132198: {
		"name": "퇴계로 오토바이상가",
		"why": "관광공사 주소는 '서울특별시 중구 충무로4가'인데 같이 준 좌표는 36.984457, 126.927322 — **충남 아산 근처**다(서울에서 65km 남쪽). 위도 앞자리가 37→36으로 어긋난 모양새지만 **고쳐서 쓰지는 않는다** — 짐작으로 좌표를 만들면 그게 더 나쁘다. 틀린 좌표 < 빈 칸 (2026-09-12)"
	}
};
//#endregion
//#region src/data/tourPlaces.ts
var RAW = tour_places_raw_default;
/**
* id는 관광공사 contentId를 그대로 쓴다.
*
* seed.ts는 `ks_1`·`ks_2`처럼 순번으로 id를 만드는데, 그 순번은 항목을 하나
* 지우거나 넣으면 뒤가 통째로 밀린다. 여기에 같은 방식을 쓰면 스크립트를 다시
* 돌릴 때마다 id가 바뀌어, 사진·좌표가 엉뚱한 곳에 붙는다(Kfood에서 실제로
* 겪은 사고다 — 지운 가게의 사진이 새 가게에 그대로 붙었다).
* contentId는 관광공사가 장소마다 고정으로 주는 값이라 그럴 일이 없고,
* `tour_` 접두사 덕에 `ks_`와 절대 겹치지 않는다.
*/
var idOf = (p) => `tour_${p.contentId}`;
var DATES = festival_dates_default;
var BAD_COORDS = Object.fromEntries(Object.entries(bad_coords_default).filter(([k]) => !k.startsWith("_")));
/**
* "20251017" → "mid". 날짜가 이상하면 undefined — 지어내지 않는다.
*
* 🚨 날짜를 그대로 안 쓰고 초·중·하순으로 뭉개는 이유는 Place.period 주석에 적어 뒀다:
* 받아온 값이 **지난 회차(2025년)** 것이라, 달까지는 맞아도 날짜는 해마다 옮겨 간다.
*/
function periodOf(yyyymmdd) {
	if (!/^\d{8}$/.test(yyyymmdd)) return void 0;
	const day = Number(yyyymmdd.slice(6, 8));
	if (day < 1 || day > 31) return void 0;
	return day <= 10 ? "early" : day <= 20 ? "mid" : "late";
}
/**
* 🏷️ 화면에 띄울 이름. 관광공사가 준 이름에 붙어 온 홍보 문구를 털어낸다.
*
* 왜 (2026-09-04 사장님 지시: "강추는 빼") — 「강북청소년축제 강추」의 '강추'가
* 이름 자리에 그대로 들어가 있었다. 못생긴 데서 끝나지 않고 **번역까지
* 망가뜨렸다** — 구글이 그걸 문장으로 읽어 영어 이름이
* "I highly recommend Gangbuk Youth Festival." 이 돼 있었다.
* 게다가 이제는 **택시 기사에게 내미는 화면**에도 그대로 나간다(DriverCard.tsx).
*
* 표에 없는 곳은 원래 이름 그대로다 — 기계가 알아서 자르지 않는다.
* '강추' 같은 말을 규칙으로 잘라 내려 하면 그게 이름의 일부인 곳까지 자른다.
*/
var DISPLAY_NAMES = Object.fromEntries(Object.entries(display_names_default).filter(([k, v]) => !k.startsWith("_") && typeof v === "string"));
var displayName = (raw) => DISPLAY_NAMES[raw.normalize("NFC")] ?? raw;
function toPlace(category, p) {
	const date = category === "festival" ? DATES[p.contentId] : void 0;
	const homepage = date?.homepage;
	const distrusted = idOf(p) in BAD_COORDS;
	return {
		id: idOf(p),
		gu: p.gu ?? "",
		category,
		name: displayName(p.name),
		addr: p.addr,
		...isOfficialSite(homepage) ? { officialUrl: homepage } : null,
		image: p.image,
		thumb: p.thumb ?? p.image,
		...distrusted ? {
			lat: void 0,
			lng: void 0
		} : {
			lat: p.lat,
			lng: p.lng
		},
		...date?.startMonth != null ? {
			startMonth: date.startMonth,
			endMonth: date.endMonth ?? date.startMonth,
			period: periodOf(date.start),
			monthSource: `한국관광공사 축제 창구 (${date.start})`
		} : null,
		confirmed: true,
		source: "tour",
		tourContentId: String(p.contentId)
	};
}
/** 구를 못 찾은 항목은 뺀다 — 화면이 구 단위로 움직이므로 어디에도 못 붙는다. */
var TOUR_PLACES = Object.entries(RAW).flatMap(([category, list]) => (list ?? []).filter((p) => p.gu).map((p) => toPlace(category, p)));
/**
* 이름으로 관광공사 항목을 찾는 표.
*
* 🔁 **열쇠는 기호·공백을 털어낸 이름**이다(2026-09-02 사용자가 앱 화면에서 잡은 사고).
* 예전에는 NFC 문자열을 글자까지 그대로 비교해서, 같은 곳인데도 표기가 조금만
* 다르면 안 합쳐지고 **카드가 두 장** 떴다:
*
*   성북거리문화축제 다다페스타   vs  성북거리문화축제 <다다페스타>
*   양천가족거리축제             vs  양천가족 거리축제
*   마장축산물시장               vs  마장 축산물시장
*   서울로7017                  vs  서울로 7017
*   한양대학교박물관             vs  한양대학교 박물관
*
* 관광공사는 부제를 < >나 ( )로 묶고 띄어쓰기도 다르게 적는 일이 잦다. 기호와
* 공백을 털면 이 다섯 쌍이 저절로 붙는다.
*
* ⚠️ **여기서 더 느슨하게 하면 안 된다.** '포함하면 같은 곳'까지 인정하면
* 구로시장과 **남**구로시장(서로 다른 시장), 광장시장과 광장시장 **한복매장**
* (시장과 그 안의 매장)이 하나로 합쳐진다. 좌표·사진 쪽 잣대가 '5자 이내 덧붙음'을
* 인정하는 것과 일부러 다르게 뒀다 — 거기는 **검색 결과를 고르는** 자리라 덜 맞아도
* 사람이 로그로 보지만, 여기는 **화면에 뜰 항목을 지우는** 자리라 되돌리기 어렵다.
*
* 한글은 보이는 게 같아도 코드가 다를 수 있으므로 NFC를 먼저 거친다.
*/
var nameKey = (s) => s.normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "");
var TOUR_BY_NAME = new Map(TOUR_PLACES.map((p) => [nameKey(p.name), p]));
/** 이름 자체가 달라 위 규칙으로는 못 잇는 곳 — 사람이 확인해 적은 표(name-aliases.json). */
var NAME_ALIASES = Object.fromEntries(Object.entries(name_aliases_default).filter(([k, v]) => !k.startsWith("_") && typeof v === "string"));
/** 사람이 적은 이름에 붙여 둔 관광공사 쪽 이름. 없으면 undefined. */
var aliasOf = (handName) => NAME_ALIASES[handName.normalize("NFC")];
/**
* 주어진 표에서 그 곳을 찾는다. 별명표를 먼저 보고, 없으면 이름으로 찾는다.
*
* 표를 밖에서 받는 이유 — 축제 합치기는 **축제만 담은 표**로 찾아야 한다.
* 전체 표에서 찾으면 이름이 같은 다른 칸의 항목(예: 박물관 '허준박물관')이 먼저
* 걸려 축제가 안 붙는다.
*/
function findIn(table, handName) {
	const alias = aliasOf(handName);
	if (alias) {
		const byAlias = table.get(nameKey(alias));
		if (byAlias) return byAlias;
	}
	return table.get(nameKey(handName));
}
/** 전체 관광공사 자료에서 찾는다(칸을 가리지 않는 합치기용). */
var findTourPlace = (handName) => findIn(TOUR_BY_NAME, handName);
var manual_photos_default = {
	_: {
		"설명": "사람이 직접 찾아 넣는 사진. 하루 3곳씩 채운다(사용자 결정 2026-09-01).",
		"규칙": [
			"🚨 저작권이 자유로운 것만 넣는다 — 구청·서울시 등 공공기관이 공공누리로 공개한 사진.",
			"공공누리 1~4유형 중 '출처표시'만 지키면 되는 1유형이 가장 안전하다.",
			"블로그·인스타·구글 이미지 검색 결과는 절대 쓰지 않는다(전부 남의 저작물이다).",
			"source(어디서 가져왔는지)와 license(이용 조건)를 반드시 함께 적는다 — 못 적으면 넣지 않는다.",
			"pageUrl은 나중에 출처를 다시 확인할 수 있게 남기는 원본 페이지 주소다."
		],
		"적는 법": {
			"열쇠": "seed.ts의 id (ks_로 시작). scripts/list-photo-todo.mjs가 알려준다.",
			"예시": { "ks_1a": {
				"image": "https://www.gangnam.go.kr/.../yangjaecheon.jpg",
				"source": "강남구청",
				"license": "공공누리 제1유형",
				"pageUrl": "https://www.gangnam.go.kr/board/..."
			} }
		}
	},
	ks_4: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/63/3557963_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2028176",
		"auto": true,
		"matchedName": "허준축제"
	},
	ks_d: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/11/3547511_image2_1.png",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=229057",
		"auto": true,
		"matchedName": "서울와우북페스티벌"
	},
	ks_j: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/54/3527554_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=3348362",
		"auto": true,
		"matchedName": "성북거리문화축제 <다다페스타>"
	},
	ks_l: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/32/3544832_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=3384023",
		"auto": true,
		"matchedName": "양천가족 거리축제"
	},
	ks_z: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/68/2787768_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2741602",
		"auto": true,
		"matchedName": "암사종합시장"
	},
	ks_11: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/82/3566882_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2753917",
		"auto": true,
		"matchedName": "화곡본동시장"
	},
	ks_14: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/48/3400248_image2_1.JPG",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2592394",
		"auto": true,
		"matchedName": "구로시장"
	},
	ks_16: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/99/2779699_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2743742",
		"auto": true,
		"matchedName": "공릉동도깨비시장"
	},
	ks_1d: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/38/3463038_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=1253230",
		"auto": true,
		"matchedName": "마장 축산물시장"
	},
	ks_1k: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/81/2668981_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=132183",
		"auto": true,
		"matchedName": "광장시장"
	},
	ks_1m: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/67/2612867_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=132180",
		"auto": true,
		"matchedName": "남대문시장"
	},
	ks_1t: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/61/3355161_image2_1.JPG",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=126490",
		"auto": true,
		"matchedName": "서울어린이대공원"
	},
	ks_22: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/24/3565324_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2784060",
		"auto": true,
		"matchedName": "난지천공원"
	},
	ks_2g: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/80/3412280_image2_1.JPG",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=1117141",
		"auto": true,
		"matchedName": "사가정공원"
	},
	ks_2k: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/44/3540144_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=822384",
		"auto": true,
		"matchedName": "북서울꿈의숲"
	},
	ks_2n: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/61/3534561_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=1030763",
		"auto": true,
		"matchedName": "뚝섬한강공원"
	},
	ks_2p: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/58/2650858_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2704696",
		"auto": true,
		"matchedName": "경춘선숲길"
	},
	ks_35: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/09/3081409_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2495561",
		"auto": true,
		"matchedName": "서울로 7017"
	},
	ks_44: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/02/2991502_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=1934593",
		"auto": true,
		"matchedName": "국립현대미술관 서울"
	},
	ks_45: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/61/3573161_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2707460",
		"auto": true,
		"matchedName": "딜쿠샤"
	},
	ks_46: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/92/3096392_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=2481866",
		"auto": true,
		"matchedName": "백인제가옥"
	},
	ks_4a: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/43/3464643_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=130511",
		"auto": true,
		"matchedName": "간송미술관(서울 보화각)"
	},
	ks_4c: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/81/3542581_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=130348",
		"auto": true,
		"matchedName": "대안공간 루프"
	},
	ks_4h: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/55/3502855_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=1916296",
		"auto": true,
		"matchedName": "한성백제박물관"
	},
	ks_4m: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/71/3566871_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=1750737",
		"auto": true,
		"matchedName": "강동아트센터"
	},
	ks_4o: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/64/3539964_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=1897833",
		"auto": true,
		"matchedName": "서울상상나라"
	},
	ks_51: {
		"image": "https://tong.visitkorea.or.kr/cms/resource/29/3537629_image2_1.jpg",
		"source": "한국관광공사",
		"license": "공공누리 제1유형",
		"pageUrl": "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=130958",
		"auto": true,
		"matchedName": "한양대학교 박물관"
	}
};
//#endregion
//#region src/lib/manualPhotos.ts
var sameName = (a, b) => String(a ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "") === String(b ?? "").normalize("NFC").replace(/[^가-힣a-zA-Z0-9]/g, "");
var PHOTOS = Object.fromEntries(Object.entries(manual_photos_default).filter(([k, v]) => !k.startsWith("_") && typeof v === "object" && v !== null && typeof v.image === "string" && typeof v.source === "string" && typeof v.license === "string"));
/**
* 🚨 **id만 믿지 않는다** (2026-09-02에 11곳이 남의 사진을 달고 있었다).
*
* seed.ts의 id는 `ks_1, ks_2 …`로 **파일에 적힌 순서**로 매겨진다. 항목 하나를
* 지우거나 끼워 넣으면 그 뒤가 전부 밀리는데, 이 파일은 옛 번호를 그대로 들고
* 있어 **화면에 남의 집 사진이 뜬다**:
*
*     서울시립미술관(중구)  → 딜쿠샤 사진 (종로구의 다른 곳)
*     관세박물관(강남구)    → 대안공간 루프 사진
*     무수골(도봉구)       → 경춘선숲길 사진
*
* 좌표가 밀린 것과 같은 원인이고(lib/coords.ts 주석), 사진 쪽이 더 나쁘다 —
* 좌표는 눌러 봐야 알지만 사진은 **목록에 그냥 보인다.**
*
* 그래서 자동으로 넣은 사진에는 그때 맞춘 이름(matchedName)이 적혀 있고,
* 지금 이름과 다르면 **안 쓴다.** 사진이 없는 곳으로 취급되어 목록에서 빠지거나
* 일러스트가 대신 나온다 — 남의 사진을 보여 주는 것보다 낫다.
*
* matchedName이 없는 항목(사람이 직접 찾아 넣은 것)은 검사하지 않는다 —
* 사람이 그 장소를 보고 고른 것이라 밀림과 무관하다.
*/
function getManualPhoto(placeId, name) {
	const p = PHOTOS[placeId];
	if (!p) return void 0;
	if (name && p.matchedName && !sameName(p.matchedName, name)) return void 0;
	return p;
}
Object.keys(PHOTOS).length;
//#endregion
//#region src/lib/photoGallery.ts
/** "_"로 시작하는 열쇠는 파일 안에 적어 둔 설명이라 자료가 아니다. */
var BY_NAME = Object.fromEntries(Object.entries({
	"영등포구|여의도 봄꽃축제": {
		"name": "여의도 봄꽃축제",
		"gu": "영등포구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/59/2638059.jpg",
				"title": "2019 영등포 여의도 봄꽃축제",
				"photographer": "라이브스튜디오",
				"createdAt": "20191121153402",
				"contentId": "2638059"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/58/2638058.jpg",
				"title": "2019 영등포 여의도 봄꽃축제",
				"photographer": "라이브스튜디오",
				"createdAt": "20191121153336",
				"contentId": "2638058"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/57/2638057.jpg",
				"title": "2019 영등포 여의도 봄꽃축제",
				"photographer": "라이브스튜디오",
				"createdAt": "20191121153243",
				"contentId": "2638057"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/56/2638056.jpg",
				"title": "2019 영등포 여의도 봄꽃축제",
				"photographer": "라이브스튜디오",
				"createdAt": "20191121153029",
				"contentId": "2638056"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/55/2638055.jpg",
				"title": "2019 영등포 여의도 봄꽃축제",
				"photographer": "라이브스튜디오",
				"createdAt": "20191121152959",
				"contentId": "2638055"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"영등포구|서울세계불꽃축제": {
		"name": "서울세계불꽃축제",
		"gu": "영등포구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/66/2540166.jpg",
				"title": "서울세계불꽃축제",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322172701",
				"contentId": "2540166"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/65/2540165.jpg",
				"title": "서울세계불꽃축제",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322172620",
				"contentId": "2540165"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/64/2540164.jpg",
				"title": "서울세계불꽃축제",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322172546",
				"contentId": "2540164"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/61/2540161.jpg",
				"title": "서울세계불꽃축제",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322172259",
				"contentId": "2540161"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/60/2540160.jpg",
				"title": "서울세계불꽃축제",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322172219",
				"contentId": "2540160"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"동대문구|경동시장": {
		"name": "경동시장",
		"gu": "동대문구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/62/2662262.jpg",
				"title": "서울 경동시장",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20200706143337",
				"contentId": "2662262"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/61/2662261.jpg",
				"title": "서울 경동시장",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20200706143311",
				"contentId": "2662261"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/60/2662260.jpg",
				"title": "서울 경동시장",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20200706143250",
				"contentId": "2662260"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/58/2662258.jpg",
				"title": "서울 경동시장",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20200706143054",
				"contentId": "2662258"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/57/2662257.jpg",
				"title": "서울 경동시장",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20200706142742",
				"contentId": "2662257"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"동작구|노량진수산시장": {
		"name": "노량진수산시장",
		"gu": "동작구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/72/1452472.jpg",
				"title": "노량진수산시장",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20111124155513",
				"contentId": "1452472"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/76/1452376.jpg",
				"title": "노량진수산시장",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20111124153929",
				"contentId": "1452376"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/84/1452484.jpg",
				"title": "노량진수산시장",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20111124155837",
				"contentId": "1452484"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/98/1452498.jpg",
				"title": "노량진수산시장",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20111124160150",
				"contentId": "1452498"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/34/1452534.jpg",
				"title": "노량진수산시장",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20111124160457",
				"contentId": "1452534"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"마포구|망원시장": {
		"name": "망원시장",
		"gu": "마포구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/68/2588668.jpg",
				"title": "망원시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116153457",
				"contentId": "2588668"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/67/2588667.jpg",
				"title": "망원시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116153228",
				"contentId": "2588667"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/69/2588669.jpg",
				"title": "망원시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116153533",
				"contentId": "2588669"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/66/2588666.jpg",
				"title": "망원시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116153152",
				"contentId": "2588666"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/64/2588664.jpg",
				"title": "망원시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116153037",
				"contentId": "2588664"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|통인시장": {
		"name": "통인시장",
		"gu": "종로구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/60/3010860.jpg",
				"title": "통인시장",
				"photographer": "한승호",
				"createdAt": "20230914133127",
				"contentId": "3010860"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/36/3011936.jpg",
				"title": "통인시장",
				"photographer": "우창민",
				"createdAt": "20230918135057",
				"contentId": "3011936"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/57/3010857.jpg",
				"title": "통인시장",
				"photographer": "김민수",
				"createdAt": "20230914132932",
				"contentId": "3010857"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/32/3011932.jpg",
				"title": "통인시장",
				"photographer": "한승호",
				"createdAt": "20230918134728",
				"contentId": "3011932"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/31/3011931.jpg",
				"title": "통인시장",
				"photographer": "김민수",
				"createdAt": "20230918134532",
				"contentId": "3011931"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"강서구|서울식물원": {
		"name": "서울식물원",
		"gu": "강서구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/32/3020432.jpg",
				"title": "서울식물원",
				"photographer": "김경빈",
				"createdAt": "20231017103645",
				"contentId": "3020432"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/47/3020447.jpg",
				"title": "서울식물원",
				"photographer": "김경빈",
				"createdAt": "20231017104311",
				"contentId": "3020447"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/45/3020445.jpg",
				"title": "서울식물원",
				"photographer": "김경빈",
				"createdAt": "20231017103859",
				"contentId": "3020445"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/46/3020446.jpg",
				"title": "서울식물원",
				"photographer": "김경빈",
				"createdAt": "20231017104208",
				"contentId": "3020446"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"송파구|석촌호수 벚꽃길": {
		"name": "석촌호수 벚꽃길",
		"gu": "송파구",
		"photos": [{
			"url": "https://tong.visitkorea.or.kr/cms2/website/10/2907610.jpg",
			"title": "석촌호수 벚꽃길",
			"photographer": "유계정",
			"createdAt": "20221114162652",
			"contentId": "2907610"
		}],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"용산구|남산": {
		"name": "남산",
		"gu": "용산구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/93/3538493.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172521",
				"contentId": "3538493"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/92/3538492.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172521",
				"contentId": "3538492"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/91/3538491.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172521",
				"contentId": "3538491"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/90/3538490.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172521",
				"contentId": "3538490"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/89/3538489.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172520",
				"contentId": "3538489"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|청계천": {
		"name": "청계천",
		"gu": "종로구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/36/3538136.jpg",
				"title": "청계천",
				"photographer": "서문교",
				"createdAt": "20250916153500",
				"contentId": "3538136"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/35/3538135.jpg",
				"title": "청계천",
				"photographer": "서문교",
				"createdAt": "20250916153500",
				"contentId": "3538135"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/34/3538134.jpg",
				"title": "청계천",
				"photographer": "서문교",
				"createdAt": "20250916153500",
				"contentId": "3538134"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/18/3538118.jpg",
				"title": "청계천",
				"photographer": "서문교",
				"createdAt": "20250916153117",
				"contentId": "3538118"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/94/3344294.jpg",
				"title": "청계천",
				"photographer": "안영관",
				"createdAt": "20240807142905",
				"contentId": "3344294"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"중구|남산": {
		"name": "남산",
		"gu": "중구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/93/3538493.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172521",
				"contentId": "3538493"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/92/3538492.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172521",
				"contentId": "3538492"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/91/3538491.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172521",
				"contentId": "3538491"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/90/3538490.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172521",
				"contentId": "3538490"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/89/3538489.jpg",
				"title": "남산자락숲길",
				"photographer": "한건우",
				"createdAt": "20250916172520",
				"contentId": "3538489"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"마포구|하늘공원": {
		"name": "하늘공원",
		"gu": "마포구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/12/4063012.jpg",
				"title": "하늘공원",
				"photographer": "서문교",
				"createdAt": "20260508142201",
				"contentId": "4063012"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/13/4063013.jpg",
				"title": "하늘공원",
				"photographer": "서문교",
				"createdAt": "20260508142258",
				"contentId": "4063013"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/14/4063014.jpg",
				"title": "하늘공원",
				"photographer": "서문교",
				"createdAt": "20260508142356",
				"contentId": "4063014"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/15/4063015.jpg",
				"title": "하늘공원",
				"photographer": "서문교",
				"createdAt": "20260508142651",
				"contentId": "4063015"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/23/4063023.jpg",
				"title": "하늘공원",
				"photographer": "서문교",
				"createdAt": "20260508142745",
				"contentId": "4063023"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"중구|서울시립미술관": {
		"name": "서울시립미술관",
		"gu": "중구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/51/2717451.jpg",
				"title": "서울시립미술관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20210517150300",
				"contentId": "2717451"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/50/2717450.jpg",
				"title": "서울시립미술관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20210517150220",
				"contentId": "2717450"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/49/2717449.jpg",
				"title": "서울시립미술관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20210517150147",
				"contentId": "2717449"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/48/2717448.jpg",
				"title": "서울시립미술관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20210517150100",
				"contentId": "2717448"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/47/2717447.jpg",
				"title": "서울시립미술관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20210517150002",
				"contentId": "2717447"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"용산구|국립중앙박물관": {
		"name": "국립중앙박물관",
		"gu": "용산구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/45/3052845.jpg",
				"title": "국립중앙박물관",
				"photographer": "최린",
				"createdAt": "20231129204415",
				"contentId": "3052845"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/42/3052842.jpg",
				"title": "국립중앙박물관",
				"photographer": "최린",
				"createdAt": "20231129204221",
				"contentId": "3052842"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/44/3052844.jpg",
				"title": "국립중앙박물관",
				"photographer": "최린",
				"createdAt": "20231129204339",
				"contentId": "3052844"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/46/3052846.jpg",
				"title": "국립중앙박물관",
				"photographer": "최린",
				"createdAt": "20231129204449",
				"contentId": "3052846"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/43/3052843.jpg",
				"title": "국립중앙박물관",
				"photographer": "최린",
				"createdAt": "20231129204305",
				"contentId": "3052843"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"은평구|은평역사한옥박물관": {
		"name": "은평역사한옥박물관",
		"gu": "은평구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/20/3525620.JPG",
				"title": "은평역사한옥박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20250822142710",
				"contentId": "3525620"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/21/3525621.JPG",
				"title": "은평역사한옥박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20250822142710",
				"contentId": "3525621"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/22/3525622.JPG",
				"title": "은평역사한옥박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20250822142710",
				"contentId": "3525622"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/19/3525619.JPG",
				"title": "은평역사한옥박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20250822142710",
				"contentId": "3525619"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|광장시장": {
		"name": "광장시장",
		"gu": "종로구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/68/2540168.jpg",
				"title": "광장시장",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322173000",
				"contentId": "2540168"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/69/2540169.jpg",
				"title": "광장시장",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322173027",
				"contentId": "2540169"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/70/2540170.jpg",
				"title": "광장시장",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322173105",
				"contentId": "2540170"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/71/2540171.jpg",
				"title": "광장시장",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322173134",
				"contentId": "2540171"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/67/2540167.jpg",
				"title": "광장시장",
				"photographer": "IR 스튜디오",
				"createdAt": "20180322172746",
				"contentId": "2540167"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"중구|남대문시장": {
		"name": "남대문시장",
		"gu": "중구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/45/2588645.jpg",
				"title": "남대문시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116145954",
				"contentId": "2588645"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/52/2588652.jpg",
				"title": "남대문시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116151548",
				"contentId": "2588652"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/51/2588651.jpg",
				"title": "남대문시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116151529",
				"contentId": "2588651"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/50/2588650.jpg",
				"title": "남대문시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116151509",
				"contentId": "2588650"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/49/2588649.jpg",
				"title": "남대문시장",
				"photographer": "니오타니 스튜디오",
				"createdAt": "20190116151449",
				"contentId": "2588649"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|백인제가옥": {
		"name": "백인제가옥",
		"gu": "종로구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/66/3011266.jpg",
				"title": "백인제가옥",
				"photographer": "이형찬",
				"createdAt": "20230915135545",
				"contentId": "3011266"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/67/3011267.jpg",
				"title": "백인제가옥",
				"photographer": "이형찬",
				"createdAt": "20230915135644",
				"contentId": "3011267"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/65/3011265.jpg",
				"title": "백인제가옥",
				"photographer": "이형찬",
				"createdAt": "20230915135448",
				"contentId": "3011265"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"성북구|간송미술관": {
		"name": "간송미술관",
		"gu": "성북구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/37/1675237.jpg",
				"title": "간송미술관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20120719175150",
				"contentId": "1675237"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/36/1675236.jpg",
				"title": "간송미술관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20120719175028",
				"contentId": "1675236"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/35/1675235.jpg",
				"title": "간송미술관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20120719174858",
				"contentId": "1675235"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/06/1675206.jpg",
				"title": "간송미술관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20120719173650",
				"contentId": "1675206"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/08/1675208.jpg",
				"title": "간송미술관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20120719173825",
				"contentId": "1675208"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"마포구|대안공간 루프": {
		"name": "대안공간 루프",
		"gu": "마포구",
		"photos": [{
			"url": "https://tong.visitkorea.or.kr/cms2/website/52/1247052.jpg",
			"title": "대안공간 루프",
			"photographer": "한국관광공사 김지호",
			"createdAt": "20110331094617",
			"contentId": "1247052"
		}, {
			"url": "https://tong.visitkorea.or.kr/cms2/website/54/1247054.jpg",
			"title": "대안공간 루프",
			"photographer": "한국관광공사 김지호",
			"createdAt": "20110331095041",
			"contentId": "1247054"
		}],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"중구|서울 중부시장": {
		"name": "서울 중부시장",
		"gu": "중구",
		"photos": [{
			"url": "https://tong.visitkorea.or.kr/cms2/website/18/1834518.jpg",
			"title": "서울중부시장",
			"photographer": "한국관광공사 박은경",
			"createdAt": "20130806152812",
			"contentId": "1834518"
		}, {
			"url": "https://tong.visitkorea.or.kr/cms2/website/19/1834519.jpg",
			"title": "서울중부시장",
			"photographer": "한국관광공사 박은경",
			"createdAt": "20130806153046",
			"contentId": "1834519"
		}],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|가회민화박물관": {
		"name": "가회민화박물관",
		"gu": "종로구",
		"photos": [{
			"url": "https://tong.visitkorea.or.kr/cms2/website/57/2468957.jpg",
			"title": "가회민화박물관",
			"photographer": "스튜디오 홍반장",
			"createdAt": "20161222094758",
			"contentId": "2468957"
		}],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"동대문구|경희대학교 자연사박물관": {
		"name": "경희대학교 자연사박물관",
		"gu": "동대문구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/70/1483670.jpg",
				"title": "경희대학교 자연사박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111208153623",
				"contentId": "1483670"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/02/1483702.jpg",
				"title": "경희대학교 자연사박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111208154435",
				"contentId": "1483702"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/25/1483725.jpg",
				"title": "경희대학교 자연사박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111208154728",
				"contentId": "1483725"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/34/1483734.jpg",
				"title": "경희대학교 자연사박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111208154854",
				"contentId": "1483734"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/36/1483736.jpg",
				"title": "경희대학교 자연사박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111208155049",
				"contentId": "1483736"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"성북구|고려대학교 박물관": {
		"name": "고려대학교 박물관",
		"gu": "성북구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/93/1484193.jpg",
				"title": "고려대학교 박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111209092040",
				"contentId": "1484193"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/00/1484200.jpg",
				"title": "고려대학교 박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111209093104",
				"contentId": "1484200"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/20/1484220.jpg",
				"title": "고려대학교 박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111209093409",
				"contentId": "1484220"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/55/1484255.jpg",
				"title": "고려대학교 박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111209094449",
				"contentId": "1484255"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/56/1484256.jpg",
				"title": "고려대학교 박물관",
				"photographer": "한국관광공사 박성근",
				"createdAt": "20111209094511",
				"contentId": "1484256"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|대한민국역사박물관": {
		"name": "대한민국역사박물관",
		"gu": "종로구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/70/1895870.jpg",
				"title": "대한민국역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140218143206",
				"contentId": "1895870"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/76/1895876.jpg",
				"title": "대한민국역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140218143802",
				"contentId": "1895876"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/80/1895880.jpg",
				"title": "대한민국역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140218144023",
				"contentId": "1895880"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/84/1895884.jpg",
				"title": "대한민국역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140218144259",
				"contentId": "1895884"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/86/1895886.jpg",
				"title": "대한민국역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140218144334",
				"contentId": "1895886"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"중구|배재학당역사박물관": {
		"name": "배재학당역사박물관",
		"gu": "중구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/11/1856611.jpg",
				"title": "배재학당역사박물관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20131107164430",
				"contentId": "1856611"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/97/1856597.jpg",
				"title": "배재학당역사박물관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20131107164052",
				"contentId": "1856597"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/98/1856598.jpg",
				"title": "배재학당역사박물관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20131107164009",
				"contentId": "1856598"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/08/1856608.jpg",
				"title": "배재학당역사박물관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20131107164353",
				"contentId": "1856608"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/09/1856609.jpg",
				"title": "배재학당역사박물관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20131107164412",
				"contentId": "1856609"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|서울역사박물관": {
		"name": "서울역사박물관",
		"gu": "종로구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/40/1906240.jpg",
				"title": "서울역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140318154301",
				"contentId": "1906240"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/00/1906300.jpg",
				"title": "서울역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140318162726",
				"contentId": "1906300"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/13/1906313.jpg",
				"title": "서울역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140318163411",
				"contentId": "1906313"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/15/1906315.jpg",
				"title": "서울역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140318163604",
				"contentId": "1906315"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/20/1906320.jpg",
				"title": "서울역사박물관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20140318164008",
				"contentId": "1906320"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|아르코미술관": {
		"name": "아르코미술관",
		"gu": "종로구",
		"photos": [{
			"url": "https://tong.visitkorea.or.kr/cms2/website/84/1856584.jpg",
			"title": "아르코미술관(구 마로니에 미술관)",
			"photographer": "한국관광공사 김지호",
			"createdAt": "20131107162557",
			"contentId": "1856584"
		}],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"용산구|전쟁기념관": {
		"name": "전쟁기념관",
		"gu": "용산구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/58/2553158.jpg",
				"title": "용산 전쟁기념관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20180709172915",
				"contentId": "2553158"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/55/2553155.jpg",
				"title": "용산 전쟁기념관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20180709172657",
				"contentId": "2553155"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/54/2553154.jpg",
				"title": "용산 전쟁기념관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20180709172625",
				"contentId": "2553154"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/38/2553138.jpg",
				"title": "용산 전쟁기념관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20180709170949",
				"contentId": "2553138"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/36/2553136.jpg",
				"title": "용산 전쟁기념관",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20180709170851",
				"contentId": "2553136"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|한국미술관": {
		"name": "한국미술관",
		"gu": "종로구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/48/1650848.jpg",
				"title": "한국미술관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20120621222515",
				"contentId": "1650848"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/20/1650920.jpg",
				"title": "한국미술관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20120621135322",
				"contentId": "1650920"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/97/1650897.jpg",
				"title": "한국미술관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20120621135138",
				"contentId": "1650897"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/95/1650895.jpg",
				"title": "한국미술관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20120621134940",
				"contentId": "1650895"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/66/1650866.jpg",
				"title": "한국미술관",
				"photographer": "한국관광공사 김지호",
				"createdAt": "20120621134356",
				"contentId": "1650866"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|환기미술관": {
		"name": "환기미술관",
		"gu": "종로구",
		"photos": [{
			"url": "https://tong.visitkorea.or.kr/cms2/website/24/1079124.jpg",
			"title": "환기미술관",
			"photographer": "한국관광공사 김지호",
			"createdAt": "20100823154530",
			"contentId": "1079124"
		}],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"중구|덕수궁 돌담길": {
		"name": "덕수궁 돌담길",
		"gu": "중구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/90/3344090.jpg",
				"title": "덕수궁 돌담길",
				"photographer": "안영관",
				"createdAt": "20240807102224",
				"contentId": "3344090"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/44/2519444.jpg",
				"title": "덕수궁 돌담길",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20171206105425",
				"contentId": "2519444"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/42/2519442.jpg",
				"title": "덕수궁 돌담길",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20171206105354",
				"contentId": "2519442"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/36/2519436.jpg",
				"title": "덕수궁 돌담길",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20171206105211",
				"contentId": "2519436"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/31/2519431.jpg",
				"title": "덕수궁 돌담길",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20171206105031",
				"contentId": "2519431"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"관악구|관악산": {
		"name": "관악산",
		"gu": "관악구",
		"photos": [{
			"url": "https://tong.visitkorea.or.kr/cms2/website/12/2909112.jpg",
			"title": "관악산의 석양",
			"photographer": "박정아",
			"createdAt": "20221115162830",
			"contentId": "2909112"
		}],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"종로구|서순라길": {
		"name": "서순라길",
		"gu": "종로구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/64/4061964.jpg",
				"title": "서순라길",
				"photographer": "한건우",
				"createdAt": "20260504160306",
				"contentId": "4061964"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/65/4061965.jpg",
				"title": "서순라길",
				"photographer": "한건우",
				"createdAt": "20260504160319",
				"contentId": "4061965"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/33/3589533.jpg",
				"title": "서순라길",
				"photographer": "서문교",
				"createdAt": "20251230131601",
				"contentId": "3589533"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/83/3046983.jpg",
				"title": "서순라길",
				"photographer": "김민수",
				"createdAt": "20231123112358",
				"contentId": "3046983"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/82/3046982.jpg",
				"title": "서순라길",
				"photographer": "김민수",
				"createdAt": "20231123112246",
				"contentId": "3046982"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"중구|신당동 떡볶이타운": {
		"name": "신당동 떡볶이타운",
		"gu": "중구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/84/2609484.jpg",
				"title": "신당동떡볶이타운",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20190704140024",
				"contentId": "2609484"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/82/2609482.jpg",
				"title": "신당동떡볶이타운",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20190704135926",
				"contentId": "2609482"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/81/2609481.jpg",
				"title": "신당동떡볶이타운",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20190704135810",
				"contentId": "2609481"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/80/2609480.jpg",
				"title": "신당동떡볶이타운",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20190704135637",
				"contentId": "2609480"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/74/2609474.jpg",
				"title": "신당동떡볶이타운",
				"photographer": "한국관광공사 이범수",
				"createdAt": "20190704135611",
				"contentId": "2609474"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	},
	"강남구|신사동 가로수길": {
		"name": "신사동 가로수길",
		"gu": "강남구",
		"photos": [
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/10/2535410.jpg",
				"title": "신사동 가로수길",
				"photographer": "IR 스튜디오",
				"createdAt": "20180201170123",
				"contentId": "2535410"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/07/2535407.jpg",
				"title": "신사동 가로수길",
				"photographer": "IR 스튜디오",
				"createdAt": "20180201165941",
				"contentId": "2535407"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/09/2535409.jpg",
				"title": "신사동 가로수길",
				"photographer": "IR 스튜디오",
				"createdAt": "20180201170043",
				"contentId": "2535409"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/08/2535408.jpg",
				"title": "신사동 가로수길",
				"photographer": "IR 스튜디오",
				"createdAt": "20180201170012",
				"contentId": "2535408"
			},
			{
				"url": "https://tong.visitkorea.or.kr/cms2/website/05/2535405.jpg",
				"title": "신사동 가로수길",
				"photographer": "IR 스튜디오",
				"createdAt": "20180201165840",
				"contentId": "2535405"
			}
		],
		"source": "한국관광공사 관광사진갤러리(포토코리아)",
		"license": "공공누리 제1유형",
		"fetchedAt": "2026-09-04"
	}
}).filter(([k]) => !k.startsWith("_")));
/** 자료를 받는 쪽(scripts/fetch-photo-gallery.mjs)과 **같은 모양의 열쇠**를 만든다. */
var key = (gu, name) => `${gu.normalize("NFC")}|${name.normalize("NFC")}`;
/** 그 곳의 갤러리 사진. 구와 이름이 둘 다 맞는 것만 돌려준다. */
function galleryShotsFor(name, gu) {
	return BY_NAME[key(gu, name)]?.photos ?? [];
}
Object.keys(BY_NAME).length;
//#endregion
//#region src/data/seed.ts
var seq = 0;
var id = () => `ks_${(++seq).toString(36)}`;
var FESTIVALS = [
	{
		id: id(),
		gu: "강남구",
		category: "festival",
		name: "강남페스티벌",
		startMonth: 9,
		endMonth: 10,
		dateLabel: "9월 말~10월 초",
		officialUrl: "https://www.visitgangnam.net/festival#stages",
		monthSource: "강남구 보도자료 (2025 9.25–10.3)",
		confirmed: true
	},
	{
		id: id(),
		gu: "강동구",
		category: "festival",
		name: "강동선사문화축제",
		startMonth: 10,
		endMonth: 10,
		dateLabel: "10월",
		note: "서울 암사동 유적, 무료. 1996년 시작, 서울 유일 선사시대 테마 축제",
		officialUrl: "https://m.gdsunsa.com/",
		monthSource: "네이버 축제정보 (2026 10.16–18, 제30회). 사용자가 화면으로 확인해 줌",
		confirmed: true
	},
	{
		id: id(),
		gu: "강북구",
		category: "festival",
		name: "4·19혁명 국민문화제",
		startMonth: 4,
		endMonth: 4,
		dateLabel: "4월",
		hidden: "축제가 아니라 추모·기념 행사다 (사용자 판단 2026-09-02)",
		confirmed: true
	},
	{
		id: id(),
		gu: "강서구",
		category: "festival",
		name: "허준축제",
		startMonth: 10,
		endMonth: 10,
		dateLabel: "10월",
		note: "사전행사 「허준 인트로 축제」는 9월",
		monthSource: "서울문화포털·관광공사 (2025 10.18–19). 9월은 사전행사",
		confirmed: true
	},
	{
		id: id(),
		gu: "관악구",
		category: "festival",
		name: "관악강감찬축제",
		startMonth: 10,
		endMonth: 10,
		officialUrl: "https://www.ggcfest.com/",
		note: "낙성대공원, 무료. 귀주대첩의 강감찬 장군을 기리는 역사문화 축제",
		monthSource: "네이버 축제정보 (2026 10.16–18). 사용자가 화면으로 확인해 줌",
		confirmed: true
	},
	{
		id: id(),
		gu: "광진구",
		category: "festival",
		name: "광진뮤직페스타",
		startMonth: 8,
		endMonth: 8,
		monthSource: "헤럴드경제·시정일보·광진구청 포털 (2025 8.29)",
		confirmed: true
	},
	{
		id: id(),
		gu: "구로구",
		category: "festival",
		name: "구로G페스티벌",
		startMonth: 9,
		endMonth: 9,
		dateLabel: "9월",
		note: "안양천(구일역) 일대, 점프!구로 + 아시아문화축제 통합",
		officialUrl: "https://www.guro.go.kr/www/contents.do?key=2976",
		monthSource: "구로구 안내 (2026 9.19–20, 2025 9.26–28)",
		confirmed: true
	},
	{
		id: id(),
		gu: "금천구",
		category: "festival",
		name: "금천하모니축제",
		confirmed: true
	},
	{
		id: id(),
		gu: "노원구",
		category: "festival",
		name: "댄싱노원 거리페스티벌",
		startMonth: 9,
		endMonth: 9,
		note: "옛 이름 '노원탈축제', 2023년 개명. 9월 이틀간",
		officialUrl: "https://dancingnowon.isweb.co.kr/",
		hidden: "회차마다 구청 공고를 새로 찾아야 해 고정된 안내가 없다 (사용자 판단 2026-09-02)",
		confirmed: true
	},
	{
		id: id(),
		gu: "도봉구",
		category: "festival",
		name: "도봉별빛축제",
		startMonth: 6,
		endMonth: 6,
		dateLabel: "6월",
		note: "중랑천(도봉구청~세월교 540m)",
		officialUrl: "https://tour.dobong.go.kr/Contents.asp?code=10003458",
		monthSource: "아시아경제·도봉구 (2025 6.13–17)",
		hidden: "회차마다 구청 공고를 새로 찾아야 해 고정된 안내가 없다 (사용자 판단 2026-09-02, 댄싱노원과 같은 이유)",
		confirmed: true
	},
	{
		id: id(),
		gu: "동대문구",
		category: "festival",
		name: "동대문페스티벌",
		startMonth: 10,
		endMonth: 10,
		note: "공연예술축제 — 거리예술·음악공연",
		officialUrl: "https://ddmf.co.kr/",
		monthSource: "시민일보·헤럴드경제·서울문화포털 (2025 10.18)",
		confirmed: true
	},
	{
		id: id(),
		gu: "동작구",
		category: "festival",
		name: "도심 속 바다축제",
		startMonth: 10,
		endMonth: 10,
		note: "노량진수산시장 일대",
		monthSource: "문화일보·헤럴드경제·서울문화포털 (제8회 10.25–26)",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		category: "festival",
		name: "서울와우북페스티벌",
		startMonth: 10,
		endMonth: 10,
		dateLabel: "10월",
		note: "책문화예술축제, 구의 유일한 축제는 아닐 수 있음",
		confirmed: true
	},
	{
		id: id(),
		gu: "서대문구",
		dong: "창천동",
		category: "festival",
		name: "신촌물총축제",
		startMonth: 7,
		endMonth: 7,
		dateLabel: "7월 이틀간",
		note: "2016년 서울시 브랜드축제 선정, 연세로",
		hidden: "2024년 취소, 이후 개최 확인 안 됨 (2026-09-02)",
		confirmed: true
	},
	{
		id: id(),
		gu: "서초구",
		category: "festival",
		name: "서초뮤직앤아트페스티벌",
		startMonth: 6,
		endMonth: 6,
		dateLabel: "6월",
		note: "서울고속버스터미널 광장, 무료",
		officialUrl: "https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=677",
		monthSource: "서울문화포털·서초문화재단 (2025 6.14–15)",
		confirmed: true
	},
	{
		id: id(),
		gu: "성동구",
		dong: "성수동1가",
		category: "festival",
		name: "서울숲 JAZZ페스티벌",
		startMonth: 9,
		endMonth: 10,
		monthVaries: true,
		note: "서울숲 가족마당, 성동문화재단",
		officialUrl: "https://www.seoulforestjazz.com/",
		monthSource: "서울시 문화포털 (2025 9.19–21, 2024 10.12–13)",
		confirmed: true
	},
	{
		id: id(),
		gu: "성동구",
		category: "festival",
		name: "세계민속춤축제",
		startMonth: 9,
		endMonth: 9,
		dateLabel: "9월",
		note: "왕십리광장, 성동구 주최. 2015년 시작, 10~15개국 민속 무용단",
		monthSource: "성동구 문화관광 — 일시 「매년 9월」(9월 말). 사용자가 화면으로 확인해 줌",
		confirmed: true
	},
	{
		id: id(),
		gu: "성북구",
		dong: "성북동",
		category: "festival",
		name: "성북 세계음식축제 누리마실",
		startMonth: 5,
		endMonth: 6,
		monthVaries: true,
		note: "연도마다 5월 또는 6월(17회 2025.5.18, 18회 2026.6.7 예정)",
		monthSource: "17회 2025.5.18, 18회 2026.6.7 예정",
		confirmed: true
	},
	{
		id: id(),
		gu: "성북구",
		dong: "석관동",
		category: "festival",
		name: "성북거리문화축제 다다페스타",
		startMonth: 9,
		endMonth: 9,
		note: "이주민·다문화가정·청년이 함께하는 거리문화축제",
		hidden: "회차마다 구청 공고를 새로 찾아야 해 고정된 안내가 없다 (사용자 판단 2026-09-02, 댄싱노원·도봉별빛과 같은 이유)",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "festival",
		name: "한성백제문화제",
		startMonth: 9,
		endMonth: 9,
		dateLabel: "9월",
		note: "올림픽공원",
		officialUrl: "https://www.songpa.go.kr/hanseong/",
		monthSource: "서울문화포털·송파구 공식 (2025 9.26–28, 2024 9.27–29)",
		confirmed: true
	},
	{
		id: id(),
		gu: "양천구",
		dong: "신정동",
		category: "festival",
		name: "양천가족거리축제",
		startMonth: 10,
		endMonth: 10,
		note: "신정네거리역 일대(약 900m 구간), 무료. 별도로 '우리동네축제'(14개 동 개별 개최)도 운영",
		monthSource: "네이버 축제정보 (2025 10.26). 사용자가 화면으로 확인해 줌",
		confirmed: true
	},
	{
		id: id(),
		gu: "영등포구",
		dong: "여의도동",
		category: "festival",
		name: "여의도 봄꽃축제",
		startMonth: 4,
		endMonth: 4,
		dateLabel: "4월",
		note: "여의서로 윤중로 벚꽃길, 무료",
		monthSource: "네이버 축제정보 (2026 4.3–4.7). 2005년부터 매년 4월 — 사용자가 화면으로 확인해 줌",
		confirmed: true
	},
	{
		id: id(),
		gu: "영등포구",
		dong: "여의도동",
		category: "festival",
		name: "서울세계불꽃축제",
		startMonth: 9,
		endMonth: 9,
		dateLabel: "9월",
		note: "여의도 한강공원 일대, 무료",
		officialUrl: "https://hanwhafireworks.com/",
		monthSource: "한화 공식 발표 (2026 9.5). 2025년은 9월 말",
		confirmed: true
	},
	{
		id: id(),
		gu: "용산구",
		category: "festival",
		name: "이태원 지구촌축제",
		startMonth: 10,
		endMonth: 10,
		note: "매년 10월경, 연도별 정확한 날짜는 미확정",
		monthSource: "위키백과·서울문화포털 — 매년 10월. 2025년 회차 날짜는 확인 못 함",
		confirmed: true
	},
	{
		id: id(),
		gu: "은평구",
		category: "festival",
		name: "은평누리축제",
		startMonth: 10,
		endMonth: 10,
		dateLabel: "10월",
		note: "불광천변 일대",
		monthSource: "서울문화포털·은평문화재단 (2025 10.24–25)",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		dong: "종로1가동",
		category: "festival",
		name: "연등회",
		startMonth: 4,
		endMonth: 5,
		monthVaries: true,
		note: "유네스코 인류무형문화유산, 조계사~종로 일대, 무료",
		officialUrl: "http://www.llf.or.kr/",
		monthSource: "음력 4월 8일 기준 — 해마다 4월 또는 5월 (2026 연등회 5.16–17)",
		hidden: "종교 행사이고 갈 자리가 한 점으로 안 정해진다 (사용자 판단 2026-09-02)",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "festival",
		name: "정동야행",
		startMonth: 5,
		endMonth: 5,
		note: "덕수궁 돌담길~정동 일대, 2025년 이틀간 13.3만 명",
		officialUrl: "https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=601",
		monthSource: "서울시 펀서울·서울문화포털 (2025 5.23–24)",
		confirmed: true
	},
	{
		id: id(),
		gu: "중랑구",
		category: "festival",
		name: "중랑 서울장미축제",
		startMonth: 5,
		endMonth: 5,
		dateLabel: "5월",
		note: "장미터널 5.45km, 국내 최대",
		officialUrl: "https://www.jnfac.or.kr/rose/index",
		monthSource: "중랑문화재단 공식 (2026 5.15–23)",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "festival",
		name: "석촌호수 호수벚꽃축제",
		startMonth: 4,
		endMonth: 4,
		dateLabel: "4월",
		note: "석촌호수 일대, 무료. 왕벚나무 1,000여 그루",
		monthSource: "네이버 축제정보 (2026 4.3–4.11). 매년 봄 — 사용자가 화면으로 확인해 줌",
		confirmed: true
	},
	{
		id: id(),
		gu: "노원구",
		category: "festival",
		name: "정월대보름 한마당",
		startMonth: 2,
		endMonth: 3,
		monthVaries: true,
		note: "당현천 하류 일대, 낙화놀이·달집태우기 — 음력 기준이라 해마다 날짜가 바뀜",
		monthSource: "음력 1월 15일 기준 — 해마다 2월 또는 3월",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "festival",
		name: "정월대보름 행사(송파다리밟기 · 달집태우기)",
		startMonth: 2,
		endMonth: 3,
		monthVaries: true,
		note: "석촌호수·서울놀이마당, 서울시 무형문화재 — 음력 기준이라 해마다 날짜가 바뀜",
		monthSource: "음력 1월 15일 기준 — 해마다 2월 또는 3월",
		confirmed: true
	},
	{
		id: id(),
		gu: "양천구",
		category: "festival",
		name: "정월대보름 민속축제",
		startMonth: 2,
		endMonth: 3,
		monthVaries: true,
		note: "안양천 둔치 야구장(신정교 아래), 달집태우기 — 음력 기준이라 해마다 날짜가 바뀜",
		monthSource: "음력 1월 15일 기준 — 해마다 2월 또는 3월",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		dong: "운니동",
		category: "festival",
		name: "운현궁 설맞이",
		startMonth: 1,
		endMonth: 2,
		monthVaries: true,
		note: "운현궁 앞마당, 서울시 주관 — 음력설 기준이라 해마다 날짜가 바뀜",
		monthSource: "음력설 기준 — 양력 1월 21일~2월 20일 사이 (2025 설 1.29, 2026 설 2.17)",
		confirmed: true
	}
];
var MARKETS = [
	{
		id: id(),
		gu: "강남구",
		category: "market",
		name: "영동전통시장",
		note: "구내 5곳 중 대표",
		confirmed: true
	},
	{
		id: id(),
		gu: "강동구",
		category: "market",
		name: "암사종합시장",
		note: "8호선 암사역 1·2번 출구 도보 5분",
		confirmed: true
	},
	{
		id: id(),
		gu: "강북구",
		category: "market",
		name: "수유전통시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "강서구",
		category: "market",
		name: "화곡본동시장",
		note: "1969년 개설, 약 55개 점포",
		confirmed: true
	},
	{
		id: id(),
		gu: "관악구",
		category: "market",
		name: "신원시장",
		note: "신림동, 약 120개 점포",
		confirmed: true
	},
	{
		id: id(),
		gu: "광진구",
		category: "market",
		name: "중곡제일시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "구로구",
		category: "market",
		name: "구로시장",
		note: "1962년, 한복 거리로 유명",
		confirmed: true
	},
	{
		id: id(),
		gu: "금천구",
		category: "market",
		name: "비단길현대시장",
		note: "약 270개 점포, 금천구 최대",
		confirmed: true
	},
	{
		id: id(),
		gu: "노원구",
		category: "market",
		name: "공릉동도깨비시장",
		note: "일평균 4천명, 7호선 공릉역",
		confirmed: true
	},
	{
		id: id(),
		gu: "도봉구",
		category: "market",
		name: "방학동 도깨비시장",
		note: "서울 우수재래시장 8곳 선정",
		confirmed: true
	},
	{
		id: id(),
		gu: "동대문구",
		category: "market",
		name: "경동시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "동작구",
		category: "market",
		name: "노량진수산시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		category: "market",
		name: "망원시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "서대문구",
		category: "market",
		name: "인왕시장",
		note: "홍제동, 1972년 개설",
		confirmed: true
	},
	{
		id: id(),
		gu: "서초구",
		category: "market",
		name: "양재종합시장",
		note: "1978년 개설, 양재역 5번 출구",
		confirmed: true
	},
	{
		id: id(),
		gu: "성동구",
		category: "market",
		name: "마장축산물시장",
		note: "서울 육류유통 60% 이상 담당",
		confirmed: true
	},
	{
		id: id(),
		gu: "성북구",
		category: "market",
		name: "정릉시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "market",
		name: "가락시장",
		note: "1985년, 서울 최대 농수산물도매시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "양천구",
		category: "market",
		name: "오목교중앙시장",
		note: "신정동",
		confirmed: true
	},
	{
		id: id(),
		gu: "영등포구",
		category: "market",
		name: "영등포시장",
		note: "1956년, 서남권 최대",
		confirmed: true
	},
	{
		id: id(),
		gu: "용산구",
		category: "market",
		name: "용문전통시장",
		note: "1948년 개장",
		confirmed: true
	},
	{
		id: id(),
		gu: "은평구",
		category: "market",
		name: "대조시장",
		note: "약 172개 점포",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		category: "market",
		name: "광장시장",
		note: "100년 상설시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		category: "market",
		name: "통인시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "market",
		name: "남대문시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "중랑구",
		category: "market",
		name: "우림시장",
		note: "구내 12곳 중 대표",
		confirmed: true
	}
];
var FLOWERS = [
	{
		id: id(),
		gu: "강남구",
		category: "flower",
		name: "양재천 벚꽃길(강남 구간)",
		confirmed: true
	},
	{
		id: id(),
		gu: "강동구",
		category: "flower",
		name: "명일동 삼익그린2차 벚꽃길",
		confirmed: true
	},
	{
		id: id(),
		gu: "강북구",
		category: "flower",
		name: "오동공원",
		note: "봄꽃길 175선 공식 예시",
		confirmed: true
	},
	{
		id: id(),
		gu: "강서구",
		category: "flower",
		name: "서울식물원",
		note: "봄꽃길 175선 공식 예시 · 온실만 실내",
		indoor: true,
		confirmed: true
	},
	{
		id: id(),
		gu: "관악구",
		category: "flower",
		name: "도림천 벚꽃길",
		note: "신림동·봉천동 구간",
		confirmed: true
	},
	{
		id: id(),
		gu: "광진구",
		category: "flower",
		name: "서울어린이대공원 벚꽃길",
		confirmed: true
	},
	{
		id: id(),
		gu: "구로구",
		category: "flower",
		name: "안양천 벚꽃길(구로 구간)",
		confirmed: true
	},
	{
		id: id(),
		gu: "금천구",
		category: "flower",
		name: "안양천 벚꽃 뚝방길",
		note: "휠체어 접근 가능",
		confirmed: true
	},
	{
		id: id(),
		gu: "노원구",
		category: "flower",
		name: "중랑천 송정·응봉지구",
		confirmed: true
	},
	{
		id: id(),
		gu: "노원구",
		category: "flower",
		name: "광진장미정원",
		confirmed: true
	},
	{
		id: id(),
		gu: "도봉구",
		category: "flower",
		name: "우이천변 벚꽃길",
		confirmed: true
	},
	{
		id: id(),
		gu: "도봉구",
		category: "flower",
		name: "발바닥공원",
		confirmed: true
	},
	{
		id: id(),
		gu: "동대문구",
		category: "flower",
		name: "청계천 꽃길",
		confirmed: true
	},
	{
		id: id(),
		gu: "동작구",
		category: "flower",
		name: "국립서울현충원 수양벚꽃길",
		note: "06:00–18:00 개방, 상시 벚꽃놀이 장소는 아님 — 참배 예절 필요",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		category: "flower",
		name: "난지천공원",
		note: "난지천길 1.8km(개나리 위주)",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		category: "flower",
		name: "홍제천",
		confirmed: true
	},
	{
		id: id(),
		gu: "서대문구",
		category: "flower",
		name: "안산 자락길 벚꽃길",
		note: "약 3,000그루",
		confirmed: true
	},
	{
		id: id(),
		gu: "서초구",
		category: "flower",
		name: "양재천 벚꽃길(서초 구간)",
		confirmed: true
	},
	{
		id: id(),
		gu: "성동구",
		category: "flower",
		name: "서울숲 벚꽃길",
		note: "포토존 '바람의 언덕'",
		confirmed: true
	},
	{
		id: id(),
		gu: "성북구",
		category: "flower",
		name: "성북천",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "flower",
		name: "석촌호수 벚꽃길",
		confirmed: true
	},
	{
		id: id(),
		gu: "양천구",
		category: "flower",
		name: "안양천 벚꽃길(양천 구간)",
		confirmed: true
	},
	{
		id: id(),
		gu: "영등포구",
		category: "flower",
		name: "여의서로",
		confirmed: true
	},
	{
		id: id(),
		gu: "영등포구",
		category: "flower",
		name: "여의천 벚꽃길",
		confirmed: true
	},
	{
		id: id(),
		gu: "용산구",
		category: "flower",
		name: "남산",
		note: "봄꽃길 175선 공식 예시",
		confirmed: true
	},
	{
		id: id(),
		gu: "은평구",
		category: "flower",
		name: "불광천 벚꽃길",
		note: "응암역 4번 출구~증산역",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		category: "flower",
		name: "청계천",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "flower",
		name: "남산",
		confirmed: true
	},
	{
		id: id(),
		gu: "중랑구",
		category: "flower",
		name: "사가정공원",
		confirmed: true
	},
	{
		id: id(),
		gu: "중랑구",
		category: "flower",
		name: "중랑천변 벚꽃길",
		confirmed: true
	}
];
var WALKS = [
	{
		id: id(),
		gu: "강남구",
		category: "walk",
		name: "도산근린공원",
		confirmed: true
	},
	{
		id: id(),
		gu: "강동구",
		category: "walk",
		name: "고덕 자갈길",
		note: "3km, 도보 약 1시간",
		confirmed: true
	},
	{
		id: id(),
		gu: "강북구",
		category: "walk",
		name: "북서울꿈의숲",
		confirmed: true
	},
	{
		id: id(),
		gu: "강서구",
		category: "walk",
		name: "궁산근린공원",
		note: "소악루, 궁산공원둘레길 1.63km",
		confirmed: true
	},
	{
		id: id(),
		gu: "관악구",
		category: "walk",
		name: "낙성대공원 산책로",
		note: "6.2km",
		confirmed: true
	},
	{
		id: id(),
		gu: "광진구",
		category: "walk",
		name: "뚝섬한강공원 산책로",
		confirmed: true
	},
	{
		id: id(),
		gu: "구로구",
		category: "walk",
		name: "구로 해피트레일",
		note: "항동철길 포함, 9개 코스 9.54km",
		confirmed: true
	},
	{
		id: id(),
		gu: "노원구",
		category: "walk",
		name: "경춘선숲길",
		confirmed: true
	},
	{
		id: id(),
		gu: "도봉구",
		category: "walk",
		name: "무수골",
		confirmed: true
	},
	{
		id: id(),
		gu: "동대문구",
		category: "walk",
		name: "홍릉 두물길",
		confirmed: true
	},
	{
		id: id(),
		gu: "동작구",
		category: "walk",
		name: "국립서울현충원",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		category: "walk",
		name: "경의선숲길(연남동 구간)",
		note: "'연트럴파크'",
		confirmed: true
	},
	{
		id: id(),
		gu: "서대문구",
		category: "walk",
		name: "연세로(차 없는 거리)",
		note: "금 14시~일 22시",
		confirmed: true
	},
	{
		id: id(),
		gu: "서초구",
		category: "walk",
		name: "서리풀근린공원",
		note: "3.31km",
		confirmed: true
	},
	{
		id: id(),
		gu: "성동구",
		category: "walk",
		name: "서울숲길",
		note: "보행자전용길 22km 지정",
		confirmed: true
	},
	{
		id: id(),
		gu: "성북구",
		category: "walk",
		name: "성북동 인문산책 코스",
		note: "길상사 등",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "walk",
		name: "올림픽공원 산책로",
		confirmed: true
	},
	{
		id: id(),
		gu: "양천구",
		category: "walk",
		name: "파리공원 산책로",
		confirmed: true
	},
	{
		id: id(),
		gu: "영등포구",
		category: "walk",
		name: "문래동 예술창작촌 산책로",
		confirmed: true
	},
	{
		id: id(),
		gu: "용산구",
		category: "walk",
		name: "경의선숲길(용산 구간)",
		confirmed: true
	},
	{
		id: id(),
		gu: "은평구",
		category: "walk",
		name: "진관사 계곡~삼천사 산책로",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		category: "walk",
		name: "북촌로",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		category: "walk",
		name: "삼청동길",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "walk",
		name: "서울로7017",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "walk",
		name: "정동길",
		confirmed: true
	},
	{
		id: id(),
		gu: "중랑구",
		category: "walk",
		name: "망우역사문화공원 '사색의 길'",
		note: "4.7km",
		confirmed: true
	}
];
var HIKES = [
	{
		id: id(),
		gu: "종로구",
		category: "hike",
		name: "한양도성 순성길(백악·낙산·인왕 구간)",
		note: "18.6km, 창의문~혜화문~흥인지문~돈의문 터",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "hike",
		name: "한양도성 순성길(목멱 구간)",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "hike",
		name: "남산둘레길",
		note: "장충체육관~백범광장, 3.5km 순환",
		confirmed: true
	},
	{
		id: id(),
		gu: "성북구",
		category: "hike",
		name: "서울둘레길 19코스 — 북한산 성북",
		confirmed: true
	},
	{
		id: id(),
		gu: "강북구",
		category: "hike",
		name: "서울둘레길 20코스 — 북한산 강북",
		confirmed: true
	},
	{
		id: id(),
		gu: "도봉구",
		category: "hike",
		name: "서울둘레길 1코스 — 수락산",
		confirmed: true
	},
	{
		id: id(),
		gu: "도봉구",
		category: "hike",
		name: "서울둘레길 21코스 — 북한산 도봉",
		confirmed: true
	},
	{
		id: id(),
		gu: "노원구",
		category: "hike",
		name: "서울둘레길 1~4코스 — 수락산~망우용마산",
		confirmed: true
	},
	{
		id: id(),
		gu: "중랑구",
		category: "hike",
		name: "서울둘레길 4코스 — 망우·용마산",
		confirmed: true
	},
	{
		id: id(),
		gu: "광진구",
		category: "hike",
		name: "서울둘레길 5코스 — 아차산",
		confirmed: true
	},
	{
		id: id(),
		gu: "강동구",
		category: "hike",
		name: "서울둘레길 6코스 — 고덕산",
		confirmed: true
	},
	{
		id: id(),
		gu: "강동구",
		category: "hike",
		name: "서울둘레길 7코스 — 일자산",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "hike",
		name: "서울둘레길 7코스 — 일자산",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "hike",
		name: "서울둘레길 8코스 — 장지·탄천",
		confirmed: true
	},
	{
		id: id(),
		gu: "강남구",
		category: "hike",
		name: "서울둘레길 8코스 — 장지·탄천",
		confirmed: true
	},
	{
		id: id(),
		gu: "강남구",
		category: "hike",
		name: "서울둘레길 9코스 — 대모·구룡산",
		confirmed: true
	},
	{
		id: id(),
		gu: "서초구",
		category: "hike",
		name: "서울둘레길 9코스 — 대모·구룡산",
		confirmed: true
	},
	{
		id: id(),
		gu: "서초구",
		category: "hike",
		name: "서울둘레길 10코스 — 우면산",
		confirmed: true
	},
	{
		id: id(),
		gu: "관악구",
		category: "hike",
		name: "서울둘레길 11코스 — 관악산",
		confirmed: true
	},
	{
		id: id(),
		gu: "동작구",
		category: "hike",
		name: "서울둘레길 11코스 — 관악산(사당역 인근)",
		confirmed: true
	},
	{
		id: id(),
		gu: "금천구",
		category: "hike",
		name: "서울둘레길 13코스 — 안양천 상류",
		confirmed: true
	},
	{
		id: id(),
		gu: "구로구",
		category: "hike",
		name: "서울둘레길 13코스 — 안양천 상류",
		confirmed: true
	},
	{
		id: id(),
		gu: "구로구",
		category: "hike",
		name: "서울둘레길 14코스 — 안양천 하류",
		confirmed: true
	},
	{
		id: id(),
		gu: "영등포구",
		category: "hike",
		name: "서울둘레길 14코스 — 안양천 하류",
		confirmed: true
	},
	{
		id: id(),
		gu: "양천구",
		category: "hike",
		name: "서울둘레길 14코스 — 안양천 하류",
		confirmed: true
	},
	{
		id: id(),
		gu: "강서구",
		category: "hike",
		name: "서울둘레길 14코스 종점 — 가양역 인근",
		confirmed: true
	},
	{
		id: id(),
		gu: "은평구",
		category: "hike",
		name: "서울둘레길 16코스 — 봉산·앵봉산",
		confirmed: true
	},
	{
		id: id(),
		gu: "은평구",
		category: "hike",
		name: "서울둘레길 17코스 — 북한산 은평",
		confirmed: true
	},
	{
		id: id(),
		gu: "서대문구",
		category: "hike",
		name: "안산자락길",
		note: "무장애 둘레길",
		confirmed: true
	},
	{
		id: id(),
		gu: "성동구",
		category: "hike",
		name: "응봉산",
		note: "95.4m, 팔각정 — 매봉산과 이름 혼용 주의",
		confirmed: true
	},
	{
		id: id(),
		gu: "용산구",
		category: "hike",
		name: "남산둘레길",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		dong: "상암동",
		category: "hike",
		name: "하늘공원",
		note: "난지도 매립지를 덮은 언덕. 억새밭과 전망대 — 서울둘레길 15코스(노을·하늘공원)",
		confirmed: true
	}
];
var MUSEUMS = [
	{
		id: id(),
		gu: "종로구",
		category: "museum",
		name: "국립현대미술관 서울관",
		note: "서울 최다 56곳",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		category: "museum",
		name: "딜쿠샤",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		category: "museum",
		name: "백인제가옥",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "museum",
		name: "서울시립미술관",
		note: "17곳",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "museum",
		name: "국립현대미술관 덕수궁관",
		confirmed: true
	},
	{
		id: id(),
		gu: "용산구",
		category: "museum",
		name: "국립중앙박물관",
		confirmed: true
	},
	{
		id: id(),
		gu: "성북구",
		category: "museum",
		name: "간송미술관",
		note: "훈민정음 해례본 소장. 연 2회(5·10월) 특별전시 때만 유료 개방 — 상시 개방 아님",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		category: "museum",
		name: "근현대디자인박물관",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		category: "museum",
		name: "대안공간 루프",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		category: "museum",
		name: "서강대박물관",
		confirmed: true
	},
	{
		id: id(),
		gu: "강남구",
		category: "museum",
		name: "관세박물관",
		note: "13곳",
		confirmed: true
	},
	{
		id: id(),
		gu: "강남구",
		category: "museum",
		name: "호림박물관 신사분관",
		confirmed: true
	},
	{
		id: id(),
		gu: "강남구",
		category: "museum",
		name: "도산안창호기념관",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "museum",
		name: "한성백제박물관",
		note: "11곳, 올림픽공원 인근",
		confirmed: true
	},
	{
		id: id(),
		gu: "송파구",
		category: "museum",
		name: "소마미술관",
		confirmed: true
	},
	{
		id: id(),
		gu: "금천구",
		category: "museum",
		name: "서울시립 서서울미술관",
		confirmed: true
	},
	{
		id: id(),
		gu: "양천구",
		category: "museum",
		name: "오목한미술관",
		note: "오목공원 내",
		confirmed: true
	},
	{
		id: id(),
		gu: "강서구",
		category: "museum",
		name: "허준박물관",
		note: "구립, 허준축제(03-1)와 연계",
		confirmed: true
	},
	{
		id: id(),
		gu: "강동구",
		category: "museum",
		name: "강동아트센터 갤러리 그림",
		confirmed: true
	},
	{
		id: id(),
		gu: "관악구",
		category: "museum",
		name: "서울대미술관",
		note: "렘 쿨하스 설계, 800점 이상 소장",
		confirmed: true
	},
	{
		id: id(),
		gu: "광진구",
		category: "museum",
		name: "서울상상나라",
		confirmed: true
	},
	{
		id: id(),
		gu: "광진구",
		category: "museum",
		name: "건국대박물관",
		confirmed: true
	},
	{
		id: id(),
		gu: "광진구",
		category: "museum",
		name: "세종대박물관",
		confirmed: true
	},
	{
		id: id(),
		gu: "노원구",
		category: "museum",
		name: "육군박물관",
		note: "태릉, 육군사관학교 내",
		confirmed: true
	},
	{
		id: id(),
		gu: "도봉구",
		category: "museum",
		name: "도봉구청 갤러리",
		note: "1층 로비, 무료대관 전시",
		confirmed: true
	},
	{
		id: id(),
		gu: "동대문구",
		category: "museum",
		name: "서울약령시한의약박물관",
		note: "경동시장(03-6) 한약재 거리와 연계",
		confirmed: true
	},
	{
		id: id(),
		gu: "서대문구",
		category: "museum",
		name: "서대문자연사박물관",
		confirmed: true
	},
	{
		id: id(),
		gu: "서초구",
		category: "museum",
		name: "예술의전당 서울서예박물관",
		note: "1988년, 국내 유일 서예 전문 전시장",
		confirmed: true
	},
	{
		id: id(),
		gu: "영등포구",
		category: "museum",
		name: "문래예술공장(갤러리M30)",
		note: "서울문화재단 운영",
		confirmed: true
	},
	{
		id: id(),
		gu: "은평구",
		category: "museum",
		name: "은평역사한옥박물관",
		confirmed: true
	},
	{
		id: id(),
		gu: "강북구",
		category: "museum",
		name: "강북구립미술관",
		note: "북서울꿈의숲 내, 인수동",
		confirmed: true
	},
	{
		id: id(),
		gu: "구로구",
		category: "museum",
		name: "구로문화재단 갤러리",
		note: "항동철길·구로G페스티벌(03-1) 연계",
		confirmed: true
	},
	{
		id: id(),
		gu: "동작구",
		category: "museum",
		name: "국립서울현충원",
		note: "역사문화 전시 · 참배 시설",
		confirmed: true
	},
	{
		id: id(),
		gu: "성동구",
		category: "museum",
		name: "한양대학교박물관",
		note: "서울숲(04-2) 인근",
		confirmed: true
	},
	{
		id: id(),
		gu: "성동구",
		category: "museum",
		name: "성동구청 갤러리",
		confirmed: true
	},
	{
		id: id(),
		gu: "중랑구",
		category: "museum",
		name: "중랑역사문화센터",
		note: "망우역사문화공원 내, 서울장미축제(03-2) 인근",
		confirmed: true
	}
];
/**
* 🆕 **나중에 들인 축제** — 여기에만 더한다. 위 FESTIVALS 를 건드리지 않는다.
*
* 🚨 **왜 따로 두나 — id 가 자리 순서로 매겨지기 때문이다.**
*    `id()` 는 이 파일에 적힌 **순서대로** ks_1, ks_2 … 를 준다. 그래서 FESTIVALS
*    한가운데에 한 줄만 끼워 넣어도 **그 뒤 290곳의 id 가 통째로 한 칸씩 밀린다.**
*    사진·좌표·블로그 자료가 전부 id 를 열쇠로 붙어 있으니, 밀리는 순간
*    **남의 집 사진이 뜬다.** (CLAUDE.md: 「id 는 재사용하지 않는다」)
*    → **새 곳은 늘 맨 뒤에.** 그래야 이미 매겨진 번호가 하나도 안 움직인다.
*
* 📌 어디서 왔나 (2026-09-12, 사장님 지시 "진행"):
*    매일 도는 `fetch-gu-festival-dates` 가 **「구청에는 있는데 우리 화면에 없는
*    축제」** 목록을 내놓는다. 그중 관광객이 갈 만한 것을 사람이 골라 들인다.
*    기계가 자동으로 넣지 않는다 — 목록에는 위령제·박람회·도서관 행사도 섞여 있다.
*
* 🗺️ **주소·좌표를 여기에 안 적는다.** 구청이 올린 장소를 그대로 쓰기 때문이다
*    (seed.ts 의 withGuFestival). 확정 회차가 끝나면 아래 addr 만 남는다 —
*    그래서 addr 에는 **해마다 안 바뀌는 자리**만 적는다(「남산골한옥마을 일대」).
*
* ⏳ 「2026 종로한복축제」(9.11~12)는 **일부러 뺐다.** 오늘(9/12)이 마지막 날이라
*    내일이면 목록에서 사라진다. 내년 회차가 올라오면 그때 들인다.
*/
var FESTIVALS_ADDED = [
	{
		id: id(),
		gu: "광진구",
		category: "festival",
		name: "서울거리예술축제",
		startMonth: 9,
		endMonth: 9,
		addr: "뚝섬한강공원, 서울숲",
		note: "국내외 20개 작품, 전 프로그램 무료. 2026년부터 서울광장 → 한강으로 옮겼다",
		monthSource: "서울시 문화포털·서울문화재단 등록 (2026 9.19–20) + 언론 보도",
		confirmed: true
	},
	{
		id: id(),
		gu: "중구",
		category: "festival",
		name: "남산골 추석축제",
		startMonth: 9,
		endMonth: 9,
		addr: "남산골한옥마을 일대",
		officialUrl: "https://www.hanokmaeul.co.kr",
		note: "추석 연휴 「남산달빛마당」",
		monthSource: "서울시 문화포털·남산골한옥마을 등록 (2026 9.25–27)",
		confirmed: true
	},
	{
		id: id(),
		gu: "종로구",
		category: "festival",
		name: "인사동 엔틱&아트페어",
		startMonth: 10,
		endMonth: 10,
		addr: "인사아트프라자, 안녕인사동 및 인사동 문화지구 전 지역",
		officialUrl: "http://www.hiinsa.com",
		monthSource: "서울시 문화포털·종로구청 등록 (2026 10.1–4)",
		confirmed: true
	},
	{
		id: id(),
		gu: "마포구",
		category: "festival",
		name: "서울 바비큐 페스티벌",
		startMonth: 10,
		endMonth: 10,
		addr: "난지캠핑장",
		officialUrl: "https://www.seoulbbqfesta.com",
		monthSource: "서울시 문화포털·서울시청 등록 (2026 10.24–25)",
		confirmed: true
	}
];
var ALL_PLACES_RAW = [
	...FESTIVALS,
	...MARKETS,
	...FLOWERS,
	...WALKS,
	...HIKES,
	...MUSEUMS,
	...FESTIVALS_ADDED
];
function withFetchedCoords(p) {
	if (p.lat != null && p.lng != null) return p;
	const c = getCoords(p.id, p.name);
	return c ? {
		...p,
		lat: c.lat,
		lng: c.lng
	} : p;
}
/**
* 🏛️ **구청이 올린 올해 회차로 자리를 고친다** (2026-09-12).
*
* 🚨 이게 왜 필요했나 — 「서울라이트 한강 빛섬축제」는 **한강 6개 섬을 해마다
*    순회**한다(난지·여의·선유도·서래·노들·뚝섬). 2025년은 뚝섬(광진구),
*    **2026년은 노들섬(용산구)**. 우리 자료는 관광공사에서 받은 **작년 회차**라
*    광진구 강변북로로 적혀 있었다 — 손님을 **한강 건너편**으로 보낼 뻔했다.
*    사장님이 공식 사이트에서 직접 확인해 줬다: 「2026.10.2~10.11 · 노들섬」.
*
* 📌 **손으로 안 고친다.** 손으로 고치면 내년에 또 틀리고, 그때는 아무도 모른다.
*    매일 아침 받아 오는 자료가 따라가게 둔다.
*
* ⚠️ 날짜만 고치고 자리를 그냥 두면 **「올해 날짜 · 작년 장소」**가 된다 —
*    아무것도 안 적은 것보다 나쁘다. 그래서 **구·주소·좌표를 한 세트로** 바꾼다.
*    (달 정보 startMonth·period 는 화면이 확정 날짜를 직접 쓰므로 건드리지 않는다.)
*/
function withGuFestival(p) {
	if (p.category !== "festival") return p;
	const d = guFestivalDate(p.id);
	if (!d) return p;
	const moved = !!d.gu && d.gu !== p.gu;
	const addr = d.place ?? (moved ? void 0 : p.addr);
	const hasNewCoord = d.lat != null && d.lng != null;
	const official = guOfficialLink(d);
	return {
		...p,
		gu: d.gu || p.gu,
		addr,
		lat: hasNewCoord ? d.lat : moved ? void 0 : p.lat,
		lng: hasNewCoord ? d.lng : moved ? void 0 : p.lng,
		officialUrl: official ?? p.officialUrl
	};
}
function mergeWithTourPlaces(hand) {
	const used = /* @__PURE__ */ new Set();
	return [...hand.map((p) => {
		const t = findTourPlace(p.name);
		if (!t) return p;
		used.add(t.id);
		return {
			...p,
			image: p.image ?? t.image,
			thumb: p.thumb ?? t.thumb,
			addr: p.addr ?? t.addr,
			lat: p.lat ?? t.lat,
			lng: p.lng ?? t.lng,
			tourContentId: p.tourContentId ?? t.tourContentId,
			officialUrl: p.officialUrl ?? t.officialUrl
		};
	}), ...TOUR_PLACES.filter((t) => !used.has(t.id))];
}
function withManualPhoto(p) {
	if (p.image) return p;
	const m = getManualPhoto(p.id, p.name);
	return m ? {
		...p,
		image: m.image,
		thumb: m.image,
		photoCredit: m.source
	} : p;
}
/**
* 📷 **관광사진 갤러리(포토코리아) 사진을 대표 사진으로 올린다**
* (사용자 지시 2026-09-04: "사진 있으면 여기 사진을 우선으로 띄워").
*
* 여기까지 와서도 사진이 없는 곳에만 붙인다 — 즉 **빈 자리만 채운다.**
* 사람이 직접 확인해 넣은 사진(manual-photos)이나 관광공사 대표 이미지가
* 이미 있으면 밀어내지 않는다. 갤러리에서 사진을 찾은 곳은 애초에 사진이
* 하나도 없던 149곳 안에서 나온 것이라, 실제로 부딪힐 일도 없다.
*
* 이 한 줄로 그 곳들이 **사진 게이트를 통과해 화면에 다시 나타난다** —
* 국립중앙박물관·남산·청계천·통인시장처럼 손님이 당연히 찾을 곳들이다.
*
* 나머지 사진은 galleryOf(lib/tourGallery.ts)가 뒤에 붙여 넘겨 볼 수 있게 한다.
* 출처는 관광공사 그대로라 photoCredit을 따로 안 바꾼다(기본값이 한국관광공사다).
*/
function withGalleryPhoto(p) {
	if (p.image ?? p.thumb) return p;
	const shots = galleryShotsFor(p.name, p.gu);
	if (!shots.length) return p;
	return {
		...p,
		image: shots[0].url,
		thumb: shots[0].url
	};
}
function hasPhoto(p) {
	return Boolean(p.image ?? p.thumb);
}
/**
* 🚧 아직 못 채운 자리표시자는 화면에 내보내지 않는다.
*
* 이 파일 맨 위에 적어 둔 대로 `confirmed: false`는 "값"이 아니라 **빈 칸**이다.
* 그런데 걸러 주는 곳이 없어서, 이름이 「확인 필요」인 항목 셋이 그대로 목록에
* 섞여 있었다(2026-09-02 사용자가 158곳 목록을 훑다 잡았다). 사진이 없어 지금은
* 가려져 있었을 뿐, 사진이 붙는 순간 손님 화면에 "확인 필요"가 떴을 것이다.
*
* 셋은 채우거나 지웠고, 앞으로 새 자리표시자를 적어 두더라도 여기서 막힌다.
*/
var isPlaceholder = (p) => p.confirmed === false;
var ALL_PLACES = mergeWithTourPlaces(ALL_PLACES_RAW).filter((p) => !isPlaceholder(p)).filter((p) => !p.hidden).filter((p) => isInLaunchScope(sidoOf(p.gu))).map(withFetchedCoords).map(withGuFestival).map(withManualPhoto).map(withGalleryPhoto).filter(hasPhoto);
mergeWithTourPlaces(ALL_PLACES_RAW).filter((p) => !isPlaceholder(p)).filter((p) => !p.hidden).filter((p) => isInLaunchScope(sidoOf(p.gu))).map(withManualPhoto).map(withGalleryPhoto).filter((p) => !hasPhoto(p));
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
var ALL_FESTIVALS = (() => {
	const tourFestivals = TOUR_PLACES.filter((p) => p.category === "festival");
	const byName = new Map(tourFestivals.map((p) => [nameKey(p.name), p]));
	const used = /* @__PURE__ */ new Set();
	return [...[...FESTIVALS, ...FESTIVALS_ADDED].map((p) => {
		const t = findTourPlace(p.name) ?? byName.get(nameKey(p.name));
		if (!t || t.category !== "festival") return p;
		used.add(t.id);
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
			monthSource: p.monthSource ?? (t.startMonth != null ? "한국관광공사 축제 창구" : void 0),
			tourContentId: p.tourContentId ?? t.tourContentId,
			officialUrl: p.officialUrl ?? t.officialUrl
		};
	}), ...tourFestivals.filter((t) => !used.has(t.id))];
})().filter((p) => !isPlaceholder(p)).filter((p) => !p.hidden).filter((p) => isInLaunchScope(sidoOf(p.gu))).filter((p) => p.startMonth == null || p.monthSource).map(withFetchedCoords).map(withGuFestival).map(withManualPhoto).map(withGalleryPhoto);
//#endregion
//#region scripts/count-for-promo.ts
var ALL_GUS = [
	{
		offset: 2.5,
		gus: ["도봉구", "노원구"]
	},
	{
		offset: 1,
		gus: [
			"은평구",
			"강북구",
			"성북구",
			"중랑구"
		]
	},
	{
		offset: .5,
		gus: [
			"마포구",
			"서대문구",
			"중구",
			"종로구",
			"동대문구",
			"광진구"
		]
	},
	{
		offset: 0,
		gus: [
			"강서구",
			"양천구",
			"영등포구",
			"용산구",
			"성동구",
			"강동구"
		]
	},
	{
		offset: .5,
		gus: [
			"구로구",
			"동작구",
			"서초구",
			"강남구",
			"송파구"
		]
	},
	{
		offset: 2,
		gus: ["금천구", "관악구"]
	}
].flatMap((r) => r.gus);
var withData = new Set(ALL_PLACES.map((p) => p.gu));
var empty = ALL_GUS.filter((g) => !withData.has(g));
var byCat = {};
for (const p of ALL_PLACES) byCat[p.category] = (byCat[p.category] ?? 0) + 1;
var photo = ALL_PLACES.filter((p) => p.image ?? p.thumb).length;
var fPhoto = ALL_FESTIVALS.filter((f) => f.image ?? f.thumb).length;
var months = {};
for (const f of ALL_FESTIVALS) if (f.startMonth) months[f.startMonth] = (months[f.startMonth] ?? 0) + 1;
console.log(`장소            ${ALL_PLACES.length}곳`);
console.log(`축제            ${ALL_FESTIVALS.length}곳`);
console.log(`합계            ${ALL_PLACES.length + ALL_FESTIVALS.length}곳`);
console.log(`자료 있는 구     ${withData.size} / ${ALL_GUS.length}개`);
console.log(`빈 구           ${empty.length}개${empty.length ? ` — ${empty.join(" · ")}` : ""}`);
console.log(`사진 있는 장소   ${photo}곳 (${(100 * photo / ALL_PLACES.length).toFixed(0)}%)`);
console.log(`사진 있는 축제   ${fPhoto}곳 (${(100 * fPhoto / ALL_FESTIVALS.length).toFixed(0)}%)`);
console.log(`갈래별          ${Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
console.log(`달별 축제        ${Object.entries(months).sort((a, b) => Number(a[0]) - Number(b[0])).map(([m, n]) => `${m}월 ${n}`).join(" · ")}`);
console.log("\n⚠️ 달별 축제 수는 **해마다 바뀐다.** 대본에 숫자로 못 박지 말 것 —\n   화면은 그날 자료로 다시 세지만 영상은 안 그렇다.");
var placeIds = new Set(ALL_PLACES.map((p) => p.id));
var dup = ALL_FESTIVALS.filter((f) => placeIds.has(f.id));
var uniq = /* @__PURE__ */ new Set([...ALL_PLACES.map((p) => p.id), ...ALL_FESTIVALS.map((f) => f.id)]);
console.log(`\n두 목록에 다 있는 곳  ${dup.length}곳`);
console.log(`id 로 센 진짜 합계     ${uniq.size}곳`);
console.log(dup.length ? "→ 285+80=365 는 겹쳐 센 값이다. 대본에는 위 숫자를 쓴다." : "→ 안 겹친다. 365 를 그대로 써도 된다.");
var ALL = [...new Map([...ALL_PLACES, ...ALL_FESTIVALS].map((x) => [x.id, x])).values()];
var withAddr = ALL.filter((x) => x.addr).length;
var anyPhoto = ALL.filter((x) => x.image ?? x.thumb).length;
console.log(`\n── 홍보에 쓸 숫자 (겹침 뺀 값) ──`);
console.log(`전체            ${ALL.length}곳`);
console.log(`주소 있는 곳     ${withAddr}곳 (${(100 * withAddr / ALL.length).toFixed(0)}%)`);
console.log(`사진 있는 곳     ${anyPhoto}곳 (${(100 * anyPhoto / ALL.length).toFixed(0)}%)`);
console.log(`구              ${new Set(ALL.map((x) => x.gu)).size}개`);
//#endregion
export {};
