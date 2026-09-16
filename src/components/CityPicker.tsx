import { createPortal } from "react-dom";
import { CITIES, type City, type CityStatus } from "../data/cities";
import { useLanguage } from "../lib/useLanguage";
import { useCity } from "../lib/useCity";

// 🗺️ **도시 고르는 시트** — 아래에서 올라온다.
//
// 사장님 (2026-09-17, 화면에 동그라미를 쳐서):
//   *"이렇게 넣으면 불편해. 케이푸드 지역찾기처럼 넣을 수 있어?
//     자리는 위쪽 체크. 케이푸드처럼 열리게."*
//
// ── ⏪ 앞판이 왜 불편했나 ─────────────────────────────────────────────────
//   처음엔 **화면 맨 아래에 한반도 모양 격자 카드**로 뒀다. 부산이 열리자 실제로
//   써 보시고 바로 짚으셨다 — 도시를 바꾸려면 **화면 끝까지 내려가야** 했다.
//   도시는 「보는 것」이 아니라 「고르는 것」이라, 목록 끝에 둘 일이 아니었다.
//   Kfood 는 이미 그렇게 하고 있다: **머리줄 단추 → 아래에서 시트가 올라온다.**
//   같은 손이 쓰는 두 앱이니 여는 법도 같은 편이 낫다.
//
// ── 그래서 바뀐 것 ───────────────────────────────────────────────────────
//   · 자리  — 화면 맨 아래 카드 → **머리줄 단추**(App.tsx)
//   · 모양  — 한반도 격자 → **두 칸짜리 목록**. 격자는 이름이 작아 누르기 어려웠다.
//   · 여는 법 — 늘 펼쳐져 있던 칸 → **누를 때만** 올라오는 시트
//
// ── 그대로 둔 것 ─────────────────────────────────────────────────────────
//   🔑 **17곳을 다 그린다.** 서울 하나만 그리면 부산이 언제 오는지 아무도 모른다.
//      칸을 다 그려 두면 비어 있는 게 눈에 보이고, 보이면 채운다(cities.ts 머리말).
//   🙈 **열린 도시가 하나면 아예 안 나온다.** 고를 것이 하나면 고르는 게 아니다 —
//      머리줄 단추도 같이 사라진다(App.tsx 가 `canChoose` 를 본다).

function statusMod(s: CityStatus): string {
  return s === "공개" ? "open" : s === "준비중" ? "soon" : "later";
}

/**
 * 🔢 **고를 수 있는 곳을 맨 위로.**
 *
 * 🐞 처음엔 명부(cities.ts) 순서를 그대로 썼다가 **부산이 열일곱 칸 중 열여섯 번째**에
 *    묻혔다. 그 순서는 한반도 격자(row/col) 자리 값이라 **지도일 때만** 뜻이 있다 —
 *    목록이 된 지금은 손님에게 아무 의미가 없다. 열린 도시가 둘뿐인데 그걸 찾아
 *    끝까지 내려가야 한다면, 맨 아래 카드를 치운 뜻이 없어진다.
 *
 * 순서: 공개 → 준비중 → 빈칸, 같은 상태 안에서는 대도시 먼저.
 */
const RANK: Record<CityStatus, number> = { 공개: 0, 준비중: 1, 빈칸: 2 };
const ORDERED = [...CITIES].sort(
  (a, b) =>
    RANK[a.status] - RANK[b.status] ||
    (a.kind === "대도시" ? 0 : 1) - (b.kind === "대도시" ? 0 : 1)
);

export default function CityPicker({ onClose }: { onClose: () => void }) {
  const { t, language } = useLanguage();
  const { cityKey, setCity } = useCity();

  // 🌏 도시 **이름**은 translations.ts 에 넣지 않았다 — 17곳 × 12언어 = 204칸을
  //    손으로 채우면 반드시 어긋난다. 한국어 손님에게는 한글, 나머지 손님에게는
  //    로마자를 준다. 로마자는 한국 안내판·지하철·고속버스표에 실제로 쓰는 표기라
  //    어느 나라 손님이든 그대로 들고 물어볼 수 있다.
  //    (화면 문구 안에 들어가는 이름은 cities.ts 의 `names` 를 쓴다 — 그건 12개 언어다.)
  const nameOf = (c: City) => (language === "ko" ? c.ko : c.en);
  const statusOf = (c: City) =>
    c.status === "공개" ? t.cityReady : c.status === "준비중" ? t.citySoon : t.cityLater;

  const pick = (key: string) => {
    setCity(key);
    onClose();
  };

  return createPortal(
    <div
      className="city-sheet-back"
      /* 🖱️ 바깥을 누르면 닫힌다 — 시트의 기본 동작이다. 안쪽 누름은 아래에서 막는다. */
      onClick={onClose}
    >
      <div
        className="city-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t.cityPickerTitle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🤏 손잡이 — 아래에서 올라온 시트라는 것을 모양으로 알려 준다. */}
        <div className="city-sheet-grip" aria-hidden="true" />

        <div className="city-sheet-head">
          <h2 className="city-sheet-title">
            <span aria-hidden="true">📍</span> {t.cityPickerTitle}
          </h2>
          <button type="button" className="ag-close" onClick={onClose} aria-label="✕">
            ✕
          </button>
        </div>
        <p className="city-sheet-note">{t.cityPickerNote}</p>

        <div className="city-sheet-grid">
          {ORDERED.map((c) => {
            const open = c.status === "공개";
            const here = c.key === cityKey;
            const cls =
              `city-opt is-${statusMod(c.status)}` + (here ? " is-here" : "");
            // 🗣️ 읽어 주는 손님에게는 **무엇이고 어떤 상태인지**까지 말해 준다.
            //    색과 흐림만으로 뜻을 전하면 그 손님은 아무것도 못 받는다.
            const spoken = `${nameOf(c)} — ${statusOf(c)}`;
            if (!open) {
              return (
                // 🚨 **눌리지 않는 것은 단추로 만들지 않는다.** 눌러도 아무 일 없는
                //    단추는 손님 눈에 「고장 난 앱」이다(App.tsx 의 오랜 규칙).
                <div key={c.key} className={cls} role="img" aria-label={spoken}>
                  <span className="city-opt-name">{nameOf(c)}</span>
                  <span className="city-opt-tag">{statusOf(c)}</span>
                </div>
              );
            }
            return (
              <button
                key={c.key}
                type="button"
                className={cls}
                aria-current={here ? "true" : undefined}
                aria-label={spoken}
                onClick={() => pick(c.key)}
              >
                <span className="city-opt-name">{nameOf(c)}</span>
                {here && (
                  <span className="city-opt-tag" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
