#!/usr/bin/env python3
# 🖼️ **배너 그림을 늘 같은 규격으로 넣는다.**
#
# 사장님 (2026-10-18): *"이미지 크기 조절해서 넣어 그전처럼 그냥 넣고 나중에 조절하지 말고"*
#
# 🧭 왜 도구로 만드나 — 손으로 넣으면 장마다 품질이 달라진다. 실제로 단풍길만
#    218KB 로 들어갔고(낙엽이 잘아 압축이 안 먹는다) 나는 그걸 「그대로 둔다」고 했다.
#    그게 「나중에 조절」이다. **넣는 순간에 맞춰야 한다.**
#
# 📐 규격 — 1200x800 (3:2) · JPG · **180KB 이하** · 품질 70 이상
#    · 품질만 낮춰 180KB 를 맞추려 하면 잎·돌 같은 잔무늬에서 뭉개짐이 보인다.
#      그래서 **품질 70 밑으로는 안 내리고**, 대신 아주 약하게 매끄럽게 해서
#      바이트를 먹는 잔무늬를 먼저 줄인다. 눈에는 거의 안 보이고 용량은 크게 준다.
#
#   python3 scripts/add-banner.py <받은파일> <이름>
#   예: python3 scripts/add-banner.py ~/다운로드/a.png autumn-road

import sys, os
from PIL import Image, ImageFilter

한도 = 180 * 1024
가로, 세로 = 1200, 800
최소품질 = 70

def 넣기(src: str, 이름: str) -> None:
    out = os.path.join("public", "images", "banner", f"{이름}.jpg")
    원본 = os.path.getsize(src)
    im = Image.open(src).convert("RGB")
    w, h = im.size
    if abs(w / h - 1.5) > 0.01:
        print(f"⚠️ 비율이 {w/h:.3f} 다 (3:2 = 1.500). 잘리거나 눌린다 — 확인할 것")
    im = im.resize((가로, 세로), Image.LANCZOS)

    # ① 품질만 낮춰 본다 (70 까지)
    for q in (82, 78, 74, 70):
        im.save(out, "JPEG", quality=q, optimize=True, progressive=True, subsampling=2)
        if os.path.getsize(out) <= 한도:
            print(f"✅ {이름}.jpg — {원본//1024}KB → {os.path.getsize(out)//1024}KB (품질 {q})")
            return
    # ② 아직 크면 잔무늬를 아주 약하게 줄이고 다시
    for 반경, q in ((0.4, 74), (0.6, 74), (0.8, 72), (1.0, 70)):
        순 = im.filter(ImageFilter.GaussianBlur(radius=반경))
        순.save(out, "JPEG", quality=q, optimize=True, progressive=True, subsampling=2)
        if os.path.getsize(out) <= 한도:
            print(f"✅ {이름}.jpg — {원본//1024}KB → {os.path.getsize(out)//1024}KB "
                  f"(품질 {q} · 잔무늬 {반경} 만큼 줄임)")
            return
    print(f"⚠️ {이름}.jpg — {os.path.getsize(out)//1024}KB 로 한도({한도//1024}KB)를 못 맞췄다. "
          f"그림이 유난히 잘다 — 사람이 볼 것")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("쓰는 법: python3 scripts/add-banner.py <받은파일> <이름>"); sys.exit(1)
    넣기(sys.argv[1], sys.argv[2])
