#!/usr/bin/env python3
"""🎬 **사진 묶음으로 세로 릴스(1080×1920 mp4)를 만든다.**

사장님 (2026-09-16): *"영상"*

── 왜 두 도막으로 나눴나 ───────────────────────────────────────────────
  ① 컷 그리기(PIL)  — 이 스크립트. 작업 환경에서도 돈다. 눈으로 확인할 수 있다.
  ② 이어 붙이기(ffmpeg) — **작업 환경에 ffmpeg 이 없다.** Actions 러너에는 있다.
  그래서 ①을 먼저 돌려 컷을 보고, ②는 러너에서 돌린다.
  `--frames-only` 를 주면 ①만 한다.

── 가로 사진을 세로로 만드는 법 ────────────────────────────────────────
  우리 사진은 대부분 가로(3:2)다. 세로 9:16 에 **잘라 넣으면 70%가 날아간다** —
  분수가 다리 끝까지 뻗은 그림이 한가운데 토막만 남는다.
  그래서 **흐린 배경 + 원본 통째로** 얹는다. 릴스에서 흔히 보는 그 모양이고,
  사진을 한 점도 안 버린다.

── 글자 ────────────────────────────────────────────────────────────────
  릴스는 85%가 소리 없이 본다(2026 조사). 자막이 영상의 전부다.
  · 굵게, 크게, 가운데 아래. 그림자를 깔아 밝은 사진 위에서도 읽히게.
  · 안전 여백 — 위아래 220px 은 비운다. 인스타 UI(계정 이름·버튼)가 덮는 자리다.
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / "docs" / "잠수교-사진"
OUT = ROOT / "reel-out"

# 🎞️ 컷 표 — `docs/잠수교-릴스-대본.md` 의 자막 그대로다.
#    자막을 고치면 **거기와 여기를 같이 고친다.** 한쪽만 고치면 영상과 문서가 갈린다.
SHOTS = [
    ("달빛-야경/3537888.jpg", 3.5, "An autumn night"),
    ("한강-전경/4062103.jpg", 3.5, "Han River Park,\nand a beautiful bridge"),
    ("미식로드-푸드트럭/2550539.jpg", 3.5, "Endless food trucks"),
    ("미식로드-푸드트럭/2550543.jpg", 3.5, "Great food, cold beer"),
    ("미식로드-푸드트럭/2550547.jpg", 3.0, "A Han River festival\non an autumn night"),
    ("달빛-야경/3537830.jpg", 3.5, "The late-night fountain show\nat Banpo Bridge"),
    ("달빛-야경/3023365.jpg", 3.5, "Romance in the heart\nof the city"),
    ("한강-전경/4062102.jpg", 3.0, "Jamsugyo Bridge · Sunday nights"),
]

# 🪪 공공누리 제1유형은 **출처 표시가 쓰는 조건**이다. 이 카드를 빼면 쓸 근거가 없어진다.
CREDIT_SEC = 3.0
CREDIT = "korea-street.com"
CREDIT_SMALL = (
    "출처 : ⓒ한국관광콘텐츠랩\n"
    "촬영 : 목영해 · 서문교 · 임태원 · 정규진 · 한국관광공사 이범수"
)

# 굵은 라틴 글꼴을 순서대로 찾는다. 러너와 작업 환경이 서로 다른 것을 갖고 있다.
LATIN = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
]
# 🇰🇷 출처 카드에 한글이 들어간다. **한글이 있는 글꼴이 따로 필요하다** —
#    DejaVu 에는 한글이 한 자도 없어서 네모(두부)로 찍힌다.
HANGUL = [
    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/opentype/unifont/unifont_jp.otf",
]


def font(paths, size):
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    print(f"⚠️ 글꼴을 못 찾았다 — 기본 글꼴로 간다 ({paths[0]})", file=sys.stderr)
    return ImageFont.load_default()


def fill_blur(im):
    """흐린 배경 — 사진을 화면에 꽉 채우도록 키운 뒤 뭉갠다."""
    r = max(W / im.width, H / im.height)
    bg = im.resize((int(im.width * r) + 2, int(im.height * r) + 2), Image.LANCZOS)
    bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2,
                  (bg.width - W) // 2 + W, (bg.height - H) // 2 + H))
    bg = bg.filter(ImageFilter.GaussianBlur(40))
    # 배경을 어둡게 깔아 앞 사진과 글자가 뜬다.
    return Image.blend(bg, Image.new("RGB", (W, H), (0, 0, 0)), 0.45)


#: 자막이 닿을 수 있는 가로 폭. 양옆 60px 은 남긴다.
TEXT_W = W - 120


def fit(paths, text, size):
    """🚨 **글자가 화면 밖으로 안 나가게 크기를 줄인다.**

    첫 판에서 이걸 안 해서 「The late-night fountain show」와
    「Jamsugyo Bridge · Sunday nights」가 **양옆이 잘린 채로** 찍혔다.
    자막은 짧을 것 같아도 영어는 한글보다 길어진다 — 재 보고 줄여야 한다.
    """
    f = font(paths, size)
    probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    while size > 28:
        if max(probe.textbbox((0, 0), ln, font=f)[2] for ln in text.split("\n")) <= TEXT_W:
            return f
        size -= 3
        f = font(paths, size)
    return f


def draw_text(d, text, cy, f, fill=(255, 255, 255)):
    """가운데 정렬 + 그림자. 밝은 사진 위에서도 읽혀야 한다."""
    lines = text.split("\n")
    gap = int(f.size * 1.25)
    y = cy - (len(lines) - 1) * gap // 2
    for ln in lines:
        w = d.textbbox((0, 0), ln, font=f)[2]
        x = (W - w) // 2
        for dx, dy in ((0, 4), (0, -4), (4, 0), (-4, 0), (3, 3), (-3, 3)):
            d.text((x + dx, y + dy), ln, font=f, fill=(0, 0, 0))
        d.text((x, y), ln, font=f, fill=fill)
        y += gap


def shot_frame(path, caption):
    """caption 이 빈 값이면 **글자 없이** 사진만 얹는다 (`--no-text`).

    사장님 (2026-09-16): *"자막 없이 해"*
    글자가 없으면 자리를 비워 둘 이유도 없다 — 사진을 더 크게 얹는다.
    """
    im = Image.open(PHOTOS / path).convert("RGB")
    canvas = fill_blur(im)
    # 원본을 통째로 얹는다 — 한 점도 안 버린다.
    room = H - (640 if caption else 240)
    r = min(W / im.width, room / im.height)
    fg = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    canvas.paste(fg, ((W - fg.width) // 2, (H - fg.height) // 2 - (60 if caption else 0)))
    if caption:
        draw_text(ImageDraw.Draw(canvas), caption, H - 430, fit(LATIN, caption, 74))
    return canvas


def credit_frame():
    canvas = Image.new("RGB", (W, H), (8, 10, 14))
    d = ImageDraw.Draw(canvas)
    draw_text(d, CREDIT, H // 2 - 80, fit(LATIN, CREDIT, 86))
    sub = "Free · 12 languages · no sign-up"
    draw_text(d, sub, H // 2 + 40, fit(LATIN, sub, 44), fill=(170, 180, 195))
    draw_text(d, CREDIT_SMALL, H - 360, fit(HANGUL, CREDIT_SMALL, 34), fill=(150, 158, 172))
    return canvas


def main():
    OUT.mkdir(exist_ok=True)
    # 🔇 `--no-text` — 자막을 빼고 사진만. **출처 카드는 뺄 수 없다** (공공누리 조건).
    quiet = "--no-text" in sys.argv
    plan = []
    for i, (p, sec, cap) in enumerate(SHOTS):
        if quiet:
            cap = ""
        f = OUT / f"{i:02d}.png"
        shot_frame(p, cap).save(f)
        plan.append((f, sec))
        print(f"🖼️  {f.name}  {sec}s  {cap.replace(chr(10), ' / ') or '(자막 없음)'}")
    f = OUT / f"{len(SHOTS):02d}.png"
    credit_frame().save(f)
    plan.append((f, CREDIT_SEC))
    print(f"🪪 {f.name}  {CREDIT_SEC}s  출처 카드")

    total = sum(s for _, s in plan)
    print(f"\n총 {len(plan)}컷 · {total:.1f}초")
    (OUT / "plan.json").write_text(
        json.dumps([{"file": p.name, "sec": s} for p, s in plan], ensure_ascii=False, indent=2),
        encoding="utf-8")

    if "--frames-only" in sys.argv:
        print("컷만 그렸다 (--frames-only). 이어 붙이려면 ffmpeg 이 있는 데서 다시 돌린다.")
        return

    # 🎬 컷 사이를 0.4초씩 겹쳐 넘긴다. 뚝뚝 끊기면 싸구려로 보인다.
    #    xfade 는 입력이 많으면 꼬이기 쉬워서, **concat 으로 붙이고 시작·끝만 페이드**한다.
    lst = OUT / "list.txt"
    lst.write_text("".join(f"file '{p.name}'\nduration {s}\n" for p, s in plan)
                   + f"file '{plan[-1][0].name}'\n", encoding="utf-8")
    mp4 = OUT / ("잠수교-릴스-자막없음.mp4" if quiet else "잠수교-릴스.mp4")
    # 🧰 **ffmpeg 을 찾는 순서** — 시스템에 있으면 그것, 없으면 pip 로 딸려 오는 것.
    #    작업 환경(샌드박스)에는 ffmpeg 이 없다. `pip install imageio-ffmpeg` 하면
    #    static 바이너리가 딸려 와서 여기서도 영상까지 만들 수 있다.
    #    Actions 러너에는 ffmpeg 이 처음부터 있으므로 그냥 그걸 쓴다.
    exe = shutil.which("ffmpeg")
    if not exe:
        try:
            import imageio_ffmpeg
            exe = imageio_ffmpeg.get_ffmpeg_exe()
        except ImportError:
            sys.exit("ffmpeg 이 없다. `pip install imageio-ffmpeg` 하거나 ffmpeg 을 깔 것.")
    cmd = [
        exe, "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
        "-vf", f"fps=30,format=yuv420p,fade=t=in:st=0:d=0.6,"
               f"fade=t=out:st={total - 0.8:.2f}:d=0.8",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-movflags", "+faststart", str(mp4),
    ]
    print("\n$ " + " ".join(cmd))
    subprocess.run(cmd, check=True, cwd=OUT)
    print(f"\n✅ {mp4}  ({mp4.stat().st_size // 1024}KB)")


if __name__ == "__main__":
    main()
