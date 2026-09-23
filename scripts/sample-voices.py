#!/usr/bin/env python3
"""🎙️ **목소리 샘플을 만든다** — 같은 문장을 여러 목소리로 읽혀 `docs/목소리-샘플/` 에 넣는다.

사장님 (2026-09-21): *"나레이션 넣을거니 샘플 목소리 수집 보고"*

── 왜 Actions 에서 돌리나 ──────────────────────────────────────────────
  작업 환경(샌드박스)에서는 음성 서비스가 웹소켓으로 붙는데 프록시가 막는다
  (`make-narration.py` 머리말과 같은 이유). 러너는 뚫려 있으니 거기서 만들어 커밋한다.

── 쓰는 법 ─────────────────────────────────────────────────────────────
  python scripts/sample-voices.py                       # 아래 VOICES 전부
  python scripts/sample-voices.py --text "..." --voices en-US-AvaMultilingualNeural,en-GB-RyanNeural

  결과: docs/목소리-샘플/<목소리>.mp3 + docs/목소리-샘플/읽어보세요.md (표)
  ⚠️ 목소리 이름이 틀리면 **그 이름만 건너뛰고** 나머지는 만든다. 건너뛴 것은 표에 ❌ 로 남긴다.
"""
import argparse
import asyncio
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "목소리-샘플"

# 🗣️ 기본 문장 — 공통 마무리 문안이 확정되면 여기를 그 영어 문장으로 바꾼다.
#    (docs/K-Street-공통-마무리.md). 지금은 안 ① 을 영어로 옮긴 임시 문장이다.
TEXT = ("K-Street. Seoul's festivals, markets, and walks, in twelve languages. "
        "Free, no sign-up. Korea Street dot com.")

# 🎚️ 후보 — 이름은 edge-tts(마이크로소프트) 목소리 이름이다. 지금 쓰는 것은 Ava 다(make-narration.py).
#    「Multilingual」이 붙은 것은 한국어 지명(석촌호수 같은 것)을 섞어 읽혀도 덜 어색하다.
VOICES = [
    ("en-US-AvaMultilingualNeural",    "여 · 지금 쓰는 목소리 · 따뜻하고 또렷"),
    ("en-US-EmmaMultilingualNeural",   "여 · 밝고 젊음"),
    ("en-US-AndrewMultilingualNeural", "남 · 차분한 저음 · 다큐 느낌"),
    ("en-US-BrianMultilingualNeural",  "남 · 부드럽고 친근"),
    ("en-US-JennyNeural",              "여 · 표준적인 안내 목소리"),
    ("en-US-GuyNeural",                "남 · 뉴스 톤"),
    ("en-GB-SoniaNeural",              "여 · 영국식"),
    ("en-GB-RyanNeural",               "남 · 영국식"),
    ("en-AU-NatashaNeural",            "여 · 호주식"),
    ("ko-KR-HyunsuMultilingualNeural", "남 · 한국어 원어민이 영어를 읽는 톤 — 한국 지명 발음이 가장 정확"),
]


async def one(voice: str, text: str) -> tuple[str, bool, str]:
    path = OUT / f"{voice}.mp3"
    try:
        await edge_tts.Communicate(text, voice).save(str(path))
        return voice, True, ""
    except Exception as e:  # 이름이 없거나 서비스가 잠깐 막힌 것 — 다른 목소리는 계속 만든다
        return voice, False, f"{type(e).__name__}: {str(e)[:80]}"


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", default=TEXT)
    ap.add_argument("--voices", default=",".join(v for v, _ in VOICES))
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    desc = dict(VOICES)
    rows = []
    for v in [x.strip() for x in a.voices.split(",") if x.strip()]:
        voice, ok, err = await one(v, a.text)
        print(("✅" if ok else "❌"), voice, err)
        rows.append((voice, ok, err))
    lines = [
        "# 🎙️ 목소리 샘플",
        "",
        f"읽힌 문장: `{a.text}`",
        "",
        "폰에서 파일을 누르면 바로 들린다. 마음에 드는 이름을 알려 주면 `make-narration.py` 의 `VOICE` 를 바꾼다.",
        "",
        "| 목소리 | 설명 | 파일 |",
        "|---|---|---|",
    ]
    for voice, ok, err in rows:
        lines.append(f"| `{voice}` | {desc.get(voice, '')} | " + (f"[{voice}.mp3]({voice}.mp3)" if ok else f"❌ {err}") + " |")
    (OUT / "읽어보세요.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    bad = [v for v, ok, _ in rows if not ok]
    if bad and len(bad) == len(rows):
        raise SystemExit("❌ 하나도 못 만들었다 — 서비스 연결부터 의심할 것")


if __name__ == "__main__":
    asyncio.run(main())
