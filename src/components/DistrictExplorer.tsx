import { useMemo, useState, type CSSProperties } from "react";
import { ALL_PLACES, CATEGORY_META, type Category } from "../data/seed";

const MAP_CATEGORIES: Category[] = ["market", "flower", "walk", "hike", "museum"];

// 서울 25개 구 — 실제 지도 위 좌표는 아직 없다(네이버·카카오 지도 API 연동 전).
// 개략적인 방위(동/서/남/북/중)만 표시해 자치구 단위로 훑을 수 있게 한다.
const DISTRICTS = [
  "종로구", "중구", "용산구", "성동구", "광진구",
  "동대문구", "중랑구", "성북구", "강북구", "도봉구",
  "노원구", "은평구", "서대문구", "마포구", "양천구",
  "강서구", "구로구", "금천구", "영등포구", "동작구",
  "관악구", "서초구", "강남구", "송파구", "강동구",
];

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
            {CATEGORY_META[c].icon} {CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      <p className="map-disclaimer">
        정식 지도(네이버·카카오 지도 API) 연동 전이라, 우선 <b>자치구 단위로</b> 탐색한다.
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
