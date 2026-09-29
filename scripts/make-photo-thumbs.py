#!/usr/bin/env python3
# 🖼️ **사진을 받아 작은 그림으로 줄인다** — 골라 보시라고.
#
# 사장님 (2026-09-29): *"한강 공원 사용가능한 사진 볼수있게 링크"*
#
# ── 왜 러너에서 도나 ──────────────────────────────────────────────────
#   이 저장소를 만드는 세션은 tong.visitkorea.or.kr 이 막혀 있다(프록시 403).
#   주소는 아는데 그림을 못 받는다. 러너는 받는다 — make-photo-cards 와 같은 이유.
#
# ── 왜 줄이나 ────────────────────────────────────────────────────────
#   원본은 한 장에 몇 MB다. 47장이면 화면이 안 열린다.
#   **가로 720px 로 줄여** 고르는 데만 쓰고, 실제로 쓸 때는 원본 주소를 쓴다.
#
# 🚨 **원본은 저장소에 안 남긴다.** 줄인 것만 가지에 올린다(사진 저작권 원칙).
#    공공누리 제1유형이라 써도 되지만, 저장소를 사진 창고로 쓰지는 않는다.
import argparse, io, os, sys, urllib.request
from PIL import Image

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"

ap = argparse.ArgumentParser()
ap.add_argument("--urls", default=os.environ.get("URLS", ""))
ap.add_argument("--out", default="thumbs")
ap.add_argument("--width", type=int, default=720)
a = ap.parse_args()

urls = [u.strip() for u in a.urls.replace("\n", ",").split(",") if u.strip()]
if not urls:
    sys.exit("❌ 주소가 없다.")

os.makedirs(a.out, exist_ok=True)
ok = bad = 0
for u in urls:
    name = os.path.splitext(os.path.basename(u))[0] + ".jpg"
    try:
        req = urllib.request.Request(u, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
        # 🚨 **받은 것이 사진인지 본다.** 오류 쪽을 받아 놓고 ✅ 를 찍으면
        #    빈 칸이 조용히 올라간다(어제 0바이트 소리를 ✅ 로 올린 일과 같은 줄).
        if len(raw) < 5000:
            raise RuntimeError(f"너무 작다 ({len(raw)}바이트) — 사진이 아닐 수 있다")
        im = Image.open(io.BytesIO(raw)).convert("RGB")
        w, h = im.size
        if w > a.width:
            im = im.resize((a.width, round(h * a.width / w)), Image.LANCZOS)
        im.save(os.path.join(a.out, name), "JPEG", quality=82, optimize=True)
        size = os.path.getsize(os.path.join(a.out, name))
        print(f"✅ {name}  {w}×{h} → {im.size[0]}×{im.size[1]}  {size // 1024}KB")
        ok += 1
    except Exception as e:
        print(f"❌ {name}  {e}")
        bad += 1

print(f"\n받은 것 {ok} · 못 받은 것 {bad}")
if not ok:
    sys.exit("❌ 한 장도 못 받았다.")
