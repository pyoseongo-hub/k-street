// 🔁 **관광공사에 물어볼 때 쓰는 재시도 — 한 군데에만 둔다.**
//
// 왜 (2026-09-10) — 똑같은 `fetchWithRetry` 가 **네 군데에 따로** 있었다:
//   fetch-festival-dates.mjs · fetch-tour-places.mjs · find-trails.mjs · survey-city.mjs
//
// 그날 제주 조사를 하다가 서버가 되다 말다 하는 것을 보고 재시도를 4번 → 6번으로
// 늘렸는데, **고친 것은 survey-city 하나뿐이었다.** 나머지 셋은 그대로 4번이라,
// 바로 다음 실행(fetch-tour-places)이 또 같은 자리에서 죽었다.
// 「잣대가 둘이면 한쪽만 고치게 된다」가 이 저장소의 오랜 교훈인데, 여기선 **넷**이었다.
//
// 📊 그날 실측 — 관광공사 호출 7번 중 **4번이 ConnectTimeout** 이었다.
//    완전히 닫힌 게 아니라 **연결이 잡히는 때와 아닌 때가 섞여 있다.**
//    한 번 실패했다고 포기하면 20분짜리 수집이 첫 호출에서 날아간다.
//
// ⚠️ 오래 기다리는 것이 공짜는 아니다 — 워크플로 시간이 늘어난다. 그래도
//    **자료를 못 받는 것보다는 낫다.** 6번이면 최대 2분 남짓이다.

/** 기다리는 간격(밀리초). 짧게 여러 번보다 **점점 길게**가 이 서버에 잘 맞았다. */
export const TOUR_WAITS = [5000, 10000, 20000, 40000, 60000];

/**
 * 관광공사에 물어본다. 연결이 안 잡히면 기다렸다 다시 물어본다.
 *
 * @param {string} url
 * @param {{tries?: number, waits?: number[], log?: (m: string) => void}} [opt]
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, opt = {}) {
  const tries = opt.tries ?? 6;
  const waits = opt.waits ?? TOUR_WAITS;
  const log = opt.log ?? console.log;
  let lastErr;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fetch(url);
    } catch (e) {
      lastErr = e;
      if (i === tries) break;
      const wait = waits[Math.min(i - 1, waits.length - 1)];
      // 진짜 이유는 cause 에 숨어 있다 — "fetch failed" 한 줄만 보면 원인을 못 찾는다.
      const why = e?.cause?.code || e?.cause?.message || e?.message;
      log(`     ↳ 관광공사 접속 실패(${i}/${tries}, ${why}) — ${wait / 1000}초 뒤 다시 시도`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  const why = lastErr?.cause?.code || lastErr?.cause?.message || lastErr?.message;
  throw new Error(`관광공사 서버에 ${tries}번 다 연결하지 못했다 (${why})`);
}
