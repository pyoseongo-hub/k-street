#!/usr/bin/env python3
# 🎙️ **자막(SRT) 그대로 읽혀서 나레이션 한 줄을 만든다.**
#
# 사장님 질문 (2026-09-26): *"목소리 나레이션 안되지?"* → 된다.
#
# ─────────────────────────────────────────────────────────────────────────
# 왜 러너에서만 되나
# ─────────────────────────────────────────────────────────────────────────
#   음성 서비스가 **웹소켓**으로 붙는데 작업 환경 프록시가 그걸 막는다
#   (`WSServerHandshakeError: 403`). 인증서를 고쳐도 안 풀린다.
#   make-narration.py 머리말에 같은 내용이 적혀 있다 — 같은 방식으로 간다.
#
# ─────────────────────────────────────────────────────────────────────────
# 기존 make-narration.py 와 무엇이 다른가
# ─────────────────────────────────────────────────────────────────────────
#   그쪽은 **릴스 컷 길이**(make-reel.py 의 SHOTS)에 맞춰 읽힌다 — 그 릴스 전용이다.
#   이쪽은 **아무 SRT나** 받아서 그 시간표에 맞춘다. 카드·릴스를 새로 만들 때마다
#   스크립트를 고치지 않아도 된다.
#
# 🚨 **말이 자리를 넘치면 조금씩 빠르게 다시 읽힌다.** 영어는 생각보다 길다.
#    2.5초 칸에 2.9초짜리 말을 얹으면 **다음 사진 위에서 앞 문장이 끝난다** —
#    보는 사람은 어긋난 걸 바로 느낀다. 그래도 안 들어가면 **경고하고 멈추지
#    않는다** — 대신 어느 줄이 넘쳤는지 찍어 준다. 문장은 사람이 줄여야 한다.
#
#   SRT="$(cat a.srt)" python3 scripts/narrate-srt.py --out out --voice en-US-AvaMultilingualNeural
import asyncio, os, re, shutil, subprocess, sys, argparse
from pathlib import Path

import edge_tts

#: 말이 끝나고 다음 칸까지 남겨 둘 틈. 이만큼은 비어 있어야 안 겹쳐 들린다.
TAIL = 0.25
#: 기본 속도. 관광 영상은 조금 느긋한 편이 듣기 좋다.
BASE_RATE = -4


def ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        sys.exit("❌ ffmpeg 이 없다. `pip install imageio-ffmpeg` 할 것.")


def sec(path):
    """소리가 몇 초짜리인지 잰다. ffprobe 가 없을 수 있어 ffmpeg 으로 잰다."""
    r = subprocess.run([ffmpeg(), "-i", str(path), "-f", "null", "-"],
                       capture_output=True, text=True)
    for line in reversed(r.stderr.splitlines()):
        if "time=" in line:
            t = line.split("time=")[1].split()[0]
            h, m, s = t.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    sys.exit(f"❌ 길이를 못 쟀다: {path}")


def parse_srt(text):
    """SRT 를 (시작초, 끝초, 글) 로 바꾼다.

    ⚠️ **줄바꿈이 섞인 SRT 도 받는다.** 자막은 두 줄로 나누는 일이 흔한데,
       읽힐 때는 한 줄로 이어야 한다 — 안 그러면 가운데서 끊어 읽는다."""
    out = []
    for block in re.split(r"\n\s*\n", text.strip()):
        lines = [l for l in block.strip().splitlines() if l.strip()]
        if len(lines) < 2:
            continue
        stamp = next((l for l in lines if "-->" in l), None)
        if not stamp:
            continue
        body = " ".join(lines[lines.index(stamp) + 1:]).strip()
        if not body:
            continue
        a, z = [s.strip() for s in stamp.split("-->")]
        f = lambda x: (int(x[0:2]) * 3600 + int(x[3:5]) * 60
                       + float(x[6:8] + "." + x[9:12]))
        out.append((f(a), f(z), body))
    if not out:
        sys.exit("❌ SRT 에서 읽을 줄을 못 찾았다.")
    return out


async def say(text, voice, path, rate=0):
    kw = {"rate": f"{rate:+d}%"} if rate else {}
    await edge_tts.Communicate(text, voice, **kw).save(str(path))


async def say_fitting(text, voice, path, slot, label):
    room = slot - TAIL
    d = None
    for step in (0, 8, 16, 24):
        rate = BASE_RATE + step
        await say(text, voice, path, rate)
        d = sec(path)
        if d <= room:
            mark = "  " if step == 0 else f" ⏩{rate:+d}%"
            print(f"   {label}  {d:4.1f}s / {slot:4.1f}s{mark}")
            return d, False
    print(f"   {label}  {d:4.1f}s / {slot:4.1f}s  ⚠️ **넘친다 — 문장을 줄일 것**")
    return d, True


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="narration")
    ap.add_argument("--voice", default="en-US-AvaMultilingualNeural")
    ap.add_argument("--name", default="narration")
    args = ap.parse_args()

    raw = os.environ.get("SRT", "").strip()
    if not raw:
        sys.exit("❌ SRT 가 비어 있다.")
    cues = parse_srt(raw)

    # 🚨 **없는 목소리를 부르면 소리 없이 빈 파일이 나온다.** 먼저 있는지 본다.
    names = [v["ShortName"] for v in await edge_tts.list_voices()]
    if args.voice not in names:
        near = [n for n in names if n.startswith(args.voice[:5])][:6]
        sys.exit(f"❌ 그런 목소리가 없다: {args.voice}\n   비슷한 것: {', '.join(near)}")

    out = Path(args.out); out.mkdir(parents=True, exist_ok=True)
    tmp = out / "_parts"; tmp.mkdir(exist_ok=True)

    print(f"🎙️ {args.voice} · {len(cues)}줄\n")
    parts, over = [], 0
    for i, (a, z, line) in enumerate(cues):
        p = tmp / f"{i:02d}.mp3"
        _, spill = await say_fitting(line, args.voice, p, z - a, f"{a:5.2f}s  {line[:46]:<46}")
        over += spill
        parts.append((a, p))

    total = max(z for _, z, _ in cues)

    # 🎬 조각들을 제자리에 놓아 한 줄로 만든다.
    #    adelay 가 「몇 밀리초 뒤에 시작」을, amix 가 합치기를 맡는다.
    #    normalize=0 — 조각들이 안 겹치므로 소리를 줄일 이유가 없다
    #    (켜면 조각 수만큼 작아져서 안 들린다).
    ins, filt, tags = [], [], []
    for i, (cue, p) in enumerate(parts):
        ins += ["-i", str(p)]
        filt.append(f"[{i}:a]aresample=48000,adelay={int(cue * 1000)}:all=1[a{i}]")
        tags.append(f"[a{i}]")
    filt.append(f"{''.join(tags)}amix=inputs={len(parts)}:normalize=0[m]")
    filt.append(f"[m]apad,atrim=0:{total:.2f},alimiter=limit=0.95[o]")

    m4a = out / f"{args.name}.m4a"
    mp3 = out / f"{args.name}.mp3"
    for dest, codec in ((m4a, ["-c:a", "aac", "-b:a", "160k"]),
                        (mp3, ["-c:a", "libmp3lame", "-b:a", "192k"])):
        subprocess.run([ffmpeg(), "-y", *ins, "-filter_complex", ";".join(filt),
                        # 🔊 **스테레오로 맞춘다.** 읽힌 소리는 모노로 온다 —
                        #    그대로 두면 기기에 따라 한쪽 귀에서만 들린다.
                        "-map", "[o]", "-ac", "2", *codec, str(dest)],
                       check=True, capture_output=True)
        print(f"\n✅ {dest.name}  {dest.stat().st_size // 1024}KB · {total:.1f}초")

    for f in tmp.iterdir():
        f.unlink()
    tmp.rmdir()
    if over:
        print(f"\n⚠️ 자리를 넘친 줄 {over}개 — 위 표에서 ⚠️ 표를 볼 것.")


if __name__ == "__main__":
    asyncio.run(main())
