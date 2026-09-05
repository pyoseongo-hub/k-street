export type Language = 'ko' | 'en' | 'ja' | 'zh' | 'zh-TW' | 'vi' | 'es' | 'fr' | 'de' | 'ru' | 'id' | 'th';

export interface Translations {
  // Header & navigation
  themeSwitchLabel: string;
  searchLabel: string;
  notificationLabel: string;
  homeTab: string;
  calendarTab: string;
  savedPlacesTab: string;
  saveLabel: string;
  unsaveLabel: string;
  savedEmptyTitle: string;
  savedEmptyBody: string;
  savedOnThisPhone: string;
  freeNoSignup: string;
  installTitle: string;
  installBody: string;
  installBodyIos: string;
  installAction: string;
  installDismiss: string;
  settingsTab: string;

  // Monthly Festival Panel
  monthlyEditorLabel: string;
  monthlyTitle: (month: number) => string;
  noFestivalsMessage: (month: number) => string;
  photoCredit: string;
  /** 사진이 여러 장일 때 그 자리를 눌러 넘길 수 있다고 알려 주는 말(화면에 안 보이고 읽어 주는 용). */
  morePhotos: (count: number) => string;

  // 🔀 맨 위 화면 전환 단추(HomeSwitch). 자리가 좁으니 **한두 낱말**로 짧게 적는다.
  /** 계절 화면 — 「봄 여름 가을 겨울 그리고 서울」 쪽 */
  viewSeason: string;
  /** 동네 화면 — 육각 지도로 구를 고르는 쪽 */
  viewDistrict: string;

  // District Explorer
  exploreNowLabel: string;
  exploreTitle: string;
  /**
   * 👆 **육각 지도 바로 위**에 붙는 한 줄 (2026-09-05 사장님: "동네지도 사용 은
   * 어떤건지 한번에 이해하기 힘들수도 있다는 생각이 드네").
   *
   * 설명은 원래도 있었는데 **지도 아래**에 있었다. 벌집을 다 지나친 다음에야
   * 나오니, 헷갈릴 사람은 이미 헷갈린 뒤였다. 안내는 **막히기 전에** 보여야 한다.
   *
   * 그래서 한 문장을 둘로 갈랐다 — 「누르면 나온다」는 지도 위로 올리고,
   * 색 설명(진한 색·옅은 색)은 그 색이 보이는 지도 아래에 남긴다.
   * 각자 설명하는 것 옆에 두는 것이다.
   */
  tapDistrictHint: string;
  mapDisclaimerStart: string;
  mapDisclaimerBold: string;
  mapDisclaimerEnd: string;
  noPlacesInDistrictMessage: (gu: string) => string;
  flowerBloomDisclaimer: string;
  mapAppNote: string;
  /** 지도가 화면 밖으로 나갔을 때 뜨는 "지도로 돌아가기" 버튼 */
  backToMap: string;
  /** 지도 버튼 이름. 두 회사가 정한 공식 표기를 쓴다 — 지어내지 않는다. */
  kakaoMapLabel: string;
  naverMapLabel: string;

  // 계절 화면 「봄 여름 가을 겨울 그리고 서울」
  /** 표지 아랫줄 — "그리고 서울". 윗줄의 계절 넷은 seasonNames를 그대로 쓴다. */
  seasonTitleAnd: string;
  seasonNames: Record<string, string>;
  seasonSubtitle: (season: string, month: string, count: number) => string;
  themeAll: string;
  themeLabels: Record<string, string>;
  /** "10월 중순" — 정확한 날짜는 일부러 안 적는다(Place.period 주석 참고) */
  monthPeriod: (month: string, period: "early" | "mid" | "late") => string;
  festivalDateDisclaimer: string;
  /**
   * ⚠️ 열리는 달이 해마다 옮겨 다니는 축제에만 붙는 안내.
   * months에는 걸린 달이 그 언어로 들어온다("9월 · 10월").
   * **그해에는 둘 중 한 달만 열린다**는 뜻이 반드시 드러나야 한다 — 이 줄이 없으면
   * 9월에 온 손님이 그해 10월 축제를 보러 헛걸음한다.
   */
  festivalMonthVaries: (months: string) => string;
  /**
   * 🌸 **꽃 축제**에만 붙는 안내. 벚꽃·장미는 그 해 날씨에 따라 피는 때가 달라져
   * 주최 측도 날짜를 미리 못 박는다. 위 festivalMonthVaries와 뜻이 다르다 —
   * 이쪽은 달이 아니라 **날짜가** 꽃 따라 움직인다.
   *
   * 카드에 한 줄로 들어가므로 짧게. 자세한 설명은 목록 위 안내(flowerBloomDisclaimer)에 있다.
   */
  festivalBloomVaries: string;
  /**
   * 🔎 날짜 옆에 붙는 **작은 링크** 글자. 누르면 그 축제의 네이버 검색으로 간다.
   *
   * 사용자 지시(2026-09-02): "날짜에 너무 신경쓰지말고 네이버 링크 달아서 직접
   * 확인해야한다 / 달라질수있다 작게적어".
   *
   * 우리가 적어 둔 달은 **어느 철에 열리나**를 보여 줄 뿐이고, 그해 날짜는
   * 주최 측 사정으로 바뀐다. 손님이 한 번만 눌러 지금 날짜를 볼 수 있어야 한다.
   * 자리를 많이 먹지 않게 한두 낱말로.
   */
  festivalCheckDates: string;
  /**
   * 🖼️ **사진이 없는 축제 카드**에 붙는 한 줄 설명 (사용자 지시 2026-09-04:
   * "이미지가 사용권한이 없어서 홈페이지 링크로 연결합니다 라든가").
   *
   * 왜 필요한가 — 80곳 중 24곳은 관광공사에 사진 자료가 아예 없다. 구청 보도자료
   * 사진은 공공누리 제2·4유형이라 우리가 쓸 수 없고, 블로그·인스타 사진은 더더욱
   * 안 된다. 그래서 **빈 자리에 아무 말 없이 그림만 그려 두면** 손님은 "앱이
   * 부실하다"고 읽는다 — 이유를 적으면 "권리를 지키는 앱"으로 읽힌다.
   *
   * 카드 한 줄에 들어가므로 짧게. 마지막은 늘 "이름을 누르면 공식 안내로 간다"로
   * 끝난다 — 이 줄의 목적은 변명이 아니라 **다음 행동을 알려 주는 것**이다.
   */
  festivalNoPhoto: string;
  /**
   * 🚕 **택시 기사에게 보여 주는 화면**(2026-09-04 사용자 지시: "기사보여주기도 진행").
   *
   * 왜 만들었나 — 카카오맵·우버 어느 쪽도 택시 호출로 이어지지 않는 것을
   * 사장님 폰에서 직접 확인했다(카카오맵 자동차 경로에는 택시 탭이 아예 없고,
   * 우버 앱은 열리기는 하지만 픽업·도착이 비어 있었다). 남의 앱 연동을
   * 기다리는 대신, **손님이 실제로 겪는 문제**를 우리 화면 안에서 푼다 —
   * 기사와 말이 안 통해 목적지를 못 대는 것.
   *
   * 그래서 이 화면은 **한국어 상호와 주소만** 크게 띄운다. 번역되는 것은
   * 버튼 이름과 안내 한 줄뿐이고, 기사가 읽는 부분은 언제나 한국어다.
   */
  showToDriver: string;
  /** 손님에게 — "이 화면을 기사에게 보여 주세요". 손님 언어로 나온다. */
  driverCardHint: string;
  /** 기사 화면을 닫는 버튼. 손님 언어로 나온다. */
  driverCardClose: string;
  /** 내 위치의 구를 찾는 버튼 */
  myLocationFind: string;
  /** 구를 찾았을 때 — "지금 용산구에 계세요" */
  myLocationHere: (gu: string) => string;
  /** 위치는 받았는데 서울이 아닐 때. 가까운 구를 억지로 대지 않는다. */
  myLocationOutside: string;
  /** 위치를 못 받았거나 구 조회가 실패했을 때 */
  myLocationFailed: string;
  /**
   * 📍 **위치 자체를 못 받았을 때** — 권한 거절·실내·기기 미지원·시간 초과.
   *
   * 🚨 아래 myLocationFailed 와 **반드시 다른 말이어야 한다** (2026-09-04에 당했다).
   * myDistrict.ts 는 결과를 네 가지로 나눠 두고 주석에 "뭉뚱그리지 말라"고까지
   * 적어 뒀는데, 정작 화면에서 noPosition 과 failed 를 **같은 문구로 합쳐** 놨었다.
   * 그래서 「위치를 못 찾았어요」가 떴을 때 **폰 권한 문제인지 지도 열쇠 문제인지
   * 아무도 몰랐다** — 도메인을 바꾼 날 이걸 확인하려다 막혔다.
   *
   * 이쪽은 **손님이 고칠 수 있는 문제**라, 무엇을 하면 되는지까지 적는다.
   */
  myLocationNoPermission: string;
  /**
   * 🗺️ **지도 열쇠·도메인 인증이 막혔을 때** — 손님 잘못이 아니라 **우리 잘못**이다.
   *
   * 네이버는 인증 실패를 window.navermap_authFailure 로만 알려 준다(lib/naverMaps.ts).
   * 그 신호가 오면 손님이 아무리 다시 눌러도 안 되므로, "다시 눌러 보세요"라고
   * 하면 안 된다 — 헛수고를 시키는 말이다.
   *
   * 그래서 **우리가 고치겠다고 말한다.** 손님이 할 일은 없다.
   */
  myLocationMapProblem: string;

  // Categories
  /** 길찾기 버튼이 내 위치를 받아오는 동안 보여줄 글자 */
  mapLocating: string;
  categoryLabels: Record<string, string>;

  // Months
  months: Record<number, string>;

  // Weather
  feelsLike: string;
  weatherUpdatedAt: string;
}

const translations: Record<Language, Translations> = {
  ko: {
    themeSwitchLabel: '테마 전환',
    searchLabel: '검색(준비 중)',
    notificationLabel: '알림(준비 중)',
    homeTab: '홈',
    calendarTab: '캘린더',
    savedPlacesTab: '저장한 곳',
    saveLabel: '저장하기',
    unsaveLabel: '저장 해제',
    savedEmptyTitle: '아직 저장한 곳이 없어요',
    savedEmptyBody: '마음에 드는 곳의 🤍 를 누르면 여기에 모입니다.',
    savedOnThisPhone: '저장한 곳은 이 기기에만 남습니다.',
    freeNoSignup: '평생 무료 · 가입 없음',
    installTitle: '앱처럼 쓰기',
    installBody: '홈 화면에 두면 인터넷이 없어도 열립니다.',
    installBodyIos: '공유 버튼 → "홈 화면에 추가"',
    installAction: '설치',
    installDismiss: '닫기',
    settingsTab: '설정',

    monthlyEditorLabel: '이달의 편집',
    monthlyTitle: (month) => `${month}월에 놓치면 안 되는 것`,
    noFestivalsMessage: (month) =>
      `이번 세션 조사에서는 ${month}월에 확인된 축제가 없다 — 없는 게 아니라 아직 확인을 못 한 것일 수 있다.`,
    photoCredit: '사진: 한국관광공사',
    morePhotos: (n: number) => `사진 ${n}장 — 눌러서 넘기기`,

    viewSeason: '계절',
    viewDistrict: '동네',
    exploreNowLabel: '지금 갈 수 있는 곳',
    exploreTitle: '동네마다 다른 서울',
    tapDistrictHint: '구를 눌러 보세요 — 그 동네의 장소가 나옵니다',
    mapDisclaimerStart: '진한 색은 ',
    mapDisclaimerBold: '지금 볼 곳이 있는 구',
    mapDisclaimerEnd: ', 옅은 색은 아직 준비 중인 구다.',
    noPlacesInDistrictMessage: (gu) => `${gu}는 아직 확인 못했다.`,
    flowerBloomDisclaimer:
      '벚꽃 등 개화 시기는 그 해 날씨에 따라 매년 달라져 특정 날짜를 미리 정할 수 없다. 보통 3~5월 사이이니, 방문 전 서울시·구청 공식 채널에서 실시간 개화 소식을 확인할 것.',
    mapAppNote: '지도 앱이 바로 안 열리면, 이름으로 다시 검색해 보세요.',
    backToMap: '다른 동네 고르기',
    kakaoMapLabel: '카카오맵',
    naverMapLabel: '네이버지도',
    seasonTitleAnd: '그리고 서울',
    seasonNames: { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' },
    seasonSubtitle: (season, month, count) => `${season} · ${month}에 열리는 축제 ${count}곳`,
    themeAll: '전체',
    themeLabels: { nature: '꽃·자연', light: '빛·불꽃', music: '음악·춤', food: '먹거리', history: '역사·전통', street: '동네·거리' },
    monthPeriod: (month, period) => `${month} ${period === 'early' ? '초' : period === 'mid' ? '중순' : '말'}`,
    festivalDateDisclaimer: '날짜는 해마다 바뀝니다. 이름을 누르면 그 구청의 공식 안내로 갑니다.',
    festivalMonthVaries: (m) => `해마다 ${m} 중 한 달에 열립니다 — 올해 날짜는 이름을 눌러 확인하세요.`,
    festivalBloomVaries: '꽃이 피는 때에 따라 날짜가 바뀝니다 — 이름을 눌러 올해 일정을 확인하세요.',
    festivalCheckDates: '날짜 확인',
    festivalNoPhoto: '사진은 사용 권한이 없어 싣지 못했습니다. 이름을 누르면 공식 안내로 갑니다.',
    showToDriver: '🇰🇷 기사에게 보여 주기',
    driverCardHint: '이 화면을 택시 기사에게 보여 주세요.',
    driverCardClose: '닫기',
    myLocationFind: '📍 내 위치',
    myLocationHere: (gu) => `지금 ${gu}에 계세요`,
    myLocationOutside: '서울 밖에 계세요',
    myLocationFailed: '위치를 못 찾았어요. 다시 눌러 보세요.',
    myLocationNoPermission: '위치 권한이 꺼져 있어요. 브라우저에서 위치 허용을 켜고 다시 눌러 주세요.',
    myLocationMapProblem: '지도 서비스에 문제가 있어요. 곧 고치겠습니다.',
    mapLocating: '위치 확인 중…',

    categoryLabels: {
      market: '시장',
      flower: '꽃길',
      walk: '산책길',
      walkFlower: '꽃길·산책길',
      hike: '등산로',
      museum: '박물관',
      festival: '축제',
      street: '골목·거리',
    },

    months: {
      1: '1월', 2: '2월', 3: '3월', 4: '4월', 5: '5월', 6: '6월',
      7: '7월', 8: '8월', 9: '9월', 10: '10월', 11: '11월', 12: '12월',
    },

    feelsLike: '체감',
    weatherUpdatedAt: '업데이트',
  },

  en: {
    themeSwitchLabel: 'Toggle theme',
    searchLabel: 'Search (coming soon)',
    notificationLabel: 'Notifications (coming soon)',
    homeTab: 'Home',
    calendarTab: 'Calendar',
    savedPlacesTab: 'Saved',
    saveLabel: 'Save',
    unsaveLabel: 'Remove from saved',
    savedEmptyTitle: 'Nothing saved yet',
    savedEmptyBody: 'Tap 🤍 on any place and it shows up here.',
    savedOnThisPhone: 'Saved places stay on this device only.',
    freeNoSignup: 'Free forever · No sign-up',
    installTitle: 'Use it like an app',
    installBody: 'Add it to your home screen — it opens even offline.',
    installBodyIos: 'Share button → "Add to Home Screen"',
    installAction: 'Install',
    installDismiss: 'Close',
    settingsTab: 'Settings',

    monthlyEditorLabel: "This Month's Picks",
    monthlyTitle: (month) => `Must not miss in ${getMonthName('en', month)}`,
    noFestivalsMessage: (month) =>
      `No festivals confirmed for ${getMonthName('en', month)} in this session — but there may be events we haven't documented yet.`,
    photoCredit: 'Photo: Korea Tourism Organization',
    morePhotos: (n: number) => `${n} photos — tap to see the next`,

    viewSeason: 'Seasons',
    viewDistrict: 'Neighborhoods',
    exploreNowLabel: 'Where you can go now',
    exploreTitle: 'A different Seoul in every neighborhood',
    tapDistrictHint: 'Tap a district to see its places',
    mapDisclaimerStart: 'Bold districts ',
    mapDisclaimerBold: 'have places to visit now',
    mapDisclaimerEnd: '; faded ones are still being added.',
    noPlacesInDistrictMessage: (gu) => `${gu} hasn't been researched yet.`,
    flowerBloomDisclaimer:
      "Bloom dates (cherry blossoms, etc.) shift every year with the weather, so no fixed date can be given. They generally fall between March and May — check the official Seoul city or district channels for real-time bloom updates before you go.",
    mapAppNote: "If the map app doesn't open directly, try searching the name yourself.",
    backToMap: 'Pick another district',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver Map',
    seasonTitleAnd: 'and Seoul',
    seasonNames: { spring: 'Spring', summer: 'Summer', autumn: 'Fall', winter: 'Winter' },
    seasonSubtitle: (season, month, count) => `${season} · ${count} festival${count === 1 ? '' : 's'} in ${month}`,
    themeAll: 'All',
    themeLabels: { nature: 'Flowers & nature', light: 'Lights & fireworks', music: 'Music & dance', food: 'Food & drink', history: 'History & tradition', street: 'Streets & neighborhoods' },
    monthPeriod: (month, period) => `${period === 'early' ? 'Early' : period === 'mid' ? 'Mid' : 'Late'} ${month}`,
    festivalDateDisclaimer: 'Dates shift a little every year. Tap a name for the district office’s official notice.',
    festivalMonthVaries: (m) => `Held in one of ${m}, and which one changes each year — tap the name for this year's dates.`,
    festivalBloomVaries: 'Dates shift with the bloom each year — tap the name for this year\'s schedule.',
    festivalCheckDates: 'Check dates',
    festivalNoPhoto: 'No photo — we don’t have the image rights. Tap the name for the official page.',
    showToDriver: '🇰🇷 Show to driver',
    driverCardHint: 'Show this screen to your taxi driver — it is written in Korean.',
    driverCardClose: 'Close',
    myLocationFind: '📍 My location',
    myLocationHere: (gu) => `You're in ${gu}`,
    myLocationOutside: "You're outside Seoul",
    myLocationFailed: 'Could not find your location. Tap to try again.',
    myLocationNoPermission: 'Location access is off. Allow location in your browser, then tap again.',
    myLocationMapProblem: 'Our map service is having trouble. We’re fixing it.',
    mapLocating: 'Locating…',

    categoryLabels: {
      market: 'Markets',
      flower: 'Flower paths',
      walk: 'Walking trails',
      walkFlower: 'Walks & flowers',
      hike: 'Hiking routes',
      museum: 'Museums',
      festival: 'Festivals',
      street: 'Alleys & streets',
    },

    months: {
      1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
      7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December',
    },

    feelsLike: 'Feels like',
    weatherUpdatedAt: 'Updated',
  },

  ja: {
    themeSwitchLabel: 'テーマの切り替え',
    searchLabel: '検索（近日公開）',
    notificationLabel: '通知（近日公開）',
    homeTab: 'ホーム',
    calendarTab: 'カレンダー',
    savedPlacesTab: '保存済み',
    saveLabel: '保存する',
    unsaveLabel: '保存を解除',
    savedEmptyTitle: 'まだ保存した場所がありません',
    savedEmptyBody: '気になる場所の 🤍 を押すと、ここに集まります。',
    savedOnThisPhone: '保存した場所はこの端末にのみ残ります。',
    freeNoSignup: 'ずっと無料 · 登録不要',
    installTitle: 'アプリのように使う',
    installBody: 'ホーム画面に追加すると、オフラインでも開けます。',
    installBodyIos: '共有ボタン →「ホーム画面に追加」',
    installAction: 'インストール',
    installDismiss: '閉じる',
    settingsTab: '設定',

    monthlyEditorLabel: 'この月の編集',
    monthlyTitle: (month) => `${getMonthName('ja', month)}で見逃せないもの`,
    noFestivalsMessage: (month) =>
      `このセッションの調査では${getMonthName('ja', month)}に確認されたフェスティバルはありません。ただし、まだ記録していないイベントがある可能性があります。`,
    photoCredit: '写真：韓国観光公社',
    morePhotos: (n: number) => `写真${n}枚 — タップで次へ`,

    viewSeason: '季節',
    viewDistrict: '街めぐり',
    exploreNowLabel: '今行ける場所',
    exploreTitle: '街ごとに違うソウル',
    tapDistrictHint: '区をタップすると、その街の場所が出てきます',
    mapDisclaimerStart: '濃い色は',
    mapDisclaimerBold: '今行ける場所がある区',
    mapDisclaimerEnd: '、薄い色はまだ準備中の区です。',
    noPlacesInDistrictMessage: (gu) => `${gu}はまだ調査していません。`,
    flowerBloomDisclaimer:
      '桜などの開花時期はその年の天気によって毎年変わるため、特定の日付を決められません。だいたい3〜5月の間なので、訪れる前にソウル市・区の公式チャンネルでリアルタイムの開花情報を確認してください。',
    mapAppNote: '地図アプリがすぐに開かない場合は、名前でもう一度検索してみてください。',
    backToMap: '別の地域を選ぶ',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'NAVER Map',
    seasonTitleAnd: 'そしてソウル',
    seasonNames: { spring: '春', summer: '夏', autumn: '秋', winter: '冬' },
    seasonSubtitle: (season, month, count) => `${season} · ${month}に開かれる祭り ${count}件`,
    themeAll: 'すべて',
    themeLabels: { nature: '花・自然', light: '光・花火', music: '音楽・踊り', food: 'グルメ', history: '歴史・伝統', street: '街・通り' },
    monthPeriod: (month, period) => `${month}${period === 'early' ? '上旬' : period === 'mid' ? '中旬' : '下旬'}`,
    festivalDateDisclaimer: '日程は毎年少しずつ変わります。名前をタップすると区役所の公式案内が開きます。',
    festivalMonthVaries: (m) => `毎年 ${m} のいずれか1か月に開催されます。今年の日程は名前をタップしてご確認ください。`,
    festivalBloomVaries: '開花時期によって日程が変わります。名前をタップして今年の日程をご確認ください。',
    festivalCheckDates: '日程を確認',
    festivalNoPhoto: '写真は使用許諾がないため掲載していません。名前をタップすると公式案内に移動します。',
    showToDriver: '🇰🇷 運転手に見せる',
    driverCardHint: 'この画面をタクシーの運転手に見せてください。韓国語で書かれています。',
    driverCardClose: '閉じる',
    myLocationFind: '📍 現在地',
    myLocationHere: (gu) => `いま ${gu} にいます`,
    myLocationOutside: 'ソウルの外にいます',
    myLocationFailed: '現在地を取得できませんでした。もう一度押してください。',
    myLocationNoPermission: '位置情報が許可されていません。ブラウザで位置情報を許可してから、もう一度タップしてください。',
    myLocationMapProblem: '地図サービスに問題が発生しています。まもなく修正します。',
    mapLocating: '現在地を確認中…',

    categoryLabels: {
      market: '市場',
      flower: '花の小道',
      walk: '散歩道',
      walkFlower: '散歩道・花の小道',
      hike: 'ハイキングコース',
      museum: '博物館',
      festival: 'フェスティバル',
      street: '路地・通り',
    },

    months: {
      1: '1月', 2: '2月', 3: '3月', 4: '4月', 5: '5月', 6: '6月',
      7: '7月', 8: '8月', 9: '9月', 10: '10月', 11: '11月', 12: '12月',
    },

    feelsLike: '体感温度',
    weatherUpdatedAt: '更新時刻',
  },

  zh: {
    themeSwitchLabel: '切换主题',
    searchLabel: '搜索（即将推出）',
    notificationLabel: '通知（即将推出）',
    homeTab: '首页',
    calendarTab: '日历',
    savedPlacesTab: '已保存',
    saveLabel: '收藏',
    unsaveLabel: '取消收藏',
    savedEmptyTitle: '还没有收藏的地方',
    savedEmptyBody: '点一下喜欢的地方的 🤍，就会出现在这里。',
    savedOnThisPhone: '收藏内容仅保存在本设备上。',
    freeNoSignup: '永久免费 · 无需注册',
    installTitle: '像应用一样使用',
    installBody: '添加到主屏幕后，没有网络也能打开。',
    installBodyIos: '分享按钮 →「添加到主屏幕」',
    installAction: '安装',
    installDismiss: '关闭',
    settingsTab: '设置',

    monthlyEditorLabel: '本月精选',
    monthlyTitle: (month) => `${getMonthName('zh', month)}不容错过的`,
    noFestivalsMessage: (month) =>
      `本次调查中未发现${getMonthName('zh', month)}的节庆活动 — 但可能还有我们尚未记录的活动。`,
    photoCredit: '照片：韩国旅游组织',
    morePhotos: (n: number) => `照片 ${n} 张 — 点击查看下一张`,

    viewSeason: '季节',
    viewDistrict: '街区',
    exploreNowLabel: '现在可以去的地方',
    exploreTitle: '每个街区都不一样的首尔',
    tapDistrictHint: '点击一个区，即可查看该区的地点',
    mapDisclaimerStart: '深色表示',
    mapDisclaimerBold: '现在就能去的区',
    mapDisclaimerEnd: '，浅色表示还在整理中的区。',
    noPlacesInDistrictMessage: (gu) => `${gu}尚未调查。`,
    flowerBloomDisclaimer:
      '樱花等开花时间会因当年天气而每年不同，无法提前确定具体日期。大致在3~5月之间，出发前请通过首尔市·区厅官方渠道确认实时花讯。',
    mapAppNote: '如果地图App没有直接打开，请尝试用名称重新搜索。',
    backToMap: '选择其他区',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver地图',
    seasonTitleAnd: '和首尔',
    seasonNames: { spring: '春', summer: '夏', autumn: '秋', winter: '冬' },
    seasonSubtitle: (season, month, count) => `${season} · ${month}举办的庆典 ${count}个`,
    themeAll: '全部',
    themeLabels: { nature: '花与自然', light: '灯光与烟花', music: '音乐与舞蹈', food: '美食', history: '历史与传统', street: '街区' },
    monthPeriod: (month, period) => `${month}${period === 'early' ? '上旬' : period === 'mid' ? '中旬' : '下旬'}`,
    festivalDateDisclaimer: '日期每年略有变动。点击名称可查看区厅的官方公告。',
    festivalMonthVaries: (m) => `每年在 ${m} 中的某一个月举办，具体月份逐年不同 — 点击名称查看今年日期。`,
    festivalBloomVaries: '日期随开花时间每年变动 — 点击名称查看今年日程。',
    festivalCheckDates: '查看日期',
    festivalNoPhoto: '因图片使用权未获授权，暂不提供照片。点击名称可前往官方介绍页。',
    showToDriver: '🇰🇷 给司机看',
    driverCardHint: '请把这个画面给出租车司机看，上面是韩语。',
    driverCardClose: '关闭',
    myLocationFind: '📍 我的位置',
    myLocationHere: (gu) => `您现在在${gu}`,
    myLocationOutside: '您在首尔以外',
    myLocationFailed: '无法获取位置，请再点一次。',
    myLocationNoPermission: '定位权限已关闭。请在浏览器中允许定位后再次点击。',
    myLocationMapProblem: '地图服务出现问题，我们会尽快修复。',
    mapLocating: '正在定位…',

    categoryLabels: {
      market: '市场',
      flower: '花路',
      walk: '散步路线',
      walkFlower: '散步路线与花路',
      hike: '登山路线',
      museum: '博物馆',
      festival: '节庆',
      street: '小巷·街道',
    },

    months: {
      1: '1月', 2: '2月', 3: '3月', 4: '4月', 5: '5月', 6: '6月',
      7: '7月', 8: '8月', 9: '9月', 10: '10月', 11: '11月', 12: '12月',
    },

    feelsLike: '体感温度',
    weatherUpdatedAt: '更新时间',
  },

  'zh-TW': {
    themeSwitchLabel: '切換主題',
    searchLabel: '搜尋（即將推出）',
    notificationLabel: '通知（即將推出）',
    homeTab: '首頁',
    calendarTab: '日曆',
    savedPlacesTab: '已儲存',
    saveLabel: '收藏',
    unsaveLabel: '取消收藏',
    savedEmptyTitle: '還沒有收藏的地方',
    savedEmptyBody: '點一下喜歡的地方的 🤍，就會出現在這裡。',
    savedOnThisPhone: '收藏內容僅保存在本裝置上。',
    freeNoSignup: '永久免費 · 無需註冊',
    installTitle: '像應用程式一樣使用',
    installBody: '加到主畫面後，沒有網路也能開啟。',
    installBodyIos: '分享按鈕 →「加入主畫面」',
    installAction: '安裝',
    installDismiss: '關閉',
    settingsTab: '設定',

    monthlyEditorLabel: '本月精選',
    monthlyTitle: (month) => `${getMonthName('zh-TW', month)}不容錯過的`,
    noFestivalsMessage: (month) =>
      `本次調查中未發現${getMonthName('zh-TW', month)}的節慶活動 — 但可能還有我們尚未記錄的活動。`,
    photoCredit: '照片：韓國觀光公社',
    morePhotos: (n: number) => `照片 ${n} 張 — 點擊查看下一張`,

    viewSeason: '季節',
    viewDistrict: '街區',
    exploreNowLabel: '現在可以去的地方',
    exploreTitle: '每個街區都不一樣的首爾',
    tapDistrictHint: '點擊一個區，即可查看該區的地點',
    mapDisclaimerStart: '深色表示',
    mapDisclaimerBold: '現在就能去的區',
    mapDisclaimerEnd: '，淺色表示還在整理中的區。',
    noPlacesInDistrictMessage: (gu) => `${gu}尚未調查。`,
    flowerBloomDisclaimer:
      '櫻花等開花時間會因當年天氣而每年不同，無法提前確定具體日期。大致在3~5月之間，出發前請透過首爾市·區廳官方管道確認即時花訊。',
    mapAppNote: '如果地圖App沒有直接開啟，請嘗試用名稱重新搜尋。',
    backToMap: '選擇其他區',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver地圖',
    seasonTitleAnd: '和首爾',
    seasonNames: { spring: '春', summer: '夏', autumn: '秋', winter: '冬' },
    seasonSubtitle: (season, month, count) => `${season} · ${month}舉辦的慶典 ${count}個`,
    themeAll: '全部',
    themeLabels: { nature: '花與自然', light: '燈光與煙火', music: '音樂與舞蹈', food: '美食', history: '歷史與傳統', street: '街區' },
    monthPeriod: (month, period) => `${month}${period === 'early' ? '上旬' : period === 'mid' ? '中旬' : '下旬'}`,
    festivalDateDisclaimer: '日期每年略有變動。點擊名稱可查看區廳的官方公告。',
    festivalMonthVaries: (m) => `每年在 ${m} 其中一個月舉辦，實際月份逐年不同 — 點擊名稱查看今年日期。`,
    festivalBloomVaries: '日期隨開花時間逐年變動 — 點擊名稱查看今年日程。',
    festivalCheckDates: '查看日期',
    festivalNoPhoto: '因圖片使用權未取得授權，暫不提供照片。點擊名稱可前往官方介紹頁。',
    showToDriver: '🇰🇷 給司機看',
    driverCardHint: '請把這個畫面給計程車司機看，上面是韓文。',
    driverCardClose: '關閉',
    myLocationFind: '📍 我的位置',
    myLocationHere: (gu) => `您現在在${gu}`,
    myLocationOutside: '您在首爾以外',
    myLocationFailed: '無法取得位置，請再點一次。',
    myLocationNoPermission: '定位權限已關閉。請在瀏覽器中允許定位後再次點擊。',
    myLocationMapProblem: '地圖服務發生問題，我們會盡快修復。',
    mapLocating: '正在定位…',

    categoryLabels: {
      market: '市場',
      flower: '花路',
      walk: '散步路線',
      walkFlower: '散步路線與花路',
      hike: '登山路線',
      museum: '博物館',
      festival: '節慶',
      street: '小巷‧街道',
    },

    months: {
      1: '1月', 2: '2月', 3: '3月', 4: '4月', 5: '5月', 6: '6月',
      7: '7月', 8: '8月', 9: '9月', 10: '10月', 11: '11月', 12: '12月',
    },

    feelsLike: '體感溫度',
    weatherUpdatedAt: '更新時間',
  },

  vi: {
    themeSwitchLabel: 'Chuyển đổi chủ đề',
    searchLabel: 'Tìm kiếm (sắp ra mắt)',
    notificationLabel: 'Thông báo (sắp ra mắt)',
    homeTab: 'Trang chủ',
    calendarTab: 'Lịch',
    savedPlacesTab: 'Đã lưu',
    saveLabel: 'Lưu',
    unsaveLabel: 'Bỏ lưu',
    savedEmptyTitle: 'Chưa lưu địa điểm nào',
    savedEmptyBody: 'Nhấn 🤍 ở địa điểm bạn thích, nó sẽ hiện ở đây.',
    savedOnThisPhone: 'Địa điểm đã lưu chỉ nằm trên thiết bị này.',
    freeNoSignup: 'Miễn phí mãi mãi · Không cần đăng ký',
    installTitle: 'Dùng như một ứng dụng',
    installBody: 'Thêm vào màn hình chính — mở được cả khi không có mạng.',
    installBodyIos: 'Nút chia sẻ → "Thêm vào MH chính"',
    installAction: 'Cài đặt',
    installDismiss: 'Đóng',
    settingsTab: 'Cài đặt',

    monthlyEditorLabel: 'Lựa chọn tháng này',
    monthlyTitle: (month) => `Điều không được bỏ lỡ trong tháng ${getMonthName('vi', month)}`,
    noFestivalsMessage: (month) =>
      `Không có lễ hội nào được xác nhận vào tháng ${getMonthName('vi', month)} trong phiên này — nhưng có thể có các sự kiện mà chúng tôi chưa ghi lại.`,
    photoCredit: 'Ảnh: Tổ chức Du lịch Hàn Quốc',
    morePhotos: (n: number) => `${n} ảnh — chạm để xem tiếp`,

    viewSeason: 'Mùa',
    viewDistrict: 'Khu phố',
    exploreNowLabel: 'Các địa điểm bạn có thể đến ngay',
    exploreTitle: 'Mỗi khu phố một Seoul khác',
    tapDistrictHint: 'Chạm vào một quận để xem các địa điểm ở đó',
    mapDisclaimerStart: 'Màu đậm là ',
    mapDisclaimerBold: 'quận đã có nơi để đi',
    mapDisclaimerEnd: ', màu nhạt là quận đang được cập nhật.',
    noPlacesInDistrictMessage: (gu) => `${gu} chưa được điều tra.`,
    flowerBloomDisclaimer:
      'Thời điểm hoa nở (như hoa anh đào) thay đổi mỗi năm tùy theo thời tiết, nên không thể ấn định ngày cụ thể trước. Thường rơi vào khoảng tháng 3-5, hãy kiểm tra thông tin nở hoa theo thời gian thực qua kênh chính thức của thành phố Seoul hoặc quận trước khi đến.',
    mapAppNote: 'Nếu ứng dụng bản đồ không mở trực tiếp, hãy thử tìm kiếm lại bằng tên.',
    backToMap: 'Chọn quận khác',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver Map',
    seasonTitleAnd: 'và Seoul',
    seasonNames: { spring: 'Xuân', summer: 'Hè', autumn: 'Thu', winter: 'Đông' },
    seasonSubtitle: (season, month, count) => `${season} · ${count} lễ hội trong ${month}`,
    themeAll: 'Tất cả',
    themeLabels: { nature: 'Hoa & thiên nhiên', light: 'Ánh sáng & pháo hoa', music: 'Âm nhạc & vũ điệu', food: 'Ẩm thực', history: 'Lịch sử & truyền thống', street: 'Phố & khu dân cư' },
    monthPeriod: (month, period) => `${period === 'early' ? 'Đầu' : period === 'mid' ? 'Giữa' : 'Cuối'} ${month}`,
    festivalDateDisclaimer: 'Ngày tổ chức thay đổi mỗi năm. Nhấn vào tên để xem thông báo chính thức của quận.',
    festivalMonthVaries: (m) => `Được tổ chức vào một trong các tháng ${m}, thay đổi theo từng năm — nhấn vào tên để xem ngày năm nay.`,
    festivalBloomVaries: 'Ngày tổ chức thay đổi theo mùa hoa nở — nhấn vào tên để xem lịch năm nay.',
    festivalCheckDates: 'Xem ngày',
    festivalNoPhoto: 'Không có ảnh vì chưa có bản quyền sử dụng. Nhấn vào tên để mở trang chính thức.',
    showToDriver: '🇰🇷 Cho tài xế xem',
    driverCardHint: 'Hãy đưa màn hình này cho tài xế taxi xem — nội dung bằng tiếng Hàn.',
    driverCardClose: 'Đóng',
    myLocationFind: '📍 Vị trí của tôi',
    myLocationHere: (gu) => `Bạn đang ở ${gu}`,
    myLocationOutside: 'Bạn đang ở ngoài Seoul',
    myLocationFailed: 'Không tìm được vị trí. Hãy nhấn lại.',
    myLocationNoPermission: 'Quyền truy cập vị trí đang tắt. Hãy bật trong trình duyệt rồi nhấn lại.',
    myLocationMapProblem: 'Dịch vụ bản đồ đang gặp sự cố. Chúng tôi sẽ khắc phục sớm.',
    mapLocating: 'Đang định vị…',

    categoryLabels: {
      market: 'Chợ',
      flower: 'Lối đi hoa',
      walk: 'Lối đi bộ',
      walkFlower: 'Đi dạo & hoa',
      hike: 'Tuyến leo núi',
      museum: 'Bảo tàng',
      festival: 'Lễ hội',
      street: 'Ngõ & phố',
    },

    months: {
      1: 'Tháng 1', 2: 'Tháng 2', 3: 'Tháng 3', 4: 'Tháng 4', 5: 'Tháng 5', 6: 'Tháng 6',
      7: 'Tháng 7', 8: 'Tháng 8', 9: 'Tháng 9', 10: 'Tháng 10', 11: 'Tháng 11', 12: 'Tháng 12',
    },

    feelsLike: 'Cảm thấy như',
    weatherUpdatedAt: 'Cập nhật',
  },

  es: {
    themeSwitchLabel: 'Cambiar tema',
    searchLabel: 'Buscar (próximamente)',
    notificationLabel: 'Notificaciones (próximamente)',
    homeTab: 'Inicio',
    calendarTab: 'Calendario',
    savedPlacesTab: 'Guardados',
    saveLabel: 'Guardar',
    unsaveLabel: 'Quitar de guardados',
    savedEmptyTitle: 'Aún no has guardado nada',
    savedEmptyBody: 'Toca 🤍 en cualquier lugar y aparecerá aquí.',
    savedOnThisPhone: 'Los lugares guardados solo quedan en este dispositivo.',
    freeNoSignup: 'Gratis para siempre · Sin registro',
    installTitle: 'Úsala como una app',
    installBody: 'Añádela a tu pantalla de inicio: abre incluso sin conexión.',
    installBodyIos: 'Botón compartir → "Añadir a inicio"',
    installAction: 'Instalar',
    installDismiss: 'Cerrar',
    settingsTab: 'Configuración',

    monthlyEditorLabel: 'Selecciones del mes',
    monthlyTitle: (month) => `No te pierdas en ${getMonthName('es', month)}`,
    noFestivalsMessage: (month) =>
      `No hay festivales confirmados en ${getMonthName('es', month)} en esta sesión — pero puede haber eventos que aún no hemos documentado.`,
    photoCredit: 'Foto: Organización de Turismo de Corea',
    morePhotos: (n: number) => `${n} fotos — toca para ver la siguiente`,

    viewSeason: 'Temporadas',
    viewDistrict: 'Barrios',
    exploreNowLabel: 'Lugares donde puedes ir ahora',
    exploreTitle: 'Un Seúl distinto en cada barrio',
    tapDistrictHint: 'Toca un distrito para ver sus lugares',
    mapDisclaimerStart: 'Los distritos en color ',
    mapDisclaimerBold: 'ya tienen lugares que visitar',
    mapDisclaimerEnd: '; los más claros aún están en preparación.',
    noPlacesInDistrictMessage: (gu) => `${gu} aún no ha sido investigado.`,
    flowerBloomDisclaimer:
      'Las fechas de floración (como los cerezos) cambian cada año según el clima, por lo que no se puede fijar una fecha exacta. Suele ser entre marzo y mayo — consulta los canales oficiales de la ciudad de Seúl o del distrito para conocer el estado de floración en tiempo real antes de ir.',
    mapAppNote: 'Si la app de mapas no se abre directamente, prueba a buscar el nombre tú mismo.',
    backToMap: 'Elegir otro distrito',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver Map',
    seasonTitleAnd: 'y Seúl',
    seasonNames: { spring: 'Primavera', summer: 'Verano', autumn: 'Otoño', winter: 'Invierno' },
    seasonSubtitle: (season, month, count) => `${season} · ${count} festival${count === 1 ? '' : 'es'} en ${month}`,
    themeAll: 'Todos',
    themeLabels: { nature: 'Flores y naturaleza', light: 'Luces y fuegos artificiales', music: 'Música y danza', food: 'Gastronomía', history: 'Historia y tradición', street: 'Calles y barrios' },
    monthPeriod: (month, period) => `${period === 'early' ? 'Principios' : period === 'mid' ? 'Mediados' : 'Finales'} de ${month}`,
    festivalDateDisclaimer: 'Las fechas cambian cada año. Toca un nombre para ver el aviso oficial del distrito.',
    festivalMonthVaries: (m) => `Se celebra en uno de estos meses (${m}) y cambia cada año: toca el nombre para ver las fechas de este año.`,
    festivalBloomVaries: 'Las fechas cambian con la floración cada año: toca el nombre para ver el calendario de este año.',
    festivalCheckDates: 'Ver fechas',
    festivalNoPhoto: 'Sin foto: no tenemos los derechos de imagen. Toca el nombre para ver la página oficial.',
    showToDriver: '🇰🇷 Mostrar al taxista',
    driverCardHint: 'Muestra esta pantalla al taxista: está escrita en coreano.',
    driverCardClose: 'Cerrar',
    myLocationFind: '📍 Mi ubicación',
    myLocationHere: (gu) => `Estás en ${gu}`,
    myLocationOutside: 'Estás fuera de Seúl',
    myLocationFailed: 'No se pudo obtener tu ubicación. Toca para reintentar.',
    myLocationNoPermission: 'El acceso a la ubicación está desactivado. Actívalo en tu navegador y vuelve a tocar.',
    myLocationMapProblem: 'Nuestro servicio de mapas tiene problemas. Lo estamos solucionando.',
    mapLocating: 'Ubicando…',

    categoryLabels: {
      market: 'Mercados',
      flower: 'Caminos florales',
      walk: 'Rutas a pie',
      walkFlower: 'Paseos y flores',
      hike: 'Rutas de senderismo',
      museum: 'Museos',
      festival: 'Festivales',
      street: 'Callejones',
    },

    months: {
      1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
      7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre',
    },

    feelsLike: 'Sensación térmica',
    weatherUpdatedAt: 'Actualizado',
  },

  fr: {
    themeSwitchLabel: 'Changer de thème',
    searchLabel: 'Rechercher (bientôt)',
    notificationLabel: 'Notifications (bientôt)',
    homeTab: 'Accueil',
    calendarTab: 'Calendrier',
    savedPlacesTab: 'Enregistrés',
    saveLabel: 'Enregistrer',
    unsaveLabel: 'Retirer des enregistrés',
    savedEmptyTitle: 'Rien d\'enregistré pour l\'instant',
    savedEmptyBody: 'Touchez 🤍 sur un lieu et il apparaîtra ici.',
    savedOnThisPhone: 'Les lieux enregistrés restent sur cet appareil uniquement.',
    freeNoSignup: 'Gratuit à vie · Sans inscription',
    installTitle: 'Utilisez-la comme une appli',
    installBody: 'Ajoutez-la à l\'écran d\'accueil : elle s\'ouvre même hors ligne.',
    installBodyIos: 'Bouton partager → "Sur l\'écran d\'accueil"',
    installAction: 'Installer',
    installDismiss: 'Fermer',
    settingsTab: 'Paramètres',

    monthlyEditorLabel: 'Sélections du mois',
    monthlyTitle: (month) => `À ne pas manquer en ${getMonthName('fr', month)}`,
    noFestivalsMessage: (month) =>
      `Aucun festival confirmé en ${getMonthName('fr', month)} dans cette session — mais il peut y avoir des événements que nous n'avons pas encore documentés.`,
    photoCredit: 'Photo : Organisation du Tourisme de Corée',
    morePhotos: (n: number) => `${n} photos — appuyez pour la suivante`,

    viewSeason: 'Saisons',
    viewDistrict: 'Quartiers',
    exploreNowLabel: 'Où vous pouvez aller maintenant',
    exploreTitle: 'Un Séoul différent dans chaque quartier',
    tapDistrictHint: 'Touchez un arrondissement pour voir ses lieux',
    mapDisclaimerStart: 'Les arrondissements colorés ',
    mapDisclaimerBold: 'ont déjà des lieux à visiter',
    mapDisclaimerEnd: ' ; les plus pâles sont encore en préparation.',
    noPlacesInDistrictMessage: (gu) => `${gu} n'a pas encore été enquêté.`,
    flowerBloomDisclaimer:
      "Les dates de floraison (cerisiers, etc.) changent chaque année selon la météo, il n'est donc pas possible de fixer une date précise. Cela se situe généralement entre mars et mai — consultez les canaux officiels de la ville de Séoul ou du district pour connaître l'état de la floraison en temps réel avant de vous y rendre.",
    mapAppNote: "Si l'application de carte ne s'ouvre pas directement, essayez de rechercher le nom vous-même.",
    backToMap: 'Choisir un autre quartier',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver Map',
    seasonTitleAnd: 'et Séoul',
    seasonNames: { spring: 'Printemps', summer: 'Été', autumn: 'Automne', winter: 'Hiver' },
    seasonSubtitle: (season, month, count) => `${season} · ${count} festival${count === 1 ? '' : 's'} en ${month}`,
    themeAll: 'Tous',
    themeLabels: { nature: 'Fleurs et nature', light: 'Lumières et feux d’artifice', music: 'Musique et danse', food: 'Gastronomie', history: 'Histoire et tradition', street: 'Rues et quartiers' },
    monthPeriod: (month, period) => `${period === 'early' ? 'Début' : period === 'mid' ? 'Mi-' : 'Fin'} ${month}`,
    festivalDateDisclaimer: 'Les dates changent chaque année. Touchez un nom pour l’annonce officielle de l’arrondissement.',
    festivalMonthVaries: (m) => `A lieu l'un de ces mois (${m}), et cela change chaque année — appuyez sur le nom pour les dates de cette année.`,
    festivalBloomVaries: 'Les dates changent avec la floraison chaque année — appuyez sur le nom pour le calendrier de cette année.',
    festivalCheckDates: 'Voir les dates',
    festivalNoPhoto: 'Pas de photo : nous n’avons pas les droits d’image. Appuyez sur le nom pour la page officielle.',
    showToDriver: '🇰🇷 Montrer au chauffeur',
    driverCardHint: 'Montrez cet écran au chauffeur de taxi : il est rédigé en coréen.',
    driverCardClose: 'Fermer',
    myLocationFind: '📍 Ma position',
    myLocationHere: (gu) => `Vous êtes à ${gu}`,
    myLocationOutside: 'Vous êtes hors de Séoul',
    myLocationFailed: 'Position introuvable. Appuyez pour réessayer.',
    myLocationNoPermission: 'L’accès à la position est désactivé. Autorisez-le dans votre navigateur, puis appuyez à nouveau.',
    myLocationMapProblem: 'Notre service de cartes rencontre un problème. Nous le corrigeons.',
    mapLocating: 'Localisation…',

    categoryLabels: {
      market: 'Marchés',
      flower: 'Chemins fleuris',
      walk: 'Sentiers pédestres',
      walkFlower: 'Balades et fleurs',
      hike: 'Sentiers de randonnée',
      museum: 'Musées',
      festival: 'Festivals',
      street: 'Ruelles',
    },

    months: {
      1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin',
      7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
    },

    feelsLike: 'Ressenti',
    weatherUpdatedAt: 'Mis à jour',
  },

  de: {
    themeSwitchLabel: 'Design wechseln',
    searchLabel: 'Suchen (in Kürze)',
    notificationLabel: 'Benachrichtigungen (in Kürze)',
    homeTab: 'Startseite',
    calendarTab: 'Kalender',
    savedPlacesTab: 'Gespeichert',
    saveLabel: 'Speichern',
    unsaveLabel: 'Aus Gespeichert entfernen',
    savedEmptyTitle: 'Noch nichts gespeichert',
    savedEmptyBody: 'Tippe bei einem Ort auf 🤍 – er erscheint dann hier.',
    savedOnThisPhone: 'Gespeicherte Orte bleiben nur auf diesem Gerät.',
    freeNoSignup: 'Für immer kostenlos · Ohne Anmeldung',
    installTitle: 'Wie eine App nutzen',
    installBody: 'Zum Startbildschirm hinzufügen – öffnet auch offline.',
    installBodyIos: 'Teilen-Button → "Zum Home-Bildschirm"',
    installAction: 'Installieren',
    installDismiss: 'Schließen',
    settingsTab: 'Einstellungen',

    monthlyEditorLabel: 'Auswahl des Monats',
    monthlyTitle: (month) => `Darf man im ${getMonthName('de', month)} nicht verpassen`,
    noFestivalsMessage: (month) =>
      `Keine Festivals im ${getMonthName('de', month)} in dieser Sitzung bestätigt — es kann aber Veranstaltungen geben, die wir noch nicht dokumentiert haben.`,
    photoCredit: 'Foto: Korea Tourism Organization',
    morePhotos: (n: number) => `${n} Fotos — zum Weiterblättern tippen`,

    viewSeason: 'Jahreszeiten',
    viewDistrict: 'Stadtviertel',
    exploreNowLabel: 'Orte, die Sie jetzt besuchen können',
    exploreTitle: 'In jedem Viertel ein anderes Seoul',
    tapDistrictHint: 'Tippen Sie auf einen Bezirk, um seine Orte zu sehen',
    mapDisclaimerStart: 'Farbige Bezirke ',
    mapDisclaimerBold: 'haben bereits Orte zu besuchen',
    mapDisclaimerEnd: '; blassere werden noch ergänzt.',
    noPlacesInDistrictMessage: (gu) => `${gu} wurde noch nicht untersucht.`,
    flowerBloomDisclaimer:
      'Die Blütezeiten (z. B. Kirschblüten) verschieben sich jedes Jahr je nach Wetter, daher kann kein festes Datum angegeben werden. Meist liegt sie zwischen März und Mai — bitte vor dem Besuch die offiziellen Kanäle der Stadt Seoul bzw. des Bezirks für aktuelle Blüteninformationen prüfen.',
    mapAppNote: 'Wenn die Karten-App nicht direkt öffnet, versuchen Sie, den Namen selbst zu suchen.',
    backToMap: 'Anderen Bezirk wählen',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver Map',
    seasonTitleAnd: 'und Seoul',
    seasonNames: { spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst', winter: 'Winter' },
    seasonSubtitle: (season, month, count) => `${season} · ${count} Feste im ${month}`,
    themeAll: 'Alle',
    themeLabels: { nature: 'Blüten & Natur', light: 'Lichter & Feuerwerk', music: 'Musik & Tanz', food: 'Essen & Trinken', history: 'Geschichte & Tradition', street: 'Straßen & Viertel' },
    monthPeriod: (month, period) => `${period === 'early' ? 'Anfang' : period === 'mid' ? 'Mitte' : 'Ende'} ${month}`,
    festivalDateDisclaimer: 'Die Termine ändern sich jedes Jahr. Tippen Sie auf einen Namen für die offizielle Ankündigung des Bezirks.',
    festivalMonthVaries: (m) => `Findet in einem dieser Monate statt (${m}) und wechselt jedes Jahr – tippen Sie auf den Namen für die diesjährigen Termine.`,
    festivalBloomVaries: 'Die Termine richten sich nach der Blüte und ändern sich jedes Jahr – tippen Sie auf den Namen für den diesjährigen Termin.',
    festivalCheckDates: 'Termine prüfen',
    festivalNoPhoto: 'Kein Foto – die Bildrechte liegen uns nicht vor. Tippen Sie auf den Namen für die offizielle Seite.',
    showToDriver: '🇰🇷 Dem Fahrer zeigen',
    driverCardHint: 'Zeigen Sie diesen Bildschirm dem Taxifahrer – er ist auf Koreanisch.',
    driverCardClose: 'Schließen',
    myLocationFind: '📍 Mein Standort',
    myLocationHere: (gu) => `Sie sind in ${gu}`,
    myLocationOutside: 'Sie sind außerhalb von Seoul',
    myLocationFailed: 'Standort nicht gefunden. Zum Wiederholen tippen.',
    myLocationNoPermission: 'Der Standortzugriff ist deaktiviert. Erlauben Sie ihn im Browser und tippen Sie erneut.',
    myLocationMapProblem: 'Unser Kartendienst hat gerade ein Problem. Wir beheben es.',
    mapLocating: 'Standort…',

    categoryLabels: {
      market: 'Märkte',
      flower: 'Blumenwege',
      walk: 'Wanderwege',
      walkFlower: 'Spazier- & Blütenwege',
      hike: 'Wanderstrecken',
      museum: 'Museen',
      festival: 'Festivals',
      street: 'Gassen',
    },

    months: {
      1: 'Januar', 2: 'Februar', 3: 'März', 4: 'April', 5: 'Mai', 6: 'Juni',
      7: 'Juli', 8: 'August', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Dezember',
    },

    feelsLike: 'Gefühlte Temperatur',
    weatherUpdatedAt: 'Aktualisiert',
  },

  ru: {
    themeSwitchLabel: 'Изменить тему',
    searchLabel: 'Поиск (скоро)',
    notificationLabel: 'Уведомления (скоро)',
    homeTab: 'Главная',
    calendarTab: 'Календарь',
    savedPlacesTab: 'Сохраненные',
    saveLabel: 'Сохранить',
    unsaveLabel: 'Убрать из сохранённых',
    savedEmptyTitle: 'Пока ничего не сохранено',
    savedEmptyBody: 'Нажмите 🤍 у любого места — оно появится здесь.',
    savedOnThisPhone: 'Сохранённые места остаются только на этом устройстве.',
    freeNoSignup: 'Навсегда бесплатно · Без регистрации',
    installTitle: 'Пользуйтесь как приложением',
    installBody: 'Добавьте на главный экран — откроется даже без интернета.',
    installBodyIos: 'Кнопка «Поделиться» → «На экран «Домой»»',
    installAction: 'Установить',
    installDismiss: 'Закрыть',
    settingsTab: 'Настройки',

    monthlyEditorLabel: 'Выбор месяца',
    monthlyTitle: (month) => `Не пропустите в ${getMonthName('ru', month)}`,
    noFestivalsMessage: (month) =>
      `В этой сессии на ${getMonthName('ru', month)} не подтверждено никаких фестивалей — но могут быть события, которые мы еще не задокументировали.`,
    photoCredit: 'Фото: Организация туризма Кореи',
    morePhotos: (n: number) => `${n} фото — нажмите, чтобы посмотреть следующее`,

    viewSeason: 'Сезоны',
    viewDistrict: 'Районы',
    exploreNowLabel: 'Куда вы можете пойти сейчас',
    exploreTitle: 'В каждом районе — свой Сеул',
    tapDistrictHint: 'Нажмите на район, чтобы увидеть места',
    mapDisclaimerStart: 'Яркие районы ',
    mapDisclaimerBold: 'уже содержат места для посещения',
    mapDisclaimerEnd: '; бледные ещё готовятся.',
    noPlacesInDistrictMessage: (gu) => `${gu} еще не был исследован.`,
    flowerBloomDisclaimer:
      'Даты цветения (например, сакуры) каждый год меняются в зависимости от погоды, поэтому точную дату указать нельзя. Обычно это период с марта по май — перед посещением уточните актуальную информацию о цветении на официальных каналах города Сеул или округа.',
    mapAppNote: 'Если приложение карты не открывается напрямую, попробуйте найти название самостоятельно.',
    backToMap: 'Выбрать другой район',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver Map',
    seasonTitleAnd: 'и Сеул',
    seasonNames: { spring: 'Весна', summer: 'Лето', autumn: 'Осень', winter: 'Зима' },
    seasonSubtitle: (season, month, count) => `${season} · фестивалей в ${month}: ${count}`,
    themeAll: 'Все',
    themeLabels: { nature: 'Цветы и природа', light: 'Огни и фейерверки', music: 'Музыка и танцы', food: 'Еда и напитки', history: 'История и традиции', street: 'Улицы и кварталы' },
    monthPeriod: (month, period) => `${period === 'early' ? 'Начало' : period === 'mid' ? 'Середина' : 'Конец'} — ${month}`,
    festivalDateDisclaimer: 'Даты меняются каждый год. Нажмите на название, чтобы открыть официальное объявление района.',
    festivalMonthVaries: (m) => `Проводится в один из этих месяцев (${m}), и каждый год месяц разный — нажмите на название, чтобы узнать даты этого года.`,
    festivalBloomVaries: 'Даты меняются каждый год вместе с цветением — нажмите на название, чтобы узнать расписание этого года.',
    festivalCheckDates: 'Уточнить даты',
    festivalNoPhoto: 'Фото нет — у нас нет прав на изображение. Нажмите на название, чтобы открыть официальную страницу.',
    showToDriver: '🇰🇷 Показать водителю',
    driverCardHint: 'Покажите этот экран таксисту — текст написан по-корейски.',
    driverCardClose: 'Закрыть',
    myLocationFind: '📍 Моё местоположение',
    myLocationHere: (gu) => `Вы в районе ${gu}`,
    myLocationOutside: 'Вы за пределами Сеула',
    myLocationFailed: 'Не удалось определить местоположение. Нажмите ещё раз.',
    myLocationNoPermission: 'Доступ к геолокации выключен. Разрешите его в браузере и нажмите ещё раз.',
    myLocationMapProblem: 'Сервис карт временно не работает. Мы это исправляем.',
    mapLocating: 'Определение…',

    categoryLabels: {
      market: 'Рынки',
      flower: 'Цветочные дорожки',
      walk: 'Пешеходные маршруты',
      walkFlower: 'Прогулки и цветы',
      hike: 'Маршруты пеших прогулок',
      museum: 'Музеи',
      festival: 'Фестивали',
      street: 'Улочки',
    },

    months: {
      1: 'Январь', 2: 'Февраль', 3: 'Март', 4: 'Апрель', 5: 'Май', 6: 'Июнь',
      7: 'Июль', 8: 'Август', 9: 'Сентябрь', 10: 'Октябрь', 11: 'Ноябрь', 12: 'Декабрь',
    },

    feelsLike: 'Ощущается как',
    weatherUpdatedAt: 'Обновлено',
  },

  id: {
    themeSwitchLabel: 'Ganti tema',
    searchLabel: 'Cari (segera)',
    notificationLabel: 'Pemberitahuan (segera)',
    homeTab: 'Beranda',
    calendarTab: 'Kalender',
    savedPlacesTab: 'Disimpan',
    saveLabel: 'Simpan',
    unsaveLabel: 'Hapus dari simpanan',
    savedEmptyTitle: 'Belum ada yang disimpan',
    savedEmptyBody: 'Ketuk 🤍 pada tempat yang kamu suka, nanti muncul di sini.',
    savedOnThisPhone: 'Tempat yang disimpan hanya tersimpan di perangkat ini.',
    freeNoSignup: 'Gratis selamanya · Tanpa daftar',
    installTitle: 'Pakai seperti aplikasi',
    installBody: 'Tambahkan ke layar utama — bisa dibuka walau offline.',
    installBodyIos: 'Tombol bagikan → "Tambah ke Layar Utama"',
    installAction: 'Pasang',
    installDismiss: 'Tutup',
    settingsTab: 'Pengaturan',

    monthlyEditorLabel: 'Pilihan bulan ini',
    monthlyTitle: (month) => `Jangan lewatkan di ${getMonthName('id', month)}`,
    noFestivalsMessage: (month) =>
      `Tidak ada festival yang dikonfirmasi pada ${getMonthName('id', month)} dalam sesi ini — tetapi mungkin ada acara yang belum kami dokumentasikan.`,
    photoCredit: 'Foto: Organisasi Pariwisata Korea',
    morePhotos: (n: number) => `${n} foto — ketuk untuk berikutnya`,

    viewSeason: 'Musim',
    viewDistrict: 'Lingkungan',
    exploreNowLabel: 'Tempat yang bisa Anda kunjungi sekarang',
    exploreTitle: 'Seoul yang berbeda di tiap lingkungan',
    tapDistrictHint: 'Ketuk sebuah distrik untuk melihat tempatnya',
    mapDisclaimerStart: 'Distrik berwarna ',
    mapDisclaimerBold: 'sudah punya tempat untuk dikunjungi',
    mapDisclaimerEnd: '; yang pudar masih disiapkan.',
    noPlacesInDistrictMessage: (gu) => `${gu} belum diteliti.`,
    flowerBloomDisclaimer:
      'Tanggal mekar (seperti bunga sakura) berubah setiap tahun tergantung cuaca, jadi tanggal pastinya tidak bisa ditentukan. Biasanya terjadi antara Maret-Mei — periksa kabar mekar terkini melalui kanal resmi Kota Seoul atau distrik sebelum berkunjung.',
    mapAppNote: 'Jika aplikasi peta tidak langsung terbuka, coba cari namanya sendiri.',
    backToMap: 'Pilih distrik lain',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver Map',
    seasonTitleAnd: 'dan Seoul',
    seasonNames: { spring: 'Musim Semi', summer: 'Musim Panas', autumn: 'Musim Gugur', winter: 'Musim Dingin' },
    seasonSubtitle: (season, month, count) => `${season} · ${count} festival pada ${month}`,
    themeAll: 'Semua',
    themeLabels: { nature: 'Bunga & alam', light: 'Cahaya & kembang api', music: 'Musik & tari', food: 'Kuliner', history: 'Sejarah & tradisi', street: 'Jalan & kampung' },
    monthPeriod: (month, period) => `${period === 'early' ? 'Awal' : period === 'mid' ? 'Pertengahan' : 'Akhir'} ${month}`,
    festivalDateDisclaimer: 'Tanggal berubah setiap tahun. Ketuk nama untuk melihat pengumuman resmi kantor distrik.',
    festivalMonthVaries: (m) => `Diadakan pada salah satu bulan ${m}, dan bulannya berubah tiap tahun — ketuk nama untuk melihat tanggal tahun ini.`,
    festivalBloomVaries: 'Tanggalnya berubah mengikuti masa mekar tiap tahun — ketuk nama untuk melihat jadwal tahun ini.',
    festivalCheckDates: 'Cek tanggal',
    festivalNoPhoto: 'Tidak ada foto karena hak gambar belum diperoleh. Ketuk nama untuk membuka halaman resmi.',
    showToDriver: '🇰🇷 Tunjukkan ke sopir',
    driverCardHint: 'Tunjukkan layar ini kepada sopir taksi — tulisannya dalam bahasa Korea.',
    driverCardClose: 'Tutup',
    myLocationFind: '📍 Lokasi saya',
    myLocationHere: (gu) => `Anda di ${gu}`,
    myLocationOutside: 'Anda di luar Seoul',
    myLocationFailed: 'Lokasi tidak ditemukan. Ketuk untuk mencoba lagi.',
    myLocationNoPermission: 'Akses lokasi mati. Izinkan akses lokasi di browser, lalu ketuk lagi.',
    myLocationMapProblem: 'Layanan peta sedang bermasalah. Kami sedang memperbaikinya.',
    mapLocating: 'Mencari lokasi…',

    categoryLabels: {
      market: 'Pasar',
      flower: 'Jalur bunga',
      walk: 'Jalur jalan',
      walkFlower: 'Jalan santai & bunga',
      hike: 'Rute pendakian',
      museum: 'Museum',
      festival: 'Festival',
      street: 'Gang & jalan',
    },

    months: {
      1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April', 5: 'Mei', 6: 'Juni',
      7: 'Juli', 8: 'Agustus', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
    },

    feelsLike: 'Terasa seperti',
    weatherUpdatedAt: 'Diperbarui',
  },

  th: {
    themeSwitchLabel: 'เปลี่ยนธีม',
    searchLabel: 'ค้นหา (เร็วๆ นี้)',
    notificationLabel: 'การแจ้งเตือน (เร็วๆ นี้)',
    homeTab: 'หน้าแรก',
    calendarTab: 'ปฏิทิน',
    savedPlacesTab: 'บันทึก',
    saveLabel: 'บันทึก',
    unsaveLabel: 'เอาออกจากที่บันทึก',
    savedEmptyTitle: 'ยังไม่มีที่บันทึกไว้',
    savedEmptyBody: 'แตะ 🤍 ที่สถานที่ที่ชอบ แล้วจะมาอยู่ตรงนี้',
    savedOnThisPhone: 'ที่บันทึกไว้จะอยู่บนเครื่องนี้เท่านั้น',
    freeNoSignup: 'ฟรีตลอดไป · ไม่ต้องสมัคร',
    installTitle: 'ใช้เหมือนแอป',
    installBody: 'เพิ่มลงหน้าจอหลัก เปิดได้แม้ไม่มีเน็ต',
    installBodyIos: 'ปุ่มแชร์ → "เพิ่มไปยังหน้าจอโฮม"',
    installAction: 'ติดตั้ง',
    installDismiss: 'ปิด',
    settingsTab: 'การตั้งค่า',

    monthlyEditorLabel: 'บรรณาธิการของเดือนนี้',
    monthlyTitle: (month) => `สิ่งที่ต้องไม่พลาดในเดือน${getMonthName('th', month)}`,
    noFestivalsMessage: (month) =>
      `ไม่มีเทศกาลที่ยืนยันสำหรับเดือน${getMonthName('th', month)}ในเซสชันนี้ — แต่อาจมีกิจกรรมที่เรายังไม่ได้บันทึก`,
    photoCredit: 'ภาพ: องค์การท่องเที่ยวเกาหลี',
    morePhotos: (n: number) => `${n} ภาพ — แตะเพื่อดูภาพถัดไป`,

    viewSeason: 'ฤดูกาล',
    viewDistrict: 'ย่าน',
    exploreNowLabel: 'สถานที่ที่คุณสามารถไปได้ตอนนี้',
    exploreTitle: 'โซลที่แตกต่างในทุกย่าน',
    tapDistrictHint: 'แตะเขตเพื่อดูสถานที่ในย่านนั้น',
    mapDisclaimerStart: 'สีเข้มคือ',
    mapDisclaimerBold: 'เขตที่มีที่ให้ไปแล้ว',
    mapDisclaimerEnd: ' ส่วนสีจางคือเขตที่ยังเตรียมอยู่',
    noPlacesInDistrictMessage: (gu) => `${gu}ยังไม่ได้รับการสอบสวน`,
    flowerBloomDisclaimer:
      'ช่วงเวลาดอกไม้บาน (เช่น ซากุระ) จะเปลี่ยนไปทุกปีตามสภาพอากาศ จึงไม่สามารถระบุวันที่แน่นอนล่วงหน้าได้ โดยทั่วไปจะอยู่ในช่วงเดือนมีนาคม-พฤษภาคม กรุณาตรวจสอบข่าวการบานของดอกไม้แบบเรียลไทม์จากช่องทางทางการของกรุงโซลหรือเขตก่อนไปเยือน',
    mapAppNote: 'หากแอปแผนที่ไม่เปิดโดยตรง โปรดลองค้นหาชื่อด้วยตัวเองอีกครั้ง',
    backToMap: 'เลือกเขตอื่น',
    kakaoMapLabel: 'KakaoMap',
    naverMapLabel: 'Naver Map',
    seasonTitleAnd: 'และโซล',
    seasonNames: { spring: 'ฤดูใบไม้ผลิ', summer: 'ฤดูร้อน', autumn: 'ฤดูใบไม้ร่วง', winter: 'ฤดูหนาว' },
    seasonSubtitle: (season, month, count) => `${season} · เทศกาลใน${month} ${count} งาน`,
    themeAll: 'ทั้งหมด',
    themeLabels: { nature: 'ดอกไม้และธรรมชาติ', light: 'แสงไฟและพลุ', music: 'ดนตรีและการเต้น', food: 'อาหาร', history: 'ประวัติศาสตร์และประเพณี', street: 'ย่านและถนน' },
    monthPeriod: (month, period) => `${period === 'early' ? 'ต้น' : period === 'mid' ? 'กลาง' : 'ปลาย'}${month}`,
    festivalDateDisclaimer: 'วันจัดงานเปลี่ยนแปลงทุกปี แตะที่ชื่อเพื่อดูประกาศอย่างเป็นทางการของเขต',
    festivalMonthVaries: (m) => `จัดขึ้นในเดือนใดเดือนหนึ่งของ ${m} ซึ่งเปลี่ยนไปในแต่ละปี — แตะที่ชื่อเพื่อดูวันที่ของปีนี้`,
    festivalBloomVaries: 'วันจัดงานเปลี่ยนไปตามช่วงดอกไม้บานในแต่ละปี — แตะที่ชื่อเพื่อดูกำหนดการปีนี้',
    festivalCheckDates: 'ดูวันที่',
    festivalNoPhoto: 'ไม่มีรูปภาพเนื่องจากยังไม่ได้รับสิทธิ์ใช้ภาพ แตะที่ชื่อเพื่อไปยังหน้าทางการ',
    showToDriver: '🇰🇷 แสดงให้คนขับดู',
    driverCardHint: 'แสดงหน้าจอนี้ให้คนขับแท็กซี่ดู ข้อความเป็นภาษาเกาหลี',
    driverCardClose: 'ปิด',
    myLocationFind: '📍 ตำแหน่งของฉัน',
    myLocationHere: (gu) => `คุณอยู่ใน ${gu}`,
    myLocationOutside: 'คุณอยู่นอกกรุงโซล',
    myLocationFailed: 'ไม่พบตำแหน่ง แตะเพื่อลองอีกครั้ง',
    myLocationNoPermission: 'สิทธิ์เข้าถึงตำแหน่งถูกปิดอยู่ กรุณาอนุญาตในเบราว์เซอร์แล้วแตะอีกครั้ง',
    myLocationMapProblem: 'บริการแผนที่ขัดข้อง เรากำลังแก้ไขอยู่',
    mapLocating: 'กำลังหาตำแหน่ง…',

    categoryLabels: {
      market: 'ตลาด',
      flower: 'ทางดอกไม้',
      walk: 'เส้นทางเดิน',
      walkFlower: 'เส้นทางเดินและดอกไม้',
      hike: 'เส้นทางเดินป่า',
      museum: 'พิพิธภัณฑ์',
      festival: 'เทศกาล',
      street: 'ตรอกและถนน',
    },

    months: {
      1: 'มกราคม', 2: 'กุมภาพันธ์', 3: 'มีนาคม', 4: 'เมษายน', 5: 'พฤษภาคม', 6: 'มิถุนายน',
      7: 'กรกฎาคม', 8: 'สิงหาคม', 9: 'กันยายน', 10: 'ตุลาคม', 11: 'พฤศจิกายน', 12: 'ธันวาคม',
    },

    feelsLike: 'อุณหภูมิที่รู้สึก',
    weatherUpdatedAt: 'อัปเดต',
  },
};

export function getTranslations(language: Language): Translations {
  return translations[language];
}

function getMonthName(language: Language, month: number): string {
  return translations[language].months[month] || month.toString();
}
