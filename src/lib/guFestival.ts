// 🏛️ **구청이 확정한 축제 일정.** 우리가 아는 것 중 가장 앞선 사실이다.
//
// 어디서 오나 — scripts/fetch-gu-festival-dates.ts 가 매일 아침 받아 온다.
// 서울시 문화포털은 **구청·구 문화재단이 직접 등록하는 자리**다.
// 왜 관광공사가 아니라 여기인지는 docs/축제-날짜-구청에서-받기.md 에 적어 뒀다.
//
// ─────────────────────────────────────────────────────────────────────────
// 🚨 **날짜만 쓰고 장소를 안 쓰면 안 된다** (2026-09-12에 배운 것)
// ─────────────────────────────────────────────────────────────────────────
//   「서울라이트 한강 빛섬축제」는 **한강 6개 섬을 해마다 순회**한다
//   (난지·여의·선유도·서래·노들·뚝섬).
//     2025년 → 뚝섬한강공원 (광진구)
//     2026년 → **노들섬 (용산구)**
//   우리 자료는 관광공사에서 받은 **작년 회차**라 광진구로 적혀 있었다.
//   날짜만 올해 것으로 바꾸면 화면에 **「올해 날짜 · 작년 장소」**가 뜬다 —
//   그건 아무것도 안 적은 것보다 나쁘다. 손님을 한강 건너편으로 보낸다.
//   그래서 **날짜·장소·좌표를 한 세트로** 덮어쓴다.
//
//   📌 손으로 고치지 않는 이유: 내년에 또 섬이 바뀐다. 그때는 아무도 모른다.
//      해마다 받아서 따라가게 둔다.
//
// ─────────────────────────────────────────────────────────────────────────
// 🔗 **확정 날짜를 띄우면 공식 링크도 같이 띄운다** (사장님 지시 2026-09-12)
// ─────────────────────────────────────────────────────────────────────────
//   "항상 공식 페이지 링크 주고 직접 확인 가능하게"
//
//   우리가 「10월 2일~11일」이라고 단정해 놓고 근거를 안 보여 주면, 그건 우리가
//   틀렸을 때 손님이 확인할 길이 없다는 뜻이다. 이 앱은 해마다 바뀌는 값을
//   **대신 확정해 주는 앱이 아니라, 어디를 봐야 하는지 알려 주는 앱**이다.

import guDates from "../data/gu-festival-dates.json";
import endedDates from "../data/festival-ended.json";
import manualDates from "../data/festival-dates-manual.json";
import funseoulDates from "../data/funseoul-dates.json";
import { isOfficialSite } from "./officialSite";

export interface GuFestivalDate {
  /** YYYY-MM-DD */
  start: string;
  /** YYYY-MM-DD. 하루짜리면 없다 */
  end?: string;
  /** 문화포털에 올라온 제목 그대로 — 「[서울시청] 2026 서울라이트 …」 */
  title: string;
  /** 그해 열리는 구. 우리 자료와 다를 수 있고, 다르면 **이쪽이 맞다** */
  gu: string;
  /** 「노들섬」처럼 주최 측이 적은 장소 */
  place?: string;
  lat?: number;
  lng?: number;
  /** 「18:30~22:30」 */
  time?: string;
  /** 「서울시청」 · 「구로구청」 · 「중랑문화재단」 */
  org?: string;
  /** 주최 측이 적은 홈페이지. **블로그·SNS 일 수 있다** */
  orgLink?: string;
  /** 문화포털 안내 페이지. 늘 있고 늘 공식이다 */
  page?: string;
  /** 구청이 올린 날 */
  registered?: string;
  source: string;
  fetchedAt: string;
}

/**
 * 🙋 **사람이 공식 공지에서 직접 찾아 적은 날짜** (festival-dates-manual.json).
 *
 * 사장님 지시 (2026-10-06): "행사는 하는데 날짜가 없다는건 기본적 말이 안되 —
 * 어딘가 공지가 있을거야". 맞았다. 문화포털에 아직 안 올라온 축제도 주최 기관
 * 누리집·서울시 보도자료에는 날짜가 이미 있었다. 그걸 적어 둔 자리다.
 *
 * 🚨 **기계가 이긴다.** 사람 자리를 먼저 깔고 문화포털 것으로 덮어쓴다 —
 *    주최 측이 직접 올린 것이 더 앞선 사실이고, 사람이 적어 둔 것은 구청이
 *    올리는 순간 **저절로 뒤로 물러나야** 한다. 반대로 깔면 손으로 적은
 *    옛 날짜가 기계가 받아 온 새 날짜를 영영 가린다.
 */
const BY_HAND = (manualDates as { 곳?: Record<string, GuFestivalDate> })["곳"] ?? {};
/**
 * 🎪 **펀서울**(festival.seoul.go.kr) — 서울시가 직접 올리는 축제 누리집.
 *    낱장에 「기간 2026-10-17 ~ 2026-10-23」이 글로 박혀 있어 그대로 읽어 온다
 *    (scripts/fetch-funseoul-dates.ts). 구청이 문화포털에 안 올린 축제도 여기엔 있다.
 */
const FROM_FUNSEOUL = (funseoulDates as { 곳?: Record<string, GuFestivalDate> })["곳"] ?? {};
const FROM_PORTAL = (guDates as { 곳?: Record<string, GuFestivalDate> })["곳"] ?? {};
/**
 * 뒤에 오는 것이 이긴다 — **사람 → 펀서울 → 문화포털**.
 * 문화포털을 맨 위에 두는 이유: 주최 측(구청·구 문화재단)이 **자기 손으로** 올린
 * 자리라 가장 앞선 사실이다. 펀서울은 서울시가 모아 두는 자리라 한 다리 건너다.
 */
const RAW: Record<string, GuFestivalDate> = { ...BY_HAND, ...FROM_FUNSEOUL, ...FROM_PORTAL };

/** 오늘(현지 시각) YYYY-MM-DD. 서울에서 보는 앱이라 UTC 로 자르면 하루가 밀린다. */
function todayYmd(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * 그 축제의 **확정 일정**. 없거나 이미 끝났으면 undefined.
 *
 * ⏳ **끝난 회차는 안 쓴다.** 받아 온 파일에도 지난 것은 안 남기지만, 화면에서도
 *    한 번 더 본다 — 손님 폰은 며칠씩 안 켜질 수 있고, 그 사이에 끝난다.
 *    잣대가 하나뿐이면 그 틈에 지난 날짜가 뜬다.
 */
/**
 * ⏳ **올해 회차가 이미 끝난 축제인가** (2026-10-10).
 *
 * 사장님이 festacode=542 를 보여 줬다 — 「제15회 도봉한글잔치 2026-10-09 하루」.
 * **어제 끝난 축제**인데 우리 앱은 아직 「10월 축제」로 띄우고 있었다.
 * 끝난 줄 몰라서가 아니라 **알고도 안 썼기 때문**이다 — 펀서울을 매일 받으면서
 * 「지난 회차」를 그냥 지나쳤다. 이제 build-festival-ended.ts 가 적어 둔다.
 *
 * ✋ **지우지 않는다.** 그 축제는 내년에 또 열린다 — 다른 달을 보는 손님에게는
 *    그대로 보여야 한다. 가리는 것은 **이번 달 목록**뿐이다(화면 쪽이 정한다).
 */
export function festivalEndedThisYear(id: string): { end: string; page?: string } | undefined {
  const 올해 = String(new Date().getFullYear());
  const 끝났나 = (start: string, end?: string) => {
    const e = end ?? start;
    return e.slice(0, 4) === 올해 && e < todayYmd() ? e : undefined;
  };
  // ① **우리가 아는 확정 날짜가 이미 지났으면 끝난 것이다** (2026-10-10에 넓혔다).
  //    처음엔 펀서울의 「지난 회차」만 봤는데, 그러면 사람이 손으로 확인해 적은
  //    날짜(강남페스티벌 10.3–5 — 강남구청 보도자료)가 지나도 화면은 「날짜를 모른다」고
  //    말한다. **모르는 것과 끝난 것은 다르다** — 우리는 알고 있었다.
  const 아는것 = RAW[id];
  if (아는것?.start) {
    const e = 끝났나(아는것.start, 아는것.end);
    if (e) return { end: e, page: 아는것.page ?? 아는것.orgLink };
  }
  // ② 펀서울이 올려 둔 「지난 회차」 (build-festival-ended.ts 가 맞춰 적는다)
  const d = (endedDates as { 곳?: Record<string, { start: string; end?: string; page: string }> })["곳"]?.[id];
  if (!d) return undefined;
  const e = 끝났나(d.start, d.end);
  return e ? { end: e, page: d.page } : undefined;
}

export function guFestivalDate(id: string): GuFestivalDate | undefined {
  const d = RAW[id];
  if (!d?.start) return undefined;
  return (d.end ?? d.start) >= todayYmd() ? d : undefined;
}

/**
 * 🔗 손님이 **직접 확인할** 공식 주소.
 *
 * 주최 측이 적은 홈페이지를 먼저 쓰되, 블로그·SNS면 거른다(officialSite.ts —
 * 자료 쪽·화면 쪽이 **같은 잣대 하나**를 쓴다). 걸리면 문화포털 안내로 보낸다.
 * 문화포털은 구청이 직접 등록한 자리라 **늘 있고 늘 공식**이다 —
 * 그래서 이 함수는 확정 일정이 있는 축제에 대해 빈손으로 돌아오지 않는다.
 */
export function guOfficialLink(d: GuFestivalDate): string | undefined {
  if (isOfficialSite(d.orgLink)) return d.orgLink;
  return d.page ?? undefined;
}

/**
 * 「10월 2일~11일」처럼 그 언어로 읽히는 날짜.
 *
 * 번역 문자열을 따로 두지 않는다 — 브라우저의 Intl 이 12개 언어를 다 안다.
 * 사람이 적어 둘 것이 없으니 **틀릴 자리도 없다.**
 */
export function formatRange(d: GuFestivalDate, locale: string): string {
  const fmt = (ymd: string) => {
    const [y, m, day] = ymd.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }).format(
      new Date(y, m - 1, day),
    );
  };
  const from = fmt(d.start);
  if (!d.end || d.end === d.start) return from;
  // 끝나는 날이 같은 달이면 「10월 2일 ~ 11일」처럼 달을 한 번만 적는다.
  const sameMonth = d.start.slice(0, 7) === d.end.slice(0, 7);
  const to = sameMonth
    ? new Intl.DateTimeFormat(locale, { day: "numeric" }).format(
        new Date(Number(d.end.slice(0, 4)), Number(d.end.slice(5, 7)) - 1, Number(d.end.slice(8, 10))),
      )
    : fmt(d.end);
  return `${from} – ${to}`;
}
