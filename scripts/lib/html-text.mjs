// 📄 **받아 온 HTML 을 사람이 읽을 글로 만든다.**
//
// 원래 scripts/fetch-page-text.mjs 안에만 있었다. 2026-10-06에 여기로 옮겼다 —
// 펀서울 축제 페이지를 긁는 쪽(fetch-funseoul-dates.ts)도 같은 것이 필요했고,
// 베껴 두면 한쪽만 고치는 일이 생긴다. **잣대가 둘이면 반쪽 적용이 생긴다.**

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

/** 태그를 걷어내고 사람이 읽을 글만 남긴다. 표는 줄로 편다. */
export function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    // 표 칸은 붙어 버리면 「3,0004,000」처럼 읽을 수 없게 된다 — 갈라 준다
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<\/(tr|p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split("\n")
    .map((l) => l.replace(/[ \t|]+/g, (m) => (m.includes("|") ? " | " : " ")).trim())
    .filter((l) => l && l !== "|")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** 한 쪽을 받아 온다. 던지는 오류는 부르는 쪽이 받는다. */
export async function fetchHtml(url, { timeoutMs = 30000 } = {}) {
  const r = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": UA },
  });
  return { status: r.status, final: r.url, html: await r.text() };
}
