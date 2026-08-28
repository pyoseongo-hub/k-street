import { useMemo, useState, type CSSProperties } from "react";
import { useLanguage } from "../lib/useLanguage";
import { ALL_PLACES, CATEGORY_META, type Category } from "../data/seed";
import { SEOUL_DISTRICTS } from "../data/districts";
import MapDirections from "./MapDirections";
import SeoulMap from "./SeoulMap";

const MAP_CATEGORIES: Category[] = ["market", "flower", "walk", "hike", "museum"];

const DISTRICTS = SEOUL_DISTRICTS;

export default function DistrictExplorer() {
  const { t } = useLanguage();
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
        <span className="panel-eyebrow">{t.exploreNowLabel}</span>
        <h2>{t.exploreTitle}</h2>
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
            <span className="cat-chip-icon">
              {CATEGORY_META[c].iconImage ? (
                <img
                  src={`${import.meta.env.BASE_URL}${CATEGORY_META[c].iconImage}`}
                  alt=""
                  className="cat-chip-icon-image"
                />
              ) : (
                CATEGORY_META[c].icon
              )}
            </span>
            <span className="cat-chip-label">{CATEGORY_META[c].label}</span>
          </button>
        ))}
      </div>

      <SeoulMap />

      <p className="map-disclaimer">
        {t.mapDisclaimerStart}<b>{t.mapDisclaimerBold}</b>{t.mapDisclaimerEnd}
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
          {selected.length === 0 && <p className="empty-note">{t.noPlacesInDistrictMessage(gu)}</p>}
          {selected.map((p) => (
            <div className="place-row" key={p.id}>
              <span className="dot" style={{ background: CATEGORY_META[p.category].color }} />
              <div>
                <div className="pr-name">{p.confirmed ? p.name : "확인 필요"}</div>
                {p.note && <div className="pr-note">{p.note}</div>}
                {p.confirmed && <MapDirections place={p} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
