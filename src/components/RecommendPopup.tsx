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
//
// ── 📰 오늘의 서울 (2026-11-05) ─────────────────────────────────────────────
//   사장님: *"팝업 내용을 그날의 서울시 메일 … 내용에 따라 한 장에서 그 이상으로"* · *"영어로"*.
//   src/data/today-seoul.json 의 카드가 **맨 앞에** 오고, 그 뒤에 추천 축제 카드가 이어진다
//   (사장님 결정: 「메일 카드 뒤에 이어 붙임」). 메일 카드는 영어 한 벌 — 화면 언어와 상관없다.
//   사진은 없다: 서울시 글·사진은 공공누리 4유형(변경금지)이라 우리 문장만 쓴다. 자세한 것은 그 파일 머리말.
//   소식이 사흘 넘게 묵으면(mailDate) 안 띄운다 — 루틴이 멈춰도 낡은 소식이 남지 않게.
//
// ── 넘기는 법 ────────────────────────────────────────────────────────────
//   사장님 (2026-10-26): *"손으로 밀어도 한 장씩 밀려서 사라지게 해"*.
//   · 맨 위 카드를 좌우로 밀면 그 장이 화면 밖으로 날아가고 다음 장이 올라온다.
//     조금만 밀다 놓으면 제자리로 돌아온다(SWIPE_PX 아래).
//   · › 단추도 같은 일을 한다 — 밀지 못하는 손님(마우스·키보드)을 위해서다.
//   · 마지막 장까지 밀면 팝업이 닫힌다(✕ 와 같다 — 이번 방문 동안 안 뜬다).
//   · 밀다가 놓은 손가락이 이름·사진 위였어도 공식 안내로 넘어가지 않는다(MOVED_PX).
// ⚠️ 저장소(localStorage)는 막혀 있을 수 있다 — 못 읽으면 그냥 띄우고, 못 적으면 그냥 넘어간다.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { useLanguage } from "../lib/useLanguage";
import { useFestivalsHere } from "../lib/usePlaces";
import { guFestivalDate, formatRange } from "../lib/guFestival";
import { getTourImage } from "../lib/tourImages";
import { placeName, translateText } from "../lib/placeText";
import { districtFullName } from "../data/districtNamesEn";
import { openPlaceInfo } from "../lib/mapLinks";
import { START } from "../lib/startParams";
import type { Place } from "../data/seed";
import todaySeoul from "../data/today-seoul.json";

interface NewsCard { title: string; titleKo?: string; when?: string; where?: string; text?: string; until?: string; link?: string }
type Item =
  | { kind: "fest"; key: string; f: Place; d: NonNullable<ReturnType<typeof guFestivalDate>>; photo: string }
  | { kind: "news"; key: string; n: NewsCard };

/** 오늘의 서울 카드 — 소식이 사흘 안이고, 행사가 아직 안 끝난 것만. */
function newsCards(): NewsCard[] {
  const t = today();
  const mail = String((todaySeoul as { mailDate?: string }).mailDate ?? "");
  if (!mail) return [];
  const age = (Date.parse(t) - Date.parse(mail)) / 86400000;
  if (!(age >= 0 && age <= 3)) return [];
  const cards = ((todaySeoul as { cards?: NewsCard[] }).cards ?? []).filter((c) => c.title);
  return cards.filter((c) => !c.until || c.until >= t);
}

const DAY_KEY = "ks-rec-skip-day";
const SESSION_KEY = "ks-rec-closed";
const POOL = 5;
const SHOW = 3;
const SWIPE_PX = 80;   // 이만큼 밀면 넘어간다
const MOVED_PX = 8;    // 이만큼 움직였으면 「누른 것」이 아니라 「민 것」이다
const FLY_MS = 260;

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
  const [i, setI] = useState(0);          // 지금까지 넘긴 장 수
  const [dx, setDx] = useState(0);        // 손가락으로 민 거리
  const [fly, setFly] = useState(0);      // -1·1 이면 그쪽으로 날아가는 중
  const drag = useRef<{ x: number; id: number; moved: boolean } | null>(null);
  const flying = useRef(false);
  const nextRef = useRef<HTMLButtonElement>(null);

  const picks = useMemo<Item[]>(() => {
    const pool = festivals
      .map((f) => ({ f, d: guFestivalDate(f.id), photo: photoOf(f) }))
      .filter((x): x is { f: Place; d: NonNullable<typeof x.d>; photo: string } => Boolean(x.d && x.photo))
      .sort((a, b) => a.d.start.localeCompare(b.d.start))
      .slice(0, POOL);
    const news: Item[] = newsCards().map((n, k) => ({ kind: "news", key: `news-${k}`, n }));
    const fest: Item[] = pickThree(pool).map((x) => ({ kind: "fest", key: x.f.id, ...x }));
    return [...news, ...fest];
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
  /** 맨 위 장을 dir 쪽으로 날려 보내고, 다 날아가면 다음 장을 올린다. */
  function throwCard(dir: number) {
    if (flying.current) return;
    flying.current = true;
    setFly(dir);
    window.setTimeout(() => {
      flying.current = false;
      setFly(0);
      setDx(0);
      if (i + 1 >= picks.length) close();
      else setI(i + 1);
    }, FLY_MS);
  }
  function onDown(e: RPointerEvent) {
    if (flying.current) return;
    drag.current = { x: e.clientX, id: e.pointerId, moved: false };
  }
  function onMove(e: RPointerEvent) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const nx = e.clientX - d.x;
    if (!d.moved && Math.abs(nx) > MOVED_PX) {
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (d.moved) setDx(nx);
  }
  function onUp(e: RPointerEvent) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (Math.abs(dx) >= SWIPE_PX) throwCard(Math.sign(dx));
    else setDx(0);
    // moved 는 click 이 끝날 때까지 남겨 둔다 — 민 손가락이 이름을 「누른」 것이 되지 않게
    window.setTimeout(() => { drag.current = null; }, 0);
  }
  /** 민 뒤에 따라오는 click 은 삼킨다. */
  function openIfTapped(p: Place) {
    if (drag.current?.moved) return;
    openPlaceInfo(p);
  }

  function skipToday() {
    try { localStorage.setItem(DAY_KEY, today()); } catch { /* 넘어간다 */ }
    setOpen(false);
  }

  const item = picks[i];
  const left = picks.length - i;          // 아직 남은 장(맨 위 포함)
  const moving = fly !== 0 || dx !== 0;
  const topStyle: CSSProperties = fly
    ? { transform: `translateX(${fly * 130}vw) rotate(${fly * 18}deg)`, transition: `transform ${FLY_MS}ms ease-in` }
    : dx
      ? { transform: `translateX(${dx}px) rotate(${dx / 18}deg)`, transition: "none" }
      : { transition: "transform 200ms ease-out" };
  return (
    <div className="rec-scrim" role="dialog" aria-modal="true" aria-label={t.recTitle}>
      <div className="rec-stack">
        {left > 2 && <div className="rec-card rec-card--back2" aria-hidden="true" />}
        {left > 1 && <div className={`rec-card rec-card--back1${moving ? " rec-card--rise" : ""}`} aria-hidden="true" />}
        <article
          key={item.key}
          className="rec-card rec-card--top"
          style={topStyle}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <div className="rec-top">
            <span className="rec-count">
              <b>{String(i + 1).padStart(2, "0")}</b>
              {String(picks.length).padStart(2, "0")}
            </span>
            {/* 메일 카드는 영어 한 벌이라 머리말도 영어로 맞춘다 */}
            <span>{item.kind === "news" ? "Today in Seoul" : t.recTitle}</span>
          </div>
          {item.kind === "news" ? (
            <>
              <p className="rec-name rec-name--news">{item.n.title}</p>
              {item.n.titleKo && <p className="rec-ko">{item.n.titleKo}</p>}
              <div className="rec-newsband" aria-hidden="true">
                {item.n.when && <span className="rec-when">{item.n.when}</span>}
                <span className="rec-newsicon">📰</span>
              </div>
              {item.n.where && <p className="rec-meta">{item.n.where}</p>}
              {item.n.text && <p className="rec-desc rec-desc--news">{item.n.text}</p>}
              {item.n.link && (
                <a className="rec-src" href={item.n.link} target="_blank" rel="noopener noreferrer">
                  From Seoul City's newsletter ↗
                </a>
              )}
              <p className="rec-disc">Dates and details can change — please check before you go.</p>
            </>
          ) : (
            <>
              <button type="button" className="rec-name" onClick={() => openIfTapped(item.f)}>
                {placeName(item.f.name, language).main}
              </button>
              <button type="button" className="rec-photo" onClick={() => openIfTapped(item.f)} aria-label={placeName(item.f.name, language).main}>
                <img src={item.photo} alt="" loading="eager" draggable={false} />
                <span className="rec-when">{formatRange(item.d, language)}</span>
                {/* 사진 출처 — 특히 「AI 연출 이미지」는 실제 사진으로 읽히면 안 된다(manual-photos.json) */}
                {item.f.photoCredit && <span className="rec-cred">{item.f.photoCredit}</span>}
              </button>
              <p className="rec-meta">{districtFullName(item.f.gu, language)}</p>
              {item.f.note && <p className="rec-desc">{translateText(item.f.note, language)}</p>}
              <p className="rec-disc">{t.recDatesMayChange}</p>
            </>
          )}
        </article>
      </div>
      <div className="rec-btns">
        <button type="button" onClick={close} aria-label={t.recClose}>✕</button>
        {left > 1 && (
          <button type="button" ref={nextRef} onClick={() => throwCard(-1)} aria-label={t.recNext}>›</button>
        )}
      </div>
      <button type="button" className="rec-skip" onClick={skipToday}>{t.recSkipToday}</button>
    </div>
  );
}
