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

const PALETTES: Record<SeasonKey, [string, string][]> = {
  spring: [
    ["#3A2A33", "#7A3B52"],
    ["#33232C", "#8C4A63"],
    ["#2C2230", "#6C3B5C"],
  ],
  summer: [
    ["#2A2018", "#7A3F1E"],
    ["#241C16", "#8A4A24"],
    ["#221A14", "#6E3A22"],
  ],
  autumn: [
    ["#241C14", "#7A5220"],
    ["#221B12", "#8C5F24"],
    ["#1F1810", "#6E4A1C"],
  ],
  winter: [
    ["#131E24", "#274A56"],
    ["#111A20", "#1F3E4A"],
    ["#0F181D", "#2C5461"],
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
      viewBox="0 0 300 72"
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
      <rect width="300" height="72" fill={`url(#${gradId})`} />
      {season === "spring" && <SpringMotif rng={rng} dense={dense} />}
      {season === "summer" && <SummerMotif rng={rng} dense={dense} />}
      {season === "autumn" && <AutumnMotif rng={rng} dense={dense} />}
      {season === "winter" && <WinterMotif rng={rng} dense={dense} />}
    </svg>
  );
}

function SpringMotif({ rng, dense }: { rng: () => number; dense: boolean }) {
  const branches = dense ? 2 : 1;
  return (
    <g opacity="0.92">
      {Array.from({ length: branches }, (_, b) => {
        const cx = 40 + rng() * 220;
        const dir = rng() > 0.5 ? 1 : -1;
        const blossoms = 5 + Math.floor(rng() * 4);
        return (
          <g key={b}>
            <path
              d={`M ${cx - 30 * dir} 76 Q ${cx} ${18 + rng() * 20} ${cx + 34 * dir} ${-4 + rng() * 10}`}
              stroke="#D8B4A0"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              opacity="0.75"
            />
            {Array.from({ length: blossoms }, (_, i) => (
              <circle
                key={i}
                cx={cx + (rng() - 0.5) * 70}
                cy={4 + rng() * 60}
                r={4 + rng() * 5}
                fill="#FBEAE6"
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
  const count = dense ? 6 : 4;
  const start = rng() * 30;
  const gap = 300 / count;
  return (
    <g opacity="0.9">
      {Array.from({ length: count }, (_, i) => {
        const x = start + i * gap + rng() * 12;
        const y = 12 + rng() * 20;
        const r = 9 + rng() * 6;
        return (
          <g key={i}>
            <line x1={x} y1={y - r - 4} x2={x} y2={y - r + 3} stroke="#F4D9A8" strokeWidth="1.6" />
            <ellipse cx={x} cy={y + r * 0.4} rx={r} ry={r * 1.25} fill="#F4D9A8" fillOpacity="0.85" />
            <ellipse cx={x} cy={y + r * 0.4} rx={r} ry={r * 1.25} fill="none" stroke="#8A4A24" strokeOpacity="0.35" />
          </g>
        );
      })}
    </g>
  );
}

function AutumnMotif({ rng, dense }: { rng: () => number; dense: boolean }) {
  const count = dense ? 9 : 6;
  return (
    <g opacity="0.88">
      {Array.from({ length: count }, (_, i) => {
        const x = (300 / count) * i + rng() * 20;
        const y = 6 + rng() * 44;
        const rot = rng() * 360;
        const scale = 0.7 + rng() * 0.6;
        return (
          <path
            key={i}
            transform={`translate(${x}, ${y}) rotate(${rot}) scale(${scale})`}
            d="M0 0 C4 -8 12 -8 12 0 C12 8 4 8 0 16 C-4 8 -12 8 -12 0 C-12 -8 -4 -8 0 0 Z"
            fill="#F5DFAE"
            fillOpacity={0.55 + rng() * 0.35}
          />
        );
      })}
    </g>
  );
}

function WinterMotif({ rng, dense }: { rng: () => number; dense: boolean }) {
  const rows = dense ? 4 : 3;
  const cols = dense ? 9 : 6;
  return (
    <g opacity="0.85">
      {Array.from({ length: rows }, (_, ri) =>
        Array.from({ length: cols }, (_, ci) => (
          <circle
            key={`${ri}-${ci}`}
            cx={(300 / cols) * ci + rng() * 14}
            cy={(72 / (rows + 1)) * (ri + 1) + (rng() - 0.5) * 10}
            r={1.2 + rng() * 2.4}
            fill="#FFFFFF"
            fillOpacity={0.5 + rng() * 0.4}
          />
        ))
      )}
    </g>
  );
}
