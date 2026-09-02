import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLanguage } from "../lib/useLanguage";
import { ALL_PLACES, CATEGORY_META, type Category } from "../data/seed";
import { SEOUL_HEX_ROWS } from "../data/seoulHexMap";
import { districtShortName, districtFullName, dongName } from "../data/districtNamesEn";
import MapDirections from "./MapDirections";
import PlacePhoto from "./PlacePhoto";
import { openPlaceInfo } from "../lib/mapLinks";
import { getTourImage } from "../lib/tourImages";
import { getMyDistrict, type MyDistrict } from "../lib/myDistrict";
import { placeName, translateText } from "../lib/placeText";

// 화면 위 갈래 칩. 칩 하나가 반드시 칸 하나는 아니다 — 아래 walk처럼 **여러 칸을
// 한 칩으로 묶을 수** 있다.
//
// 🌸 꽃길을 산책길에 합쳤다 (사용자 지시 2026-09-01: "꽃길 산책로 합쳐").
// 합치는 게 맞는 이유가 둘 있다:
//   ① 걷는다는 점에서 같은 일이다 — 손님에게 "꽃길"과 "산책길"은 구분할 이유가 없다.
//   ② 꽃길 칩이 사실상 죽어 있었다. 사진 게이트를 켜면서 32곳 → 2곳이 됐다
//      (사람이 조사한 25개 구 꽃길에 사진이 없어서다). 두 곳짜리 칩은 눌러도
//      허탕이라 죽은 버튼과 다르지 않았다. 합치면 22곳이 된다.
// 자료는 그대로 둔다 — 카드에 붙는 칸 이름은 여전히 '꽃길'/'산책길'로 각각 나온다.
// 되돌리려면 이 표에서 extra만 빼면 된다.
const MAP_CHIPS: { key: Category; extra?: Category[]; label?: string }[] = [
  { key: "market" },
  { key: "street" },
  { key: "walk", extra: ["flower"], label: "walkFlower" },
  { key: "hike" },
  { key: "museum" },
];

/** 이 칩이 담는 칸들. */
function catsOf(key: Category): Category[] {
  const chip = MAP_CHIPS.find((c) => c.key === key);
  return chip ? [chip.key, ...(chip.extra ?? [])] : [key];
}

export default function DistrictExplorer() {
  const { t, language } = useLanguage();
  const [category, setCategory] = useState<Category>("market");
  const [gu, setGu] = useState<string | null>(null);
  // 내 위치의 구. null = 아직 안 눌러 봤다, "loading" = 찾는 중.
  const [myGu, setMyGu] = useState<MyDistrict | "loading" | null>(null);
  const map = useMapOffScreen();

  const inCategory = useMemo(() => {
    const cats = catsOf(category);
    return ALL_PLACES.filter((p) => cats.includes(p.category));
  }, [category]);
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
      {/* 🎨 머리말에 **지금 고른 갈래의 색**을 깐다(사용자 지시 2026-09-01:
          "지도 위 글씨부분도 꾸미고"). 계절 화면은 사진 표지가 있어 무게가 있는데
          이 화면은 검은 바탕에 흰 글씨뿐이라 밋밋했다.
          색을 갈래에 묶은 이유 — 꾸미기만 하는 게 아니라 **지금 무엇을 보고 있는지**를
          말해 준다. 시장을 고르면 앰버, 골목을 고르면 주황으로 머리 색이 바뀐다.
          바탕의 삼각 격자는 아래 육각 지도와 같은 결이다(3% 밝기라 글씨를 안 가린다). */}
      <div className="de-head" style={{ "--cc": CATEGORY_META[category].color } as CSSProperties}>
        <span className="de-eyebrow">{t.exploreNowLabel}</span>
        <h2>{t.exploreTitle}</h2>
      </div>

      {/* 🗺️ 고르는 것(갈래 칩 · 내 위치 · 육각 지도)을 맨 위에 모아 둔다.
          **화면에 붙여 두지 않는다** — 스크롤하면 그냥 위로 밀려 나간다.
          붙여 뒀더니 폰 화면의 절반을 먹어서 목록이 한두 개밖에 안 보였고,
          작게 접는 장치는 덜덜 떨렸다(useMapOffScreen 주석 참고).
          대신 지도가 화면 밖으로 나가면 작은 '지도' 버튼이 떠서 한 번에 돌아온다 —
          동네를 바꾸려고 손으로 끝까지 올릴 필요가 없다. */}
      <div ref={map.ref} className="de-picker">
        <div className="category-chip-row">
          {MAP_CHIPS.map(({ key: c, label }) => (
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
              <span className="cat-chip-label">{t.categoryLabels[label ?? c]}</span>
            </button>
          ))}
        </div>

        {/* 📍 내가 지금 어느 구에 있는지(사용자 지시 2026-09-01).
            위치는 **이 버튼을 눌렀을 때만** 물어본다 — 앱을 켜자마자 권한 창이 뜨면
            대부분 거절하고, 한 번 거절하면 되돌리기 어렵다(userPosition.ts와 같은 판단). */}
        <MyLocationChip state={myGu} onFind={async () => {
          setMyGu("loading");
          setMyGu(await getMyDistrict());
        }} t={t} />

        <div className="district-hexgrid">
          <div className="hex-rows">
            {SEOUL_HEX_ROWS.map((row, i) => (
              <div
                className="hex-row"
                key={i}
                style={{ "--offset": row.offset } as CSSProperties}
              >
                {row.gus.map((d) => {
                  const has = guWithData.has(d);
                  const here = typeof myGu === "object" && myGu?.kind === "gu" && myGu.gu === d;
                  const label = districtShortName(d, language);
                  // 로마자 표기는 한글·한자보다 훨씬 길다(Yeongdeungpo 등) —
                  // 라벨 길이를 보고 글자 크기를 미리 줄여서 잘리기 전에 줄인다.
                  const fontSize =
                    label.length > 10 ? 8.5 : label.length > 7 ? 9.5 : label.length > 4 ? 11 : 12;
                  return (
                    <button
                      key={d}
                      className={
                        "hex-tile" +
                        (has ? " has-data" : "") +
                        (d === gu ? " selected" : "") +
                        (here ? " here" : "")
                      }
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
        </div>
      </div>

      {/* 꽃 피는 시기 안내. 꽃길이 산책길 칩에 합쳐졌으므로 그 칩일 때 띄운다 —
          예전 조건(category === "flower")은 칩이 없어져 영영 안 뜨게 됐다. */}
      {category === "walk" && (
        <p className="map-disclaimer">🌸 {t.flowerBloomDisclaimer}</p>
      )}

      <p className="map-disclaimer">
        {t.mapDisclaimerStart}<b>{t.mapDisclaimerBold}</b>{t.mapDisclaimerEnd} {t.mapAppNote}
      </p>

      {gu && (
        <div className="place-list">
          {selected.length === 0 && (
            <p className="empty-note">{t.noPlacesInDistrictMessage(districtFullName(gu, language))}</p>
          )}
          {selected.map((p) => {
            // 사진은 두 군데서 온다 — 관광공사에서 통째로 받아온 곳은 항목 자체에
            // 붙어 있고, 예전 fetch-tour-images.mjs로 따로 맞춰 붙인 것은
            // id를 열쇠로 tour-images.json에 있다.
            //
            // 🖼️ 2026-09-01 사용자 지적("사진 화질이 안 좋아") — 원본(image)이 아니라
            // 썸네일(thumb)을 먼저 쓰고 있었다. 관광공사는 한 장소에 두 크기를 준다:
            // firstimage(_image2_, 원본)와 firstimage2(_image3_, 작은 썸네일).
            // 카드는 화면 폭을 꽉 채우는데 작은 쪽을 늘려 쓰니 뭉개져 보였다.
            // 265곳 중 249곳이 두 주소가 실제로 다르다 — 그만큼이 흐릿했던 것.
            const legacyPhoto = getTourImage(p.id);
            const photoUrl = p.image ?? p.thumb ?? legacyPhoto?.image ?? legacyPhoto?.thumb;
            const meta = CATEGORY_META[p.category];
            // ⓘ 2026-09-01 오후에 사진 게이트가 생겨(seed.ts의 hasPhoto) 사진 없는 곳은
            // 아예 목록에 안 온다 — 그래서 아래 작은 카드는 지금은 실제로 안 그려진다.
            // 게이트를 풀거나 완화하면 바로 되살아나므로 지운다기보다 남겨 둔다.
            //
            // 🚨 사진 없는 곳은 카드를 작게 만든다(사용자 지시 2026-09-01:
            // "사진이 없는 곳은 그만큼 메리트가 없거나 유명하지 않은 장소 —
            //  빈칸을 너무 크게 할애하지 말고 카드 크기 줄이고 텍스트 정보와
            //  길안내 정도까지"). 예전에는 사진이 없어도 4:3짜리 아이콘 자리를
            // 그대로 잡아 화면 절반이 빈 칸이었다.
            const compact = !photoUrl;
            return (
              <div className={"place-row" + (compact ? " pr-compact" : "")} key={p.id}>
                {/* 사진이 여러 장이면 눌러서 넘길 수 있다 — PlacePhoto가 맡는다.
                    legacy 좌표·사진을 쓰는 예전 항목도 있어 image를 채워 넘긴다. */}
                {photoUrl && <PlacePhoto place={{ ...p, image: photoUrl }} />}
                <div className="pr-body">
                  <div className="pr-top">
                    {/* 작은 카드에서는 사진 자리가 없으니 아이콘을 여기 작게 붙인다 —
                        어느 칸의 장소인지가 한눈에 보여야 한다. */}
                    {compact && (
                      <span className="pr-chip-icon" style={{ "--cc": meta.color } as CSSProperties}>
                        {meta.iconImage ? (
                          <img src={`${import.meta.env.BASE_URL}${meta.iconImage}`} alt="" />
                        ) : (
                          meta.icon
                        )}
                      </span>
                    )}
                    <span className="pr-category" style={{ "--cc": meta.color } as CSSProperties}>
                      {t.categoryLabels[p.category]}
                    </span>
                    <span className="pr-gu">
                      {districtFullName(p.gu, language)}
                      {p.dong ? ` ${dongName(p.dong, language)}` : ""}
                    </span>
                  </div>
                  {/* 🔗 이름을 누르면 네이버 **통합검색**으로 간다.
                      처음엔 네이버 지도로 보냈는데 2026-09-01 사용자 캡처로 틀린 게
                      드러났다 — 축제·골목·꽃길은 지도에 등록된 '장소'가 아니라
                      "검색결과가 없습니다"만 떴다. 통합검색은 그 자치구가 직접 만든
                      공식 행사·관광 안내 페이지를 잡아 준다.
                      아래 길찾기 버튼과 역할이 다르다 — 이건 "자세히 보기"다. */}
                  {p.confirmed ? (
                    <button
                      type="button"
                      className="pr-name pr-name-link"
                      onClick={() => openPlaceInfo(p)}
                    >
                      {placeName(p.name, language).main}
                      <span className="pr-name-arrow" aria-hidden="true">↗</span>
                    </button>
                  ) : (
                    <div className="pr-name">확인 필요</div>
                  )}
                  {/* 번역된 이름 아래에 한국어 원문. 기계 번역이 어색해도 손님이
                      택시 기사에게 보여줄 수 있어야 한다(placeText.ts 주석 참고). */}
                  {placeName(p.name, language).sub && (
                    <div className="name-ko" lang="ko">{p.name}</div>
                  )}
                  {p.note && <div className="pr-note">{translateText(p.note, language)}</div>}
                  {/* 주소는 관광공사에서 받은 곳만 있다. 사진이 없는 작은 카드일수록
                      글로 줄 수 있는 정보가 하나라도 더 있는 게 낫다. */}
                  {p.addr && <div className="pr-addr">{p.addr}</div>}
                  {/* 관광공사 사진과 함께 받은 실제 좌표가 있으면 길찾기에도 쓴다
                      (2026-08-29 — 좌표가 이미 있는데도 검색 화면만 뜨던 문제). */}
                  {p.confirmed && (
                    <MapDirections
                      place={
                        p.lat == null && legacyPhoto?.lat != null
                          ? { ...p, lat: legacyPhoto.lat, lng: legacyPhoto.lng }
                          : p
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🗺️ 지도가 화면 밖으로 나갔을 때만 뜬다. 목록 위에 떠 있어서 자리를
          차지하지 않고, 누르면 지도로 한 번에 돌아간다.
          ⚠️ 뜨고 지는 것이 **레이아웃을 건드리지 않아야** 한다 — 높이를 바꾸면
          그 변화가 다시 '화면 밖인지'를 뒤집어 덜덜 떨린다(useMapOffScreen 주석). */}
      {map.off && (
        <button
          type="button"
          className="to-map"
          onClick={() => map.ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <span aria-hidden="true">🗺️</span> {t.backToMap}
        </button>
      )}
    </section>
  );
}

/**
 * 지도가 화면 밖으로 나갔는지 지켜본다. 나가면 작은 "지도" 버튼을 띄운다.
 *
 * 🐞 여기 있던 것을 2026-09-01에 걷어냈다 — 지도를 화면에 붙여 두고(sticky)
 * 스크롤하면 작게 접는 장치였는데, 사용자가 **"지도 작아지면서 덜덜 떨린다"**고
 * 짚어 줬다. 원인은 되먹임 고리다:
 *   접힌다 → 지도가 작아진다 → 페이지 전체 높이가 줄어든다 → 스크롤 위치가
 *   내용에 대해 뒤로 밀린다 → 표식이 다시 화면 안으로 들어온다 → 펴진다 →
 *   높이가 늘어난다 → 다시 접힌다 …
 * 경계 근처에서 이게 초당 몇 번씩 반복된다. **크기를 바꾸는 것을 크기 변화가
 * 스스로 일으키게 만들면 반드시 이렇게 된다.**
 *
 * 지금 것은 안전하다 — 버튼을 띄우고 내리는 것뿐이라 **레이아웃을 건드리지 않는다.**
 * 지도는 그냥 위로 밀려 나간다(사용자 결정: "화면이 작아서 지도가 밀려 나가는 게 맞겠어").
 */
function useMapOffScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const [off, setOff] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      // 🐞 "화면 밖"이 두 가지라 처음엔 틀렸다(2026-09-01) — 지도가 **위로 지나간**
      // 것과 **아직 아래에 있어 안 나온** 것. 그냥 !isIntersecting으로 보면 둘을
      // 못 가려서, 맨 위 계절 화면을 보는 중에도 "지도" 버튼이 떠 있었다.
      // 위로 지나갔을 때(아래 끝이 화면 위쪽 밖)만 띄운다.
      setOff(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, off };
}

/**
 * 📍 내 위치의 구를 보여주는 한 줄.
 *
 * 네 가지 결과를 각각 다른 말로 적는다(myDistrict.ts 참고) — 뭉뚱그리면
 * "서울 밖이라 안 나오는 것"과 "위치 권한을 거절해서 안 나오는 것"을 구분 못 한다.
 * 특히 **서울 밖일 때 가장 가까운 구를 억지로 대지 않는다.** 틀린 구 이름은
 * 그 아래 목록 전체를 못 믿게 만든다(CLAUDE.md 정확도 원칙).
 */
function MyLocationChip({
  state,
  onFind,
  t,
}: {
  state: MyDistrict | "loading" | null;
  onFind: () => void;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  if (state === null) {
    return (
      <button type="button" className="myloc myloc-btn" onClick={onFind}>
        {t.myLocationFind}
      </button>
    );
  }
  if (state === "loading") {
    return <span className="myloc myloc-loading">{t.mapLocating}</span>;
  }
  if (state.kind === "gu") {
    return (
      <span className="myloc myloc-found">
        <span className="myloc-pin" aria-hidden="true">📍</span>
        {t.myLocationHere(state.gu)}
      </span>
    );
  }
  if (state.kind === "outside") {
    return <span className="myloc myloc-note">{t.myLocationOutside}</span>;
  }
  // 못 찾았을 때는 **다시 누를 수 있게** 버튼으로 남긴다 — 잠깐 안 됐을 수 있다.
  return (
    <button type="button" className="myloc myloc-btn myloc-failed" onClick={onFind}>
      {t.myLocationFailed}
    </button>
  );
}
