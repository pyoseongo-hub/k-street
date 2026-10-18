// 🖼️ **사진이 없는 곳에 띄울 그림(배너)을 고른다.**
//
// 사장님 (2026-10-17): *"사진없는거는 컨샙 정해서 … 이미지 만들어줄께 등록해"*
//
// 🧭 왜 필요한가 — 사진이 없는 곳이 **607곳(8%)** 이다. 아무것도 없이 이름만 두면
//    손님은 「앱이 부실하다」고 읽는다(서울시 관광거리 114곳에서 이미 겪은 자리).
//
// 🚨 **이 그림은 그 곳의 사진이 아니다.** AI 가 만든 그림이고, 같은 갈래의 곳들이
//    같은 그림을 쓴다. 그래서 카드에 **「AI 제작 이미지」**(translations.ts 의 aiImageNote)를
//    반드시 함께 띄운다. 사진이 생기면 그림은 저절로 사라진다(galleryOf 가 이긴다).
//
// 🔒 **공유·검색으로는 내보내지 않는다.** og:image 로 나가면 카톡·구글·ChatGPT 가
//    「그 곳 사진」으로 보여 주는데 거기엔 「AI 제작」 표시가 안 따라간다.
//    build-place-pages.ts 가 배너를 걸러내고, scripts/check-ai-banner.mjs 가 막는다.
//
// 📌 서울 랜드마크(남산타워)가 든 그림이 섞여 있다. 사진 없는 곳의 **41%(247곳)는
//    서울 밖**이라 그 그림이 전주 축제에 뜰 수 있다 — 사장님이 보고 *"상관없어 그냥써"*
//    라고 정하셨다(2026-10-17). 나중에 바꾸고 싶으면 그 파일만 갈아 끼우면 된다.

import type { Place } from "../data/seed";

/** 그림 갈래. 파일 이름과 같다 — `public/images/banner/<갈래>.jpg` */
export type 배너갈래 =
  | "festival-day-1" | "festival-day-2" | "festival-day-3"
  | "festival-day-4" | "festival-day-5" | "festival-day-6"
  | "festival-night" | "festival-tradition" | "festival-flower"
  | "autumn-road" | "street-tour" | "street-market" | "walk-path";

// 🖼️ **실제로 들어와 있는 그림만 적는다.** 없는 파일을 가리키면 카드에 깨진 그림이 뜬다.
//    그림이 오면 여기에 한 줄 더하면 끝이다 — 다른 코드는 안 건드린다.
export const 있는배너: ReadonlySet<string> = new Set<배너갈래>([
  "festival-day-1",
  "festival-day-2",
  "festival-day-3",
  // 🍁 단풍길 104곳. 앞쪽 커플의 발·손이 흐릿하게 뭉개진 자리가 있는데
  //    사장님이 보고 *"확대해도 발 정상이야 손이 오히려 이상하지 그냥써"* 로 정하셨다
  //    (2026-10-18). 카드 크기(300x200)에서는 사람이 쌀알만 해 안 보인다.
  "autumn-road",
  // 🌊 강변 피크닉. 다리·아파트 스카이라인이 있어 한강처럼 보이지만 **특정 다리가 아니다**
  //    (일반 콘크리트 교량 + 뒤에 산). 전국 어느 강변으로도 읽힌다.
  "festival-day-4",
  "festival-day-5",
  "festival-day-6",
  "festival-tradition",
  "festival-flower",
  "street-tour",
]);

// 축제 갈래를 가르는 낱말. **위에 있는 것이 이긴다.**
const 축제규칙: [배너갈래, RegExp][] = [
  ["festival-night", /야시장|야간|밤마실|달밤|야식|나이트|불빛|빛축제|등축제|야행/],
  ["festival-flower", /꽃|벚꽃|장미|튤립|연꽃|국화|매화|진달래|유채|코스모스|수국|플라워/],
  ["festival-tradition", /문화제|전통|한복|국악|농악|제례|단오|대보름|종묘|산대|탈춤|읍성|향교/],
];

// 🎲 나머지 축제는 **324곳**이다. 한 장이면 한 구 목록에서도 같은 그림이 여러 번 뜬다.
//    여섯 장으로 나누되, **id 로 고르므로 같은 곳은 늘 같은 그림**이 나온다
//    (새로 그릴 때마다 바뀌면 손님이 어지럽다).
const 낮축제 = ["festival-day-1", "festival-day-2", "festival-day-3",
  "festival-day-4", "festival-day-5", "festival-day-6"] as const;
const 흩기 = (id: string) => {
  let n = 0;
  for (const c of id) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return n;
};

/** 이 곳에 띄울 그림 갈래. 없으면 undefined. */
export function 배너갈래고르기(p: Place): 배너갈래 | undefined {
  const 글 = `${p.name} ${(p as { note?: string }).note ?? ""}`;
  if (p.category === "autumn") return "autumn-road";
  if (p.category === "walk" || p.category === "hike") return "walk-path";
  if (p.category === "street") return /시장|상점가|골목/.test(글) ? "street-market" : "street-tour";
  if (p.category === "festival") {
    const 맞는것 = 축제규칙.find(([, re]) => re.test(글));
    return 맞는것 ? 맞는것[0] : 낮축제[흩기(p.id) % 낮축제.length];
  }
  return undefined;
}

/** 카드에 띄울 그림 주소. 아직 그림이 안 들어온 갈래면 undefined. */
export function bannerOf(p: Place): string | undefined {
  const 갈래 = 배너갈래고르기(p);
  return 갈래 && 있는배너.has(갈래) ? `/images/banner/${갈래}.jpg` : undefined;
}
