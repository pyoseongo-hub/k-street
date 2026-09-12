// 🌧️ **비 오는 날** — 「계절 | 동네」 옆 **세 번째 화면**.
//
// ─────────────────────────────────────────────────────────────────────────
// 사장님이 내 제안을 두 번 고쳐 주셨고, 두 번 다 맞다
// ─────────────────────────────────────────────────────────────────────────
// ① 나는 「비 올 때만 보이게」를 권했다. 답:
//      *"좋은 생각이긴 한데 **날씨는 기상청도 못 맞춰.** 그러니 **항시 보이게**"*
//    그러면 예보가 틀린 날 이 기능이 **아예 없는 앱**이 된다 — 손님은 그런 화면이
//    있는 줄도 모른다. 게다가 「내일 비 온다는데」 하고 미리 찾는 손님을 놓친다.
//    → **날씨는 「있느냐」를 정하지 않는다. 「얼마나 눈에 띄느냐」만 정한다.**
//
// ② 그다음 나는 머리줄에 ☂️ 단추를 더하려 했다(✈️ 옆). 답은 화면을 찍어
//    「계절 | 동네」 줄에 빨간 줄을 그어 주신 것이었다:
//      *"자리는 충분해. **첫 번째 칸 넣고** 비 오면 안내문구 뜨든지, 둘째 줄에 넣든지"*
//    이쪽이 낫다 —
//      · 머리줄 단추가 넷이 되는 문제가 **아예 없어진다**(좁은 폰에서 줄이 갈라졌다)
//      · 비 오는 날은 **계절·동네와 같은 급의 보는 방식**이다. 딸린 기능이 아니다
//      · 그래서 이 파일은 **전체화면(portal)이 아니다.** 뒤로가기 문제도 안 생긴다
//
// ⚠️ 문구는 **묶음 페이지와 같은 말**을 쓴다 — translations.ts 의 rainy… 칸은
//    scripts/lib/page-strings.ts 의 HUB_STRINGS 에서 그대로 옮겨 온 것이다.
//    갈리면 검색으로 들어온 손님과 앱을 쓰는 손님이 **다른 말**을 읽는다.

import { useState } from "react";
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

export default function RainyPanel() {
  const { language, t } = useLanguage();
  const { indoors, arcades, total, gus } = rainyPlaces();

  return (
    <div className="rainy-panel">
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
  );
}
