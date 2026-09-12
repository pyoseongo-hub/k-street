// ✈️ **도착 안내** — 머리줄 ✈️ 단추로 여는 전체화면.
//
// 사장님 지시 (2026-09-12):
//   "여기도 푸드에 있는 가이드가 필요할거같아" · "다 넣어 —
//    음식이라서가 아니라 **여행에 필요한 앱 소개**야"
//
// 📌 뒤의 한마디가 칸을 정했다. 처음에 나는 「식당 예약·배달」 두 칸을
//    Kfood 것이라 보고 빼려 했는데, 그게 아니다 —
//    **한국 전화번호가 없으면 막히는 문제**를 푸는 칸이다.
//    캐치테이블 글로벌·배민이 해외 번호와 해외 카드를 어떻게 받는지가 내용이다.
//    손님이 서울에 내려서 겪는 일이지 음식 이야기가 아니다. 그래서 9칸 전부 넣었다.
//
// ─────────────────────────────────────────────────────────────────────────
// 🚚 **글은 Kfood 에서 그대로 옮겼다** (src/data/arrival-guide.json)
// ─────────────────────────────────────────────────────────────────────────
//   같은 제작자가 만든 자료다. **12개 언어가 이미 다 채워져 있어** 번역이 필요 없었다
//   (Kfood 주석에는 「한/영/일/중 + 영어 폴백」이라고 적혀 있는데, 실제 파일에는
//    12개가 다 있다 — 주석이 낡은 것이다).
//
//   옮기면서 **두 가지를 고쳤다**:
//
//   ① **이 앱을 가리키는 말.** Kfood 는 「이 앱 **가게** 화면의 길찾기 버튼」이라고
//      하는데 우리는 식당만 있는 앱이 아니다 → 「곳 화면」. 7개 언어에서 고쳤다.
//
//   ② 🚨 **확인 못 한 값은 전부 뺐다.** 이게 Kfood 와 우리가 갈리는 자리다.
//      Kfood 는 값을 적고 「2026년 기준이며 달라질 수 있어요」를 붙인다.
//      우리는 FAQ 에 **「확인하지 못한 값이라 안 적습니다」**를 12개 언어로
//      이미 내보냈다 — 여기서 값을 적으면 그 약속을 우리가 깬다.
//
//      그리고 실제로 **엇갈렸다**: 2026-09-12에 공항철도 직통 요금을 찾아보니
//      자료마다 **11,000원과 13,000원**으로 갈렸고 일반열차 값은 아예 안 나왔다.
//      저장소 규칙이 이럴 때 답을 준다 — **「숫자가 엇갈리면 숫자를 적지 않는다」.**
//      · 뺀 것 — AREX 요금 · 교통카드 카드값 · 잔액 환불 수수료 (12개 언어 45곳)
//      · 남긴 것 — 「₩10,000 씩 넣으면 편해요」. 이건 **값이 아니라 지폐 단위**다.
//      · 소요 시간(약 60분 / 약 45분)은 남겼다 — 값이 아니고 잘 안 바뀐다.
//      대신 칸마다 **공식 안내 단추**가 붙어 있다. 값은 거기서 보면 된다.
//
// ⚠️ 공식 링크가 죽으면 우리가 갈아 끼운다(검색으로 때우지 않는다) —
//    Kfood 의 scripts/check-guide-links.mjs 와 같은 점검을 여기에도 붙일 것.

import { useState } from "react";
import { createPortal } from "react-dom";
import { useOverlay } from "../lib/useOverlay";
import { useLanguage } from "../lib/useLanguage";
import GUIDE from "../data/arrival-guide.json";

interface Section {
  icon: string;
  title: string;
  summary: string;
  videoQuery?: string;
  details: string[];
}
interface Guide {
  title: string;
  intro: string;
  sections: Section[];
}
interface LinkItem {
  icon: string;
  url?: string;
  urls?: Record<string, string>;
  label: Record<string, string>;
}

const DATA = GUIDE as unknown as {
  단추라벨: Record<string, string>;
  공식링크라벨: Record<string, string>;
  안내: Record<string, Guide>;
  공식링크: LinkItem[][];
};

/** 그 언어 것, 없으면 영어. Kfood 와 같은 폴백 규칙이다. */
const pick = <T,>(table: Record<string, T>, lang: string): T => table[lang] ?? table.en;

/** ✈️ 단추에 붙는 짧은 말 — 「도착 안내」/「Arrival」. */
export function arrivalLabel(lang: string): string {
  return pick(DATA.단추라벨, lang);
}

export default function ArrivalGuide({ onClose }: { onClose: () => void }) {
  // 🔙 폰 뒤로가기로 닫는다 — 전체화면에서 손님이 실제로 쓰는 길이다.
  //    주소 기록을 안 남기면 뒤로가기가 **앱을 통째로 꺼뜨린다**(useOverlay 머리말).
  useOverlay(onClose);
  const { language } = useLanguage();
  const g = pick(DATA.안내, language);
  const linkLabel = pick(DATA.공식링크라벨, language);
  // 🔽 **첫 칸은 펼쳐 둔다.** 아홉 칸이 다 접혀 있으면 열자마자 제목만 보여
  //    「빈 화면」처럼 읽힌다. 공항에서 제일 먼저 필요한 것이 첫 칸이기도 하다.
  const [open, setOpen] = useState<number | null>(0);

  return createPortal(
    // 🚨 body 로 옮겨 그린다(portal) — 조상의 transform 때문에 position:fixed 가
    //    화면이 아니라 그 카드를 기준으로 잡히는 사고를 LuggageCard 에서 겪었다.
    <div className="arrival-back" role="dialog" aria-modal="true" aria-label={g.title}>
      <div className="arrival-card">
        <div className="ag-head">
          <h2 className="ag-title">
            <span aria-hidden="true">✈️</span> {g.title}
          </h2>
          <button className="ag-close" onClick={onClose} aria-label="✕">
            ✕
          </button>
        </div>
        <p className="ag-intro">{g.intro}</p>

        {g.sections.map((s, i) => {
          const links = DATA.공식링크[i] ?? [];
          const isOpen = open === i;
          return (
            <section className={"ag-sec" + (isOpen ? " open" : "")} key={i}>
              <button
                className="ag-sec-head"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="ag-icon" aria-hidden="true">
                  {s.icon}
                </span>
                <span className="ag-sec-text">
                  <span className="ag-sec-title">{s.title}</span>
                  <span className="ag-sec-sum">{s.summary}</span>
                </span>
                <span className="ag-chev" aria-hidden="true">
                  {isOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {isOpen && (
                <div className="ag-body">
                  <ul className="ag-list">
                    {s.details.map((d, j) => (
                      <li key={j}>{d}</li>
                    ))}
                  </ul>

                  {links.length > 0 && (
                    <>
                      <p className="ag-link-label">▶ {linkLabel}</p>
                      <div className="ag-links">
                        {links.map((it, j) => {
                          // 🚉 같은 영상이 언어판으로 여럿 있는 것이 있다(AREX 환승 안내).
                          //    보는 언어에 맞는 판을 연다 — 없으면 영어판.
                          const href = it.urls
                            ? it.urls[language] ?? it.urls.en ?? Object.values(it.urls)[0]
                            : it.url;
                          if (!href) return null;
                          return (
                            <a
                              className="ag-link"
                              key={j}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span className="ag-link-icon" aria-hidden="true">
                                {it.icon}
                              </span>
                              <span className="ag-link-text">{pick(it.label, language)}</span>
                              <span className="ag-link-go" aria-hidden="true">
                                ↗
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
