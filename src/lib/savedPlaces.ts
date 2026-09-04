// 🤍 손님이 저장해 둔 곳.
//
// 사용자 결정(2026-09-04): "홈 하고 저장한 곳만 살릴까" — 아래 탭 네 개 중
// 캘린더·설정을 빼고 이 둘만 남긴다. 그러려면 '저장한 곳'이 실제로 돼야 한다.
//
// 🚨 **id를 열쇠로 쓰지 않는다.** seed.ts의 id는 `ks_1`·`ks_2`처럼 파일에
//    적힌 순서로 매겨지므로, 앞에 항목을 하나 넣거나 빼면 **뒤가 통째로 밀린다.**
//    좌표·사진이 남의 장소에 붙는 사고를 이미 두 번 겪었다(2026-09-02, 감사 ❌B1-2).
//    저장한 곳은 손님 폰에 몇 달씩 남아 있으므로 그 위험이 훨씬 크다 —
//    다음 배포에서 "저장해 둔 광장시장"이 조용히 다른 가게로 바뀐다.
//
//    그래서 **구 + 이름**을 열쇠로 쓴다. 둘 다 사람이 읽는 값이라 자료를 손봐도
//    그대로고, 서울 안에서 같은 구에 같은 이름이 둘일 일은 없다.
//    (그래도 겹치면 한 칸으로 합쳐질 뿐 남의 장소가 되지는 않는다.)
//
// 🔒 저장은 **그 폰 안에만** 남는다(localStorage). 로그인이 없으므로 다른 기기와
//    맞춰지지 않고, 우리도 무엇을 저장했는지 볼 수 없다. 손님 입장에서는
//    "이 폰의 메모"에 가깝다 — 관광객이 며칠 쓰는 앱에는 이 편이 맞고,
//    계정을 만들라고 하는 순간 대부분 그냥 나간다.

import { useSyncExternalStore } from "react";
import type { Place } from "../data/seed";

const KEY = "k-street-saved";

export interface SavedEntry {
  gu: string;
  name: string;
  /** 저장한 때 — 최근에 저장한 것이 위로 온다. */
  at: number;
}

/** 저장 열쇠. 한글은 보이는 게 같아도 코드가 다를 수 있어 NFC로 맞춘다
 *  (유튜브가 자모 분해형 제목을 줘서 같은 이름을 못 찾은 사고가 있었다). */
export const savedKey = (p: { gu: string; name: string }) =>
  `${p.gu.normalize("NFC")}|${p.name.normalize("NFC")}`;

// ── 저장소 ───────────────────────────────────────────────────────────────
// 화면 여러 곳(카드의 하트 · 아래 탭의 개수 · 저장 목록)이 같은 값을 봐야 하므로
// 컴포넌트마다 useState로 들고 있으면 안 된다 — 하트를 눌렀는데 목록은 그대로인
// 사고가 난다(언어 고르기에서 이미 겪었다, useLanguage.tsx 주석 참고).
// 하나의 저장소를 두고 useSyncExternalStore로 모두가 그것을 본다.

let cache: SavedEntry[] | null = null;
const listeners = new Set<() => void>();

function read(): SavedEntry[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed.filter(
          (x): x is SavedEntry =>
            x && typeof x.gu === "string" && typeof x.name === "string"
        )
      : [];
  } catch {
    // 사파리 비공개 모드처럼 저장소를 막아 둔 경우 — 이번 방문 동안만 기억한다.
    cache = [];
  }
  return cache;
}

function write(next: SavedEntry[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장을 못 해도 화면은 바뀐다 — 새로고침하면 사라질 뿐이다.
  }
  for (const l of listeners) l();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  // 다른 탭에서 저장했을 때도 따라가게 한다.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      fn();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/** 저장 목록(최근 저장한 것이 위). 서버 렌더는 없지만 규칙상 스냅샷을 하나 더 둔다. */
const EMPTY: SavedEntry[] = [];
export function useSavedEntries(): SavedEntry[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function isSaved(entries: SavedEntry[], p: { gu: string; name: string }) {
  const k = savedKey(p);
  return entries.some((e) => savedKey(e) === k);
}

/** 저장 / 저장 해제. 이미 있으면 빼고, 없으면 넣는다. */
export function toggleSaved(p: { gu: string; name: string }) {
  const k = savedKey(p);
  const now = read();
  const next = now.some((e) => savedKey(e) === k)
    ? now.filter((e) => savedKey(e) !== k)
    : [{ gu: p.gu, name: p.name, at: Date.now() }, ...now];
  write(next);
}

/**
 * 저장해 둔 열쇠를 **지금 자료의 장소**로 되살린다.
 *
 * 못 찾는 것이 나올 수 있다 — 그 곳이 자료에서 빠졌거나 이름이 바뀐 경우다.
 * 그때는 **조용히 건너뛴다.** 이름만 남은 카드를 띄우면 눌러도 아무 데도 못 가고,
 * 손님은 앱이 고장난 줄 안다. 저장 자체는 지우지 않으므로, 자료가 돌아오면
 * 그 곳도 목록에 다시 나타난다.
 */
export function resolveSaved(entries: SavedEntry[], places: Place[]): Place[] {
  const byKey = new Map(places.map((p) => [savedKey(p), p]));
  return entries
    .slice()
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0))
    .map((e) => byKey.get(savedKey(e)))
    .filter((p): p is Place => Boolean(p));
}
