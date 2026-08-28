import { useMemo, useState, type CSSProperties } from "react";
import { useLanguage } from "../lib/useLanguage";
import { ALL_PLACES, CATEGORY_META, type Category } from "../data/seed";
import { SEOUL_HEX_ROWS } from "../data/seoulHexMap";
import { districtShortName, districtFullName, dongName } from "../data/districtNamesEn";
import MapDirections from "./MapDirections";
import { getTourImage } from "../lib/tourImages";

const MAP_CATEGORIES: Category[] = ["market", "flower", "walk", "hike", "museum"];

export default function DistrictExplorer() {
  const { t, language } = useLanguage();
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
            <span className="cat-chip-label">{t.categoryLabels[c]}</span>
          </button>
        ))}
      </div>

      {category === "flower" && (
        <p className="map-disclaimer">🌸 {t.flowerBloomDisclaimer}</p>
      )}

      <p className="map-disclaimer">
        {t.mapDisclaimerStart}<b>{t.mapDisclaimerBold}</b>{t.mapDisclaimerEnd}
      </p>

      <div className="district-hexgrid">
        {SEOUL_HEX_ROWS.map((row, i) => (
          <div
            className="hex-row"
            key={i}
            style={{ "--offset": row.offset } as CSSProperties}
          >
            {row.gus.map((d) => {
              const has = guWithData.has(d);
              const label = districtShortName(d, language);
              // 로마자 표기는 한글보다 훨씬 길다(Yeongdeungpo 등) — 라벨
              // 길이를 보고 글자 크기를 미리 줄여서 잘리기 전에 줄인다.
              const fontSize =
                label.length > 10 ? 6.5 : label.length > 7 ? 7.5 : label.length > 4 ? 9 : 10.5;
              return (
                <button
                  key={d}
                  className={"hex-tile" + (has ? " has-data" : "") + (d === gu ? " selected" : "")}
                  style={{ "--cc": CATEGORY_META[category].color } as CSSProperties}
                  onClick={() => setGu(d === gu ? null : d)}
                >
                  <span style={{ fontSize }}>{label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {gu && (
        <div className="place-list">
          {selected.length === 0 && (
            <p className="empty-note">{t.noPlacesInDistrictMessage(districtFullName(gu, language))}</p>
          )}
          {selected.map((p) => {
            const photo = getTourImage(p.id);
            const meta = CATEGORY_META[p.category];
            return (
              <div className="place-row" key={p.id}>
                {photo ? (
                  <div
                    className="fc-art fc-art-photo"
                    style={{ backgroundImage: `url(${photo.thumb})` }}
                  >
                    <span className="fc-photo-credit">{t.photoCredit}</span>
                  </div>
                ) : (
                  // 실제 사진이 없을 때(대부분 지금) 빈 칸으로 두지 않고 카테고리
                  // 아이콘을 큼직하게 보여준다 — "그 장소의 실제 사진"이라고
                  // 오해할 여지가 없는 장식용 자리표시자다(정확도 원칙).
                  <div className="pr-art-fallback" style={{ "--cc": meta.color } as CSSProperties}>
                    {meta.iconImage ? (
                      <img src={`${import.meta.env.BASE_URL}${meta.iconImage}`} alt="" />
                    ) : (
                      <span>{meta.icon}</span>
                    )}
                  </div>
                )}
                <div className="pr-body">
                  <div className="pr-top">
                    <span className="pr-category" style={{ "--cc": meta.color } as CSSProperties}>
                      {t.categoryLabels[p.category]}
                    </span>
                    <span className="pr-gu">
                      {districtFullName(p.gu, language)}
                      {p.dong ? ` ${dongName(p.dong, language)}` : ""}
                    </span>
                  </div>
                  <div className="pr-name">{p.confirmed ? p.name : "확인 필요"}</div>
                  {p.note && <div className="pr-note">{p.note}</div>}
                  {p.confirmed && <MapDirections place={p} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
