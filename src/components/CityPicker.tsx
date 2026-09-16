import { CITIES, MAP_COLS, type City, type CityStatus } from "../data/cities";
import { useLanguage } from "../lib/useLanguage";

// 🗺️ **도시 고르는 칸** — 「한국, 어디로 가세요?」
//
// 사장님 (2026-09-16):
//   *"도시를 고를 수 있는 카드를 만들어야 할 거 같아, 점진적 확대할 거니"*
//   *"도별로 나누고 지도 참조해서 대도시 따로"*
//
// ── 왜 17곳을 다 그리나 ───────────────────────────────────────────────────
//   서울 하나만 그리면 **부산이 언제 오는지 아무도 모른다.** 손님도 모르고
//   우리도 모른다. 칸을 다 그려 두면 비어 있는 게 눈에 보이고, 보이면 채운다.
//   서울 법정동 467개를 등록하자 빈 동네가 **0 → 428개**로 드러났던 것과 같다 —
//   그전에 「빈 곳 0」이었던 건 다 채워서가 아니라 **볼 자리가 없어서**였다.
//
// ── 🔁 처음에는 격자를 **둘로 나눠** 그렸다. 되돌렸다 ────────────────────
//   지시대로 대도시 격자 · 도 격자를 위아래로 놓아 보니, 둘 다 같은 5열 지도라
//   빈 칸이 절반이 넘고 **폰에서 두 화면을 통째로 먹었다**(약 800px).
//   17곳이 한 장에 들어가면 6줄(약 360px)이고, 무엇보다 **한반도 모양이 보인다** —
//   서해안이 왼쪽, 강원이 오른쪽 위, 제주가 왼쪽 아래.
//   → **지도는 한 장**으로 합치고, 대도시와 도는 **모양으로** 갈랐다(둥근 칸 vs 네모 칸).
//     아래 설명 줄에 어느 모양이 무엇인지 적어 둔다 — 모양만으로는 안 통한다.
//   나눠 그리는 쪽이 맞다고 하시면 되돌리기는 쉽다(이 파일 하나만 고치면 된다).
//
// ── 🙈 **열린 도시가 하나면 이 칸은 아예 안 나온다** (2026-09-16) ────────
//   사장님: *"지금 아무것도 없는데 부산 열릴 때까지 가릴 수 있나"*
//
//   맞는 말씀이다. 서울 하나뿐인데 「한국, 어디로 가세요?」를 띄우면
//   손님에게는 **못 가는 곳 열여섯 개를 보여 주는 화면**이 된다.
//   앱이 작아 보이지, 커 보이지 않는다. 아래 탭에서 이미 겪은 일이다 —
//   네 칸 중 셋이 흐리게 죽어 있으면 "아직 안 만든 앱"으로 보인다.
//
//   🔑 **가리는 것과 지우는 것은 다르다.** 자리(cities.ts 17곳)는 그대로 둔다.
//      가려 두면 부산이 열리는 날 저절로 나타난다 — 아무도 다시 안 만들어도 된다.
//
//   ⚙️ 되살아나는 조건 — cities.ts 에서 부산 status 를 「공개」로 바꾸면
//      열린 도시가 둘이 되어 **이 칸도 나오고 단추도 된다.** 그 한 줄이 전부다.
//
// ── 🚨 왜 「단추」가 나중에 생기나 ────────────────────────────────────────
//   고를 것이 하나면 고르는 게 아니다. 눌러도 아무 일 없는 단추를 놓으면
//   손님은 앱이 고장 난 줄 안다(App.tsx: *"단추는 없애든 되게 하든
//   둘 중 하나여야 한다"*).
//   → 열린 도시가 둘 이상이 되는 순간 칸이 저절로 단추가 된다(아래 pick).
//     그때 App 에서 onPick 만 넘겨 주면 된다. 지금은 넘기지 않는다.
//
// ── ⚠️ 이 그림은 실측 지도가 아니다 ──────────────────────────────────────
//   cities.ts 의 row/col 을 그대로 격자에 앉힌 것이다. 위도(북→남)·경도(서→동)
//   순서는 맞지만 모양은 손으로 앉혔다. 서울 육각형 지도(seoulHexMap.ts)처럼
//   참고 이미지를 픽셀로 잰 것이 아니다 — 고칠 일이 있으면 cities.ts 를 고친다.

function statusMod(s: CityStatus): string {
  return s === "공개" ? "open" : s === "준비중" ? "soon" : "later";
}

/** 칸 하나. 열린 도시가 둘 이상일 때만 단추가 된다(위 머리말 참고). */
function Tile({
  city, label, statusText, kindText, onPick,
}: {
  city: City;
  label: string;
  statusText: string;
  kindText: string;
  onPick?: (key: string) => void;
}) {
  const style = { gridRow: city.row + 1, gridColumn: city.col + 1 };
  const cls = `city-tile is-${statusMod(city.status)}`
    + (city.kind === "대도시" ? " is-big" : "");
  // 🗣️ 화면에는 이름만 적지만, 읽어 주는 손님에게는 **무엇이고 어떤 상태인지**까지
  //    말해 준다. 모양과 색만으로 뜻을 전하면 그 손님은 아무것도 못 받는다.
  const spoken = `${label} — ${kindText} · ${statusText}`;

  if (city.status === "공개" && onPick) {
    return (
      <button type="button" className={cls} style={style}
        aria-label={spoken} onClick={() => onPick(city.key)}>
        {label}
      </button>
    );
  }
  return (
    <div className={cls} style={style} role="img" aria-label={spoken}>
      {label}
    </div>
  );
}

export default function CityPicker({ onPick }: { onPick?: (key: string) => void }) {
  const { t, language } = useLanguage();

  // 🌏 도시 **이름**은 translations.ts 에 넣지 않았다 — 17곳 × 12언어 = 204칸을
  //    손으로 채우면 반드시 어긋난다. 한국어 손님에게는 한글, 나머지 손님에게는
  //    로마자를 준다. 로마자는 한국 안내판·지하철·고속버스표에 실제로 쓰는 표기라
  //    어느 나라 손님이든 그대로 들고 물어볼 수 있다.
  const nameOf = (c: City) => (language === "ko" ? c.ko : c.en);
  const statusOf = (c: City) =>
    c.status === "공개" ? t.cityReady : c.status === "준비중" ? t.citySoon : t.cityLater;
  const kindOf = (c: City) =>
    c.kind === "대도시" ? t.cityGroupBig : t.cityGroupProvince;

  // 🔢 지금 열려 있는 도시 수. 이 숫자 하나가 두 가지를 정한다(머리말 참고).
  const open = CITIES.filter((c) => c.status === "공개").length;

  // 🙈 하나뿐이면 **아무것도 그리지 않는다.** 2026-09-17에 부산이 열려 나타났다.
  if (open < 2) return null;

  const pick = onPick;

  return (
    <section className="city-picker" aria-labelledby="city-picker-h">
      <h2 id="city-picker-h" className="city-picker-title">{t.cityPickerTitle}</h2>
      <p className="city-picker-note">{t.cityPickerNote}</p>

      <div className="city-grid" style={{ gridTemplateColumns: `repeat(${MAP_COLS}, 1fr)` }}>
        {CITIES.map((c) => (
          <Tile key={c.key} city={c} label={nameOf(c)}
            statusText={statusOf(c)} kindText={kindOf(c)} onPick={pick} />
        ))}
      </div>

      {/* 🏷️ 모양만으로는 안 통한다 — 어느 모양이 무엇인지 글자로 적는다.
          `aria-hidden` 인 이유: 칸마다 이미 "대도시 · 준비 중"을 말로 달아 뒀다.
          여기까지 읽어 주면 같은 말을 두 번 듣는다. */}
      <p className="city-legend" aria-hidden="true">
        <span className="city-legend-item"><i className="city-swatch is-big" />{t.cityGroupBig}</span>
        <span className="city-legend-item"><i className="city-swatch" />{t.cityGroupProvince}</span>
        <span className="city-legend-item"><i className="city-swatch is-open" />{t.cityReady}</span>
        <span className="city-legend-item"><i className="city-swatch is-soon" />{t.citySoon}</span>
      </p>
    </section>
  );
}
