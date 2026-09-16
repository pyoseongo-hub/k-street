#!/usr/bin/env python3
"""🃏 **축제 두세 곳을 묶어 세로 카드로 만든다** (틱톡 포토 모드 · 인스타 여러 장).

사장님 (2026-09-16):
> *"틱톡 채널을 완전 스트릿 소개 페이지처럼 활용하자.
>   서울 축제 두 개 세 개 묶어서 사진 첨부해서 이쁘게 보여 주고 링크는 스트릿으로"*

── 왜 영상이 아니라 카드인가 ───────────────────────────────────────────
  릴스(잠수교)는 **미끼**다 — 분위기만 던지고 정보는 앱이 맡는다.
  이건 **소개 페이지**다. 보는 사람이 **자기 속도로 읽어야** 한다.
  틱톡 「포토 모드」는 넘겨 가며 보므로 글이 들어가도 안 답답하다.
  · 그대로 PNG 여러 장으로 올리면 → 포토 모드
  · `--video` 를 주면 같은 카드를 이어 붙여 mp4 로도 만든다

── 🎣 **이건 미끼다. 정보판이 아니다** (사장님 2026-09-16) ──────────────
  > *"틱톡은 정보보다 감성, 예쁜 사진 등으로 미끼. 사실에 너무 얽매이지 말고
  >   책임지지 않는 추상적 표현으로 사람들을 홀린다. 책임 없게."*

  🚨 첫 판은 **표**였다 — WHEN / WHERE / PRICE 를 줄줄이 박아 놨다.
     사장님은 처음부터 *"이쁘게만 보여 주고 링크는 스트릿으로"* 라고 하셨는데
     내가 정보 카드를 만들었다. 릴스에서 네 번 반려된 것과 **똑같은 실수**다 —
     「무엇이 있는지」를 예쁘게 다듬는 것. 광고는 그걸 하는 자리가 아니다.

  → 사진이 화면의 주인이다. 글은 **홀리는 한 줄**만.
  → 남기는 사실은 **장소 이름과 날짜, 딱 둘.** 사장님 (2026-09-16):
    *"날짜 장소 정도만 남겨. 그 정도는 있어야 신뢰감 있으니."*
    · 장소 — 사진이 어디인지 말해 준다. 빼면 남의 곳 사진처럼 보인다.
    · 날짜 — 이게 없으면 홍보물이 아니라 그냥 사진첩이다.
    · 시각·프로그램·규모는 **한 자도 안 적는다.** 앱이 맡는다.

  📌 **날짜는 넓게 적는다.** 「Through October」는 하루가 밀려도 안 틀린다.
     손님을 헛걸음시키는 건 「낭만」이 아니라 「10월 4일 오후 2시」다.

── 🚨 사진은 **그 축제가 열리는 자리**의 것만 쓴다 ─────────────────────
  이 저장소가 여러 번 데인 자리다 — 비슷한 지역 남의 사진을 채워 넣으면
  화면에 엉뚱한 곳이 뜬다. 자리 사진이 없으면 **그 축제는 안 넣는다.**
  축제 자체 사진이 없어 **같은 장소**의 사진을 쓸 때는 그렇다고 적어 둔다.

── 🪪 출처 ─────────────────────────────────────────────────────────────
  공공누리 제1유형은 **출처 표시가 쓰는 조건**이다. 마지막 카드에 넣는다.
  ⚠️ 맨 아래 구석에 두지 않는다 — 틱톡·인스타가 그 자리를 덮는다.
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
PHOTOS = ROOT / "docs"
OUT = ROOT / "cards-out"

# 🎨 가을 밤. 릴스와 같은 결로 맞춘다 — 두 채널이 한 곳처럼 보여야 한다.
INK = (14, 16, 22)          # 바탕
PANEL = (20, 23, 31)        # 글 판
ACCENT = (224, 154, 85)     # 가을 주황 — 눈길이 가야 하는 한 군데에만
TEXT = (240, 238, 234)
MUTED = (150, 158, 172)

#: 📱 위아래로 앱 UI(계정 이름·글·버튼)가 덮는 자리. 여기에는 글을 안 놓는다.
SAFE_TOP, SAFE_BOTTOM = 190, 300


# ── 📋 무엇을 올릴지 — **여기만 고치면 새 묶음이 나온다** ────────────────
#
# 🚨 `when`·`where`·`price` 는 **확인한 것만** 적는다. 애매하면 비운다.
#    날짜를 못 박으면 「Through October」처럼 **넓게** 적는다 — 하루가 밀려도 안 틀린다.
#
# `photo` 는 `docs/` 아래 실제 파일이다. 없는 사진을 적으면 바로 멈춘다.
POSTS = {
    "2026-10-서울-무료축제": {
        # 표지 — 크게 한 마디. 이게 손가락을 멈추게 하는 자리다.
        "title": ["OCTOBER", "IN SEOUL"],
        "sub": "Nobody tells you about these.",
        "cover": "잠수교-사진/한강-전경/4062103.jpg",
        "credit": ("출처 : ⓒ한국관광콘텐츠랩\n"
                   "촬영 : 정규진 · 서문교 · 임태원 · 두드림"),
        "items": [
            {
                # `place` — 어디인지. 이건 사진이 남의 곳처럼 보이지 않게 하는 닻이다.
                # `line`  — 홀리는 말. 분위기다. 사실을 말하는 자리가 아니다.
                # `when`  — **작게** 한 줄. 사장님 (2026-09-16):
                #           *"날짜 장소 정도만 남겨. 그 정도는 있어야 신뢰감 있으니."*
                #           🚨 넓게 적는다. 「10월 4일 오후 2시」로 적으면 틀릴 수 있고,
                #              틀리면 손님이 헛걸음한다. 정확한 날짜는 앱이 맡는다.
                "place": "JAMSUGYO BRIDGE",
                "line": ["The bridge empties.", "The river lights up."],
                "when": "Every Sunday · through October",
                "photo": "잠수교-사진/달빛-야경/3537888.jpg",
                "note": "잠수교 축제 사진은 갤러리에 없다 — 같은 자리 실사",
            },
            {
                "place": "SEOUL FOREST",
                "line": ["A whole park", "turning gold."],
                "when": "Through October",
                "photo": "서울숲-사진/가을/3098337.jpg",
                "note": "박람회 사진은 갤러리에 없다 — 같은 자리(서울숲) 실사",
            },
        ],
    },
}

LINK = "korea-street.com"
LINK_SUB = "Free · 12 languages · no sign-up"

LATIN = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
]
LATIN_THIN = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
]
# 🇰🇷 한글이 든 글꼴이 따로 필요하다 — DejaVu 에는 한글이 한 자도 없다(네모로 찍힌다).
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


def fit(paths, text, size, width):
    """🚨 글자가 폭을 넘으면 **들어갈 때까지 줄인다.**

    릴스에서 이걸 안 해서 자막 양옆이 잘린 채로 찍힌 적이 있다.
    영어 축제 이름은 길다 — 「Seoul International Garden Show」처럼.
    """
    probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    f = font(paths, size)
    while size > 22:
        if max(probe.textbbox((0, 0), ln, font=f)[2] for ln in text.split("\n")) <= width:
            return f
        size -= 2
        f = font(paths, size)
    return f


def draw_lines(d, text, x, y, f, fill, gap_ratio=1.22, center_w=None):
    """왼쪽 맞춤이 기본. `center_w` 를 주면 그 폭 안에서 가운데로 맞춘다."""
    gap = int(f.size * gap_ratio)
    for ln in text.split("\n"):
        px = x if center_w is None else x + (center_w - d.textbbox((0, 0), ln, font=f)[2]) // 2
        d.text((px, y), ln, font=f, fill=fill)
        y += gap
    return y


def fill_blur(im):
    """흐린 배경 — 사진을 화면에 꽉 채우도록 키운 뒤 뭉개고 어둡게 깐다.

    ⚠️ 우리 사진은 대부분 가로(3:2)다. 세로 9:16 으로 **자르면 70%가 날아간다.**
    릴스에서 쓴 방법을 그대로 가져왔다 — **한 점도 안 버리고** 화면은 꽉 찬다.
    """
    r = max(W / im.width, H / im.height)
    bg = im.resize((round(im.width * r) + 2, round(im.height * r) + 2), Image.LANCZOS)
    x, y = (bg.width - W) // 2, (bg.height - H) // 2
    bg = bg.crop((x, y, x + W, y + H)).filter(ImageFilter.GaussianBlur(44))
    return Image.blend(bg, Image.new("RGB", (W, H), INK), 0.58)


def photo_band(path, height):
    """사진을 `W × height` 로 꽉 채워 자른다.

    ⚠️ 우리 사진은 대부분 가로(3:2)다. 세로로 자르면 양옆이 날아가므로
    **높이를 사진 비율에 가깝게** 잡아 손실을 줄인다(1080×1000 ≈ 25%).
    릴스처럼 한 점도 안 버리는 게 목적이 아니라, **카드로 보기 좋은 것**이 목적이다.
    """
    im = Image.open(PHOTOS / path).convert("RGB")
    r = max(W / im.width, height / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - height) // 2
    return im.crop((x, y, x + W, y + height))


def fade_into_panel(canvas, band_h, fade=220):
    """사진 아래를 글 판 색으로 **서서히** 녹인다. 딱 잘리면 싸구려로 보인다."""
    grad = Image.new("L", (1, fade), 0)
    for i in range(fade):
        grad.putpixel((0, i), int(255 * (i / fade) ** 1.6))
    mask = grad.resize((W, fade))
    panel = Image.new("RGB", (W, fade), PANEL)
    box = (0, band_h - fade, W, band_h)
    canvas.paste(Image.composite(panel, canvas.crop(box), mask), box)


def rule(d, y, x0=80, x1=W - 80, fill=(52, 58, 70)):
    d.line([(x0, y), (x1, y)], fill=fill, width=2)


# ── 카드 세 종류 ────────────────────────────────────────────────────────

def cover_card(post):
    canvas = Image.new("RGB", (W, H), INK)
    band = photo_band(post["cover"], H)
    # 사진 위에 글을 얹으므로 **충분히 어둡게** 깐다. 안 그러면 안 읽힌다.
    canvas.paste(Image.blend(band, Image.new("RGB", (W, H), INK), 0.62))
    d = ImageDraw.Draw(canvas)

    y = H // 2 - 330
    y = draw_lines(d, "SEOUL STREET", 80, y, font(LATIN, 36), ACCENT, center_w=W - 160)
    y += 30
    title = "\n".join(post["title"])
    y = draw_lines(d, title, 80, y, fit(LATIN, title, 132, W - 160), TEXT,
                   gap_ratio=1.06, center_w=W - 160)
    y += 40
    rule(d, y, 380, W - 380)
    y += 46
    draw_lines(d, post["sub"], 80, y, fit(LATIN_THIN, post["sub"], 46, W - 200), MUTED,
               center_w=W - 160)

    swipe = "swipe  →"
    draw_lines(d, swipe, 80, H - SAFE_BOTTOM - 90, font(LATIN, 40), ACCENT, center_w=W - 160)
    return canvas


def shadowed(d, text, x, y, f, fill):
    """밝은 사진 위에서도 읽히게 그림자를 깐다.

    ⚠️ **어두운 사진만 보고 괜찮다고 넘기면 안 된다.** 잠수교(밤)에서는 멀쩡했는데
    서울숲(낮, 흰 하늘)을 넣자마자 글자가 사라졌다. 사진은 밝을 수도 있다.
    """
    for dx, dy in ((0, 4), (0, -4), (4, 0), (-4, 0), (3, 3), (-3, 3), (3, -3), (-3, -3)):
        d.text((x + dx, y + dy), text, font=f, fill=(0, 0, 0))
    d.text((x, y), text, font=f, fill=fill)


def item_card(it, n, total):
    """🎣 **사진이 주인, 글은 한 줄.**

    사장님 (2026-09-16): *"정보보다 감성, 예쁜 사진으로 미끼."*
    첫 판은 WHEN/WHERE/PRICE 표였다 — 소개가 아니라 **안내문**이 됐다.
    여기 남는 글은 **장소 이름 하나 + 홀리는 한 줄**뿐이다.
    """
    # 🚨 **흐린 배경 + 떠 있는 사진은 안 된다** (2026-09-16에 해 보고 버렸다).
    #    릴스에서는 그 방법이 맞다 — 움직이니까 배경이 안 거슬린다.
    #    멈춰 있는 카드에서는 **사진이 띠처럼 떠 보이고** 위아래 경계가 선으로 남는다.
    #    밝은 사진이면 흐린 배경까지 밝아져서 더 지저분하다.
    #    → 사진은 위에 꽉 채우고, 아래는 **한 색 판**으로 간다. 경계가 선이 아니라 면이 된다.
    band_h = 1080
    canvas = Image.new("RGB", (W, H), PANEL)
    canvas.paste(photo_band(it["photo"], band_h), (0, 0))
    fade_into_panel(canvas, band_h, 190)
    d = ImageDraw.Draw(canvas)

    # 이 한 줄만 사진 위에 놓는다(맨 위라야 뜻이 있다) — 흰 하늘에 묻히지 않게 그림자.
    shadowed(d, f"{n} / {total}", 80, SAFE_TOP - 90, font(LATIN, 34), (245, 245, 245))

    y = band_h + 60
    d.text((80, y), it["place"], font=font(LATIN, 34), fill=ACCENT)
    y += 68
    line = "\n".join(it["line"])
    f = fit(LATIN, line, 86, W - 160)
    for ln in line.split("\n"):
        d.text((80, y), ln, font=f, fill=TEXT)
        y += int(f.size * 1.16)

    # 📅 날짜 한 줄. **작게.** 없으면 그냥 사진첩이고, 크면 안내문이 된다.
    y += 26
    d.text((80, y), it["when"], font=fit(LATIN_THIN, it["when"], 38, W - 160), fill=MUTED)

    d.text((80, H - SAFE_BOTTOM - 50), LINK, font=font(LATIN, 34), fill=(120, 128, 142))
    return canvas


def closing_card(post):
    canvas = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(canvas)
    y = H // 2 - 300
    y = draw_lines(d, "FULL GUIDE", 80, y, font(LATIN, 36), ACCENT, center_w=W - 160)
    y += 34
    y = draw_lines(d, LINK, 80, y, fit(LATIN, LINK, 96, W - 140), TEXT, center_w=W - 160)
    y += 30
    y = draw_lines(d, LINK_SUB, 80, y, fit(LATIN_THIN, LINK_SUB, 42, W - 200), MUTED,
                   center_w=W - 160)
    y += 90
    rule(d, y, 300, W - 300)
    y += 70
    # 🪪 출처 — 공공누리 제1유형의 **쓰는 조건**이다. 앱 UI 가 덮지 않는 가운데에 둔다.
    draw_lines(d, post["credit"], 80, y, fit(HANGUL, post["credit"], 36, W - 160),
               (178, 187, 201), center_w=W - 160)
    return canvas


# ── 만들기 ──────────────────────────────────────────────────────────────

def build(post_id):
    post = POSTS[post_id]
    # 🚨 사진이 다 있는지 **먼저** 본다. 반쯤 만들다 멈추면 뭐가 나왔는지 헷갈린다.
    missing = [p for p in [post["cover"]] + [i["photo"] for i in post["items"]]
               if not (PHOTOS / p).exists()]
    if missing:
        sys.exit("❌ 사진이 없다:\n" + "\n".join(f"   docs/{m}" for m in missing))

    out = OUT / post_id
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("*.png"):
        old.unlink()

    cards = [("01-cover", cover_card(post))]
    total = len(post["items"])
    for i, it in enumerate(post["items"], 1):
        slug = it["place"].lower().replace(" ", "-")
        cards.append((f"{i + 1:02d}-{slug}",
                      item_card(it, i, total)))
    cards.append((f"{len(cards) + 1:02d}-link", closing_card(post)))

    for name, im in cards:
        im.save(out / f"{name}.png")
        print(f"🃏 {name}.png")
    print(f"\n✅ 카드 {len(cards)}장 → {out.relative_to(ROOT)}/")

    (out / "올리는-법.md").write_text(
        f"# 🃏 {post_id}\n\n"
        "## 틱톡 — 포토 모드\n\n"
        "1. 틱톡 → **+** → 위쪽 **「사진」** 탭\n"
        f"2. 이 폴더의 PNG **{len(cards)}장을 번호 순서대로** 고른다\n"
        "3. 음악은 틱톡 안에서 고른다 (영상에 미리 넣지 않는다 — 저작권·노출 둘 다 유리)\n"
        "4. 올린 뒤 **댓글을 하나 달고 「고정」** 한다 — 틱톡은 글에 주소를 못 적는다\n\n"
        "## 인스타 — 여러 장 올리기\n\n"
        "같은 PNG 를 순서대로 올린다. 첫 장이 표지다.\n\n"
        "---\n\n"
        "⚠️ **마지막 카드(출처)를 빼지 마세요.** 관광공사 사진은 공공누리 제1유형이라\n"
        "**출처 표시가 쓰는 조건**입니다. 빼면 쓸 근거가 없어집니다.\n\n"
        "⚠️ 카드에 적힌 사실은 **언제·어디서·값** 셋뿐입니다. 시작 시각·프로그램은\n"
        "앱이 맡습니다 — 경쟁 계정이 시간을 잘못 적어 손님을 두 시간 기다리게 한 적이 있습니다.\n",
        encoding="utf-8")

    if "--video" in sys.argv:
        stitch(out, cards)


def stitch(out, cards):
    """같은 카드를 이어 붙여 mp4 로도 만든다 (`--video`)."""
    exe = shutil.which("ffmpeg")
    if not exe:
        try:
            import imageio_ffmpeg
            exe = imageio_ffmpeg.get_ffmpeg_exe()
        except ImportError:
            sys.exit("ffmpeg 이 없다. `pip install imageio-ffmpeg` 할 것.")
    per = 3.5
    lst = out / "list.txt"
    lst.write_text("".join(f"file '{n}.png'\nduration {per}\n" for n, _ in cards)
                   + f"file '{cards[-1][0]}.png'\n", encoding="utf-8")
    mp4 = out / "카드영상.mp4"
    total = per * len(cards)
    subprocess.run([exe, "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-vf", f"fps=30,format=yuv420p,fade=t=in:st=0:d=0.5,"
                           f"fade=t=out:st={total - 0.8:.2f}:d=0.8",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                    "-movflags", "+faststart", str(mp4)],
                   check=True, cwd=out)
    print(f"🎬 {mp4.relative_to(ROOT)}  ({mp4.stat().st_size // 1024}KB · {total:.0f}초)")


def main():
    ids = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not ids:
        print("어느 묶음을 만들까:")
        for k, v in POSTS.items():
            print(f"   {k}  — 축제 {len(v['items'])}곳")
        print(f"\n$ python3 scripts/make-festival-cards.py {next(iter(POSTS))} [--video]")
        return
    for i in ids:
        if i not in POSTS:
            sys.exit(f"❌ 그런 묶음이 없다: {i}\n   있는 것: {', '.join(POSTS)}")
        build(i)


if __name__ == "__main__":
    main()
