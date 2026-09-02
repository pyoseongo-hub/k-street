import { useMemo, useState } from "react";
import gallery from "../data/tour-gallery.json";

// 🖼️ 표지 사진 고르는 화면 (2026-09-02 사용자 지시: "여기 자동 사진들 너무 별로라
// 서울 야경 사진 몇 개 줘봐 거기서 고를게").
//
// 왜 앱 안에 만들었나 — 사진이 관광공사 서버(tong.visitkorea.or.kr)에 있는데
// 작업 세션에서는 그 host가 막혀 있어 **내가 사진을 볼 수가 없다.** 폰에서는
// 잘 보이므로, 고르는 자리를 앱 안에 두고 사용자가 번호로 알려 주는 쪽이 빠르다.
//
// 지금 계절 표지는 그 계절 장소들의 사진 중 아무거나 돌린다. 그래서 축제 포스터가
// 표지로 뜨는 일이 생겼다(사용자 캡처: 글씨가 잔뜩 박힌 노란 포스터). 여기서 고른
// 것을 seed에 못박으면 그 일이 없어진다.
//
// 여는 법: 주소 끝에 **?pick=cover** 를 붙인다.
//   https://pyoseongo-hub.github.io/k-street/?pick=cover
//
// ⚠️ 임시 화면이다. 고르고 나면 지워도 된다 — 지울 때 App.tsx의 분기도 같이 지운다.

interface GalleryPhoto { url: string; thumb?: string }
interface GalleryEntry { name?: string; gu?: string; photos?: GalleryPhoto[] }
const GALLERY = gallery as Record<string, GalleryEntry>;

/** 야경·전망이 있을 만한 곳. 이름으로만 거른다 — 사진 내용은 사람이 보고 정한다. */
const NIGHT = /(야경|남산|서울타워|한강|반포|달빛|청계천|서울로|낙산|북악|스카이|전망|타워|불꽃|빛|라이트|노을|야행|월드타워)/;

export default function CoverPicker() {
  const [only, setOnly] = useState(true);

  const shots = useMemo(() => {
    const out: { n: number; url: string; place: string; gu: string }[] = [];
    let n = 0;
    for (const entry of Object.values(GALLERY)) {
      const name = entry.name ?? "";
      if (only && !NIGHT.test(name)) continue;
      for (const p of entry.photos ?? []) {
        n += 1;
        out.push({ n, url: p.url, place: name, gu: entry.gu ?? "" });
      }
    }
    return out;
  }, [only]);

  return (
    <div className="pick-wrap">
      <div className="pick-head">
        <h2>표지 사진 고르기</h2>
        <p>
          마음에 드는 사진의 <b>번호</b>를 알려 주세요. 여러 개도 됩니다 —
          계절마다 하나씩 정해 두면 표지가 그 사진으로 고정됩니다.
        </p>
        <p className="pick-note">
          전부 <b>한국관광공사 · 공공누리 제1유형</b>입니다(출처만 밝히면 됩니다).
        </p>
        <div className="pick-toggle">
          <button className={only ? "on" : ""} onClick={() => setOnly(true)}>
            🌃 야경·전망만 ({only ? shots.length : "…"})
          </button>
          <button className={!only ? "on" : ""} onClick={() => setOnly(false)}>
            전체 보기
          </button>
        </div>
      </div>

      <div className="pick-grid">
        {shots.map((s) => (
          <figure className="pick-item" key={s.n}>
            {/* 원본을 그대로 띄운다 — 표지로 쓸 사진이라 화질을 봐야 고를 수 있다. */}
            <img src={s.url} alt={s.place} loading="lazy" />
            <figcaption>
              <b>#{s.n}</b> {s.place}
              {s.gu ? <span> · {s.gu}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>

      {shots.length === 0 && <p className="pick-note">사진이 없습니다.</p>}
    </div>
  );
}
