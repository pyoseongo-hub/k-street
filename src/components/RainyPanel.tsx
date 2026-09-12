// 🌧️ **비 오는 날** — 머리줄 ☂️ 단추로 여는 전체화면.
//
// ─────────────────────────────────────────────────────────────────────────
// 자리를 세 번 옮겼다. 옮긴 이유를 다 남긴다 — 다음 사람이 되돌리지 않게
// ─────────────────────────────────────────────────────────────────────────
// ① 내 첫 안: **비 올 때만** 날씨 띠에 띄운다. → 뒤집혔다.
//      *"좋은 생각이긴 한데 **날씨는 기상청도 못 맞춰.** 그러니 **항시 보이게**"*
//    예보가 틀린 날 이 기능이 **아예 없는 앱**이 된다. 손님은 그런 화면이 있는
//    줄도 모르고, 「내일 비 온다는데」 하고 미리 찾는 손님도 놓친다.
//    🔑 **날씨는 「있느냐」를 정하지 않는다. 「얼마나 눈에 띄느냐」만 정한다.**
//
// ② 그다음: 「계절 | 동네」 옆 **세 번째 칸**. → 이것도 뒤집혔다.
//      *"이게 맞다. **비는 어쩌다 오는데** 두 번째 줄은 너무 과하고"*
//    그 줄은 **늘 쓰는 두 가지**를 오가는 자리다. 한 달에 며칠 쓰는 것에
//    자리의 3분의 1을 영구히 주면 평소에 **안 쓰는 칸이 계속 눈에 들어온다.**
//
// ③ 지금: **머리줄 ☂️**(✈️ 옆). 늘 있지만 **자리를 안 먹고**, 예보가 있으면
//    그 단추가 **깜박인다**(App.tsx · .icon-btn.blink).
//
//    ⚠️ 이 자리의 대가는 내가 먼저 짚었고 **재서 확인했다** — ☂️ 하나가 언어
//       고르는 칸에서 **정확히 40px**을 가져간다(320px에서 57→17px, 「한국어」가
//       사라진다). 그래서 좁은 폭에서는 **이름 아래 소개말을 접어** 그 폭을
//       돌려준다(index.css 의 .app-tagline). 대가를 알고 넘긴 것이 아니라 **막았다.**
//
// ⚠️ 문구는 **묶음 페이지와 같은 말**을 쓴다 — translations.ts 의 rainy… 칸은
//    scripts/lib/page-strings.ts 의 HUB_STRINGS 에서 그대로 옮겨 온 것이다.
//    갈리면 검색으로 들어온 손님과 앱을 쓰는 손님이 **다른 말**을 읽는다.

import { useState } from "react";
import { createPortal } from "react-dom";
import { useOverlay } from "../lib/useOverlay";
import { useLanguage } from "../lib/useLanguage";
import { rainyPlaces, type RainyRow } from "../lib/rainyPlaces";
import { CATEGORY_META } from "../data/seed";
import { stationLabel } from "../lib/stationName";
import MapDirections from "./MapDirections";

/**
 * 한 줄. **접혀 있고, 누르면 길찾기 단추가 펼쳐진다.**
 *
 * 🐞 처음에는 줄마다 길찾기 단추를 **다 펼쳐 놨다.** 한 줄이 180px이 되어
 *    118곳이면 **2만 픽셀**을 긁어야 했다(폰에서 화면을 보고 찾았다).
 *    이 화면에서 손님이 먼저 하는 일은 **거리를 훑는 것**이다 —
 *    「어디로 갈까」를 정한 다음에 길찾기를 누른다. 그 순서대로 만든다.
 */
function Row({ row, lang }: { row: RainyRow; lang: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const meta = CATEGORY_META[row.place.category];
  const label = t.categoryLabels[row.place.category] ?? "";
  return (
    <li className={"rp-row" + (open ? " open" : "")}>
      <button type="button" className="rp-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="rp-ic" aria-hidden="true">
          {meta?.icon ?? "📍"}
        </span>
        <span className="rp-tx">
          <span className="rp-nm">{row.place.name}</span>
          <span className="rp-mt">
            {[label, row.place.gu, stationLabel(row.station, lang)].filter(Boolean).join(" · ")}
          </span>
        </span>
        {/* 🚨 거리는 **늘 적는다.** 잣대가 하는 일은 목록을 짧게 유지하는 것이지
            「가깝다」고 말해 주는 것이 아니다 — 983m 를 보여 주고 손님이 정한다.
            ⚠️ **직선거리**다. 실제 걷는 길은 더 길다. */}
        <span className="rp-dist">{row.dist}m</span>
      </button>
      {open && (
        <div className="rp-open">
          <MapDirections place={row.place} />
        </div>
      )}
    </li>
  );
}

export default function RainyPanel({ onClose }: { onClose: () => void }) {
  // 🔙 폰 뒤로가기로 닫는다 — 주소 기록을 안 남기면 앱이 통째로 꺼진다(useOverlay 머리말).
  useOverlay(onClose);
  const { language, t } = useLanguage();
  const { indoors, arcades, total, gus } = rainyPlaces();

  return createPortal(
    // ✈️ 도착 안내와 **같은 껍데기**를 쓴다(.arrival-back/.arrival-card) — 손님이
    //    한 번 익힌 모양을 두 번 익히게 하지 않는다.
    <div className="arrival-back" role="dialog" aria-modal="true" aria-label={t.rainyH1}>
      <div className="arrival-card rainy-panel">
        <div className="ag-head">
          <h2 className="ag-title">
            <span aria-hidden="true">☔</span> {t.rainyH1}
          </h2>
          <button className="ag-close" onClick={onClose} aria-label="✕">
            ✕
          </button>
        </div>
        <p className="rp-lead">
        <strong>{t.rainyCta(total)}</strong>
        <span>
          {t.rainySub}
          {" · "}
          {language === "ko" ? `${gus}개 구` : `${gus} districts`}
        </span>
        </p>

        {indoors.length > 0 && (
        <section className="rp-grp">
          <h3 className="rp-grp-h">
            <span aria-hidden="true">🏢</span> {t.rainyIndoorGroup}
            <span className="rp-cnt">{indoors.length}</span>
          </h3>
          <ul className="rp-list">
            {indoors.map((r) => (
              <Row key={r.place.id} row={r} lang={language} />
            ))}
          </ul>
        </section>
        )}

        {arcades.length > 0 && (
        <section className="rp-grp">
          <h3 className="rp-grp-h">
            <span aria-hidden="true">🏮</span> {t.rainyArcadeGroup}
            <span className="rp-cnt">{arcades.length}</span>
          </h3>
          {/* 🚨 **목록과 이 문구는 한 세트다.** 중앙 통로만 덮여 있어서, 이 말이
              없으면 손님이 안쪽 골목에서 젖는다. 문구 없이 목록만 쓰는 화면은
              만들지 않는다(사장님: "전체 아케이드 아닌 중앙통로 기준이야. 안내문구"). */}
          <p className="rp-warn">{t.rainyArcadeNote}</p>
          <ul className="rp-list">
            {arcades.map((r) => (
              <Row key={r.place.id} row={r} lang={language} />
            ))}
          </ul>
        </section>
        )}

        {/* 📭 **빈 칸을 빈 칸이라 말한다.** 지하상가 25곳은 아직 못 넣었다 —
          안 적으면 손님은 「없구나」가 아니라 「서울엔 그런 게 없구나」로 읽는다. */}
        <p className="rp-missing">{t.rainyMissing}</p>
      </div>
    </div>,
    document.body,
  );
}
