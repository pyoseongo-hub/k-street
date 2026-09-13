// 🅺 **K-Street 마크 — 네 계절.**
//
// 사장님 (2026-09-13): *"벚꽃도 바꾸고 앱안 k로고도 바뀌 / 전에 만든 네계절 올려봐"*
//
// ── 무엇을 고쳤나 ────────────────────────────────────────────────────────
// 그전까지 **얼굴이 둘**이었다 —
//   · 머리줄  : 테마색 네모에 글자 K 하나 (CSS 로만 그린 것)
//   · 홈 화면 : 🌸 벚꽃 **이모지** (Fluent Emoji 를 PNG 로 구운 것)
// 홈 화면에서는 벚꽃, 앱을 열면 K. 손님 눈에는 **서로 다른 앱**으로 보인다.
// 이제 둘 다 이 마크 하나로 맞췄다.
//
// ── 그림 ────────────────────────────────────────────────────────────────
// 둥근 네모를 넷으로 나눠 **봄·여름·가을·겨울**을 넣고, 그 위에 K 를 파냈다.
// 색은 앱이 이미 쓰는 갈래 색 그대로다(tokens.css) — 새 색을 들이지 않았다:
//   봄 #FF8FBB(--flower) · 여름 #4FE3CB(--walk) · 가을 #FFB13C(--market) · 겨울 #7EA6D9(--rain)
// 계절이 이 앱의 뼈대라서 맞는 그림이다. 홈 화면이 계절로 나뉘어 있고,
// 표지 사진도 계절마다 다르다(cover-photos.json).
//
// ── 🚨 여기만 고치면 되는 게 아니다 ─────────────────────────────────────
// 이 파일은 **화면에 뜨는 마크**다. 홈 화면·탭에 뜨는 PNG 는 따로 있다:
//   public/icons/{favicon-64, icon-192, icon-512, icon-512-maskable, apple-touch-icon}.png
// 그 PNG 들은 **이 그림에서 구워 낸다** — `node scripts/make-icons.mjs`.
// 그림을 바꾸면 **반드시 그 스크립트를 다시 돌린다.** 안 그러면 또 얼굴이 둘이 된다.
// (모양을 고치는 자리는 scripts/make-icons.mjs 의 markSvg() 하나다. 여기 JSX 와
//  그쪽 문자열이 같은 모양이어야 하므로, 고칠 때 둘을 같이 본다.)
//
// ── K 를 왜 '파내나' (fill 이 아니라 구멍) ──────────────────────────────
// K 를 배경색으로 덧그리면 **밝은 화면에서 어두운 K 가 그대로 남는다.**
// mask 로 파내면 뒤가 비쳐서 어느 바탕에서도 맞는다 — 이 앱은 다크·라이트가 둘 다 있다.
export default function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="app-mark"
      role="img"
      aria-label="K-Street"
    >
      <defs>
        {/* ⚠️ id 는 화면에 여러 개가 놓여도 부딪히지 않게 고유해야 한다.
            이 마크는 머리줄에 한 번만 쓰므로 고정 이름으로 둔다 — 늘어나면 그때 나눈다. */}
        <mask id="ks-mark-k">
          <rect x="0" y="0" width="100" height="100" fill="#fff" />
          <g
            fill="none"
            stroke="#000"
            strokeWidth="12"
            strokeLinecap="round"
            transform="translate(50,50) scale(0.68) translate(-50,-50)"
          >
            <path d="M31 16 V84" />
            <path d="M73 17 L36 50" />
            <path d="M36 50 L75 83" />
          </g>
        </mask>
        <clipPath id="ks-mark-sq">
          <rect x="6" y="6" width="88" height="88" rx="24" />
        </clipPath>
      </defs>
      <g clipPath="url(#ks-mark-sq)" mask="url(#ks-mark-k)">
        <rect x="6" y="6" width="44" height="44" fill="#FF8FBB" />
        <rect x="50" y="6" width="44" height="44" fill="#4FE3CB" />
        <rect x="50" y="50" width="44" height="44" fill="#FFB13C" />
        <rect x="6" y="50" width="44" height="44" fill="#7EA6D9" />
      </g>
    </svg>
  );
}
