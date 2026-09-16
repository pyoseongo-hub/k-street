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
 * ⏱️ **한 번 물어볼 때 최대 기다리는 시간** (2026-09-17에 넣었다).
 *
 * 🚨 그전에는 **시간 제한이 없었다.** 재시도는 「연결이 안 잡힐 때」만 도는데,
 *    서버가 연결은 받아 놓고 **답을 안 주면** fetch 가 영영 안 끝난다 —
 *    재시도도 안 돌고, 오류도 안 나고, 그냥 매달려 있다.
 *    오늘 일문 조사가 그렇게 **10분 넘게 멈춰 있었다.** 로그에는 아무것도 안 찍혀서
 *    「서버가 느린가」 하고 계속 기다리게 된다 — **멈춘 것과 느린 것을 구분할 수 없다.**
 *
 * 30초로 잡은 이유 — 관광공사는 잘 되는 날 1초 안에 답한다. 30초를 넘기면
 * 느린 게 아니라 **안 오는 것**이다. 끊고 다시 묻는 편이 빠르다.
 */
export const TOUR_TIMEOUT_MS = 30000;

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
      // ⏱️ 시간 제한을 건다. 넘기면 fetch 가 스스로 끊고 아래 catch 로 온다 —
      //    그래야 **재시도가 실제로 돌고**, 로그에도 무슨 일인지 찍힌다.
      return await fetch(url, { signal: AbortSignal.timeout(opt.timeoutMs ?? TOUR_TIMEOUT_MS) });
    } catch (e) {
      lastErr = e;
      if (i === tries) break;
      const wait = waits[Math.min(i - 1, waits.length - 1)];
      // 진짜 이유는 cause 에 숨어 있다 — "fetch failed" 한 줄만 보면 원인을 못 찾는다.
      const why = e?.name === "TimeoutError"
        ? `${(opt.timeoutMs ?? TOUR_TIMEOUT_MS) / 1000}초 안에 답이 없다`
        : e?.cause?.code || e?.cause?.message || e?.message;
      log(`     ↳ 관광공사 접속 실패(${i}/${tries}, ${why}) — ${wait / 1000}초 뒤 다시 시도`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  const why = lastErr?.name === "TimeoutError"
    ? "물어볼 때마다 시간 안에 답이 없었다"
    : lastErr?.cause?.code || lastErr?.cause?.message || lastErr?.message;
  throw new Error(`관광공사 서버에 ${tries}번 다 연결하지 못했다 (${why})`);
}
