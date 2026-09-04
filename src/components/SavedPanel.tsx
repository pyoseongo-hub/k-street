import { useMemo } from "react";
import { useLanguage } from "../lib/useLanguage";
import { ALL_PLACES, ALL_FESTIVALS, CATEGORY_META, type Place } from "../data/seed";
import { districtFullName } from "../data/districtNamesEn";
import { placeName } from "../lib/placeText";
import { openPlaceInfo } from "../lib/mapLinks";
import { resolveSaved, savedKey, useSavedEntries } from "../lib/savedPlaces";
import MapDirections from "./MapDirections";
import PlacePhoto from "./PlacePhoto";
import SaveButton from "./SaveButton";
import { getTourImage } from "../lib/tourImages";

// 🤍 손님이 저장해 둔 곳만 모아 보여 준다.
//
// 사용자 결정(2026-09-04): 아래 탭을 **홈 · 저장한 곳** 둘로 줄이면서,
// '저장한 곳'을 실제로 되게 만들었다. 안 되는 단추를 화면에 두면 손님 눈에는
// 앱이 덜 만들어진 것으로 보인다 — 없애든 되게 하든 둘 중 하나여야 한다.
//
// 두 목록을 합쳐서 찾는 이유 — 축제는 ALL_PLACES와 ALL_FESTIVALS가 다르다.
// 계절 화면의 축제에는 사진 게이트가 없어서 ALL_PLACES에 없는 것이 있다
// (seed.ts ALL_FESTIVALS 주석 참고). 한쪽만 보면 저장은 됐는데 목록에서는
// 사라지는 곳이 생긴다.
export default function SavedPanel() {
  const { t, language } = useLanguage();
  const entries = useSavedEntries();

  const everything = useMemo(() => {
    const byKey = new Map<string, Place>();
    for (const p of [...ALL_PLACES, ...ALL_FESTIVALS]) {
      const k = savedKey(p);
      if (!byKey.has(k)) byKey.set(k, p);
    }
    return [...byKey.values()];
  }, []);

  const saved = useMemo(() => resolveSaved(entries, everything), [entries, everything]);

  return (
    <section className="panel saved-panel">
      <div className="panel-head">
        <span className="panel-eyebrow">{t.savedPlacesTab}</span>
        <h2>{saved.length > 0 ? `${saved.length}` : ""}</h2>
      </div>

      {saved.length === 0 ? (
        <div className="saved-empty">
          <div className="saved-empty-icon" aria-hidden="true">🤍</div>
          <p className="saved-empty-title">{t.savedEmptyTitle}</p>
          <p className="saved-empty-body">{t.savedEmptyBody}</p>
        </div>
      ) : (
        <>
          <p className="map-disclaimer map-disclaimer--fine">{t.savedOnThisPhone}</p>
          <div className="place-list">
            {saved.map((p) => {
              // 사진은 두 군데서 온다 — DistrictExplorer와 같은 규칙을 쓴다.
              const legacyPhoto = getTourImage(p.id);
              const photoUrl = p.image ?? p.thumb ?? legacyPhoto?.image ?? legacyPhoto?.thumb;
              const meta = CATEGORY_META[p.category];
              const compact = !photoUrl;
              return (
                <div className={"place-row" + (compact ? " pr-compact" : "")} key={savedKey(p)}>
                  {photoUrl && (
                    <div className="pr-photo-wrap">
                      <PlacePhoto place={{ ...p, image: photoUrl }} />
                      <SaveButton place={p} className="save-btn save-btn--on-photo" />
                    </div>
                  )}
                  <div className="pr-body">
                    <div className="pr-top">
                      <span className="pr-category" style={{ "--cc": meta.color } as React.CSSProperties}>
                        {t.categoryLabels[p.category]}
                      </span>
                      <span className="pr-gu">{districtFullName(p.gu, language)}</span>
                      {/* 사진이 없는 작은 카드에는 사진 위에 얹을 자리가 없으니
                          이 줄 끝에 붙인다 — 어느 카드에서도 저장을 뺄 수 있어야 한다. */}
                      {compact && <SaveButton place={p} className="save-btn save-btn--inline" />}
                    </div>
                    <button
                      type="button"
                      className="pr-name pr-name-link"
                      onClick={() => openPlaceInfo(p)}
                    >
                      {placeName(p.name, language).main}
                      <span className="pr-name-arrow" aria-hidden="true">↗</span>
                    </button>
                    {placeName(p.name, language).sub && (
                      <div className="name-ko" lang="ko">{p.name}</div>
                    )}
                    <MapDirections
                      place={
                        p.lat == null && legacyPhoto?.lat != null
                          ? { ...p, lat: legacyPhoto.lat, lng: legacyPhoto.lng }
                          : p
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
