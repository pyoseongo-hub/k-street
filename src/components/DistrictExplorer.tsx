import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLanguage } from "../lib/useLanguage";
import { ALL_PLACES, CATEGORY_META, type Category } from "../data/seed";
import { SEOUL_HEX_ROWS } from "../data/seoulHexMap";
import { districtShortName, districtFullName, dongName } from "../data/districtNamesEn";
import MapDirections from "./MapDirections";
import { openPlaceInfo } from "../lib/mapLinks";
import { getTourImage } from "../lib/tourImages";
import { getMyDistrict, type MyDistrict } from "../lib/myDistrict";
import { placeName, translateText } from "../lib/placeText";

// street(골목·거리)를 2026-09-01에 추가했다 — 관광공사 자료의 골목 40곳이
// 들어갈 칸이 없어서 통째로 버려지고 있었다(seed.ts의 Category 주석 참고).
const MAP_CATEGORIES: Category[] = ["market", "street", "flower", "walk", "hike", "museum"];

export default function DistrictExplorer() {
  const { t, language } = useLanguage();
  const [category, setCategory] = useState<Category>("market");
  const [gu, setGu] = useState<string | null>(null);
  // 내 위치의 구. null = 아직 안 눌러 봤다, "loading" = 찾는 중.
  const [myGu, setMyGu] = useState<MyDistrict | "loading" | null>(null);
  const condensed = useCondenseOnScroll();

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

      {/* 🧲 고르는 것(갈래 칩 · 내 위치 · 육각 지도)을 **맨 위에 모아 화면에 붙여 둔다**
          (사용자 지시 2026-09-01: "2안 / 스크롤해도 지도는 안밀리게 / 이카드를 맨위로").
          2026-08-28에는 반대로 지도를 목록 **아래**로 내렸었는데("정보가 위로 가게"),
          그러자 동네를 바꿀 때마다 목록을 통째로 지나 내려가야 했다. 붙여 두면
          두 요구가 같이 풀린다 — 결과는 여전히 눈앞에 있고, 지도는 늘 손 닿는 곳에 있다. */}
      <div ref={condensed.sentinelRef} className="de-sentinel" aria-hidden="true" />
      <div className={"de-sticky" + (condensed.on ? " condensed" : "")}>
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

      {category === "flower" && (
        <p className="map-disclaimer">🌸 {t.flowerBloomDisclaimer}</p>
      )}

      <p className="map-disclaimer">
        {t.mapDisclaimerStart}<b>{t.mapDisclaimerBold}</b>{t.mapDisclaimerEnd}
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
                {photoUrl && (
                  <div className="fc-art fc-art-photo" style={{ backgroundImage: `url(${photoUrl})` }}>
                    <span className="fc-photo-credit">{t.photoCredit}</span>
                  </div>
                )}
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

    </section>
  );
}

/**
 * 붙어 있는 고르기 영역을 **스크롤을 시작하면 작게** 접는다.
 *
 * 왜 필요한가 — 갈래 칩 + 내 위치 + 육각 지도를 다 펴 두면 폰 화면(900px)의 **55%**를
 * 차지해서, 정작 보러 온 목록이 한 칸밖에 안 보였다. 그렇다고 지도를 늘 작게 두면
 * 로마자 표기가 뭉개진다(2026-08-28 사용자 지적: "가독성 떨어져 특히 영어").
 * 그래서 **맨 위에서는 크게, 목록을 훑을 때는 작게** 두 크기를 오간다.
 *
 * 스크롤 위치를 직접 재지 않고 1px짜리 표식(sentinel)이 화면 밖으로 나갔는지만 본다 —
 * 스크롤 이벤트를 매번 받아 계산하면 손가락을 따라 버벅인다.
 */
function useCondenseOnScroll() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setOn(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { sentinelRef, on };
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
