// 🌏 **곳 페이지에 박히는 낱말들** — 12개 언어.
//
// 왜 앱의 translations.ts 에 안 넣나 (2026-09-09) — 그 파일은 **손님 브라우저로
// 내려간다.** 여기 있는 말은 정적 페이지를 만들 때만 쓰고 앱 화면에는 안 나오므로,
// 앱에 넣으면 손님이 쓰지도 않는 글자를 매번 내려받는다. 그래서 scripts 쪽에 둔다.
//
// 🚨 **곳 이름·메모는 여기서 번역하지 않는다.** 그건 place-translations.json 에
//    이미 11개 언어가 다 있고(306/307곳), translateText() 가 꺼내 준다.
//    여기 있는 것은 「무엇 / 동네 / 주소」처럼 **틀에 박히는 낱말**뿐이다.
//
// ⚠️ 언어 열쇠는 앱과 **글자까지 같게** 쓴다(`zh-TW` 에 붙임표가 있다).
//    어긋나면 그 언어만 조용히 영어로 떨어진다.
import type { Language } from "../../src/lib/translations";

export interface PageStrings {
  /** 「서울」 — 제목 끝에 들어간다. 영어만 남아 있으면 일본어 제목에 Seoul 이 박힌다. */
  seoul: string;
  /** dl 왼쪽 딱지 다섯 개 */
  what: string;
  district: string;
  address: string;
  when: string;
  official: string;
  /** 「10월 — 날짜는 해마다 바뀝니다…」 뒤에 붙는 안내 */
  datesShift: string;
  /** 같은 구의 다른 곳 목록 제목 */
  moreIn: (gu: string) => string;
  /** 아래 딱지 줄 제목 */
  browse: string;
  /** 「종로구 전체 보기」 */
  everythingIn: (gu: string) => string;
  /** 앱으로 들어가는 단추 */
  openApp: string;
  /** 밥집으로 가는 단추 */
  eatIn: (gu: string) => string;
  /** 맨 아래 두 줄 */
  footerAbout: string;
  footerData: string;
}

export const PAGE_STRINGS: Record<Language, PageStrings> = {
  ko: {
    seoul: "서울",
    what: "무엇",
    district: "동네",
    address: "주소",
    when: "언제",
    official: "공식 안내",
    datesShift: "날짜는 해마다 바뀝니다 — 공식 안내를 확인하세요",
    moreIn: (gu) => `${gu}의 다른 곳`,
    browse: "둘러보기",
    everythingIn: (gu) => `${gu} 전체 보기`,
    openApp: "서울의 다른 곳 더 보기 →",
    eatIn: (gu) => `${gu} 주변 먹거리 →`,
    footerAbout: "K-Street — 서울 동네를 12개 언어로 안내합니다. 평생 무료, 가입 없음.",
    footerData: "자료: 한국관광공사. 사진: 한국관광공사(공공누리 제1유형).",
  },
  en: {
    seoul: "Seoul",
    what: "What",
    district: "District",
    address: "Address",
    when: "When",
    official: "Official",
    datesShift: "dates shift each year, check the official notice",
    moreIn: (gu) => `More in ${gu}`,
    browse: "Browse",
    everythingIn: (gu) => `Everything in ${gu}`,
    openApp: "See more places in Seoul →",
    eatIn: (gu) => `Where to eat in ${gu} →`,
    footerAbout:
      "K-Street — a free, no-sign-up guide to Seoul's neighbourhoods in 12 languages.",
    footerData:
      "Place data from the Korea Tourism Organization. Photos: Korea Tourism Organization (KOGL Type 1).",
  },
  ja: {
    seoul: "ソウル",
    what: "種類",
    district: "エリア",
    address: "住所",
    when: "時期",
    official: "公式案内",
    datesShift: "日程は年によって変わります — 公式案内をご確認ください",
    moreIn: (gu) => `${gu}のほかの場所`,
    browse: "ほかを見る",
    everythingIn: (gu) => `${gu}をすべて見る`,
    openApp: "ソウルのほかの場所を見る →",
    eatIn: (gu) => `${gu}周辺のグルメ →`,
    footerAbout: "K-Street — ソウルの街を12言語で案内します。ずっと無料、登録不要。",
    footerData: "データ：韓国観光公社。写真：韓国観光公社（KOGL 第1類型）。",
  },
  zh: {
    seoul: "首尔",
    what: "类型",
    district: "区域",
    address: "地址",
    when: "时间",
    official: "官方信息",
    datesShift: "日期每年不同 — 请查看官方公告",
    moreIn: (gu) => `${gu}的其他地方`,
    browse: "浏览",
    everythingIn: (gu) => `查看${gu}全部`,
    openApp: "查看首尔更多地方 →",
    eatIn: (gu) => `${gu}附近美食 →`,
    footerAbout: "K-Street — 用12种语言介绍首尔的街区。永久免费，无需注册。",
    footerData: "地点数据：韩国观光公社。照片：韩国观光公社（KOGL 第1类型）。",
  },
  "zh-TW": {
    seoul: "首爾",
    what: "類型",
    district: "區域",
    address: "地址",
    when: "時間",
    official: "官方資訊",
    datesShift: "日期每年不同 — 請查看官方公告",
    moreIn: (gu) => `${gu}的其他地方`,
    browse: "瀏覽",
    everythingIn: (gu) => `查看${gu}全部`,
    openApp: "查看首爾更多地方 →",
    eatIn: (gu) => `${gu}附近美食 →`,
    footerAbout: "K-Street — 用12種語言介紹首爾的街區。永久免費，無需註冊。",
    footerData: "地點資料：韓國觀光公社。照片：韓國觀光公社（KOGL 第1類型）。",
  },
  vi: {
    seoul: "Seoul",
    what: "Loại",
    district: "Khu vực",
    address: "Địa chỉ",
    when: "Thời gian",
    official: "Thông tin chính thức",
    datesShift: "ngày thay đổi mỗi năm — hãy xem thông báo chính thức",
    moreIn: (gu) => `Địa điểm khác ở ${gu}`,
    browse: "Xem thêm",
    everythingIn: (gu) => `Tất cả ở ${gu}`,
    openApp: "Xem thêm địa điểm ở Seoul →",
    eatIn: (gu) => `Quán ăn gần ${gu} →`,
    footerAbout:
      "K-Street — hướng dẫn các khu phố Seoul bằng 12 ngôn ngữ. Miễn phí mãi mãi, không cần đăng ký.",
    footerData:
      "Dữ liệu địa điểm: Tổng cục Du lịch Hàn Quốc. Ảnh: Tổng cục Du lịch Hàn Quốc (KOGL loại 1).",
  },
  es: {
    seoul: "Seúl",
    what: "Qué",
    district: "Distrito",
    address: "Dirección",
    when: "Cuándo",
    official: "Información oficial",
    datesShift: "las fechas cambian cada año — consulta el aviso oficial",
    moreIn: (gu) => `Más en ${gu}`,
    browse: "Explorar",
    everythingIn: (gu) => `Todo en ${gu}`,
    openApp: "Ver más lugares de Seúl →",
    eatIn: (gu) => `Dónde comer en ${gu} →`,
    footerAbout:
      "K-Street — guía gratuita de los barrios de Seúl en 12 idiomas. Sin registro.",
    footerData:
      "Datos: Organización de Turismo de Corea. Fotos: Organización de Turismo de Corea (KOGL tipo 1).",
  },
  fr: {
    seoul: "Séoul",
    what: "Type",
    district: "Quartier",
    address: "Adresse",
    when: "Quand",
    official: "Infos officielles",
    datesShift: "les dates changent chaque année — consultez l'avis officiel",
    moreIn: (gu) => `Autres lieux à ${gu}`,
    browse: "Parcourir",
    everythingIn: (gu) => `Tout à ${gu}`,
    openApp: "Voir plus de lieux à Séoul →",
    eatIn: (gu) => `Où manger à ${gu} →`,
    footerAbout:
      "K-Street — guide gratuit des quartiers de Séoul en 12 langues. Sans inscription.",
    footerData:
      "Données : Organisation du tourisme coréen. Photos : Organisation du tourisme coréen (KOGL type 1).",
  },
  de: {
    seoul: "Seoul",
    what: "Art",
    district: "Stadtteil",
    address: "Adresse",
    when: "Wann",
    official: "Offizielle Info",
    datesShift: "die Termine ändern sich jedes Jahr — bitte offizielle Ankündigung prüfen",
    moreIn: (gu) => `Mehr in ${gu}`,
    browse: "Entdecken",
    everythingIn: (gu) => `Alles in ${gu}`,
    openApp: "Mehr Orte in Seoul ansehen →",
    eatIn: (gu) => `Essen in ${gu} →`,
    footerAbout:
      "K-Street — kostenloser Führer durch Seouls Viertel in 12 Sprachen. Ohne Anmeldung.",
    footerData:
      "Ortsdaten: Korea Tourism Organization. Fotos: Korea Tourism Organization (KOGL Typ 1).",
  },
  ru: {
    seoul: "Сеул",
    what: "Что это",
    district: "Район",
    address: "Адрес",
    when: "Когда",
    official: "Официально",
    datesShift: "даты меняются каждый год — смотрите официальное объявление",
    moreIn: (gu) => `Ещё в ${gu}`,
    browse: "Смотреть",
    everythingIn: (gu) => `Всё в ${gu}`,
    openApp: "Больше мест в Сеуле →",
    eatIn: (gu) => `Где поесть в ${gu} →`,
    footerAbout:
      "K-Street — бесплатный гид по районам Сеула на 12 языках. Без регистрации.",
    footerData:
      "Данные о местах: Korea Tourism Organization. Фото: Korea Tourism Organization (KOGL тип 1).",
  },
  id: {
    seoul: "Seoul",
    what: "Jenis",
    district: "Distrik",
    address: "Alamat",
    when: "Kapan",
    official: "Info resmi",
    datesShift: "tanggal berubah setiap tahun — cek pengumuman resmi",
    moreIn: (gu) => `Lainnya di ${gu}`,
    browse: "Jelajahi",
    everythingIn: (gu) => `Semua di ${gu}`,
    openApp: "Lihat tempat lain di Seoul →",
    eatIn: (gu) => `Tempat makan di ${gu} →`,
    footerAbout:
      "K-Street — panduan gratis lingkungan Seoul dalam 12 bahasa. Tanpa pendaftaran.",
    footerData:
      "Data tempat: Korea Tourism Organization. Foto: Korea Tourism Organization (KOGL Tipe 1).",
  },
  th: {
    seoul: "โซล",
    what: "ประเภท",
    district: "ย่าน",
    address: "ที่อยู่",
    when: "ช่วงเวลา",
    official: "ข้อมูลทางการ",
    datesShift: "วันที่เปลี่ยนทุกปี — โปรดตรวจสอบประกาศทางการ",
    moreIn: (gu) => `ที่อื่นใน ${gu}`,
    browse: "ดูเพิ่มเติม",
    everythingIn: (gu) => `ทั้งหมดใน ${gu}`,
    openApp: "ดูสถานที่อื่นในโซล →",
    eatIn: (gu) => `ร้านอาหารใน ${gu} →`,
    footerAbout:
      "K-Street — คู่มือย่านต่าง ๆ ในโซล 12 ภาษา ฟรีตลอดไป ไม่ต้องสมัคร",
    footerData:
      "ข้อมูลสถานที่: องค์การส่งเสริมการท่องเที่ยวเกาหลี ภาพ: องค์การส่งเสริมการท่องเที่ยวเกาหลี (KOGL ประเภท 1)",
  },
};

/**
 * 🔗 주소 규칙 — 영어는 **지금 주소를 그대로 쓴다.**
 *
 * 🚨 `/place/<슬러그>/` 는 이미 구글에 내고 링크도 걸려 있다. 여기에 `/en/` 을
 *    붙이면 그동안 쌓은 것이 통째로 날아간다(저장소 규칙: 한번 정한 주소는 안 바꾼다).
 *    그래서 **영어만 접두어가 없고**, 나머지 언어는 앞에 언어를 붙인다.
 *      영어      /place/gwangjang-market/
 *      일본어    /ja/place/gwangjang-market/
 */
export const langPath = (lang: Language, rest: string) =>
  lang === "en" ? rest : `${lang}/${rest}`;

/** 페이지에 넣을 언어 목록. 한국어도 넣는다 — 한국에 사는 외국인이 한국어로 검색한다. */
export const PAGE_LANGS: Language[] = [
  "en", "ko", "ja", "zh", "zh-TW", "vi", "es", "fr", "de", "ru", "id", "th",
];

// ─────────────────────────────────────────────────────────────────────────
// 🗂️ 묶음 페이지에 박히는 낱말들
// ─────────────────────────────────────────────────────────────────────────
//
// 곳 페이지와 **따로 두는 이유** (2026-09-10) — 곳 페이지는 「무엇 / 동네 / 주소」
// 처럼 딱지만 갈아 끼우면 됐다. 묶음 페이지는 **문장에 숫자가 박힌다**:
//   「4 traditional markets, 3 festivals in 12 districts of Seoul」
// 그래서 낱말이 아니라 **함수**로 받아야 한다. 언어마다 셈하는 법이 다르다.
//
// 🚨 **영어·일어·중국어부터 시작한다** (사장님 지시 2026-09-10).
//    CJK 세 언어는 **복수형이 없어서** 셈 문장이 오히려 안전하다 —
//    영어의 "1 place / 2 places" 같은 갈림이 아예 없다.
//    (예전에 뒤에 s 를 붙여 "3 street & alleys" 를 만든 적이 있다.)
//    나머지 8개 언어는 복수형 규칙이 언어마다 달라(러시아어는 1/2~4/5+ 세 갈래)
//    한꺼번에 하면 틀린 문장을 대량으로 만든다. 나중에 언어별로 더한다.
//
// 그래서 목록을 PAGE_LANGS 와 **따로 둔다.** 여기 없는 언어는 묶음 페이지가
// 아예 안 만들어지고, 곳 페이지의 묶음 링크는 영어 묶음으로 간다.
// 🚦 **차례는 복수형 규칙이 정한다** (2026-09-10, 사장님: "순서는 니가 알아서해").
//    셈 문장(「축제 33개가 21개 구에서」)이 이 페이지의 뼈대라, 언어를 고르는
//    기준은 인기가 아니라 **그 언어가 수를 어떻게 세는가**다.
//      ① 복수형 없음 — en·ja·zh·zh-TW(끝) · **ko·vi·th·id**  ← 지금 여기
//      ② 두 갈래(1/여럿) — es·fr. 영어와 같아 위험이 낮다
//      ③ 두 갈래 + 불규칙 — de. Markt→Märkte · Museum→Museen 처럼
//         갈래마다 복수형을 따로 적어야 한다
//      ④ 세 갈래 + 격변화 — ru. 1 / 2~4 / 5+ 가 다르고 수사 뒤 격이 바뀐다.
//         혼자 따로, 맨 마지막에.
export const HUB_LANGS: Language[] = ["en", "ja", "zh", "zh-TW", "ko", "vi", "th", "id"];

/** 이 언어에 묶음 페이지가 있나 — 없으면 영어 묶음으로 보낸다. */
export const hubLang = (lang: Language): Language =>
  HUB_LANGS.includes(lang) ? lang : "en";

export interface HubStrings {
  /** 페이지 위 작은 딱지 */
  byMonth: string;
  byDistrict: string;
  byKind: string;
  index: string;
  /** 머리 줄 두 개 */
  allOfSeoul: string;
  openTheApp: string;
  /** 세는 말 */
  places: (n: number) => string;
  festivals: (n: number) => string;
  districts: (n: number) => string;
  /** 「시장 4곳, 축제 3곳」 — 갈래 이름과 수를 잇는다 */
  kindCount: (label: string, n: number) => string;
  /** 위 조각들을 잇는 글자 */
  join: string;
  andMore: string;
  /** 달별 */
  monthH1: (month: string) => string;
  monthTitle: (month: string, year: number, n: number) => string;
  monthLead: (n: number, gus: number, month: string) => string;
  monthDesc: (n: number, gus: number, month: string) => string;
  otherMonths: string;
  festivalsInMonth: (month: string) => string;
  /** 구별 */
  guH1: (gu: string) => string;
  guTitle: (gu: string, n: number) => string;
  guLead: (gu: string, guKo: string, n: number, kinds: string) => string;
  guDesc: (gu: string, kinds: string) => string;
  otherDistricts: string;
  kindInGu: (kind: string, gu: string) => string;
  /** 갈래별 */
  catH1: (kind: string) => string;
  catTitle: (kind: string, n: number, gus: number) => string;
  catLead: (kind: string, n: number, gus: number, isFestival: boolean) => string;
  catDesc: (kind: string, n: number, gus: number) => string;
  otherKinds: string;
  /** 대문 */
  indexH1: string;
  indexTitle: (n: number) => string;
  indexLead: (n: number, gus: number, kinds: string) => string;
  indexDesc: (kinds: string, gus: number) => string;
  byDistrictChips: string;
}

/** 영어의 복수형 — 뒤에 s 를 붙이는 것은 여기 한 군데로만 모아 둔다. */
const en = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;

/**
 * 첫 글자만 소문자로. 베트남어 달 이름이 「Tháng 10」처럼 **대문자로 저장**돼 있어,
 * 문장 가운데 넣으면 「vào Tháng 10」이 된다 — 베트남어는 문장 중간에서 소문자다.
 * (제목·h1 처럼 문장 맨 앞에 올 때는 그대로 쓴다.)
 */
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const HUB_STRINGS: Partial<Record<Language, HubStrings>> = {
  en: {
    byMonth: "By month",
    byDistrict: "By district",
    byKind: "By kind",
    index: "Index",
    allOfSeoul: "All of Seoul",
    openTheApp: "Open the app",
    places: (n) => en(n, "place"),
    festivals: (n) => en(n, "festival"),
    districts: (n) => en(n, "district"),
    kindCount: (label, n) => `${n} ${label.toLowerCase()}`,
    join: ", ",
    andMore: " and more",
    monthH1: (m) => `Seoul festivals in ${m}`,
    monthTitle: (m, y, n) => `Seoul Festivals in ${m} ${y} — ${en(n, "festival")} | K-Street`,
    monthLead: (n, gus, m) =>
      `${en(n, "festival")} in ${en(gus, "district")} of Seoul are usually held in ${m}. ` +
      `We list the month, not the exact dates — organisers set those anew each year, so open the official notice before you go. ` +
      `Every entry has KakaoMap and Naver Map directions, and the Korean name to show a taxi driver.`,
    monthDesc: (n, gus, m) =>
      `${en(n, "festival")} usually held in ${m} across ${en(gus, "district")} of Seoul — with Korean names, districts and map directions.`,
    otherMonths: "Other months",
    festivalsInMonth: (m) => `Festivals in ${m}`,
    guH1: (gu) => `What to see in ${gu}, Seoul`,
    guTitle: (gu, n) => `${gu}, Seoul — ${en(n, "place")} to see | K-Street`,
    guLead: (gu, guKo, n, kinds) =>
      `${gu} (${guKo}) has ${en(n, "place")} in K-Street: ${kinds}. ` +
      `Every entry keeps its Korean name to show a taxi driver, and opens straight into KakaoMap or Naver Map directions — ` +
      `Google Maps cannot give walking or driving directions inside Korea.`,
    guDesc: (gu, kinds) =>
      `${gu}, Seoul: ${kinds}. Korean names and KakaoMap / Naver Map directions for every place.`,
    otherDistricts: "Other districts",
    kindInGu: (kind, gu) => `${kind} in ${gu}`,
    catH1: (kind) => `${kind} in Seoul`,
    catTitle: (kind, n, gus) => `${kind} in Seoul — ${n} across ${en(gus, "district")} | K-Street`,
    catLead: (kind, n, gus, isFestival) =>
      `${n} ${kind.toLowerCase()} across ${en(gus, "district")} of Seoul, listed by district with their Korean names. ` +
      (isFestival
        ? `Dates shift every year, so we list the month and link the official notice.`
        : `Every entry opens straight into KakaoMap or Naver Map directions.`),
    catDesc: (kind, n, gus) =>
      `${kind} in Seoul — ${n} places in ${en(gus, "district")}, with Korean names and map directions.`,
    otherKinds: "Other kinds",
    indexH1: "Seoul by district, month and kind",
    indexTitle: (n) => `Seoul by District, Month and Kind — ${n} places | K-Street`,
    indexLead: (n, gus, kinds) =>
      `${en(n, "place")} in ${en(gus, "district")} of Seoul: ${kinds}. ` +
      `Pick a district, a month, or a kind of place. Everything here is free, needs no sign-up, and comes with Korean names for taxis and shops.`,
    indexDesc: (kinds, gus) =>
      `All of Seoul in K-Street: ${kinds} across ${en(gus, "district")} — browse by district, by month, or by kind.`,
    byDistrictChips: "By district",
  },

  ja: {
    byMonth: "月別",
    byDistrict: "エリア別",
    byKind: "種類別",
    index: "一覧",
    allOfSeoul: "ソウル全体",
    openTheApp: "アプリを開く",
    places: (n) => `${n}か所`,
    festivals: (n) => `${n}件のフェスティバル`,
    districts: (n) => `${n}区`,
    kindCount: (label, n) => `${label}${n}件`,
    join: "・",
    andMore: "ほか",
    monthH1: (m) => `${m}のソウルのフェスティバル`,
    monthTitle: (m, y, n) => `${y}年${m} ソウルのフェスティバル — ${n}件 | K-Street`,
    monthLead: (n, gus, m) =>
      `ソウル${gus}区で行われる${n}件のフェスティバルは、通常${m}に開催されます。` +
      `正確な日程は主催者が毎年決め直すため、ここでは月だけを載せています — お出かけ前に公式案内をご確認ください。` +
      `すべての項目に KakaoMap と Naver Map の経路案内、そしてタクシーで見せる韓国語名が付いています。`,
    monthDesc: (n, gus, m) =>
      `ソウル${gus}区で通常${m}に開催される${n}件のフェスティバル — 韓国語名・エリア・地図の経路案内付き。`,
    otherMonths: "ほかの月",
    festivalsInMonth: (m) => `${m}のフェスティバル`,
    guH1: (gu) => `ソウル${gu}の見どころ`,
    guTitle: (gu, n) => `ソウル${gu} — 見どころ${n}か所 | K-Street`,
    guLead: (gu, guKo, n, kinds) =>
      `${gu}（${guKo}）には K-Street に${n}か所あります：${kinds}。` +
      `すべての項目にタクシーで見せる韓国語名が付き、KakaoMap または Naver Map の経路案内がそのまま開きます — ` +
      `韓国国内では Google マップが徒歩・車の経路を案内できません。`,
    guDesc: (gu, kinds) =>
      `ソウル${gu}：${kinds}。すべての場所に韓国語名と KakaoMap / Naver Map の経路案内。`,
    otherDistricts: "ほかのエリア",
    kindInGu: (kind, gu) => `${gu}の${kind}`,
    catH1: (kind) => `ソウルの${kind}`,
    catTitle: (kind, n, gus) => `ソウルの${kind} — ${gus}区に${n}件 | K-Street`,
    catLead: (kind, n, gus, isFestival) =>
      `ソウル${gus}区にある${kind}${n}件を、エリア別に韓国語名付きで並べました。` +
      (isFestival
        ? `日程は毎年変わるため、月だけを載せ、公式案内へのリンクを付けています。`
        : `すべての項目から KakaoMap または Naver Map の経路案内がそのまま開きます。`),
    catDesc: (kind, n, gus) =>
      `ソウルの${kind} — ${gus}区に${n}か所。韓国語名と地図の経路案内付き。`,
    otherKinds: "ほかの種類",
    indexH1: "ソウルをエリア・月・種類から探す",
    indexTitle: (n) => `ソウルをエリア・月・種類から — ${n}か所 | K-Street`,
    indexLead: (n, gus, kinds) =>
      `ソウル${gus}区の${n}か所：${kinds}。` +
      `エリア、月、種類のどれからでも探せます。すべて無料・登録不要で、タクシーやお店で見せる韓国語名が付いています。`,
    indexDesc: (kinds, gus) =>
      `K-Street のソウル全体：${gus}区の${kinds} — エリア・月・種類から探せます。`,
    byDistrictChips: "エリア別",
  },

  zh: {
    byMonth: "按月份",
    byDistrict: "按区域",
    byKind: "按类型",
    index: "总览",
    allOfSeoul: "首尔全部",
    openTheApp: "打开应用",
    places: (n) => `${n}个地点`,
    festivals: (n) => `${n}个节庆`,
    districts: (n) => `${n}个区`,
    kindCount: (label, n) => `${n}个${label}`,
    join: "、",
    andMore: "等",
    monthH1: (m) => `首尔${m}的节庆`,
    monthTitle: (m, y, n) => `${y}年${m}首尔节庆 — ${n}个 | K-Street`,
    monthLead: (n, gus, m) =>
      `首尔${gus}个区的${n}个节庆通常在${m}举行。` +
      `确切日期由主办方每年重新决定，因此我们只标注月份 — 出发前请查看官方公告。` +
      `每个项目都有 KakaoMap 和 Naver Map 路线，以及可以给出租车司机看的韩语名称。`,
    monthDesc: (n, gus, m) =>
      `首尔${gus}个区通常在${m}举行的${n}个节庆 — 附韩语名称、区域和地图路线。`,
    otherMonths: "其他月份",
    festivalsInMonth: (m) => `${m}的节庆`,
    guH1: (gu) => `首尔${gu}有什么可看`,
    guTitle: (gu, n) => `首尔${gu} — ${n}个值得一看的地方 | K-Street`,
    guLead: (gu, guKo, n, kinds) =>
      `${gu}（${guKo}）在 K-Street 收录${n}个地点：${kinds}。` +
      `每个项目都保留可给出租车司机看的韩语名称，并可直接打开 KakaoMap 或 Naver Map 路线 — ` +
      `在韩国境内，Google 地图无法提供步行或驾车路线。`,
    guDesc: (gu, kinds) =>
      `首尔${gu}：${kinds}。每个地点都有韩语名称和 KakaoMap / Naver Map 路线。`,
    otherDistricts: "其他区域",
    kindInGu: (kind, gu) => `${gu}的${kind}`,
    catH1: (kind) => `首尔的${kind}`,
    catTitle: (kind, n, gus) => `首尔的${kind} — ${gus}个区共${n}个 | K-Street`,
    catLead: (kind, n, gus, isFestival) =>
      `首尔${gus}个区的${n}个${kind}，按区域排列并附韩语名称。` +
      (isFestival
        ? `日期每年变动，因此我们只标注月份并附上官方公告链接。`
        : `每个项目都可直接打开 KakaoMap 或 Naver Map 路线。`),
    catDesc: (kind, n, gus) =>
      `首尔的${kind} — ${gus}个区共${n}个地点，附韩语名称和地图路线。`,
    otherKinds: "其他类型",
    indexH1: "按区域、月份和类型浏览首尔",
    indexTitle: (n) => `按区域、月份和类型浏览首尔 — ${n}个地点 | K-Street`,
    indexLead: (n, gus, kinds) =>
      `首尔${gus}个区的${n}个地点：${kinds}。` +
      `可以按区域、月份或类型来找。全部免费、无需注册，并附有可给出租车和店家看的韩语名称。`,
    indexDesc: (kinds, gus) =>
      `K-Street 的首尔全部：${gus}个区的${kinds} — 可按区域、月份或类型浏览。`,
    byDistrictChips: "按区域",
  },

  "zh-TW": {
    byMonth: "按月份",
    byDistrict: "按區域",
    byKind: "按類型",
    index: "總覽",
    allOfSeoul: "首爾全部",
    openTheApp: "開啟應用程式",
    places: (n) => `${n}個地點`,
    festivals: (n) => `${n}個節慶`,
    districts: (n) => `${n}個區`,
    kindCount: (label, n) => `${n}個${label}`,
    join: "、",
    andMore: "等",
    monthH1: (m) => `首爾${m}的節慶`,
    monthTitle: (m, y, n) => `${y}年${m}首爾節慶 — ${n}個 | K-Street`,
    monthLead: (n, gus, m) =>
      `首爾${gus}個區的${n}個節慶通常在${m}舉行。` +
      `確切日期由主辦方每年重新決定，因此我們只標註月份 — 出發前請查看官方公告。` +
      `每個項目都有 KakaoMap 和 Naver Map 路線，以及可以給計程車司機看的韓語名稱。`,
    monthDesc: (n, gus, m) =>
      `首爾${gus}個區通常在${m}舉行的${n}個節慶 — 附韓語名稱、區域和地圖路線。`,
    otherMonths: "其他月份",
    festivalsInMonth: (m) => `${m}的節慶`,
    guH1: (gu) => `首爾${gu}有什麼可看`,
    guTitle: (gu, n) => `首爾${gu} — ${n}個值得一看的地方 | K-Street`,
    guLead: (gu, guKo, n, kinds) =>
      `${gu}（${guKo}）在 K-Street 收錄${n}個地點：${kinds}。` +
      `每個項目都保留可給計程車司機看的韓語名稱，並可直接開啟 KakaoMap 或 Naver Map 路線 — ` +
      `在韓國境內，Google 地圖無法提供步行或駕車路線。`,
    guDesc: (gu, kinds) =>
      `首爾${gu}：${kinds}。每個地點都有韓語名稱和 KakaoMap / Naver Map 路線。`,
    otherDistricts: "其他區域",
    kindInGu: (kind, gu) => `${gu}的${kind}`,
    catH1: (kind) => `首爾的${kind}`,
    catTitle: (kind, n, gus) => `首爾的${kind} — ${gus}個區共${n}個 | K-Street`,
    catLead: (kind, n, gus, isFestival) =>
      `首爾${gus}個區的${n}個${kind}，按區域排列並附韓語名稱。` +
      (isFestival
        ? `日期每年變動，因此我們只標註月份並附上官方公告連結。`
        : `每個項目都可直接開啟 KakaoMap 或 Naver Map 路線。`),
    catDesc: (kind, n, gus) =>
      `首爾的${kind} — ${gus}個區共${n}個地點，附韓語名稱和地圖路線。`,
    otherKinds: "其他類型",
    indexH1: "按區域、月份和類型瀏覽首爾",
    indexTitle: (n) => `按區域、月份和類型瀏覽首爾 — ${n}個地點 | K-Street`,
    indexLead: (n, gus, kinds) =>
      `首爾${gus}個區的${n}個地點：${kinds}。` +
      `可以按區域、月份或類型來找。全部免費、無需註冊，並附有可給計程車和店家看的韓語名稱。`,
    indexDesc: (kinds, gus) =>
      `K-Street 的首爾全部：${gus}個區的${kinds} — 可按區域、月份或類型瀏覽。`,
    byDistrictChips: "按區域",
  },

  // 🇰🇷 한국어 — 읽는 사람이 다르므로 **문장을 그대로 옮기지 않는다.**
  //    영어판에는 「택시 기사에게 보여 줄 한국어 이름」이 들어가는데,
  //    한국어를 읽는 손님에게 그 말은 아무 뜻이 없다(이미 한국어를 안다).
  //    그 자리를 빼고 실제로 쓸모 있는 것만 남겼다 — 번역이 아니라 현지화다.
  //    이 페이지의 손님은 한국에 사는 외국인과, 한국어로 검색하는 사람이다.
  ko: {
    byMonth: "달별",
    byDistrict: "구별",
    byKind: "갈래별",
    index: "전체",
    allOfSeoul: "서울 전체",
    openTheApp: "앱 열기",
    places: (n) => `${n}곳`,
    festivals: (n) => `축제 ${n}개`,
    districts: (n) => `${n}개 구`,
    kindCount: (label, n) => `${label} ${n}곳`,
    join: ", ",
    andMore: " 등",
    monthH1: (m) => `${m} 서울 축제`,
    monthTitle: (m, y, n) => `${y}년 ${m} 서울 축제 — ${n}개 | K-Street`,
    monthLead: (n, gus, m) =>
      `서울 ${gus}개 구에서 ${m}에 주로 열리는 축제 ${n}개입니다. ` +
      `정확한 날짜는 주최 측이 해마다 새로 정하므로 여기서는 달까지만 적었습니다 — 가시기 전에 공식 안내를 확인하세요. ` +
      `모든 항목에서 카카오맵·네이버 지도 길찾기가 바로 열립니다.`,
    monthDesc: (n, gus, m) =>
      `서울 ${gus}개 구에서 ${m}에 주로 열리는 축제 ${n}개 — 구와 시기, 지도 길찾기까지.`,
    otherMonths: "다른 달",
    festivalsInMonth: (m) => `${m} 축제`,
    guH1: (gu) => `서울 ${gu} 볼거리`,
    guTitle: (gu, n) => `서울 ${gu} — 볼거리 ${n}곳 | K-Street`,
    guLead: (gu, _guKo, n, kinds) =>
      `${gu}에는 K-Street에 ${n}곳이 있습니다: ${kinds}. ` +
      `모든 항목에서 카카오맵·네이버 지도 길찾기가 바로 열립니다.`,
    guDesc: (gu, kinds) => `서울 ${gu}: ${kinds}. 모든 곳에 카카오맵·네이버 지도 길찾기.`,
    otherDistricts: "다른 구",
    kindInGu: (kind, gu) => `${gu}의 ${kind}`,
    catH1: (kind) => `서울의 ${kind}`,
    catTitle: (kind, n, gus) => `서울의 ${kind} — ${gus}개 구에 ${n}곳 | K-Street`,
    catLead: (kind, n, gus, isFestival) =>
      `서울 ${gus}개 구에 있는 ${kind} ${n}곳을 구별로 모았습니다. ` +
      (isFestival
        ? `날짜는 해마다 바뀌므로 달까지만 적고 공식 안내를 링크했습니다.`
        : `모든 항목에서 카카오맵·네이버 지도 길찾기가 바로 열립니다.`),
    catDesc: (kind, n, gus) => `서울의 ${kind} — ${gus}개 구에 ${n}곳. 지도 길찾기까지.`,
    otherKinds: "다른 갈래",
    indexH1: "구·달·갈래로 보는 서울",
    indexTitle: (n) => `구·달·갈래로 보는 서울 — ${n}곳 | K-Street`,
    indexLead: (n, gus, kinds) =>
      `서울 ${gus}개 구의 ${n}곳입니다: ${kinds}. ` +
      `구, 달, 갈래 어느 쪽으로나 찾아보세요. 전부 무료고 가입이 필요 없습니다.`,
    indexDesc: (kinds, gus) =>
      `K-Street의 서울 전체: ${gus}개 구의 ${kinds} — 구·달·갈래로 찾아보세요.`,
    byDistrictChips: "구별",
  },

  // 🇻🇳 베트남어 — 복수형이 없다(2 địa điểm, không phải "địa điểms").
  //    달 이름이 「Tháng 10」로 대문자 저장이라 문장 가운데서는 lc() 로 낮춘다.
  vi: {
    byMonth: "Theo tháng",
    byDistrict: "Theo quận",
    byKind: "Theo loại",
    index: "Tổng quan",
    allOfSeoul: "Toàn bộ Seoul",
    openTheApp: "Mở ứng dụng",
    places: (n) => `${n} địa điểm`,
    festivals: (n) => `${n} lễ hội`,
    districts: (n) => `${n} quận`,
    kindCount: (label, n) => `${n} ${lc(label)}`,
    join: ", ",
    andMore: " và nhiều nữa",
    monthH1: (m) => `Lễ hội Seoul ${lc(m)}`,
    monthTitle: (m, y, n) => `Lễ hội Seoul ${lc(m)} năm ${y} — ${n} lễ hội | K-Street`,
    monthLead: (n, gus, m) =>
      `${n} lễ hội ở ${gus} quận của Seoul thường được tổ chức vào ${lc(m)}. ` +
      `Chúng tôi chỉ ghi tháng, không ghi ngày cụ thể — ban tổ chức ấn định lại mỗi năm, nên hãy xem thông báo chính thức trước khi đi. ` +
      `Mỗi địa điểm đều có chỉ đường KakaoMap và Naver Map, cùng tên tiếng Hàn để đưa cho tài xế taxi.`,
    monthDesc: (n, gus, m) =>
      `${n} lễ hội thường diễn ra vào ${lc(m)} tại ${gus} quận của Seoul — kèm tên tiếng Hàn, quận và chỉ đường.`,
    otherMonths: "Tháng khác",
    festivalsInMonth: (m) => `Lễ hội ${lc(m)}`,
    guH1: (gu) => `Nên xem gì ở ${gu}, Seoul`,
    guTitle: (gu, n) => `${gu}, Seoul — ${n} địa điểm nên xem | K-Street`,
    guLead: (gu, guKo, n, kinds) =>
      `${gu} (${guKo}) có ${n} địa điểm trong K-Street: ${kinds}. ` +
      `Mỗi địa điểm đều giữ tên tiếng Hàn để đưa cho tài xế taxi, và mở trực tiếp chỉ đường KakaoMap hoặc Naver Map — ` +
      `Google Maps không thể chỉ đường đi bộ hay lái xe trong Hàn Quốc.`,
    guDesc: (gu, kinds) =>
      `${gu}, Seoul: ${kinds}. Tên tiếng Hàn và chỉ đường KakaoMap / Naver Map cho mọi địa điểm.`,
    otherDistricts: "Quận khác",
    kindInGu: (kind, gu) => `${kind} ở ${gu}`,
    catH1: (kind) => `${kind} ở Seoul`,
    catTitle: (kind, n, gus) => `${kind} ở Seoul — ${n} địa điểm tại ${gus} quận | K-Street`,
    catLead: (kind, n, gus, isFestival) =>
      `${n} ${lc(kind)} tại ${gus} quận của Seoul, xếp theo quận kèm tên tiếng Hàn. ` +
      (isFestival
        ? `Ngày thay đổi mỗi năm, nên chúng tôi ghi tháng và dẫn tới thông báo chính thức.`
        : `Mỗi địa điểm mở trực tiếp chỉ đường KakaoMap hoặc Naver Map.`),
    catDesc: (kind, n, gus) =>
      `${kind} ở Seoul — ${n} địa điểm tại ${gus} quận, kèm tên tiếng Hàn và chỉ đường.`,
    otherKinds: "Loại khác",
    indexH1: "Seoul theo quận, tháng và loại",
    indexTitle: (n) => `Seoul theo quận, tháng và loại — ${n} địa điểm | K-Street`,
    indexLead: (n, gus, kinds) =>
      `${n} địa điểm tại ${gus} quận của Seoul: ${kinds}. ` +
      `Chọn một quận, một tháng, hoặc một loại địa điểm. Tất cả đều miễn phí, không cần đăng ký, và có tên tiếng Hàn để dùng khi đi taxi hay vào cửa hàng.`,
    indexDesc: (kinds, gus) =>
      `Toàn bộ Seoul trong K-Street: ${kinds} tại ${gus} quận — xem theo quận, theo tháng, hoặc theo loại.`,
    byDistrictChips: "Theo quận",
  },

  // 🇹🇭 태국어 — 복수형이 없고 **분류사**를 쓴다: 장소는 แห่ง, 행사는 งาน.
  //    구 이름은 로마자로 남으므로(태국어 구 이름 표가 없다) 앞에 빈칸을 둔다 —
  //    태국어는 낱말을 붙여 쓰지만 로마자와 붙으면 읽기 어렵다.
  th: {
    byMonth: "ตามเดือน",
    byDistrict: "ตามเขต",
    byKind: "ตามประเภท",
    index: "ภาพรวม",
    allOfSeoul: "โซลทั้งหมด",
    openTheApp: "เปิดแอป",
    places: (n) => `${n} แห่ง`,
    festivals: (n) => `เทศกาล ${n} งาน`,
    districts: (n) => `${n} เขต`,
    kindCount: (label, n) => `${label} ${n} แห่ง`,
    join: " · ",
    andMore: " และอื่น ๆ",
    monthH1: (m) => `เทศกาลในโซล เดือน${m}`,
    monthTitle: (m, y, n) => `เทศกาลในโซล เดือน${m} ${y} — ${n} งาน | K-Street`,
    monthLead: (n, gus, m) =>
      `เทศกาล ${n} งานใน ${gus} เขตของโซล มักจัดขึ้นในเดือน${m} ` +
      `เราระบุเฉพาะเดือน ไม่ระบุวันที่แน่นอน เพราะผู้จัดกำหนดใหม่ทุกปี — โปรดตรวจสอบประกาศทางการก่อนออกเดินทาง ` +
      `ทุกรายการมีเส้นทางจาก KakaoMap และ Naver Map พร้อมชื่อภาษาเกาหลีให้แสดงกับคนขับแท็กซี่`,
    monthDesc: (n, gus, m) =>
      `เทศกาล ${n} งานที่มักจัดในเดือน${m} ใน ${gus} เขตของโซล — พร้อมชื่อภาษาเกาหลี เขต และเส้นทางบนแผนที่`,
    otherMonths: "เดือนอื่น",
    festivalsInMonth: (m) => `เทศกาลเดือน${m}`,
    guH1: (gu) => `${gu} โซล มีอะไรน่าดู`,
    guTitle: (gu, n) => `${gu} โซล — ${n} แห่งที่น่าไป | K-Street`,
    guLead: (gu, guKo, n, kinds) =>
      `${gu} (${guKo}) มี ${n} แห่งใน K-Street: ${kinds} ` +
      `ทุกรายการมีชื่อภาษาเกาหลีให้แสดงกับคนขับแท็กซี่ และเปิดเส้นทาง KakaoMap หรือ Naver Map ได้ทันที — ` +
      `ในเกาหลี Google Maps ไม่สามารถบอกเส้นทางเดินหรือขับรถได้`,
    guDesc: (gu, kinds) =>
      `${gu} โซล: ${kinds} ทุกแห่งมีชื่อภาษาเกาหลีและเส้นทาง KakaoMap / Naver Map`,
    otherDistricts: "เขตอื่น",
    kindInGu: (kind, gu) => `${kind}ใน ${gu}`,
    catH1: (kind) => `${kind}ในโซล`,
    catTitle: (kind, n, gus) => `${kind}ในโซล — ${n} แห่งใน ${gus} เขต | K-Street`,
    catLead: (kind, n, gus, isFestival) =>
      `${kind} ${n} แห่งใน ${gus} เขตของโซล จัดเรียงตามเขตพร้อมชื่อภาษาเกาหลี ` +
      (isFestival
        ? `วันที่เปลี่ยนทุกปี เราจึงระบุเฉพาะเดือนและแนบลิงก์ประกาศทางการ`
        : `ทุกรายการเปิดเส้นทาง KakaoMap หรือ Naver Map ได้ทันที`),
    catDesc: (kind, n, gus) =>
      `${kind}ในโซล — ${n} แห่งใน ${gus} เขต พร้อมชื่อภาษาเกาหลีและเส้นทางบนแผนที่`,
    otherKinds: "ประเภทอื่น",
    indexH1: "โซลตามเขต เดือน และประเภท",
    indexTitle: (n) => `โซลตามเขต เดือน และประเภท — ${n} แห่ง | K-Street`,
    indexLead: (n, gus, kinds) =>
      `${n} แห่งใน ${gus} เขตของโซล: ${kinds} ` +
      `เลือกจากเขต เดือน หรือประเภทก็ได้ ทั้งหมดฟรี ไม่ต้องสมัคร และมีชื่อภาษาเกาหลีสำหรับใช้กับแท็กซี่และร้านค้า`,
    indexDesc: (kinds, gus) =>
      `โซลทั้งหมดใน K-Street: ${kinds} ใน ${gus} เขต — ดูตามเขต เดือน หรือประเภท`,
    byDistrictChips: "ตามเขต",
  },

  // 🇮🇩 인도네시아어 — 수사 뒤에 복수 표시를 **안 한다**(2 tempat, tempats 가 아니다).
  id: {
    byMonth: "Menurut bulan",
    byDistrict: "Menurut distrik",
    byKind: "Menurut jenis",
    index: "Ikhtisar",
    allOfSeoul: "Seluruh Seoul",
    openTheApp: "Buka aplikasi",
    places: (n) => `${n} tempat`,
    festivals: (n) => `${n} festival`,
    districts: (n) => `${n} distrik`,
    kindCount: (label, n) => `${n} ${lc(label)}`,
    join: ", ",
    andMore: " dan lainnya",
    monthH1: (m) => `Festival Seoul pada ${m}`,
    monthTitle: (m, y, n) => `Festival Seoul ${m} ${y} — ${n} festival | K-Street`,
    monthLead: (n, gus, m) =>
      `${n} festival di ${gus} distrik Seoul biasanya digelar pada ${m}. ` +
      `Kami hanya mencantumkan bulannya, bukan tanggal pastinya — penyelenggara menetapkannya ulang setiap tahun, jadi buka pengumuman resmi sebelum pergi. ` +
      `Setiap entri punya rute KakaoMap dan Naver Map, serta nama Korea untuk ditunjukkan ke pengemudi taksi.`,
    monthDesc: (n, gus, m) =>
      `${n} festival yang biasanya digelar pada ${m} di ${gus} distrik Seoul — lengkap dengan nama Korea, distrik, dan rute peta.`,
    otherMonths: "Bulan lain",
    festivalsInMonth: (m) => `Festival ${m}`,
    guH1: (gu) => `Apa yang bisa dilihat di ${gu}, Seoul`,
    guTitle: (gu, n) => `${gu}, Seoul — ${n} tempat untuk dikunjungi | K-Street`,
    guLead: (gu, guKo, n, kinds) =>
      `${gu} (${guKo}) punya ${n} tempat di K-Street: ${kinds}. ` +
      `Setiap entri menyimpan nama Korea untuk ditunjukkan ke pengemudi taksi, dan langsung membuka rute KakaoMap atau Naver Map — ` +
      `Google Maps tidak bisa memberi rute jalan kaki atau berkendara di Korea.`,
    guDesc: (gu, kinds) =>
      `${gu}, Seoul: ${kinds}. Nama Korea dan rute KakaoMap / Naver Map untuk setiap tempat.`,
    otherDistricts: "Distrik lain",
    kindInGu: (kind, gu) => `${kind} di ${gu}`,
    catH1: (kind) => `${kind} di Seoul`,
    catTitle: (kind, n, gus) => `${kind} di Seoul — ${n} tempat di ${gus} distrik | K-Street`,
    catLead: (kind, n, gus, isFestival) =>
      `${n} ${lc(kind)} di ${gus} distrik Seoul, disusun per distrik dengan nama Korea. ` +
      (isFestival
        ? `Tanggalnya berubah setiap tahun, jadi kami mencantumkan bulan dan menautkan pengumuman resmi.`
        : `Setiap entri langsung membuka rute KakaoMap atau Naver Map.`),
    catDesc: (kind, n, gus) =>
      `${kind} di Seoul — ${n} tempat di ${gus} distrik, dengan nama Korea dan rute peta.`,
    otherKinds: "Jenis lain",
    indexH1: "Seoul menurut distrik, bulan, dan jenis",
    indexTitle: (n) => `Seoul menurut distrik, bulan, dan jenis — ${n} tempat | K-Street`,
    indexLead: (n, gus, kinds) =>
      `${n} tempat di ${gus} distrik Seoul: ${kinds}. ` +
      `Pilih distrik, bulan, atau jenis tempat. Semuanya gratis, tanpa pendaftaran, dan dilengkapi nama Korea untuk taksi dan toko.`,
    indexDesc: (kinds, gus) =>
      `Seluruh Seoul di K-Street: ${kinds} di ${gus} distrik — telusuri menurut distrik, bulan, atau jenis.`,
    byDistrictChips: "Menurut distrik",
  },
};
