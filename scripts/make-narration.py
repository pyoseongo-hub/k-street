#!/usr/bin/env python3
"""🎙️ **릴스에 얹을 영어 나레이션을 만든다.**

사장님 (2026-09-16): *"나레이션"*

── 왜 GitHub Actions 에서 돌리나 ───────────────────────────────────────
  작업 환경(샌드박스)에서는 **못 만든다.** 두 단계로 막힌다:
    ① 인증서 — 프록시 CA 를 certifi 에 넣으면 풀린다
    ② **웹소켓 — 프록시가 막는다. 못 푼다** (`WSServerHandshakeError: 403`)
  음성 서비스는 웹소켓으로 붙는다. `/root/.ccr/README.md` 에도
  "웹소켓 업그레이드는 아예 안 될 수 있다"고 적혀 있고, 그 경우였다.
  러너는 인터넷이 뚫려 있으므로 거기서 만들어 **저장소에 커밋**한다.
  사진을 받아 올 때와 같은 방식이다.

── 왜 한 덩이로 안 읽고 줄마다 따로 읽나 ───────────────────────────────
  한 번에 쭉 읽히면 **사진과 말이 어긋난다.** 읽는 속도는 우리가 못 정한다.
  줄마다 따로 만들어 **그 사진이 뜨는 시각에 하나씩 놓으면** 절대 안 어긋난다.

── 자리를 넘치면 ───────────────────────────────────────────────────────
  영어는 한글보다 길어진다. 한 컷이 3초인데 읽는 데 3.4초가 걸리면
  **다음 사진으로 넘어간 뒤에도 앞 문장을 읽고 있다.**
  그래서 재 보고, 넘치면 **조금씩 빠르게 다시 읽힌다**(최대 +24%).
  그래도 넘치면 화면에 경고를 찍는다 — 그때는 문장을 줄여야 한다.
"""
import asyncio
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "잠수교-릴스-음성"
TMP = ROOT / "narration-tmp"

# 🔗 **컷 길이는 make-reel.py 에서 그대로 가져온다.**
#    두 군데 적어 두면 한쪽만 고치는 날이 온다 — 이 저장소가 여러 번 데인 모양이다.
spec = importlib.util.spec_from_file_location("make_reel", ROOT / "scripts" / "make-reel.py")
make_reel = importlib.util.module_from_spec(spec)
spec.loader.exec_module(make_reel)

# 🗣️ **읽을 말** — 화면 자막과 거의 같지만 **똑같지는 않다.**
#    자막은 눈으로 읽고 나레이션은 귀로 듣는다. 「·」 같은 기호는 소리가 안 난다.
#    · 「Jamsugyo Bridge · Sunday nights」 → 점을 찍어 **쉬게** 만든다
#    · 「korea-street.com」 → 「Korea Street dot com」 이라고 **소리 나는 대로** 적는다
SPEECH = [
    "An autumn night.",
    "Han River Park, and a beautiful bridge.",
    "Endless food trucks.",
    "Great food, cold beer.",
    "A Han River festival, on an autumn night.",
    "The late-night fountain show at Banpo Bridge.",
    "Romance in the heart of the city.",
    "Jamsugyo Bridge. Sunday nights.",
]
CREDIT_SPEECH = "Korea Street dot com."

# 🎚️ 목소리 두 가지를 만들어 **사장님이 고르시게** 한다.
#    글로 설명해서는 목소리를 못 고른다 — 들어 봐야 안다.
VOICES = {
    "aria": ("en-US-AriaNeural", "미국 여성 · 따뜻하고 부드럽다"),
    "sonia": ("en-GB-SoniaNeural", "영국 여성 · 차분하고 또렷하다"),
}

#: 사진이 바뀐 **직후**에 말이 시작되게 조금 늦춘다. 동시에 시작하면 급해 보인다.
LEAD_IN = 0.30
#: 🚨 **첫 줄만 더 늦춘다.** 영상 맨 앞 0.6초는 **까만 화면에서 밝아지는 중**이다
#:  (make-reel.py 의 `fade=t=in:d=0.6`). 거기서 말이 시작되면 **소리가 먼저 오고
#:   그림이 나중에 온다** — 켜자마자 어긋난 느낌이 든다. 밝아지고 나서 말한다.
FIRST_IN = 0.85
#: 말이 끝나고 다음 컷까지 남겨 둘 틈. 이만큼은 비어 있어야 안 겹쳐 들린다.
TAIL = 0.25


def ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("ffmpeg 이 없다. `pip install imageio-ffmpeg` 하거나 ffmpeg 을 깔 것.")


def sec(path):
    """소리가 몇 초짜리인지 잰다. ffprobe 가 없을 수 있어서 ffmpeg 으로 잰다."""
    r = subprocess.run([ffmpeg(), "-i", str(path), "-f", "null", "-"],
                       capture_output=True, text=True)
    # ffmpeg 은 마지막 줄에 `time=00:00:02.35` 를 찍는다. 뒤에서부터 찾는다.
    for line in reversed(r.stderr.splitlines()):
        if "time=" in line:
            t = line.split("time=")[1].split()[0]
            h, m, s = t.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    sys.exit(f"길이를 못 쟀다: {path}\n{r.stderr[-2000:]}")


async def say(text, voice, path, rate=0):
    """한 줄을 읽혀 mp3 로 받는다. rate 는 % — 양수면 빠르게 읽는다."""
    kw = {"rate": f"{rate:+d}%"} if rate else {}
    await edge_tts.Communicate(text, voice, **kw).save(str(path))


async def say_fitting(text, voice, path, slot, label):
    """🚨 **자리를 넘치면 조금씩 빠르게 다시 읽힌다.**

    영어는 한글보다 길다. 3초 컷에 3.4초짜리 말을 얹으면 **다음 사진 위에서
    앞 문장이 끝난다** — 보는 사람은 어긋난 걸 바로 느낀다.
    """
    room = slot - TAIL
    for rate in (0, 8, 16, 24):
        await say(text, voice, path, rate)
        d = sec(path)
        if d <= room:
            mark = "  " if rate == 0 else f" ⏩+{rate}%"
            print(f"   {label}  {d:4.1f}s / {slot:4.1f}s{mark}")
            return d
    print(f"   {label}  {d:4.1f}s / {slot:4.1f}s  ⚠️ **넘친다 — 문장을 줄여야 한다**")
    return d


async def build(name, voice, desc):
    print(f"\n🎙️ {name} ({voice}) — {desc}")
    TMP.mkdir(exist_ok=True)

    # 컷이 시작하는 시각을 make-reel.py 의 길이에서 그대로 계산한다.
    cues, t = [], 0.0
    for i, ((_, dur, _), line) in enumerate(zip(make_reel.SHOTS, SPEECH)):
        lead = FIRST_IN if i == 0 else LEAD_IN
        cues.append((t + lead, dur - lead, line))
        t += dur
    cues.append((t + LEAD_IN, make_reel.CREDIT_SEC - LEAD_IN, CREDIT_SPEECH))
    total = t + make_reel.CREDIT_SEC

    parts = []
    for i, (cue, slot, line) in enumerate(cues):
        p = TMP / f"{name}-{i:02d}.mp3"
        await say_fitting(line, voice, p, slot, f"{cue:5.2f}s  {line[:44]:<44}")
        parts.append((cue, p))

    # 🎬 **말 조각들을 제자리에 놓아 30초짜리 한 줄로 만든다.**
    #    adelay 가 「몇 밀리초 뒤에 시작」을 맡고, amix 가 하나로 합친다.
    #    normalize=0 — 조각들이 서로 안 겹치므로 소리를 줄일 이유가 없다.
    #    (normalize 를 켜면 조각 수만큼 소리가 작아져서 안 들린다.)
    ins, filt, tags = [], [], []
    for i, (cue, p) in enumerate(parts):
        ins += ["-i", str(p)]
        filt.append(f"[{i}:a]aresample=48000,adelay={int(cue * 1000)}:all=1[a{i}]")
        tags.append(f"[a{i}]")
    filt.append(f"{''.join(tags)}amix=inputs={len(parts)}:normalize=0[m]")
    # apad 로 뒤를 늘린 뒤 atrim 으로 영상 길이에 딱 맞춘다.
    filt.append(f"[m]apad,atrim=0:{total:.2f},alimiter=limit=0.95[out]")

    OUT.mkdir(parents=True, exist_ok=True)
    m4a = OUT / f"{name}.m4a"
    subprocess.run([ffmpeg(), "-y", *ins, "-filter_complex", ";".join(filt),
                    # 🔊 **스테레오로 맞춘다.** 읽힌 소리는 모노로 온다 —
                    #    그대로 두면 기기에 따라 **한쪽 귀에서만** 들리는 일이 있다.
                    "-map", "[out]", "-ac", "2",
                    "-c:a", "aac", "-b:a", "128k", str(m4a)],
                   check=True, capture_output=True)
    print(f"   ✅ {m4a.relative_to(ROOT)}  ({m4a.stat().st_size // 1024}KB · {total:.1f}s)")
    return {"file": m4a.name, "voice": voice, "desc": desc, "sec": total}


async def main():
    made = [await build(n, v, d) for n, (v, d) in VOICES.items()]
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "읽어보세요.md").write_text(
        "# 🎙️ 잠수교 릴스 나레이션\n\n"
        "`scripts/make-narration.py` 가 GitHub Actions 에서 만든 것입니다.\n"
        "**작업 환경에서는 못 만듭니다** — 프록시가 웹소켓을 막습니다.\n\n"
        "| 파일 | 목소리 | 어떤 느낌 |\n|---|---|---|\n"
        + "".join(f"| `{m['file']}` | {m['voice']} | {m['desc']} |\n" for m in made)
        + "\n읽는 말은 `scripts/make-narration.py` 의 `SPEECH` 에 있습니다.\n"
          "**화면 자막과 조금 다릅니다** — 「·」 같은 기호는 소리가 안 나서,\n"
          "귀로 들을 수 있게 고쳐 적었습니다.\n\n"
          "⚠️ 영상에 얹는 것은 `make-reel.py --voice` 가 합니다.\n",
        encoding="utf-8")
    (OUT / "narration.json").write_text(
        json.dumps(made, ensure_ascii=False, indent=2), encoding="utf-8")
    shutil.rmtree(TMP, ignore_errors=True)
    print(f"\n✅ 목소리 {len(made)}가지를 만들었다 → {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    asyncio.run(main())
