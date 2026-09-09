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
