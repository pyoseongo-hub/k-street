#!/usr/bin/env python3
# 📇 **사진 위에 글자를 얹어 SNS 카드를 찍는다.**
#
# 사장님 지시 (2026-09-26): *"경복궁 틱톡 인스타 넣을 사진 링크"* → *"다운받게 만들어"*
#
# ─────────────────────────────────────────────────────────────────────────
# 왜 러너에서 도나
# ─────────────────────────────────────────────────────────────────────────
#   저장소를 만드는 세션은 **tong.visitkorea.or.kr 이 막혀 있다**(프록시 403).
#   그래서 포토코리아 사진을 받아올 수가 없다 — 링크만 알고 그림은 못 본다.
#   러너는 받을 수 있다. 여기서 받아 카드를 찍고 가지에 올린다.
#
# 🚨 **받은 사진을 저장소에 남기지 않는다.** 카드(PNG)만 올린다.
#    원본은 관광공사 것이고, 우리가 보관할 이유가 없다.
#
# ─────────────────────────────────────────────────────────────────────────
# 🪪 출처 표기는 빼지 않는다
# ─────────────────────────────────────────────────────────────────────────
#   포토코리아 사진은 **공공누리 제1유형**이라 상업적으로 쓸 수 있지만,
#   **출처를 밝히는 것이 조건**이다. 그래서 `by` 가 빈 카드는 찍지 않고 멈춘다 —
#   나중에 손으로 붙이겠다는 약속은 지켜지지 않는다.
#
# ⚠️ **글꼴이 없으면 네모가 찍힌다.** 한글·가나·한자가 한 카드에 같이 들어가므로
#    Noto CJK 를 쓴다. 없으면 멈춘다 — 네모 박힌 카드를 올리는 것이 더 나쁘다.
#
#   CARDS='[{...}]' python3 scripts/make-photo-cards.py --out out
import json, os, sys, argparse, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# 📐 **크기.** 인스타는 세로 4:5, 틱톡은 9:16.
SIZES = {
    "ig": (1080, 1350),
    "tiktok": (1080, 1920),
}
# 🚧 틱톡은 위아래에 제 UI 가 겹친다. 이 안에만 글자를 둔다.
TIKTOK_SAFE_BOTTOM = 1420

FONT_DIRS = [
    "/usr/share/fonts/opentype/noto",
    "/usr/share/fonts/truetype/noto",
    "/usr/share/fonts",
]


def find_font(*names):
    """이름이 맞는 글꼴 파일을 찾는다. 못 찾으면 None."""
    for root in FONT_DIRS:
        for dirpath, _dirs, files in os.walk(root):
            for f in files:
                if any(n.lower() in f.lower() for n in names):
                    return os.path.join(dirpath, f)
    return None


def load_fonts():
    # NotoSansCJK 하나에 한글·가나·한자가 다 들어 있다 — 섞어 써도 네모가 안 난다.
    cjk = find_font("NotoSansCJK-Bold", "NotoSansCJKkr-Bold", "NotoSerifCJK-Bold")
    cjk_r = find_font("NotoSansCJK-Regular", "NotoSansCJKkr-Regular") or cjk
    if not cjk:
        sys.exit("❌ Noto CJK 글꼴이 없다. 워크플로에서 fonts-noto-cjk 를 깔 것.\n"
                 "   (글꼴 없이 찍으면 한글·가나가 전부 네모로 나온다)")
    return cjk, cjk_r


def fetch(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (k-street card maker)"})
    with urllib.request.urlopen(req, timeout=30) as r, open(dest, "wb") as f:
        f.write(r.read())


def cover(img, w, h):
    """가운데를 기준으로 꽉 채워 자른다 (CSS 의 object-fit: cover 와 같다)."""
    src_ratio = img.width / img.height
    dst_ratio = w / h
    if src_ratio > dst_ratio:            # 원본이 더 넓다 → 좌우를 자른다
        new_w = int(img.height * dst_ratio)
        box = ((img.width - new_w) // 2, 0, (img.width - new_w) // 2 + new_w, img.height)
    else:                                # 원본이 더 높다 → 위아래를 자른다
        new_h = int(img.width / dst_ratio)
        # 🖼️ 가운데가 아니라 **살짝 위**를 남긴다. 건물 사진은 하늘보다 아래가 중요하다.
        top = int((img.height - new_h) * 0.4)
        box = (0, top, img.width, top + new_h)
    return img.resize((w, h), Image.LANCZOS, box=box)


def scrim(img, top_y, strength=232):
    """아래쪽을 어둡게 깐다. 안 깔면 밝은 사진에서 흰 글자가 안 읽힌다."""
    w, h = img.size
    band = h - top_y
    mask = Image.new("L", (1, band))
    for y in range(band):
        t = y / max(band - 1, 1)
        mask.putpixel((0, y), int(strength * (t ** 0.85)))
    mask = mask.resize((w, band))
    img.paste(Image.new("RGB", (w, band), (8, 11, 9)), (0, top_y), mask)


def wrap(draw, text, font, max_w):
    """글자를 칸 안에 접는다. 한·일 글은 띄어쓰기가 없어 **글자 단위**로도 접는다."""
    if not text:
        return []
    words = text.split(" ")
    lines, cur = [], ""
    for wd in words:
        trial = (cur + " " + wd).strip()
        if draw.textlength(trial, font=font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    # 띄어쓰기로 안 접히는 줄(일본어)은 글자 단위로 다시 접는다
    out = []
    for ln in lines:
        if draw.textlength(ln, font=font) <= max_w:
            out.append(ln)
            continue
        buf = ""
        for ch in ln:
            if draw.textlength(buf + ch, font=font) <= max_w:
                buf += ch
            else:
                out.append(buf)
                buf = ch
        if buf:
            out.append(buf)
    return out


def render(card, kind, bold_path, reg_path, out_dir, src_path):
    w, h = SIZES[kind]
    img = cover(Image.open(src_path).convert("RGB"), w, h)

    pad = 76
    max_w = w - pad * 2
    f_ko = ImageFont.truetype(bold_path, 74)
    f_ro = ImageFont.truetype(reg_path, 27)
    f_en = ImageFont.truetype(bold_path, 44)
    f_ja = ImageFont.truetype(reg_path, 40)
    f_cr = ImageFont.truetype(reg_path, 23)
    f_mk = ImageFont.truetype(bold_path, 27)

    d = ImageDraw.Draw(img)
    en_lines = wrap(d, card.get("en", ""), f_en, max_w)
    ja_lines = wrap(d, card.get("ja", ""), f_ja, max_w)

    # 글자 덩어리 높이를 먼저 잰다 — 어디서부터 어둡게 깔지 정해야 한다.
    gap_s, gap_m, gap_l = 10, 18, 30
    block = 74 + gap_s + 27 + gap_l
    block += len(en_lines) * 56
    block += gap_m + len(ja_lines) * 52
    block += gap_l + 23

    bottom = TIKTOK_SAFE_BOTTOM if kind == "tiktok" else h - pad
    y = bottom - block
    scrim(img, max(0, y - 150))

    def put(text, font, fill, yy):
        d.text((pad, yy), text, font=font, fill=fill)

    put(card["ko"], f_ko, (255, 255, 255), y); y += 74 + gap_s
    put(card.get("ro", ""), f_ro, (198, 206, 199), y); y += 27 + gap_l
    for ln in en_lines:
        put(ln, f_en, (255, 255, 255), y); y += 56
    y += gap_m - 12
    for ln in ja_lines:
        put(ln, f_ja, (214, 221, 214), y); y += 52
    y += gap_l
    # 🪪 포토코리아의 촬영자 칸은 「한국관광공사 이범수」처럼 기관 이름이 붙어 오기도 한다.
    #    그대로 쓰면 「한국관광공사 포토코리아 – 한국관광공사 이범수」가 된다 — 앞을 떼어낸다.
    by = card["by"].strip()
    if by.startswith("한국관광공사"):
        by = by[len("한국관광공사"):].strip() or card["by"].strip()
    put("사진: 한국관광공사 포토코리아 – " + by, f_cr, (168, 178, 170), y)

    # 🏷️ K-STREET 표는 **오른쪽 아래 구석**에 작게. 사진을 가리지 않는다.
    mark = "K-STREET"
    mw = d.textlength(mark, font=f_mk)
    d.text((w - pad - mw, y - 2), mark, font=f_mk, fill=(255, 206, 92))

    name = f"{card['id']}-{kind}.png"
    img.save(os.path.join(out_dir, name), "PNG")
    return name


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="out")
    ap.add_argument("--sizes", default="ig,tiktok")
    args = ap.parse_args()

    raw = os.environ.get("CARDS", "").strip()
    if not raw:
        sys.exit("❌ CARDS 가 비어 있다 (JSON 배열을 넣을 것)")
    cards = json.loads(raw)

    bold, reg = load_fonts()
    print(f"🔤 굵은 글꼴 {bold}\n🔤 보통 글꼴 {reg}\n")

    os.makedirs(args.out, exist_ok=True)
    tmp = os.path.join(args.out, "_src")
    os.makedirs(tmp, exist_ok=True)

    made, failed = [], []
    for c in cards:
        for key in ("id", "url", "ko", "by"):
            if not c.get(key):
                sys.exit(f"❌ 카드에 {key} 가 없다: {c}")
        src = os.path.join(tmp, c["id"] + os.path.splitext(c["url"])[1])
        try:
            fetch(c["url"], src)
            size = os.path.getsize(src)
            if size < 5000:
                raise RuntimeError(f"받은 파일이 너무 작다 ({size}바이트) — 사진이 아닐 수 있다")
            print(f"📥 {c['id']}  {size // 1024}KB")
        except Exception as e:
            print(f"❌ {c['id']} 못 받았다 — {e}")
            failed.append(c["id"])
            continue
        for kind in args.sizes.split(","):
            kind = kind.strip()
            if kind not in SIZES:
                sys.exit(f"❌ 모르는 크기: {kind}")
            made.append(render(c, kind, bold, reg, args.out, src))
            print(f"   🖼️  {made[-1]}")

    # 원본은 남기지 않는다 (위 머리말)
    for f in os.listdir(tmp):
        os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)

    print(f"\n✅ 카드 {len(made)}장")
    if failed:
        print(f"❌ 사진을 못 받은 것 {len(failed)}개: {', '.join(failed)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
