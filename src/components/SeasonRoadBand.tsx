import { useMemo, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import { roadsForSeason, ROAD_SOURCE, type SeasonRoad } from "../data/seasonRoads";
import { districtFullName } from "../data/districtNamesEn";
import { placeName, translateText } from "../lib/placeText";
import { naverSearchUrl } from "../lib/mapLinks";
import type { SeasonKey } from "../lib/season";

// 🌸🍁 **이 계절의 길** — 봄 꽃길 · 가을 단풍길.
//
// 사장님 (2026-09-14): *"테마로 빼서 강추 — 봄 꽃길, 가을 단풍길 추천."*
//
// ── 왜 이 자리인가 ──────────────────────────────────────────────────────
// 계절 화면(「봄 여름 가을 겨울 그리고 서울」)은 지도와 상관없이 **계절로** 고르는
// 자리다. 계절 길은 정확히 그 성격이라 여기 말고 갈 데가 없다.
//
// 그리고 **장소 칸에는 넣을 수 없었다.** ALL_PLACES 끝의 `.filter(hasPhoto)` 가
// 사진 없는 곳을 통째로 가리는데, 단풍길 110곳 중 109곳이 사진이 없다.
// 테마 띠는 축제 카드처럼 사진 없이도 그려진다 — **빼는 것이 곧 푸는 것이었다.**
//
// ── 사진이 없어도 빈 카드가 아니다 ──────────────────────────────────────
// 서울시 자료에 **수종 · 길이 · 한 줄 설명**이 붙어 있다. 「은행나무 · 1.2km」는
// 흐릿한 사진 한 장보다 "갈까 말까"에 더 도움이 된다. 없는 칸은 비운다 —
// 꽃길에는 수종·길이가 없으므로 있을 때만 보여준다.

const ICON: Record<"spring" | "autumn", string> = { spring: "🌸", autumn: "🍁" };

/**
 * 🎨 색은 **이미 있는 토큰**만 쓴다 — 꽃길은 갈래색 `--flower`(분홍),
 * 단풍길은 `--market`(주황). 둘 다 네 가지 테마 블록(기본 다크 · 시스템 라이트 ·
 * data-theme=light · data-theme=dark)에 이미 다 정의돼 있다.
 *
 * 🚨 새 토큰을 만들지 않는 이유 — 네 블록에 한 벌씩 넣어야 하는데 하나를
 *    빠뜨리면 **그 테마에서만** 색이 사라진다. 화면은 안 깨지고 아무도 모른다.
 *    있는 토큰을 쓰면 그 사고가 아예 생기지 않는다.
 */
const ACCENT: Record<"spring" | "autumn", string> = {
  spring: "var(--flower)",
  autumn: "var(--market)",
};
const FIRST_SHOWN = 6;

/** 이름 옆에 붙는 한 줄. 있는 것만 · 로 잇는다. */
function facts(r: SeasonRoad, t: ReturnType<typeof useLanguage>["t"]): string {
  return [
    r.species ? `${t.seasonRoadsSpecies} ${r.species}` : null,
    r.length ? `${t.seasonRoadsLength} ${r.length}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function SeasonRoadBand({ season }: { season: SeasonKey }) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);

  const roads = useMemo(() => roadsForSeason(season), [season]);

  // 여름·겨울에는 계절 길이 없다. **없는 걸 지어내지 않는다** — 띠를 통째로 안 그린다.
  if (roads.length === 0) return null;
  const key = season as "spring" | "autumn";

  const shown = open ? roads : roads.slice(0, FIRST_SHOWN);
  const title = key === "spring" ? t.seasonRoadsSpring : t.seasonRoadsAutumn;

  return (
    <section
      aria-labelledby="season-roads-heading"
      style={{
        margin: "20px 0",
        padding: "16px",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        // 계절 색은 **왼쪽 띠 한 곳에만** 쓴다. 카드마다 칠하면 목록이 시끄러워진다.
        borderLeft: `3px solid ${ACCENT[key]}`,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "6px 10px",
          marginBottom: 12,
        }}
      >
        <h3 id="season-roads-heading" style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
          <span aria-hidden="true">{ICON[key]}</span> {title}
        </h3>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {t.seasonRoadsCount(roads.length)}
        </span>
      </header>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
        {shown.map((r) => {
          const nm = placeName(r.name, language);
          const line = facts(r, t);
          return (
            <li
              key={r.key}
              style={{
                background: "var(--surface-2)",
                borderRadius: 12,
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>
                {districtFullName(r.gu, language)}
              </div>
              <a
                href={naverSearchUrl(r.name)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 600, textDecoration: "none", color: "inherit" }}
              >
                {nm.main}
                {nm.sub && (
                  <span style={{ fontWeight: 400, opacity: 0.75 }}> · {nm.sub}</span>
                )}
              </a>
              {line && (
                <div style={{ fontSize: "0.82rem", opacity: 0.85, marginTop: 2 }}>{line}</div>
              )}
              {r.note && (
                <p style={{ margin: "6px 0 0", fontSize: "0.85rem", lineHeight: 1.5 }}>
                  {translateText(r.note, language)}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {roads.length > FIRST_SHOWN && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            marginTop: 12,
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontSize: "0.88rem",
          }}
        >
          {open ? t.seasonRoadsShowLess : t.seasonRoadsShowAll}
        </button>
      )}

      {/* 🏛️ 공공저작물은 **출처를 밝히는 것이 쓰는 조건**이다. 지우지 말 것. */}
      <p style={{ margin: "10px 0 0", fontSize: "0.72rem", opacity: 0.6 }}>{ROAD_SOURCE[key]}</p>
    </section>
  );
}
