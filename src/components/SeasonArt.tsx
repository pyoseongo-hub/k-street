import { useId } from "react";
import type { SeasonKey } from "../lib/season";

// 실제 사진이 아니라 직접 그린 벡터 일러스트다 — 저작권 문제 없이 25개 구 전체 축제 카드에
// 바로 쓸 수 있다("그 축제의 실제 모습"이 아니라 "계절 분위기"를 나타낸다는 점을 잊지 말 것).
interface Props {
  season: SeasonKey;
  variant?: 0 | 1;
  className?: string;
}

const PALETTES: Record<SeasonKey, [string, string]> = {
  spring: ["#F6C9D6", "#F0879F"],
  summer: ["#F7A65C", "#D64B2E"],
  autumn: ["#E8B45A", "#B4652A"],
  winter: ["#AFD4DE", "#4E8FA3"],
};

export default function SeasonArt({ season, variant = 0, className }: Props) {
  const uid = useId();
  const gradId = `sa-grad-${uid}`;
  const [from, to] = PALETTES[season];

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
      {season === "spring" && <SpringMotif variant={variant} />}
      {season === "summer" && <SummerMotif variant={variant} />}
      {season === "autumn" && <AutumnMotif variant={variant} />}
      {season === "winter" && <WinterMotif variant={variant} />}
    </svg>
  );
}

function SpringMotif({ variant }: { variant: number }) {
  const cx = variant === 0 ? 230 : 70;
  return (
    <g opacity="0.9">
      <path
        d={`M ${cx - 40} 76 Q ${cx - 10} 20 ${cx + 30} -4`}
        stroke="#7A5340"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {[
        [cx + 26, 2],
        [cx + 8, 14],
        [cx - 6, 26],
        [cx - 18, 40],
        [cx - 28, 54],
        [cx + 14, 22],
        [cx - 12, 8],
      ].map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r={i % 2 === 0 ? 7 : 5} fill="#FFF" fillOpacity="0.85" />
      ))}
    </g>
  );
}

function SummerMotif({ variant }: { variant: number }) {
  const start = variant === 0 ? 20 : 40;
  return (
    <g opacity="0.92">
      {[0, 1, 2, 3, 4].map((i) => {
        const x = start + i * 55;
        const y = 14 + (i % 2) * 12;
        return (
          <g key={i}>
            <line x1={x} y1={y - 10} x2={x} y2={y - 2} stroke="#FFE9C7" strokeWidth="2" />
            <ellipse cx={x} cy={y + 12} rx="12" ry="15" fill="#FFE9C7" fillOpacity="0.9" />
            <ellipse cx={x} cy={y + 12} rx="12" ry="15" fill="none" stroke="#D64B2E" strokeOpacity="0.4" />
          </g>
        );
      })}
    </g>
  );
}

function AutumnMotif({ variant }: { variant: number }) {
  const offset = variant === 0 ? 0 : 18;
  return (
    <g opacity="0.9">
      {[15, 70, 125, 180, 235, 280].map((x, i) => (
        <path
          key={i}
          transform={`translate(${x + offset - 10}, ${8 + (i % 3) * 16}) rotate(${(i * 37) % 60})`}
          d="M0 0 C4 -8 12 -8 12 0 C12 8 4 8 0 16 C-4 8 -12 8 -12 0 C-12 -8 -4 -8 0 0 Z"
          fill="#FFF3DC"
          fillOpacity="0.85"
        />
      ))}
    </g>
  );
}

function WinterMotif({ variant }: { variant: number }) {
  const rows = variant === 0 ? [10, 30, 50] : [18, 38, 58];
  return (
    <g opacity="0.9">
      {rows.flatMap((y, ri) =>
        [20, 70, 120, 170, 220, 270].map((x, ci) => (
          <circle key={`${ri}-${ci}`} cx={x + (ri % 2) * 20} cy={y} r={ci % 2 === 0 ? 2.5 : 1.6} fill="#FFFFFF" />
        ))
      )}
    </g>
  );
}
