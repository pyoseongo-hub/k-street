import { useId, useMemo } from "react";
import type { SeasonKey } from "../lib/season";

// 실제 사진이 아니라 직접 그린 벡터 일러스트다 — 저작권 문제 없이 25개 구 전체 축제 카드에
// 바로 쓸 수 있다("그 축제의 실제 모습"이 아니라 "계절 분위기"를 나타낸다는 점을 잊지 말 것).
// seed로 모티프 배치·팔레트를 조금씩 바꿔서, 사진처럼 "여러 장 중 하나가 도는" 느낌을 낸다.
interface Props {
  season: SeasonKey;
  seed?: number;
  dense?: boolean; // true면 히어로용(더 화려하게), false면 카드 배너용
  className?: string;
}

// 시드로 결정되는 의사난수(mulberry32) — 매 렌더 동일 seed면 동일 결과.
function makeRng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 🎨 2026-09-01에 전부 밝게 다시 잡았다 (사용자 지시: "봄 여름 가을 겨울 이미지
// 화사한 거로 바꿔"). 예전 값은 전부 어두운 고동색 계열이라(#2A2018 → #7A3F1E)
// 어느 계절이든 갈색 덩어리로만 보였다 — 사용자가 캡처로 짚어 준 그 화면이다.
//
// 원래는 **카드 뒤에 깔리는 띠**라 어둡게 잡았던 값인데, 지금은 172px짜리 계절
// 표지로도 쓰인다. 표지에는 아래쪽에 검은 그늘이 깔려 있어(.mfp-cover::after)
// 밝은 그림 위에서도 흰 글씨가 그대로 읽힌다 — 밝게 해도 안전하다.
//
// 🚨 사진이 아니라 **직접 그린 그림**이다. 스톡 사진이나 웹에서 긁어온 이미지는
// 쓰지 않는다(저작권 원칙). 실사진은 관광공사 것(공공누리 1유형)만 쓰고,
// 그 계절에 확보된 사진이 하나도 없을 때만 이 그림이 대신 나온다.
const PALETTES: Record<SeasonKey, [string, string][]> = {
  // 벚꽃 — 연분홍에서 진분홍으로
  spring: [
    ["#FFE3EF", "#F58FB4"],
    ["#FFEAF2", "#EE7FA8"],
    ["#FFDCE9", "#F79BC0"],
  ],
  // 한여름 물빛 — 민트에서 에메랄드로
  summer: [
    ["#CFF6EA", "#2FB89A"],
    ["#D8F7EF", "#37C2A4"],
    ["#C6F2E4", "#28A98C"],
  ],
  // 단풍 — 살구빛에서 주황으로
  autumn: [
    ["#FFE6C0", "#E5822F"],
    ["#FFEDD0", "#D9722A"],
    ["#FFE1B4", "#EC8C38"],
  ],
  // 눈 내린 하늘 — 옅은 하늘빛에서 푸른빛으로
  winter: [
    ["#E4EEFF", "#6E96C8"],
    ["#DCE8FB", "#5F88BC"],
    ["#EAF2FF", "#7AA1D0"],
  ],
};

export default function SeasonArt({ season, seed = 0, dense = false, className }: Props) {
  const uid = useId();
  const gradId = `sa-grad-${uid}`;
  const rng = useMemo(() => makeRng(season.length * 1000 + seed), [season, seed]);
  const palette = PALETTES[season];
  const [from, to] = palette[Math.floor(rng() * palette.length)];

  return (
    <svg
      className={className}
      viewBox="0 0 300 170"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="300" height="170" fill={`url(#${gradId})`} />
      {season === "spring" && <SpringMotif rng={rng} dense={dense} />}
      {season === "summer" && <SummerMotif rng={rng} dense={dense} />}
      {season === "autumn" && <AutumnMotif rng={rng} dense={dense} />}
      {season === "winter" && <WinterMotif rng={rng} dense={dense} />}
    </svg>
  );
}

function SpringMotif({ rng, dense }: { rng: () => number; dense: boolean }) {
  const branches = dense ? 3 : 2;
  return (
    <g opacity="0.92">
      {Array.from({ length: branches }, (_, b) => {
        const cx = 40 + rng() * 220;
        const dir = rng() > 0.5 ? 1 : -1;
        const blossoms = 9 + Math.floor(rng() * 6);
        return (
          <g key={b}>
            <path
              d={`M ${cx - 40 * dir} 180 Q ${cx} ${60 + rng() * 50} ${cx + 46 * dir} ${-8 + rng() * 24}`}
              stroke="#A9614C"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.75"
            />
            {Array.from({ length: blossoms }, (_, i) => (
              <circle
                key={i}
                cx={cx + (rng() - 0.5) * 110}
                cy={6 + rng() * 150}
                r={3.5 + rng() * 5}
                fill="#FFFFFF"
                fillOpacity={0.65 + rng() * 0.3}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}

function SummerMotif({ rng, dense }: { rng: () => number; dense: boolean }) {
  const count = dense ? 9 : 7;
  const start = rng() * 30;
  const gap = 300 / count;
  return (
    <g opacity="0.9">
      {Array.from({ length: count }, (_, i) => {
        const x = start + i * gap + rng() * 12;
        const y = 22 + rng() * 78;
        const r = 7 + rng() * 6;
        return (
          <g key={i}>
            <line x1={x} y1={0} x2={x} y2={y - r} stroke="#F6C544" strokeWidth="1.4" strokeOpacity="0.55" />
            <ellipse cx={x} cy={y + r * 0.4} rx={r} ry={r * 1.25} fill="#FFF0B8" fillOpacity="0.95" />
            <ellipse cx={x} cy={y + r * 0.4} rx={r} ry={r * 1.25} fill="none" stroke="#1E7A66" strokeOpacity="0.35" />
          </g>
        );
      })}
    </g>
  );
}

/**
 * 🍁 단풍잎.
 *
 * 🚨 2026-09-04 사장님 폰 화면에서 잡혔다 — 여기 있던 path가
 *    `M0 0 C4 -8 12 -8 12 0 C12 8 4 8 0 16 …` 로, **단풍잎이 아니라 하트 곡선**이었다.
 *    가을 축제 카드에 분홍 하트가 흩날려서 밸런타인 화면처럼 보였다.
 *    한성백제문화제·서울세계불꽃축제 같은 곳이 그렇게 떠 있었다.
 *
 * 이 그림이 중요한 이유 — 축제 80곳 중 **24곳은 사진이 아예 없다.**
 * 관광공사 자료에 그 축제들이 없어서(확인함) 앞으로도 쉽게 안 채워진다.
 * 그러니 **사진 대신 나오는 이 그림이 그 카드의 얼굴**이다.
 *
 * 잎 모양은 곡선(베지어)이 아니라 **꼭짓점 좌표**로 그린다 — 단풍잎은 뾰족한
 * 톱니가 특징이라 곡선으로 그리면 자꾸 하트나 물방울로 뭉개진다.
 * 위가 잎끝, 아래가 잎자루이고 x=0을 축으로 좌우 대칭이다.
 */
const MAPLE_LEAF =
  "M0 -21 L3.5 -12.5 L10.5 -14 L8 -8 L16.5 -3.5 L13.5 -1 L18.5 4 " +
  "L7.5 3.5 L8.5 8.5 L2 6.5 L2.2 17 L-2.2 17 L-2 6.5 L-8.5 8.5 L-7.5 3.5 " +
  "L-18.5 4 L-13.5 -1 L-16.5 -3.5 L-8 -8 L-10.5 -14 L-3.5 -12.5 Z";

/** 진짜 단풍은 한 가지 빨강이 아니다 — 노랑·주황·붉은빛이 섞여 있어야 단풍으로 보인다. */
const LEAF_COLORS = ["#C0402A", "#D9622A", "#E08A1E", "#A8341F", "#CF7A22"];

function AutumnMotif({ rng, dense }: { rng: () => number; dense: boolean }) {
  const count = dense ? 14 : 11;
  return (
    <g opacity="0.9">
      {Array.from({ length: count }, (_, i) => {
        const x = (300 / count) * i + rng() * 26;
        const y = 10 + rng() * 145;
        // 떨어지는 잎이라 방향이 제각각이다. 다만 완전히 뒤집힌 잎은 어색해서
        // 좌우로 기운 범위(-70°~70°)만 쓴다.
        const rot = (rng() - 0.5) * 140;
        const scale = 0.55 + rng() * 0.5;
        return (
          <path
            key={i}
            transform={`translate(${x}, ${y}) rotate(${rot}) scale(${scale})`}
            d={MAPLE_LEAF}
            fill={LEAF_COLORS[Math.floor(rng() * LEAF_COLORS.length)]}
            fillOpacity={0.45 + rng() * 0.4}
          />
        );
      })}
    </g>
  );
}

function WinterMotif({ rng, dense }: { rng: () => number; dense: boolean }) {
  const rows = dense ? 7 : 6;
  const cols = dense ? 11 : 9;
  return (
    <g opacity="0.85">
      {Array.from({ length: rows }, (_, ri) =>
        Array.from({ length: cols }, (_, ci) => (
          <circle
            key={`${ri}-${ci}`}
            cx={(300 / cols) * ci + rng() * 14}
            cy={(170 / (rows + 1)) * (ri + 1) + (rng() - 0.5) * 18}
            r={1.4 + rng() * 3}
            fill="#FFFFFF"
            fillOpacity={0.5 + rng() * 0.4}
          />
        ))
      )}
    </g>
  );
}
