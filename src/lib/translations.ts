export type Language = 'ko' | 'en' | 'ja' | 'zh' | 'zh-TW' | 'vi' | 'es' | 'fr' | 'de' | 'ru' | 'id' | 'th';

export interface Translations {
  // Header & navigation
  themeSwitchLabel: string;
  searchLabel: string;
  notificationLabel: string;
  homeTab: string;
  calendarTab: string;
  savedPlacesTab: string;
  settingsTab: string;

  // Monthly Festival Panel
  monthlyEditorLabel: string;
  monthlyTitle: (month: number) => string;
  noFestivalsMessage: (month: number) => string;
  photoCredit: string;

  // District Explorer
  exploreNowLabel: string;
  exploreTitle: string;
  mapDisclaimerStart: string;
  mapDisclaimerBold: string;
  mapDisclaimerEnd: string;
  noPlacesInDistrictMessage: (gu: string) => string;
  flowerBloomDisclaimer: string;
  mapAppNote: string;

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
    settingsTab: '설정',

    monthlyEditorLabel: '이달의 편집',
    monthlyTitle: (month) => `${month}월에 놓치면 안 되는 것`,
    noFestivalsMessage: (month) =>
      `이번 세션 조사에서는 ${month}월에 확인된 축제가 없다 — 없는 게 아니라 아직 확인을 못 한 것일 수 있다.`,
    photoCredit: '사진: 한국관광공사',

    exploreNowLabel: '지금 갈 수 있는 곳',
    exploreTitle: '구를 골라 둘러보기',
    mapDisclaimerStart: '구를 누르면 그 동네의 장소가 나온다. 진한 색은 ',
    mapDisclaimerBold: '지금 볼 곳이 있는 구',
    mapDisclaimerEnd: ', 옅은 색은 아직 준비 중인 구다.',
    noPlacesInDistrictMessage: (gu) => `${gu}는 아직 확인 못했다.`,
    flowerBloomDisclaimer:
      '벚꽃 등 개화 시기는 그 해 날씨에 따라 매년 달라져 특정 날짜를 미리 정할 수 없다. 보통 3~5월 사이이니, 방문 전 서울시·구청 공식 채널에서 실시간 개화 소식을 확인할 것.',
    mapAppNote: '지도 앱이 바로 안 열리면, 이름으로 다시 검색해 보세요.',
    mapLocating: '위치 확인 중…',

    categoryLabels: {
      market: '시장',
      flower: '꽃길',
      walk: '산책길',
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
    settingsTab: 'Settings',

    monthlyEditorLabel: "This Month's Picks",
    monthlyTitle: (month) => `Must not miss in ${getMonthName('en', month)}`,
    noFestivalsMessage: (month) =>
      `No festivals confirmed for ${getMonthName('en', month)} in this session — but there may be events we haven't documented yet.`,
    photoCredit: 'Photo: Korea Tourism Organization',

    exploreNowLabel: 'Where you can go now',
    exploreTitle: 'Pick a district to explore',
    mapDisclaimerStart: 'Tap a district to see its places. Bold districts ',
    mapDisclaimerBold: 'have places to visit now',
    mapDisclaimerEnd: '; faded ones are still being added.',
    noPlacesInDistrictMessage: (gu) => `${gu} hasn't been researched yet.`,
    flowerBloomDisclaimer:
      "Bloom dates (cherry blossoms, etc.) shift every year with the weather, so no fixed date can be given. They generally fall between March and May — check the official Seoul city or district channels for real-time bloom updates before you go.",
    mapAppNote: "If the map app doesn't open directly, try searching the name yourself.",
    mapLocating: 'Locating…',

    categoryLabels: {
      market: 'Markets',
      flower: 'Flower paths',
      walk: 'Walking trails',
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
    settingsTab: '設定',

    monthlyEditorLabel: 'この月の編集',
    monthlyTitle: (month) => `${getMonthName('ja', month)}で見逃せないもの`,
    noFestivalsMessage: (month) =>
      `このセッションの調査では${getMonthName('ja', month)}に確認されたフェスティバルはありません。ただし、まだ記録していないイベントがある可能性があります。`,
    photoCredit: '写真：韓国観光公社',

    exploreNowLabel: '今行ける場所',
    exploreTitle: '地区を選んで探索',
    mapDisclaimerStart: '区をタップするとその街の場所が出てきます。濃い色は',
    mapDisclaimerBold: '今行ける場所がある区',
    mapDisclaimerEnd: '、薄い色はまだ準備中の区です。',
    noPlacesInDistrictMessage: (gu) => `${gu}はまだ調査していません。`,
    flowerBloomDisclaimer:
      '桜などの開花時期はその年の天気によって毎年変わるため、特定の日付を決められません。だいたい3〜5月の間なので、訪れる前にソウル市・区の公式チャンネルでリアルタイムの開花情報を確認してください。',
    mapAppNote: '地図アプリがすぐに開かない場合は、名前でもう一度検索してみてください。',
    mapLocating: '現在地を確認中…',

    categoryLabels: {
      market: '市場',
      flower: '花の小道',
      walk: '散歩道',
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
    settingsTab: '设置',

    monthlyEditorLabel: '本月精选',
    monthlyTitle: (month) => `${getMonthName('zh', month)}不容错过的`,
    noFestivalsMessage: (month) =>
      `本次调查中未发现${getMonthName('zh', month)}的节庆活动 — 但可能还有我们尚未记录的活动。`,
    photoCredit: '照片：韩国旅游组织',

    exploreNowLabel: '现在可以去的地方',
    exploreTitle: '选择地区浏览',
    mapDisclaimerStart: '点击区可查看该区域的地点。深色表示',
    mapDisclaimerBold: '现在就能去的区',
    mapDisclaimerEnd: '，浅色表示还在整理中的区。',
    noPlacesInDistrictMessage: (gu) => `${gu}尚未调查。`,
    flowerBloomDisclaimer:
      '樱花等开花时间会因当年天气而每年不同，无法提前确定具体日期。大致在3~5月之间，出发前请通过首尔市·区厅官方渠道确认实时花讯。',
    mapAppNote: '如果地图App没有直接打开，请尝试用名称重新搜索。',
    mapLocating: '正在定位…',

    categoryLabels: {
      market: '市场',
      flower: '花路',
      walk: '散步路线',
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
    settingsTab: '設定',

    monthlyEditorLabel: '本月精選',
    monthlyTitle: (month) => `${getMonthName('zh-TW', month)}不容錯過的`,
    noFestivalsMessage: (month) =>
      `本次調查中未發現${getMonthName('zh-TW', month)}的節慶活動 — 但可能還有我們尚未記錄的活動。`,
    photoCredit: '照片：韓國觀光公社',

    exploreNowLabel: '現在可以去的地方',
    exploreTitle: '選擇地區瀏覽',
    mapDisclaimerStart: '點擊區可查看該區域的地點。深色表示',
    mapDisclaimerBold: '現在就能去的區',
    mapDisclaimerEnd: '，淺色表示還在整理中的區。',
    noPlacesInDistrictMessage: (gu) => `${gu}尚未調查。`,
    flowerBloomDisclaimer:
      '櫻花等開花時間會因當年天氣而每年不同，無法提前確定具體日期。大致在3~5月之間，出發前請透過首爾市·區廳官方管道確認即時花訊。',
    mapAppNote: '如果地圖App沒有直接開啟，請嘗試用名稱重新搜尋。',
    mapLocating: '正在定位…',

    categoryLabels: {
      market: '市場',
      flower: '花路',
      walk: '散步路線',
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
    settingsTab: 'Cài đặt',

    monthlyEditorLabel: 'Lựa chọn tháng này',
    monthlyTitle: (month) => `Điều không được bỏ lỡ trong tháng ${getMonthName('vi', month)}`,
    noFestivalsMessage: (month) =>
      `Không có lễ hội nào được xác nhận vào tháng ${getMonthName('vi', month)} trong phiên này — nhưng có thể có các sự kiện mà chúng tôi chưa ghi lại.`,
    photoCredit: 'Ảnh: Tổ chức Du lịch Hàn Quốc',

    exploreNowLabel: 'Các địa điểm bạn có thể đến ngay',
    exploreTitle: 'Chọn một quận để khám phá',
    mapDisclaimerStart: 'Chạm vào một quận để xem các địa điểm. Màu đậm là ',
    mapDisclaimerBold: 'quận đã có nơi để đi',
    mapDisclaimerEnd: ', màu nhạt là quận đang được cập nhật.',
    noPlacesInDistrictMessage: (gu) => `${gu} chưa được điều tra.`,
    flowerBloomDisclaimer:
      'Thời điểm hoa nở (như hoa anh đào) thay đổi mỗi năm tùy theo thời tiết, nên không thể ấn định ngày cụ thể trước. Thường rơi vào khoảng tháng 3-5, hãy kiểm tra thông tin nở hoa theo thời gian thực qua kênh chính thức của thành phố Seoul hoặc quận trước khi đến.',
    mapAppNote: 'Nếu ứng dụng bản đồ không mở trực tiếp, hãy thử tìm kiếm lại bằng tên.',
    mapLocating: 'Đang định vị…',

    categoryLabels: {
      market: 'Chợ',
      flower: 'Lối đi hoa',
      walk: 'Lối đi bộ',
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
    settingsTab: 'Configuración',

    monthlyEditorLabel: 'Selecciones del mes',
    monthlyTitle: (month) => `No te pierdas en ${getMonthName('es', month)}`,
    noFestivalsMessage: (month) =>
      `No hay festivales confirmados en ${getMonthName('es', month)} en esta sesión — pero puede haber eventos que aún no hemos documentado.`,
    photoCredit: 'Foto: Organización de Turismo de Corea',

    exploreNowLabel: 'Lugares donde puedes ir ahora',
    exploreTitle: 'Elige un distrito para explorar',
    mapDisclaimerStart: 'Toca un distrito para ver sus lugares. Los distritos en color ',
    mapDisclaimerBold: 'ya tienen lugares que visitar',
    mapDisclaimerEnd: '; los más claros aún están en preparación.',
    noPlacesInDistrictMessage: (gu) => `${gu} aún no ha sido investigado.`,
    flowerBloomDisclaimer:
      'Las fechas de floración (como los cerezos) cambian cada año según el clima, por lo que no se puede fijar una fecha exacta. Suele ser entre marzo y mayo — consulta los canales oficiales de la ciudad de Seúl o del distrito para conocer el estado de floración en tiempo real antes de ir.',
    mapAppNote: 'Si la app de mapas no se abre directamente, prueba a buscar el nombre tú mismo.',
    mapLocating: 'Ubicando…',

    categoryLabels: {
      market: 'Mercados',
      flower: 'Caminos florales',
      walk: 'Rutas a pie',
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
    settingsTab: 'Paramètres',

    monthlyEditorLabel: 'Sélections du mois',
    monthlyTitle: (month) => `À ne pas manquer en ${getMonthName('fr', month)}`,
    noFestivalsMessage: (month) =>
      `Aucun festival confirmé en ${getMonthName('fr', month)} dans cette session — mais il peut y avoir des événements que nous n'avons pas encore documentés.`,
    photoCredit: 'Photo : Organisation du Tourisme de Corée',

    exploreNowLabel: 'Où vous pouvez aller maintenant',
    exploreTitle: 'Choisir un district pour explorer',
    mapDisclaimerStart: 'Touchez un arrondissement pour voir ses lieux. Les arrondissements colorés ',
    mapDisclaimerBold: 'ont déjà des lieux à visiter',
    mapDisclaimerEnd: ' ; les plus pâles sont encore en préparation.',
    noPlacesInDistrictMessage: (gu) => `${gu} n'a pas encore été enquêté.`,
    flowerBloomDisclaimer:
      "Les dates de floraison (cerisiers, etc.) changent chaque année selon la météo, il n'est donc pas possible de fixer une date précise. Cela se situe généralement entre mars et mai — consultez les canaux officiels de la ville de Séoul ou du district pour connaître l'état de la floraison en temps réel avant de vous y rendre.",
    mapAppNote: "Si l'application de carte ne s'ouvre pas directement, essayez de rechercher le nom vous-même.",
    mapLocating: 'Localisation…',

    categoryLabels: {
      market: 'Marchés',
      flower: 'Chemins fleuris',
      walk: 'Sentiers pédestres',
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
    settingsTab: 'Einstellungen',

    monthlyEditorLabel: 'Auswahl des Monats',
    monthlyTitle: (month) => `Darf man im ${getMonthName('de', month)} nicht verpassen`,
    noFestivalsMessage: (month) =>
      `Keine Festivals im ${getMonthName('de', month)} in dieser Sitzung bestätigt — es kann aber Veranstaltungen geben, die wir noch nicht dokumentiert haben.`,
    photoCredit: 'Foto: Korea Tourism Organization',

    exploreNowLabel: 'Orte, die Sie jetzt besuchen können',
    exploreTitle: 'Wählen Sie einen Bezirk zum Erkunden',
    mapDisclaimerStart: 'Tippen Sie auf einen Bezirk, um seine Orte zu sehen. Farbige Bezirke ',
    mapDisclaimerBold: 'haben bereits Orte zu besuchen',
    mapDisclaimerEnd: '; blassere werden noch ergänzt.',
    noPlacesInDistrictMessage: (gu) => `${gu} wurde noch nicht untersucht.`,
    flowerBloomDisclaimer:
      'Die Blütezeiten (z. B. Kirschblüten) verschieben sich jedes Jahr je nach Wetter, daher kann kein festes Datum angegeben werden. Meist liegt sie zwischen März und Mai — bitte vor dem Besuch die offiziellen Kanäle der Stadt Seoul bzw. des Bezirks für aktuelle Blüteninformationen prüfen.',
    mapAppNote: 'Wenn die Karten-App nicht direkt öffnet, versuchen Sie, den Namen selbst zu suchen.',
    mapLocating: 'Standort…',

    categoryLabels: {
      market: 'Märkte',
      flower: 'Blumenwege',
      walk: 'Wanderwege',
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
    settingsTab: 'Настройки',

    monthlyEditorLabel: 'Выбор месяца',
    monthlyTitle: (month) => `Не пропустите в ${getMonthName('ru', month)}`,
    noFestivalsMessage: (month) =>
      `В этой сессии на ${getMonthName('ru', month)} не подтверждено никаких фестивалей — но могут быть события, которые мы еще не задокументировали.`,
    photoCredit: 'Фото: Организация туризма Кореи',

    exploreNowLabel: 'Куда вы можете пойти сейчас',
    exploreTitle: 'Выберите округ для исследования',
    mapDisclaimerStart: 'Нажмите на район, чтобы увидеть места. Яркие районы ',
    mapDisclaimerBold: 'уже содержат места для посещения',
    mapDisclaimerEnd: '; бледные ещё готовятся.',
    noPlacesInDistrictMessage: (gu) => `${gu} еще не был исследован.`,
    flowerBloomDisclaimer:
      'Даты цветения (например, сакуры) каждый год меняются в зависимости от погоды, поэтому точную дату указать нельзя. Обычно это период с марта по май — перед посещением уточните актуальную информацию о цветении на официальных каналах города Сеул или округа.',
    mapAppNote: 'Если приложение карты не открывается напрямую, попробуйте найти название самостоятельно.',
    mapLocating: 'Определение…',

    categoryLabels: {
      market: 'Рынки',
      flower: 'Цветочные дорожки',
      walk: 'Пешеходные маршруты',
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
    settingsTab: 'Pengaturan',

    monthlyEditorLabel: 'Pilihan bulan ini',
    monthlyTitle: (month) => `Jangan lewatkan di ${getMonthName('id', month)}`,
    noFestivalsMessage: (month) =>
      `Tidak ada festival yang dikonfirmasi pada ${getMonthName('id', month)} dalam sesi ini — tetapi mungkin ada acara yang belum kami dokumentasikan.`,
    photoCredit: 'Foto: Organisasi Pariwisata Korea',

    exploreNowLabel: 'Tempat yang bisa Anda kunjungi sekarang',
    exploreTitle: 'Pilih distrik untuk dijelajahi',
    mapDisclaimerStart: 'Ketuk sebuah distrik untuk melihat tempatnya. Distrik berwarna ',
    mapDisclaimerBold: 'sudah punya tempat untuk dikunjungi',
    mapDisclaimerEnd: '; yang pudar masih disiapkan.',
    noPlacesInDistrictMessage: (gu) => `${gu} belum diteliti.`,
    flowerBloomDisclaimer:
      'Tanggal mekar (seperti bunga sakura) berubah setiap tahun tergantung cuaca, jadi tanggal pastinya tidak bisa ditentukan. Biasanya terjadi antara Maret-Mei — periksa kabar mekar terkini melalui kanal resmi Kota Seoul atau distrik sebelum berkunjung.',
    mapAppNote: 'Jika aplikasi peta tidak langsung terbuka, coba cari namanya sendiri.',
    mapLocating: 'Mencari lokasi…',

    categoryLabels: {
      market: 'Pasar',
      flower: 'Jalur bunga',
      walk: 'Jalur jalan',
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
    settingsTab: 'การตั้งค่า',

    monthlyEditorLabel: 'บรรณาธิการของเดือนนี้',
    monthlyTitle: (month) => `สิ่งที่ต้องไม่พลาดในเดือน${getMonthName('th', month)}`,
    noFestivalsMessage: (month) =>
      `ไม่มีเทศกาลที่ยืนยันสำหรับเดือน${getMonthName('th', month)}ในเซสชันนี้ — แต่อาจมีกิจกรรมที่เรายังไม่ได้บันทึก`,
    photoCredit: 'ภาพ: องค์การท่องเที่ยวเกาหลี',

    exploreNowLabel: 'สถานที่ที่คุณสามารถไปได้ตอนนี้',
    exploreTitle: 'เลือกเขตเพื่อสำรวจ',
    mapDisclaimerStart: 'แตะเขตเพื่อดูสถานที่ในย่านนั้น สีเข้มคือ',
    mapDisclaimerBold: 'เขตที่มีที่ให้ไปแล้ว',
    mapDisclaimerEnd: ' ส่วนสีจางคือเขตที่ยังเตรียมอยู่',
    noPlacesInDistrictMessage: (gu) => `${gu}ยังไม่ได้รับการสอบสวน`,
    flowerBloomDisclaimer:
      'ช่วงเวลาดอกไม้บาน (เช่น ซากุระ) จะเปลี่ยนไปทุกปีตามสภาพอากาศ จึงไม่สามารถระบุวันที่แน่นอนล่วงหน้าได้ โดยทั่วไปจะอยู่ในช่วงเดือนมีนาคม-พฤษภาคม กรุณาตรวจสอบข่าวการบานของดอกไม้แบบเรียลไทม์จากช่องทางทางการของกรุงโซลหรือเขตก่อนไปเยือน',
    mapAppNote: 'หากแอปแผนที่ไม่เปิดโดยตรง โปรดลองค้นหาชื่อด้วยตัวเองอีกครั้ง',
    mapLocating: 'กำลังหาตำแหน่ง…',

    categoryLabels: {
      market: 'ตลาด',
      flower: 'ทางดอกไม้',
      walk: 'เส้นทางเดิน',
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
