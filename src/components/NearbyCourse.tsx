import { useMemo, useState, type CSSProperties } from "react";
import { useLanguage } from "../lib/useLanguage";
import { usePlacesHere } from "../lib/usePlaces";
import { getPositionOrNull } from "../lib/userPosition";
import { buildCourse, formatMeters, COURSE_SIZES, REACH, type Course, type CourseSize, type Reach } from "../lib/nearbyCourse";
import { CATEGORY_META, type Category } from "../data/seed";
import { districtFullName, dongName } from "../data/districtNamesEn";
import { placeName } from "../lib/placeText";
import MapDirections from "./MapDirections";
import SaveButton from "./SaveButton";

// 🧭 **내 주변 코스** — 사장님 (2026-09-22): *"내 주변 코스 받는게 목표야 지금 구조로 만들어"*
//
// ── 🚨 시간을 묻지도, 답하지도 않는다 ───────────────────────────────────
//   사장님 설계안에는 「사용가능시간 1시간·2시간·반나절·하루」와
//   「예상 소요시간 2시간 10분」이 있었다. **그 두 칸은 안 만들었다.**
//   사장님이 2026-09-11에 직접 못박은 것과 정면으로 부딪히기 때문이다 —
//     "그시간을 잴수없어 거기에 머무르는 시간은 개개인이 틀리니
//      그러니 숫자로 몇개 코스를 넣을지 정하게 하는게 좋을거 같아"
//   그래서 손님이 고르는 것은 **몇 곳**이고, 화면에 뜨는 것은 **미터**다.
//   「3곳이면 오전에 되겠네」는 손님이 판단한다 — 우리가 대신 판단하면 거짓말이 된다.
//   docs/코스-추천.md 의 「적으면 안 되는 것 / 적어도 되는 것」 표가 이 파일의 잣대다.
//
// ── 🧭 구 선택 화면을 밀어내지 않는다 ───────────────────────────────────
//   「가까운 순 보기」(DistrictExplorer)는 **숙소에서 내일을 계획할 때** 쓴다.
//   이 화면은 **이미 밖에 나와 있을 때** 쓴다. 둘은 쓰는 때가 다르다.
//   그래서 이 칸은 동네 화면 맨 위에 **접힌 단추 하나**로만 있는다 —
//   자리를 안 먹고, 필요한 사람만 편다.
//
// ── 🔒 위치는 **단추를 누른 그 순간에만** 묻는다 ────────────────────────
//   앱을 켜자마자 권한 창이 뜨면 대부분 거절하고, 한 번 거절하면 되돌리기 어렵다
//   (userPosition.ts 의 오래된 판단). 그래서 열어도 안 묻고, **만들기를 눌러야** 묻는다.
//
// ── 🖥️ 서버도 AI 도 없다 ────────────────────────────────────────────────
//   계산은 전부 브라우저 안에서 돈다(nearbyCourse.ts). CLAUDE.md 「서버를 두지 않는다」.

/** 갈래 칩 — 동네 화면의 것과 같은 차례로 둔다. 손님이 두 곳에서 다른 순서를 보면 헷갈린다. */
const CHIPS: Category[] = ["market", "street", "walk", "autumn", "hike", "museum", "shop", "temple", "beach", "view"];

type Phase =
  | { kind: "idle" }
  | { kind: "finding" }
  /** 위치를 못 받았다 — 손님이 고칠 수 있는 문제라 무엇을 하면 되는지까지 적는다 */
  | { kind: "noPosition" }
  /** 위치는 받았는데 한도 안에 곳이 없다 */
  | { kind: "empty" }
  | { kind: "done"; course: Course };

export default function NearbyCourse() {
  const { t, language } = useLanguage();
  const PLACES = usePlacesHere();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<CourseSize>(3);
  const [reach, setReach] = useState<Reach>("walk");
  const [cats, setCats] = useState<Category[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  // 🚨 **곳이 하나도 없는 갈래는 칩을 안 그린다.** 눌러도 빈 코스가 나오는 단추는
  //    손님 눈에 「고장 난 앱」이다 — DistrictExplorer 가 같은 이유로 같은 일을 한다.
  //    docs/코스-추천.md 의 경고(9개 구에 골목 0곳)가 여기서 풀린다.
  const shownChips = useMemo(
    () => CHIPS.filter((c) => PLACES.some((p) => p.category === c && p.confirmed && p.lat != null)),
    [PLACES],
  );

  const toggleCat = (c: Category) =>
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  async function make() {
    setPhase({ kind: "finding" });
    const pos = await getPositionOrNull();
    if (!pos) {
      setPhase({ kind: "noPosition" });
      return;
    }
    const course = buildCourse(PLACES, pos, { size, reach: REACH[reach], categories: cats });
    setPhase(course ? { kind: "done", course } : { kind: "empty" });
  }

  if (!open)
    return (
      <button type="button" className="nc-open" onClick={() => setOpen(true)}>
        <span className="nc-open-pin" aria-hidden="true">📍</span>
        {t.nearbyCourseTitle}
      </button>
    );

  const course = phase.kind === "done" ? phase.course : null;

  return (
    <section className="panel nearby-course">
      <div className="nc-head">
        <h2>📍 {t.nearbyCourseTitle}</h2>
        <button type="button" className="nc-close" onClick={() => setOpen(false)} aria-label="✕">✕</button>
      </div>
      {/* 📏 **직선거리라는 사실을 여기서 한 번 밝힌다.** 아래 숫자마다 붙이면 읽기 힘들다 */}
      <p className="nc-intro">{t.nearbyCourseIntro}</p>
      {/* 📌 직선거리라는 사실은 위 줄이 말한다. 이 줄은 **값 자체가 틀릴 수 있다**는 말이다
          (사장님 지시 2026-09-26: "자료도 100 프로 믿을수 없으니 안내문 필수야"). */}
      <p className="map-disclaimer map-disclaimer--fine">{t.dataMayBeWrong}</p>

      <div className="nc-row">
        <span className="nc-row-label">{t.nearbyCourseHowMany}</span>
        <div className="nc-opts">
          {COURSE_SIZES.map((n) => (
            <button
              key={n}
              type="button"
              className={"nc-opt" + (size === n ? " on" : "")}
              aria-pressed={size === n}
              onClick={() => setSize(n)}
            >
              {t.nearbyCourseStops(n)}
            </button>
          ))}
        </div>
      </div>

      {/* 🚶🚇 「이동방식」을 **거리 한도**로 옮긴 것이다 — 시간이 아니다.
          한도 숫자(1.2km·4km)는 화면에 안 적는다. 손님에게 보이는 것은 실제 거리뿐이다. */}
      <div className="nc-row">
        <div className="nc-opts">
          <button type="button" className={"nc-opt" + (reach === "walk" ? " on" : "")}
            aria-pressed={reach === "walk"} onClick={() => setReach("walk")}>🚶 {t.nearbyCourseReachWalk}</button>
          <button type="button" className={"nc-opt" + (reach === "transit" ? " on" : "")}
            aria-pressed={reach === "transit"} onClick={() => setReach("transit")}>🚇 {t.nearbyCourseReachTransit}</button>
        </div>
      </div>

      <div className="nc-row">
        <div className="nc-opts nc-cats">
          <button type="button" className={"nc-opt" + (cats.length === 0 ? " on" : "")}
            aria-pressed={cats.length === 0} onClick={() => setCats([])}>{t.nearbyCourseAnyTheme}</button>
          {shownChips.map((c) => (
            <button
              key={c}
              type="button"
              className={"nc-opt" + (cats.includes(c) ? " on" : "")}
              aria-pressed={cats.includes(c)}
              style={{ "--cc": CATEGORY_META[c].color } as CSSProperties}
              onClick={() => toggleCat(c)}
            >
              {t.categoryLabels[c]}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="nc-make" onClick={make} disabled={phase.kind === "finding"}>
        {phase.kind === "finding" ? t.nearbyCourseFinding : t.nearbyCourseMake}
      </button>

      {/* 🚨 못 받은 것과 못 찾은 것을 **가른다.** 뭉치면 손님이 무엇을 해야 할지 모른다
          (translations.ts 의 myLocationNoPermission 주석 — 이 저장소가 한 번 데인 자리다). */}
      {phase.kind === "noPosition" && <p className="nc-warn">{t.myLocationNoPermission}</p>}
      {phase.kind === "empty" && <p className="nc-warn">{t.nearbyCourseNone}</p>}

      {course && (
        <div className="nc-result">
          {/* 부탁받은 곳 수를 못 채웠으면 **그렇다고 말한다.** 조용히 적게 주지 않는다 */}
          {course.stops.length < course.asked && (
            <p className="nc-warn">{t.nearbyCourseShort(course.stops.length)}</p>
          )}
          <p className="nc-total">{t.nearbyCourseTotal(formatMeters(course.total))}</p>
          <ol className="nc-stops">
            {course.stops.map((s, i) => {
              const meta = CATEGORY_META[s.place.category];
              return (
                <li className="nc-stop" key={s.place.id}>
                  {/* ➡️ 앞 지점에서 여기까지. 첫 줄만 「내 위치에서」라고 밝힌다 */}
                  <div className="nc-leg">
                    <span className="nc-leg-from">{i === 0 ? t.nearbyCourseFromMe : `${i}`}</span>
                    <span className="nc-leg-m">{formatMeters(s.fromPrev)}</span>
                  </div>
                  <div className="nc-card">
                    <div className="nc-card-top">
                      <span className="nc-no" style={{ "--cc": meta.color } as CSSProperties}>{i + 1}</span>
                      <span className="nc-cat" style={{ "--cc": meta.color } as CSSProperties}>
                        {t.categoryLabels[s.place.category]}
                      </span>
                      <span className="nc-gu">
                        {districtFullName(s.place.gu, language)}
                        {s.place.dong ? ` ${dongName(s.place.dong, language)}` : ""}
                      </span>
                      <SaveButton place={s.place} className="save-btn save-btn--inline" />
                    </div>
                    <div className="nc-name">{placeName(s.place.name, language).main}</div>
                    {/* 기계 번역이 어색해도 손님이 택시 기사에게 보여 줄 수 있어야 한다 */}
                    {placeName(s.place.name, language).sub && (
                      <div className="name-ko" lang="ko">{s.place.name}</div>
                    )}
                    <MapDirections place={s.place} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
