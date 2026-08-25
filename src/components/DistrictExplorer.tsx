import { useMemo, useState, type CSSProperties } from "react";
import { ALL_PLACES, CATEGORY_META, type Category } from "../data/seed";
import { SEOUL_DISTRICTS } from "../data/districts";
import SeoulMap from "./SeoulMap";

const MAP_CATEGORIES: Category[] = ["market", "flower", "walk", "hike", "museum"];

// 실제 지도 위 좌표는 아직 없다(네이버·카카오 지도 API 연동 전) — 자치구 단위 그리드로 대신한다.
// 목록은 districts.ts에서 가져온다(서울 25개 구). 출시 범위가 넓어지면 그쪽만 고치면 된다.
const DISTRICTS = SEOUL_DISTRICTS;

export default function DistrictExplorer() {
  const [category, setCategory] = useState<Category>("market");
  const [gu, setGu] = useState<string | null>(null);

  const inCategory = useMemo(
    () => ALL_PLACES.filter((p) => p.category === category),
    [category]
  );
  const guWithData = useMemo(
    () => new Set(inCategory.filter((p) => p.confirmed).map((p) => p.gu)),
    [inCategory]
  );
  const selected = useMemo(
    () => (gu ? inCategory.filter((p) => p.gu === gu) : []),
    [gu, inCategory]
  );

  return (
    <section className="panel district-explorer">
      <div className="panel-head">
        <span className="panel-eyebrow">🗺️ 지금 갈 수 있는 곳</span>
        <h2>구를 골라 둘러보기</h2>
      </div>

      <div className="category-chip-row">
        {MAP_CATEGORIES.map((c) => (
          <button
            key={c}
            className={"cat-chip" + (c === category ? " active" : "")}
            style={{ "--cc": CATEGORY_META[c].color } as CSSProperties}
            onClick={() => {
              setCategory(c);
              setGu(null);
            }}
          >
            <span className="cat-chip-icon">{CATEGORY_META[c].icon}</span>
            <span className="cat-chip-label">{CATEGORY_META[c].label}</span>
          </button>
        ))}
      </div>

      <SeoulMap />

      <p className="map-disclaimer">
        지도 위 개별 위치 표시는 아직 준비 중이라(구별 좌표 검증 전), 우선 <b>자치구 단위로</b> 탐색한다.
        색이 있는 구는 이번 조사로 이름까지 확인된 곳, 옅은 구는 아직 확인 못 한 곳이다.
      </p>

      <div className="district-grid">
        {DISTRICTS.map((d) => {
          const has = guWithData.has(d);
          return (
            <button
              key={d}
              className={"district-tile" + (has ? " has-data" : "") + (d === gu ? " selected" : "")}
              style={{ "--cc": CATEGORY_META[category].color } as CSSProperties}
              onClick={() => setGu(d === gu ? null : d)}
            >
              {d.replace("구", "")}
            </button>
          );
        })}
      </div>

      {gu && (
        <div className="place-list">
          {selected.length === 0 && <p className="empty-note">{gu}는 아직 확인 못했다.</p>}
          {selected.map((p) => (
            <div className="place-row" key={p.id}>
              <span className="dot" style={{ background: CATEGORY_META[p.category].color }} />
              <div>
                <div className="pr-name">{p.confirmed ? p.name : "확인 필요"}</div>
                {p.note && <div className="pr-note">{p.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
