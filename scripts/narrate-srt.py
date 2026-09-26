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
# ─────────────────────────────────────────────────────────────────────────
# 두 가지 모드
# ─────────────────────────────────────────────────────────────────────────
#   ① **맞춤(기본)** — 준 SRT 의 시간표에 **소리를 맞춘다.**
#      영상 길이가 이미 정해졌을 때. 칸을 넘치면 빠르게 읽혀서 밀어 넣는다.
#
#   ② **자유(`--free`)** — 글을 **자연스럽게 읽고, 시간표를 새로 뽑는다.**
#      사장님 지시 (2026-09-26): *"시간은 넘어도 되 / 영상을 맞출거야"*.
#      영상을 소리에 맞출 때 이쪽이 맞다 — 읽는 속도를 억지로 올리지 않으니
#      말이 편하고, 문장도 줄일 필요가 없다. 준 SRT 의 **시각은 무시**하고
#      글만 가져다 쓴 뒤, **실제로 읽힌 길이로 SRT 를 다시 써서** 같이 낸다.
#
#   SRT="$(cat a.srt)" python3 scripts/narrate-srt.py --out out --voice en-US-AvaMultilingualNeural
#   SRT="$(cat a.srt)" python3 scripts/narrate-srt.py --free --gap 0.4
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


def trim_silence(path):
    """앞뒤 빈 소리를 잘라낸다.

    🚨 **edge-tts 는 조각마다 0.5~0.9초쯤 빈 소리를 붙여 보낸다** (2026-09-26에 잡았다).
       그래서 「Come back after dark」처럼 **네 낱말짜리 말도 2.1초**를 먹었다.
       2.2초 칸에 넣으면 당연히 넘친다 — 글을 아무리 줄여도 바닥이 2.1초라
       **문장을 줄이는 것으로는 절대 안 풀리는 문제**였다.
       빈 소리를 잘라내면 같은 말이 1.2~1.4초가 된다.

    ⚠️ 말 사이의 틈(문장 사이 쉼)은 건드리지 않는다 — `start_periods=1` 이라
       **맨 앞 한 번만** 자른다. 뒤는 뒤집어서 같은 방법으로 자른다."""
    cut = ("silenceremove=start_periods=1:start_silence=0.03:start_threshold=-45dB")
    tmp = path.with_name(path.stem + "-t.mp3")
    subprocess.run([ffmpeg(), "-y", "-i", str(path),
                    "-af", f"{cut},areverse,{cut},areverse", str(tmp)],
                   check=True, capture_output=True)
    tmp.replace(path)


#: 🗣️ **글로 읽을 때와 소리 내 읽을 때가 다른 것들.**
#    사장님 (2026-09-26): *"중간에 이상한걸 읽는데"*.
#    긴 줄표(—)는 **자막에서는 쉼표 노릇**을 하지만, 읽히면 「dash」라고
#    소리 내 읽히거나 엉뚱하게 끊긴다. 자막에는 남기고 **소리에서만** 바꾼다.
#    ⚠️ 자막까지 바꾸면 안 된다 — 글로는 줄표가 읽기 편하다.
SPEECH_FIX = [
    (" — ", ". "),   # 긴 줄표는 문장을 끊는 자리다 → 마침표로
    (" – ", ". "),   # 중간 줄표도 같다
    ("—", ", "),
    ("–", ", "),
    ("…", "."),      # 말줄임표를 「dot dot dot」 으로 읽는 목소리가 있다
    ("&", " and "),
]


# ─────────────────────────────────────────────────────────────────────────
# 🇰🇷 **고유명사는 한국식으로 읽힌다** (사장님 지시, 2026-09-26)
# ─────────────────────────────────────────────────────────────────────────
#   사장님: *"경복궁이네 발음이 이상해 / 이상하니 언어가 아니게 들려 /
#            자이엔복강 이렇게 들레 / 고유 명사 발음 한국식으로해"*
#
#   영어 목소리는 `Gyeongbokgung` 의 **`Gy` 를 「자이」로** 읽는다.
#   그러면 손님 귀에 「자이엔복강」이 되고, **말이 아닌 소리**로 들린다.
#   외국인이 가게에서 그 이름을 말해야 하는데, 잘못 배운 발음을 가르치는 꼴이다.
#
#   🚨 **자막은 로마자 그대로 둔다.** 손님이 읽고 찾아야 하는 글자다.
#      바꾸는 것은 **읽히는 소리뿐**이다.
#
#   두 가지 길 — 어느 쪽이 나은지는 **귀로 들어야** 안다:
#     · `ko`    — 한글을 그대로 넣는다. 다국어 목소리가 **진짜 한국어**로 읽는다.
#     · `roman` — 영어로 소리나는 대로 적는다. 영어 발음이지만 훨씬 가깝다.
#     · `off`   — 안 건드린다.
NAMES_KO = {
    "Gyeongbokgung": "경복궁", "Geunjeongjeon": "근정전", "Gyeonghoeru": "경회루",
    "Hyangwonjeong": "향원정", "Gwanghwamun": "광화문", "Changdeokgung": "창덕궁",
    "Deoksugung": "덕수궁", "Bukchon": "북촌", "Insadong": "인사동",
    "Myeongdong": "명동", "Hongdae": "홍대", "Namsan": "남산",
    "Bukhansan": "북한산", "Jongno": "종로", "hanbok": "한복",
    "Sumunjang": "수문장", "Cheonggyecheon": "청계천", "Gwangjang": "광장",
}
NAMES_ROMAN = {
    "Gyeongbokgung": "Kyung-bok-goong", "Geunjeongjeon": "Keun-jung-jun",
    "Gyeonghoeru": "Kyung-hway-roo", "Hyangwonjeong": "Hyang-won-jung",
    "Gwanghwamun": "Gwang-hwa-moon", "Changdeokgung": "Chang-duk-goong",
    "Deoksugung": "Duk-soo-goong", "Bukchon": "Book-chon",
    "Insadong": "In-sa-dong", "Myeongdong": "Myung-dong",
    "Hongdae": "Hong-dae", "Namsan": "Nam-san", "Bukhansan": "Book-han-san",
    "Jongno": "Jong-no", "hanbok": "Han-bok", "Sumunjang": "Soo-moon-jang",
    "Cheonggyecheon": "Chung-gye-chun", "Gwangjang": "Gwang-jang",
}
#: 어느 표를 쓸까. main() 이 `--names` 를 보고 정한다.
NAMES = NAMES_KO


def for_speech(text):
    """읽히기 전에 손본다. **자막은 안 건드린다.**"""
    out = text
    for a, b in SPEECH_FIX:
        out = out.replace(a, b)
    # 🇰🇷 고유명사를 낱말 단위로 바꾼다. 대소문자를 가리지 않는다
    #    (문장 첫머리의 Hanbok 과 가운데의 hanbok 이 둘 다 잡혀야 한다).
    for eng, ko in NAMES.items():
        out = re.sub(rf"\b{re.escape(eng)}\b", ko, out, flags=re.IGNORECASE)
    # 줄표를 마침표로 바꾸면 그 뒤가 소문자로 남는다 — 읽는 투가 어색해진다.
    out = re.sub(r"([.!?]\s+)([a-z])", lambda m: m.group(1) + m.group(2).upper(), out)
    return " ".join(out.split())


async def say(text, voice, path, rate=0):
    kw = {"rate": f"{rate:+d}%"} if rate else {}
    await edge_tts.Communicate(for_speech(text), voice, **kw).save(str(path))
    trim_silence(path)


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
    ap.add_argument("--free", action="store_true",
                    help="준 시간표를 무시하고 자연스럽게 읽은 뒤 시간표를 새로 뽑는다")
    ap.add_argument("--gap", type=float, default=0.4,
                    help="자유 모드에서 줄과 줄 사이에 둘 틈(초)")
    ap.add_argument("--names", choices=["ko", "roman", "off"], default="ko",
                    help="고유명사를 어떻게 읽힐까 — ko(한글) · roman(소리나는 대로) · off")
    args = ap.parse_args()

    global NAMES
    NAMES = {"ko": NAMES_KO, "roman": NAMES_ROMAN, "off": {}}[args.names]

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

    mode = "자유 — 소리에 영상을 맞춘다" if args.free else "맞춤 — 준 시간표에 소리를 맞춘다"
    print(f"🎙️ {args.voice} · {len(cues)}줄 · {mode}\n")
    parts, over = [], 0

    if args.free:
        # 🕊️ **자유 모드** — 속도를 안 건드리고 그냥 읽은 뒤, 읽힌 길이대로 줄을 세운다.
        t, new_cues = 0.0, []
        for i, (_, _, line) in enumerate(cues):
            p = tmp / f"{i:02d}.mp3"
            await say(line, args.voice, p, BASE_RATE)
            d = sec(p)
            spoken = for_speech(line)
            mark = "  ✎ 읽을 때만 고침" if spoken != line else ""
            print(f"   {t:5.2f}s  {line[:46]:<46}  {d:4.1f}s{mark}")
            parts.append((t, p))
            new_cues.append((t, t + d, line))
            t += d + args.gap
        total = new_cues[-1][1] + 0.3  # 마지막 말 뒤에 조금 남긴다
        cues = new_cues

        # 🚨 **시간표가 바뀌었으니 자막도 다시 써야 한다.** 안 그러면 손님이
        #    예전 SRT 를 그대로 쓰고, 소리와 글자가 어긋난 영상이 나간다.
        srt_out = out / f"{args.name}.srt"
        def stamp(x):
            h, r = divmod(x, 3600); m, s2 = divmod(r, 60)
            return f"{int(h):02d}:{int(m):02d}:{int(s2):02d},{int(round((s2 % 1) * 1000)):03d}"
        srt_out.write_text("\n\n".join(
            f"{i+1}\n{stamp(a)} --> {stamp(z)}\n{line}"
            for i, (a, z, line) in enumerate(cues)) + "\n", encoding="utf-8")
        print(f"\n📝 {srt_out.name}  — 읽힌 길이대로 새로 뽑았다")
    else:
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
    if args.free:
        print(f"\n🎬 **영상을 {total:.1f}초로 맞추면 된다.**")


if __name__ == "__main__":
    asyncio.run(main())
