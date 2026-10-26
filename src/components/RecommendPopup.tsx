// 🎪 **추천 축제 팝업** — 앱을 열면 하루에 한 번, 카드 석 장.
//
// 사장님 (2026-10-26): 「내손안에 서울」 앱의 겹친 카드 팝업을 보여 주며
//   *"추천 축제를 이미지처럼 팝업 스타일로 만들 수 있나"* → A안(팝업) →
//   *"사진 있고 날짜 정해진 것 중 5개에서 3개 선정해서 추천 축제"*.
//
// ── 무엇을 고르나 ─────────────────────────────────────────────────────────
//   ① 지금 고른 시·도의 축제(useFestivalsHere) 중
//   ② **확정 날짜가 있고**(guFestivalDate — 끝난 회차는 이미 빠져 있다)
//   ③ **사진이 있는** 것만.
//   ④ 날짜가 가까운 순으로 **다섯**을 추린 뒤, 그중 **셋**을 보여 준다.
//      셋은 날마다 돌아간다(오늘이 몇째 날인지로 시작 자리를 민다) — 같은 손님이
//      다음 날 열면 다른 조합을 본다. 다섯 밖으로는 안 나간다: 먼 축제를 앞세우지 않는다.
//   🚫 달만 알고 날짜가 없는 축제는 넣지 않는다 — 「이번 주말」 칩과 같은 잣대다(whenWindow.ts).
//
// ── 언제 뜨나 ────────────────────────────────────────────────────────────
//   · 하루 한 번 — 「오늘 그만 보기」를 누르면 그날은 다시 안 뜬다(이 폰에만 적는다).
//   · ✕ 로 닫으면 이번 방문 동안만 안 뜬다.
//   · 공유 링크로 특정 구에 들어온 손님에게는 안 띄운다 — 보러 온 것을 가리지 않는다.
//   · 고를 축제가 하나도 없으면 아예 안 뜬다.
// ⚠️ 저장소(localStorage)는 막혀 있을 수 있다 — 못 읽으면 그냥 띄우고, 못 적으면 그냥 넘어간다.
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import { useFestivalsHere } from "../lib/usePlaces";
import { guFestivalDate, formatRange } from "../lib/guFestival";
import { getTourImage } from "../lib/tourImages";
import { placeName, translateText } from "../lib/placeText";
import { districtFullName } from "../data/districtNamesEn";
import { openPlaceInfo } from "../lib/mapLinks";
import { START } from "../lib/startParams";
import type { Place } from "../data/seed";

const DAY_KEY = "ks-rec-skip-day";
const SESSION_KEY = "ks-rec-closed";
const POOL = 5;
const SHOW = 3;

const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

function photoOf(f: Place): string | undefined {
  const legacy = getTourImage(f.id);
  return f.image ?? legacy?.image ?? f.thumb ?? legacy?.thumb;
}

/** 다섯 중 셋 — 날마다 시작 자리를 한 칸씩 민다. */
function pickThree<T>(pool: T[]): T[] {
  if (pool.length <= SHOW) return pool;
  const start = new Date();
  const dayOfYear = Math.floor((start.getTime() - new Date(start.getFullYear(), 0, 0).getTime()) / 86400000);
  const at = dayOfYear % pool.length;
  return Array.from({ length: SHOW }, (_, k) => pool[(at + k) % pool.length]);
}

function shouldOpen(): boolean {
  if (START.gu) return false;
  try {
    if (localStorage.getItem(DAY_KEY) === today()) return false;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return false;
  } catch {
    /* 못 읽으면 띄운다 */
  }
  return true;
}

export default function RecommendPopup() {
  const { t, language } = useLanguage();
  const festivals = useFestivalsHere();
  const [open, setOpen] = useState(shouldOpen);
  const [i, setI] = useState(0);
  const nextRef = useRef<HTMLButtonElement>(null);

  const picks = useMemo(() => {
    const pool = festivals
      .map((f) => ({ f, d: guFestivalDate(f.id), photo: photoOf(f) }))
      .filter((x): x is { f: Place; d: NonNullable<typeof x.d>; photo: string } => Boolean(x.d && x.photo))
      .sort((a, b) => a.d.start.localeCompare(b.d.start))
      .slice(0, POOL);
    return pickThree(pool);
  }, [festivals]);

  useEffect(() => {
    if (!open) return;
    nextRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || picks.length === 0) return null;

  function close() {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* 넘어간다 */ }
    setOpen(false);
  }
  function skipToday() {
    try { localStorage.setItem(DAY_KEY, today()); } catch { /* 넘어간다 */ }
    setOpen(false);
  }

  const { f, d, photo } = picks[i % picks.length];
  return (
    <div className="rec-scrim" role="dialog" aria-modal="true" aria-label={t.recTitle}>
      <div className="rec-stack">
        {picks.length > 2 && <div className="rec-card rec-card--back2" aria-hidden="true" />}
        {picks.length > 1 && <div className="rec-card rec-card--back1" aria-hidden="true" />}
        <article className="rec-card">
          <div className="rec-top">
            <span className="rec-count">
              <b>{String((i % picks.length) + 1).padStart(2, "0")}</b>
              {String(picks.length).padStart(2, "0")}
            </span>
            <span>{t.recTitle}</span>
          </div>
          <button type="button" className="rec-name" onClick={() => openPlaceInfo(f)}>
            {placeName(f.name, language).main}
          </button>
          <button type="button" className="rec-photo" onClick={() => openPlaceInfo(f)} aria-label={placeName(f.name, language).main}>
            <img src={photo} alt="" loading="eager" />
            <span className="rec-when">{formatRange(d, language)}</span>
            {/* 사진 출처 — 특히 「AI 연출 이미지」는 실제 사진으로 읽히면 안 된다(manual-photos.json) */}
            {f.photoCredit && <span className="rec-cred">{f.photoCredit}</span>}
          </button>
          <p className="rec-meta">{districtFullName(f.gu, language)}</p>
          {f.note && <p className="rec-desc">{translateText(f.note, language)}</p>}
          <p className="rec-disc">{t.recDatesMayChange}</p>
        </article>
      </div>
      <div className="rec-btns">
        <button type="button" onClick={close} aria-label={t.recClose}>✕</button>
        {picks.length > 1 && (
          <button type="button" ref={nextRef} onClick={() => setI((n) => n + 1)} aria-label={t.recNext}>›</button>
        )}
      </div>
      <button type="button" className="rec-skip" onClick={skipToday}>{t.recSkipToday}</button>
    </div>
  );
}
