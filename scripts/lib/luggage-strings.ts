// 🧳 **짐 보관 안내에 들어가는 글** — 12개 언어.
//
// 왜 이런 모양인가 (2026-09-10, 사장님 지시 세 번에 걸쳐 좁혀졌다):
//   ① "간단한 안내만으로도 좋을거 같아"
//      → 보관소 목록·가격표·필터·관리자 화면을 **안 만든다.** 안내 한 장이다.
//   ② "결제나 그런거에 우리가 관여하여서는 안되 특히 사설 창고 같은경우"
//      → 예약·결제에 끼지 않는다. 제휴 추적코드도 없다.
//   ③ "사설 안내까지는 하고 안내문 넣어"
//      → 사설도 **적되**, 우리가 확인 안 했다는 것을 분명히 밝힌다.
//
// 🚨 **가격과 운영시간은 한 글자도 적지 않는다.**
//    이 저장소는 값으로 이미 크게 데었다(메뉴판 6장을 대조하니 6곳 중 5곳이 틀렸다).
//    짐 보관은 더 나쁘다 — 값이 틀린 식당은 다른 데 가면 되지만,
//    **닫힌 보관소 앞에 선 사람은 캐리어를 끌고 오도 가도 못한다.**
//    그래서 축제 날짜와 같은 잣대를 쓴다: 종류까지만 말하고, 확인은 현장·공식에서.
//
// 💡 대신 넣은 것이 **「맡기기 전에 물어볼 것」**이다. 우리가 모르는 사실을 지어내지
//    않으면서 외국인에게 실제로 쓸모 있는 유일한 방식이다. 특히 「몇 시까지 찾나」는
//    아무도 안 알려 주는데, 못 찾으면 짐 없이 비행기를 타야 한다.
import type { Language } from "../../src/lib/translations";

export interface LuggageStrings {
  title: string;
  h1: string;
  lead: string;
  desc: string;

  kindsHeading: string;
  lockerName: string;
  lockerDesc: string;
  centreName: string;
  centreDesc: string;
  bookedName: string;
  bookedDesc: string;

  checkHeading: string;
  check1: string;
  check2: string;
  check3: string;
  check4: string;

  noPrices: string;

  officialHeading: string;
  bookedHeading: string;
  /** 🚨 사설 서비스 아래 붙는 안내문. 이 글이 이 페이지에서 가장 중요하다. */
  bookedNotice: string;

  afterHeading: string;
  afterLead: string;
  lastChecked: string;
}

export const LUGGAGE_STRINGS: Record<Language, LuggageStrings> = {
  en: {
    title: "Luggage storage in Seoul — where to leave your bags | K-Street",
    h1: "Leaving your luggage in Seoul",
    lead: "Leave your luggage, then walk the neighbourhood. Here is how storage works in Seoul, and what to check before you hand your bags over.",
    desc: "How luggage storage works in Seoul: station lockers, tourist information centres and booked services — plus what to ask before you leave your bags.",
    kindsHeading: "Three ways",
    lockerName: "Coin lockers in subway stations",
    lockerDesc: "Most large stations have them. Spaces free up and fill through the day, so there may be none left when you arrive.",
    centreName: "Tourist information centres",
    centreDesc: "Some hold bags free of charge while you look around. Ask at the desk.",
    bookedName: "Booked storage services",
    bookedDesc: "Shops and offices that hold luggage, usually booked online beforehand. Useful for large bags, or early in the morning before check-in.",
    checkHeading: "Ask these before you leave your bags",
    check1: "Until what time can you collect it? Miss that and your bag stays overnight.",
    check2: "Will your suitcase actually fit?",
    check3: "Do they take cards, or cash only?",
    check4: "Do they need to see your passport?",
    noPrices: "We do not list prices or opening hours. They change, and a wrong number leaves you standing outside with a suitcase. Check on the spot, or on the official page.",
    officialHeading: "Official travel information",
    bookedHeading: "Booked services",
    bookedNotice: "These are private companies, not public facilities. We have not tried them. We cannot tell you whether staff speak English, which cards they take, or what happens if something goes wrong — ask them directly. Booking and payment are between you and the company. K-Street takes no commission and has no partnership with any of them.",
    afterHeading: "Bags stored? Go for a walk",
    afterLead: "Pick a district and start walking.",
    lastChecked: "Links last checked",
  },

  ko: {
    title: "서울에서 짐 맡기기 — 어디에 맡기나 | K-Street",
    h1: "서울에서 짐 맡기기",
    lead: "짐을 맡기고 동네를 걸어 보세요. 서울에서 짐을 맡기는 방법과, 맡기기 전에 확인할 것을 정리했습니다.",
    desc: "서울에서 짐 맡기는 방법 — 지하철 물품보관함, 관광안내소, 예약제 서비스. 그리고 맡기기 전에 물어볼 것.",
    kindsHeading: "세 가지 방법",
    lockerName: "지하철역 물품보관함",
    lockerDesc: "큰 역에는 대체로 있습니다. 하루 사이에도 찼다 비었다 하므로, 갔을 때 빈 칸이 없을 수 있습니다.",
    centreName: "관광안내소",
    centreDesc: "구경하는 동안 무료로 맡아 주는 곳이 있습니다. 창구에 물어보세요.",
    bookedName: "예약제 보관 서비스",
    bookedDesc: "짐을 맡아 주는 가게·사무실로, 보통 미리 예약합니다. 짐이 크거나, 체크인 전 이른 아침에 쓸 만합니다.",
    checkHeading: "맡기기 전에 이것만 물어보세요",
    check1: "몇 시까지 찾아야 하나요? 놓치면 짐이 하룻밤 거기 있습니다.",
    check2: "내 캐리어가 실제로 들어가나요?",
    check3: "카드가 되나요, 현금만 되나요?",
    check4: "여권을 보여 줘야 하나요?",
    noPrices: "가격과 운영시간은 적지 않습니다. 자주 바뀌고, 틀린 숫자는 캐리어를 끌고 문 앞에 서게 만듭니다. 현장이나 공식 안내에서 확인하세요.",
    officialHeading: "공식 관광 안내",
    bookedHeading: "예약제 서비스",
    bookedNotice: "여기는 공공시설이 아니라 사설 업체입니다. 저희가 직접 써 보지 않았습니다. 영어가 되는지, 어떤 카드를 받는지, 문제가 생기면 어떻게 되는지 저희는 알지 못합니다 — 업체에 직접 물어보세요. 예약과 결제는 손님과 업체 사이의 일입니다. K-Street은 수수료를 받지 않고 어느 업체와도 제휴하지 않습니다.",
    afterHeading: "짐을 맡겼다면, 걸어 보세요",
    afterLead: "구를 하나 골라 시작하세요.",
    lastChecked: "링크 확인일",
  },

  ja: {
    title: "ソウルで荷物を預ける — どこに預けるか | K-Street",
    h1: "ソウルで荷物を預ける",
    lead: "荷物を預けて、街を歩きましょう。ソウルでの荷物の預け方と、預ける前に確かめることをまとめました。",
    desc: "ソウルでの荷物の預け方 — 駅のコインロッカー、観光案内所、予約制サービス。そして預ける前に聞いておくこと。",
    kindsHeading: "三つの方法",
    lockerName: "地下鉄駅のコインロッカー",
    lockerDesc: "大きな駅にはたいていあります。一日のうちに空いたり埋まったりするので、着いたときに空きがないこともあります。",
    centreName: "観光案内所",
    centreDesc: "見て回る間、無料で預かってくれるところがあります。窓口で聞いてみてください。",
    bookedName: "予約制の荷物預かり",
    bookedDesc: "荷物を預かる店や事務所で、たいてい事前にネットで予約します。荷物が大きいとき、チェックイン前の早朝に便利です。",
    checkHeading: "預ける前に、これだけは聞いてください",
    check1: "何時までに受け取ればよいですか — 過ぎると荷物は翌日までそこに残ります。",
    check2: "自分のスーツケースが本当に入りますか。",
    check3: "カードは使えますか、現金のみですか。",
    check4: "パスポートの提示が必要ですか。",
    noPrices: "料金と営業時間は載せません。よく変わりますし、間違った数字はスーツケースを引いたまま扉の前に立たせることになります。現地か公式案内でご確認ください。",
    officialHeading: "公式の観光案内",
    bookedHeading: "予約制サービス",
    bookedNotice: "ここは公共施設ではなく民間の業者です。私たちは実際に利用していません。英語が通じるか、どのカードが使えるか、問題が起きたときどうなるかは分かりません — 業者に直接お尋ねください。予約と支払いはお客様と業者の間のことです。K-Street は手数料を受け取らず、どの業者とも提携していません。",
    afterHeading: "預けたら、歩きに出かけましょう",
    afterLead: "エリアを一つ選んで歩き出してください。",
    lastChecked: "リンク確認日",
  },

  zh: {
    title: "在首尔寄存行李 — 可以存在哪里 | K-Street",
    h1: "在首尔寄存行李",
    lead: "把行李放下，去街区走走。这里整理了首尔寄存行李的方式，以及寄存前该确认的事。",
    desc: "首尔寄存行李的方式 — 地铁站储物柜、旅游咨询中心、预约制服务，以及寄存前该问清楚的事。",
    kindsHeading: "三种方式",
    lockerName: "地铁站投币储物柜",
    lockerDesc: "大站基本都有。一天之内会有人存有人取，所以到的时候可能已经没有空柜。",
    centreName: "旅游咨询中心",
    centreDesc: "有些地方在您游览期间免费保管行李。可以到柜台询问。",
    bookedName: "预约制寄存服务",
    bookedDesc: "由店铺或办公室代为保管，通常需要提前在网上预约。行李较大、或入住前的清晨比较适用。",
    checkHeading: "寄存前，请务必问清这几件事",
    check1: "最晚几点前要取回？错过的话行李要留到第二天。",
    check2: "我的行李箱真的放得进去吗？",
    check3: "能刷卡吗，还是只收现金？",
    check4: "需要出示护照吗？",
    noPrices: "我们不列出价格和营业时间。这些经常变动，而错误的数字会让您拖着行李箱站在门外。请在现场或官方页面确认。",
    officialHeading: "官方旅游信息",
    bookedHeading: "预约制服务",
    bookedNotice: "这些是私营公司，不是公共设施。我们没有实际使用过。工作人员是否会说英语、接受哪些银行卡、出问题时如何处理，我们都无法告诉您 — 请直接询问对方。预约和付款是您与该公司之间的事。K-Street 不收取佣金，也未与其中任何一家建立合作关系。",
    afterHeading: "行李放好了？去走走吧",
    afterLead: "选一个区，开始走。",
    lastChecked: "链接确认日期",
  },

  "zh-TW": {
    title: "在首爾寄放行李 — 可以放在哪裡 | K-Street",
    h1: "在首爾寄放行李",
    lead: "把行李放下，去街區走走。這裡整理了首爾寄放行李的方式，以及寄放前該確認的事。",
    desc: "首爾寄放行李的方式 — 地鐵站置物櫃、旅遊諮詢中心、預約制服務，以及寄放前該問清楚的事。",
    kindsHeading: "三種方式",
    lockerName: "地鐵站投幣置物櫃",
    lockerDesc: "大站基本都有。一天之內會有人放有人取，所以到的時候可能已經沒有空櫃。",
    centreName: "旅遊諮詢中心",
    centreDesc: "有些地方在您遊覽期間免費保管行李。可以到櫃檯詢問。",
    bookedName: "預約制寄放服務",
    bookedDesc: "由店家或辦公室代為保管，通常需要提前在網路上預約。行李較大、或入住前的清晨比較適用。",
    checkHeading: "寄放前，請務必問清這幾件事",
    check1: "最晚幾點前要取回？錯過的話行李要留到隔天。",
    check2: "我的行李箱真的放得進去嗎？",
    check3: "可以刷卡嗎，還是只收現金？",
    check4: "需要出示護照嗎？",
    noPrices: "我們不列出價格和營業時間。這些經常變動，而錯誤的數字會讓您拖著行李箱站在門外。請在現場或官方頁面確認。",
    officialHeading: "官方旅遊資訊",
    bookedHeading: "預約制服務",
    bookedNotice: "這些是私營公司，不是公共設施。我們沒有實際使用過。工作人員是否會說英語、接受哪些信用卡、出問題時如何處理，我們都無法告訴您 — 請直接詢問對方。預約與付款是您與該公司之間的事。K-Street 不收取佣金，也未與其中任何一家建立合作關係。",
    afterHeading: "行李放好了？去走走吧",
    afterLead: "選一個區，開始走。",
    lastChecked: "連結確認日期",
  },

  vi: {
    title: "Gửi hành lý ở Seoul — gửi ở đâu | K-Street",
    h1: "Gửi hành lý ở Seoul",
    lead: "Gửi hành lý rồi đi dạo khu phố. Đây là các cách gửi hành lý ở Seoul, và những điều cần hỏi trước khi gửi.",
    desc: "Các cách gửi hành lý ở Seoul — tủ khóa trong ga tàu điện ngầm, trung tâm thông tin du lịch, dịch vụ đặt trước, và những điều nên hỏi trước khi gửi.",
    kindsHeading: "Ba cách",
    lockerName: "Tủ khóa trong ga tàu điện ngầm",
    lockerDesc: "Hầu hết các ga lớn đều có. Tủ trống rồi lại đầy trong ngày, nên khi bạn đến có thể không còn chỗ.",
    centreName: "Trung tâm thông tin du lịch",
    centreDesc: "Một số nơi giữ hành lý miễn phí trong lúc bạn đi tham quan. Hãy hỏi ở quầy.",
    bookedName: "Dịch vụ giữ hành lý đặt trước",
    bookedDesc: "Cửa hàng hoặc văn phòng nhận giữ hành lý, thường phải đặt trước trên mạng. Hữu ích khi hành lý lớn, hoặc sáng sớm trước giờ nhận phòng.",
    checkHeading: "Hãy hỏi những điều này trước khi gửi",
    check1: "Muộn nhất mấy giờ phải lấy? Trễ thì hành lý sẽ ở lại qua đêm.",
    check2: "Va li của bạn có thực sự vừa không?",
    check3: "Có nhận thẻ không, hay chỉ tiền mặt?",
    check4: "Có cần xuất trình hộ chiếu không?",
    noPrices: "Chúng tôi không ghi giá và giờ mở cửa. Những thứ đó hay thay đổi, và một con số sai sẽ khiến bạn đứng ngoài cửa với va li. Hãy kiểm tra tại chỗ hoặc trên trang chính thức.",
    officialHeading: "Thông tin du lịch chính thức",
    bookedHeading: "Dịch vụ đặt trước",
    bookedNotice: "Đây là các công ty tư nhân, không phải cơ sở công. Chúng tôi chưa từng sử dụng. Chúng tôi không biết nhân viên có nói tiếng Anh không, nhận thẻ nào, hay xử lý ra sao khi có sự cố — hãy hỏi trực tiếp họ. Việc đặt chỗ và thanh toán là giữa bạn và công ty đó. K-Street không nhận hoa hồng và không hợp tác với bất kỳ công ty nào trong số này.",
    afterHeading: "Gửi xong rồi? Đi dạo thôi",
    afterLead: "Chọn một quận và bắt đầu đi bộ.",
    lastChecked: "Ngày kiểm tra liên kết",
  },

  es: {
    title: "Consigna de equipaje en Seúl — dónde dejar las maletas | K-Street",
    h1: "Dejar el equipaje en Seúl",
    lead: "Deja el equipaje y recorre el barrio a pie. Aquí tienes cómo funciona la consigna en Seúl y qué conviene preguntar antes de dejar las maletas.",
    desc: "Cómo funciona la consigna de equipaje en Seúl: taquillas del metro, oficinas de turismo y servicios con reserva, y qué preguntar antes de dejar las maletas.",
    kindsHeading: "Tres formas",
    lockerName: "Taquillas en las estaciones de metro",
    lockerDesc: "La mayoría de las estaciones grandes las tienen. Se llenan y se vacían a lo largo del día, así que puede que no quede ninguna libre al llegar.",
    centreName: "Oficinas de información turística",
    centreDesc: "Algunas guardan las maletas gratis mientras paseas. Pregunta en el mostrador.",
    bookedName: "Servicios de consigna con reserva",
    bookedDesc: "Tiendas y oficinas que guardan equipaje, normalmente con reserva previa por internet. Útil para maletas grandes o a primera hora, antes del check-in.",
    checkHeading: "Pregunta esto antes de dejar las maletas",
    check1: "¿Hasta qué hora se puede recoger? Si se te pasa, la maleta se queda hasta el día siguiente.",
    check2: "¿Cabe realmente tu maleta?",
    check3: "¿Aceptan tarjeta o solo efectivo?",
    check4: "¿Necesitan ver tu pasaporte?",
    noPrices: "No indicamos precios ni horarios. Cambian, y un dato equivocado te deja en la puerta con la maleta. Compruébalo allí mismo o en la página oficial.",
    officialHeading: "Información turística oficial",
    bookedHeading: "Servicios con reserva",
    bookedNotice: "Son empresas privadas, no instalaciones públicas. No las hemos probado. No podemos decirte si el personal habla inglés, qué tarjetas aceptan ni qué ocurre si algo sale mal — pregúntaselo directamente. La reserva y el pago son entre tú y la empresa. K-Street no cobra comisión ni tiene acuerdo con ninguna de ellas.",
    afterHeading: "¿Maletas guardadas? A caminar",
    afterLead: "Elige un distrito y empieza a andar.",
    lastChecked: "Enlaces comprobados el",
  },

  fr: {
    title: "Consigne à bagages à Séoul — où laisser ses valises | K-Street",
    h1: "Laisser ses bagages à Séoul",
    lead: "Laissez vos bagages, puis parcourez le quartier à pied. Voici comment fonctionne la consigne à Séoul, et ce qu'il faut demander avant de confier vos valises.",
    desc: "Comment fonctionne la consigne à bagages à Séoul : casiers du métro, offices de tourisme et services sur réservation, et ce qu'il faut demander avant de laisser ses valises.",
    kindsHeading: "Trois solutions",
    lockerName: "Casiers dans les stations de métro",
    lockerDesc: "La plupart des grandes stations en ont. Ils se libèrent et se remplissent au fil de la journée : il se peut qu'il n'en reste aucun à votre arrivée.",
    centreName: "Offices de tourisme",
    centreDesc: "Certains gardent les bagages gratuitement pendant que vous visitez. Renseignez-vous au comptoir.",
    bookedName: "Consignes sur réservation",
    bookedDesc: "Boutiques et bureaux qui gardent les bagages, en général sur réservation en ligne. Pratique pour les grandes valises ou tôt le matin, avant l'enregistrement.",
    checkHeading: "À demander avant de laisser vos bagages",
    check1: "Jusqu'à quelle heure peut-on récupérer ? Passé ce délai, la valise reste jusqu'au lendemain.",
    check2: "Votre valise rentre-t-elle vraiment ?",
    check3: "Carte acceptée, ou espèces uniquement ?",
    check4: "Faut-il présenter son passeport ?",
    noPrices: "Nous n'indiquons ni tarifs ni horaires. Ils changent, et un chiffre erroné vous laisse devant une porte fermée, valise à la main. Vérifiez sur place ou sur la page officielle.",
    officialHeading: "Informations touristiques officielles",
    bookedHeading: "Services sur réservation",
    bookedNotice: "Ce sont des entreprises privées, pas des services publics. Nous ne les avons pas testées. Nous ne pouvons pas vous dire si le personnel parle anglais, quelles cartes sont acceptées, ni ce qui se passe en cas de problème — posez-leur directement la question. La réservation et le paiement se font entre vous et l'entreprise. K-Street ne touche aucune commission et n'a de partenariat avec aucune d'elles.",
    afterHeading: "Bagages déposés ? En route",
    afterLead: "Choisissez un quartier et commencez à marcher.",
    lastChecked: "Liens vérifiés le",
  },

  de: {
    title: "Gepäckaufbewahrung in Seoul — wo Sie Ihr Gepäck lassen | K-Street",
    h1: "Gepäck in Seoul abgeben",
    lead: "Geben Sie Ihr Gepäck ab und erkunden Sie das Viertel zu Fuß. Hier steht, wie die Gepäckaufbewahrung in Seoul funktioniert und was Sie vorher klären sollten.",
    desc: "Wie die Gepäckaufbewahrung in Seoul funktioniert: Schließfächer in U-Bahn-Stationen, Touristeninformationen und Angebote mit Voranmeldung — und was Sie vorher fragen sollten.",
    kindsHeading: "Drei Möglichkeiten",
    lockerName: "Schließfächer in U-Bahn-Stationen",
    lockerDesc: "In den meisten großen Stationen gibt es welche. Sie werden über den Tag frei und wieder belegt — bei Ihrer Ankunft kann alles besetzt sein.",
    centreName: "Touristeninformationen",
    centreDesc: "Manche bewahren Gepäck kostenlos auf, während Sie sich umsehen. Fragen Sie am Schalter.",
    bookedName: "Aufbewahrung mit Voranmeldung",
    bookedDesc: "Läden und Büros, die Gepäck annehmen, meist online im Voraus gebucht. Praktisch bei großem Gepäck oder früh am Morgen vor dem Check-in.",
    checkHeading: "Fragen Sie das, bevor Sie Ihr Gepäck abgeben",
    check1: "Bis wann kann man es abholen? Wer das verpasst, bekommt sein Gepäck erst am nächsten Tag.",
    check2: "Passt Ihr Koffer wirklich hinein?",
    check3: "Werden Karten akzeptiert oder nur Bargeld?",
    check4: "Muss der Reisepass vorgezeigt werden?",
    noPrices: "Wir nennen keine Preise und keine Öffnungszeiten. Sie ändern sich, und eine falsche Zahl lässt Sie mit dem Koffer vor verschlossener Tür stehen. Prüfen Sie es vor Ort oder auf der offiziellen Seite.",
    officialHeading: "Offizielle Reiseinformationen",
    bookedHeading: "Angebote mit Voranmeldung",
    bookedNotice: "Das sind private Unternehmen, keine öffentlichen Einrichtungen. Wir haben sie nicht ausprobiert. Wir können Ihnen nicht sagen, ob dort Englisch gesprochen wird, welche Karten akzeptiert werden oder was bei Problemen geschieht — fragen Sie direkt dort nach. Buchung und Bezahlung sind Sache zwischen Ihnen und dem Unternehmen. K-Street erhält keine Provision und arbeitet mit keinem von ihnen zusammen.",
    afterHeading: "Gepäck abgegeben? Dann los",
    afterLead: "Wählen Sie einen Stadtteil und gehen Sie los.",
    lastChecked: "Links zuletzt geprüft",
  },

  ru: {
    title: "Камеры хранения в Сеуле — где оставить багаж | K-Street",
    h1: "Где оставить багаж в Сеуле",
    lead: "Оставьте багаж и пройдитесь по району пешком. Здесь — как в Сеуле хранят вещи и что стоит выяснить, прежде чем оставлять чемодан.",
    desc: "Как в Сеуле оставить багаж: ячейки в метро, туристические информационные центры и хранение по предварительной записи — и о чём спросить заранее.",
    kindsHeading: "Три способа",
    lockerName: "Ячейки на станциях метро",
    lockerDesc: "На большинстве крупных станций они есть. В течение дня освобождаются и снова занимаются, так что свободных может не оказаться.",
    centreName: "Туристические информационные центры",
    centreDesc: "Некоторые бесплатно присмотрят за вещами, пока вы гуляете. Спросите на стойке.",
    bookedName: "Хранение по предварительной записи",
    bookedDesc: "Магазины и офисы, принимающие багаж, — обычно бронируют заранее через интернет. Удобно для крупных чемоданов и ранним утром, до заселения.",
    checkHeading: "Спросите это, прежде чем оставить вещи",
    check1: "До скольки можно забрать? Опоздаете — чемодан останется до следующего дня.",
    check2: "Ваш чемодан действительно поместится?",
    check3: "Принимают карты или только наличные?",
    check4: "Нужен ли паспорт?",
    noPrices: "Мы не указываем цены и часы работы. Они меняются, а неверная цифра оставит вас с чемоданом у закрытой двери. Уточняйте на месте или на официальной странице.",
    officialHeading: "Официальная туристическая информация",
    bookedHeading: "Хранение по записи",
    bookedNotice: "Это частные компании, а не государственные службы. Мы ими не пользовались. Мы не знаем, говорят ли там по-английски, какие карты принимают и что будет, если что-то пойдёт не так, — спрашивайте у них напрямую. Бронирование и оплата — дело между вами и компанией. K-Street не берёт комиссию и не сотрудничает ни с одной из них.",
    afterHeading: "Вещи оставили? Идём гулять",
    afterLead: "Выберите район и отправляйтесь пешком.",
    lastChecked: "Ссылки проверены",
  },

  id: {
    title: "Penitipan koper di Seoul — di mana menitipkan barang | K-Street",
    h1: "Menitipkan koper di Seoul",
    lead: "Titipkan koper Anda, lalu jelajahi lingkungannya dengan berjalan kaki. Ini cara penitipan barang di Seoul, dan apa yang perlu ditanyakan sebelum menitipkan.",
    desc: "Cara menitipkan koper di Seoul: loker di stasiun kereta bawah tanah, pusat informasi wisata, dan layanan dengan pemesanan — serta apa yang perlu ditanyakan lebih dulu.",
    kindsHeading: "Tiga cara",
    lockerName: "Loker di stasiun kereta bawah tanah",
    lockerDesc: "Sebagian besar stasiun besar punya. Loker terisi dan kosong bergantian sepanjang hari, jadi bisa saja habis saat Anda tiba.",
    centreName: "Pusat informasi wisata",
    centreDesc: "Beberapa menyimpan barang gratis selama Anda berjalan-jalan. Tanyakan di meja informasi.",
    bookedName: "Layanan penitipan dengan pemesanan",
    bookedDesc: "Toko atau kantor yang menyimpan koper, biasanya dipesan lebih dulu secara daring. Berguna untuk koper besar, atau pagi-pagi sebelum check-in.",
    checkHeading: "Tanyakan ini sebelum menitipkan barang",
    check1: "Sampai jam berapa bisa diambil? Kalau terlewat, koper menginap di sana.",
    check2: "Apakah koper Anda benar-benar muat?",
    check3: "Bisa pakai kartu, atau tunai saja?",
    check4: "Apakah paspor perlu ditunjukkan?",
    noPrices: "Kami tidak mencantumkan harga dan jam buka. Keduanya berubah, dan angka yang salah membuat Anda berdiri di depan pintu sambil menyeret koper. Pastikan di tempat atau di halaman resmi.",
    officialHeading: "Informasi wisata resmi",
    bookedHeading: "Layanan dengan pemesanan",
    bookedNotice: "Ini perusahaan swasta, bukan fasilitas umum. Kami belum pernah mencobanya. Kami tidak bisa memberi tahu apakah petugasnya berbahasa Inggris, kartu apa yang diterima, atau apa yang terjadi bila ada masalah — tanyakan langsung kepada mereka. Pemesanan dan pembayaran adalah urusan Anda dengan perusahaan tersebut. K-Street tidak menerima komisi dan tidak bermitra dengan satu pun di antaranya.",
    afterHeading: "Sudah dititipkan? Ayo jalan-jalan",
    afterLead: "Pilih satu distrik dan mulai berjalan.",
    lastChecked: "Tautan terakhir diperiksa",
  },

  th: {
    title: "ฝากกระเป๋าในโซล — ฝากได้ที่ไหนบ้าง | K-Street",
    h1: "ฝากกระเป๋าในโซล",
    lead: "ฝากกระเป๋าไว้ แล้วออกไปเดินเล่นในย่านนั้น นี่คือวิธีฝากกระเป๋าในโซล และสิ่งที่ควรถามก่อนฝาก",
    desc: "วิธีฝากกระเป๋าในโซล — ตู้ล็อกเกอร์ในสถานีรถไฟใต้ดิน ศูนย์ข้อมูลนักท่องเที่ยว และบริการที่ต้องจองล่วงหน้า พร้อมสิ่งที่ควรถามก่อนฝาก",
    kindsHeading: "สามวิธี",
    lockerName: "ตู้ล็อกเกอร์ในสถานีรถไฟใต้ดิน",
    lockerDesc: "สถานีใหญ่ส่วนมากมี ตู้ว่างและเต็มสลับกันทั้งวัน จึงอาจไม่มีตู้ว่างตอนที่คุณไปถึง",
    centreName: "ศูนย์ข้อมูลนักท่องเที่ยว",
    centreDesc: "บางแห่งรับฝากกระเป๋าฟรีระหว่างที่คุณเดินเที่ยว ลองถามที่เคาน์เตอร์",
    bookedName: "บริการรับฝากแบบจองล่วงหน้า",
    bookedDesc: "ร้านหรือสำนักงานที่รับฝากกระเป๋า มักต้องจองออนไลน์ล่วงหน้า เหมาะกับกระเป๋าใบใหญ่ หรือช่วงเช้าก่อนเช็กอิน",
    checkHeading: "ก่อนฝาก ถามสิ่งเหล่านี้ให้ชัด",
    check1: "ต้องมารับคืนภายในกี่โมง หากเลยเวลา กระเป๋าจะค้างอยู่ถึงวันรุ่งขึ้น",
    check2: "กระเป๋าเดินทางของคุณใส่ได้จริงไหม",
    check3: "รับบัตรหรือรับเงินสดอย่างเดียว",
    check4: "ต้องแสดงหนังสือเดินทางไหม",
    noPrices: "เราไม่ระบุราคาและเวลาทำการ เพราะเปลี่ยนบ่อย และตัวเลขที่ผิดจะทำให้คุณต้องลากกระเป๋ายืนอยู่หน้าประตู กรุณาตรวจสอบที่หน้างานหรือหน้าเว็บทางการ",
    officialHeading: "ข้อมูลท่องเที่ยวทางการ",
    bookedHeading: "บริการแบบจองล่วงหน้า",
    bookedNotice: "ที่นี่เป็นบริษัทเอกชน ไม่ใช่หน่วยงานของรัฐ เราไม่เคยใช้บริการเอง เราไม่ทราบว่าพนักงานพูดภาษาอังกฤษได้หรือไม่ รับบัตรใดบ้าง หรือจะจัดการอย่างไรหากเกิดปัญหา — กรุณาสอบถามกับทางร้านโดยตรง การจองและการชำระเงินเป็นเรื่องระหว่างคุณกับบริษัทนั้น K-Street ไม่รับค่าคอมมิชชันและไม่ได้เป็นพันธมิตรกับรายใดเลย",
    afterHeading: "ฝากกระเป๋าแล้ว ออกไปเดินกันเลย",
    afterLead: "เลือกเขตหนึ่งแล้วเริ่มเดินได้เลย",
    lastChecked: "ตรวจสอบลิงก์ล่าสุด",
  },
};
