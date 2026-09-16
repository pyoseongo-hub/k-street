#!/usr/bin/env python3
"""📋 **축제 자료를 한 표로 모은다** — 글 자료만. 사진은 우리가 따로 넣는다.

사장님 (2026-09-16):
> *"축제가 많아서 기본 자료 텍스트 자료만 빼서, 우리는 사진 넣고 영어라 충돌도 없고.
>   필요한 정보 뽑아둬"*

── 왜 필요한가 ─────────────────────────────────────────────────────────
  10월 축제만 19곳이다. 한 편 만들 때마다 seed.ts · gu-festival-dates.json ·
  festival-venues.json · place-slugs.json 을 **네 군데 뒤지고 있었다.**
  그때마다 뒤지면 빠뜨린다. 한 번 모아 두면 **고르기만** 하면 된다.

── 어디서 모으나 (전부 이미 저장소에 있다) ─────────────────────────────
  · seed.ts                  이름 · 구 · 달 · 주소 · 공식 누리집 · 메모
  · gu-festival-dates.json   구청이 서울시 문화포털에 올린 **확정 날짜**와 장소
  · festival-venues.json     구청 보도자료로 확인해 둔 **자리**
  · place-slugs.json         앱 주소 (미끼 뒤에 방이 있는지 여기서 본다)
  · place-translations/en.json  영문 이름 (카드에 쓸 것)
  · photo-gallery.json + docs/*-사진/   **사진이 있나**

── 🚨 이 표는 「고르는 자리」지 「그대로 쓰는 자리」가 아니다 ────────────
  · 날짜가 **확정(구청)** 인지 **달만 아는 것**인지 칸을 갈라 뒀다.
    달만 아는 것을 카드에 날짜로 박으면 손님이 헛걸음한다.
  · **사진 없는 곳은 카드로 못 만든다.** 사장님: *"사진 없으면 의미 없어."*
    그래서 사진 칸을 맨 앞에 뒀다 — 거기부터 보고 고른다.
  · **앱 주소가 없는 곳도 못 만든다.** 미끼를 던졌는데 방이 없으면 손님이 한 번 오고 만다.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / "src" / "data"
OUT_MD = ROOT / "docs" / "축제-자료.md"
OUT_JSON = ROOT / "docs" / "축제-자료.json"


def load(name):
    return json.loads((D / name).read_text(encoding="utf-8"))


def b36(n):
    """seed.ts 의 `id()` 가 주는 값 — ks_1, ks_2 … ks_a … 순서대로다."""
    digits, out = "0123456789abcdefghijklmnopqrstuvwxyz", ""
    while n:
        out = digits[n % 36] + out
        n //= 36
    return out or "0"


def read_seed():
    """seed.ts 에서 축제만 뽑는다.

    ⚠️ **id 는 자리로 정해진다.** `id()` 가 순서대로 매기므로 **몇 번째 항목인지**로
       id 를 되살릴 수 있다. 중간에 하나 끼워 넣으면 뒤가 전부 밀린다 —
       그래서 새 항목은 늘 **맨 뒤**에 붙인다(HANDOFF 에 적힌 규칙).
    """
    s = (D / "seed.ts").read_text(encoding="utf-8")
    out = []
    for i, chunk in enumerate(s.split("{ id: id(),")[1:], 1):
        r = chunk[:1800]
        if '"festival"' not in r:
            continue

        def txt(k):
            m = re.search(rf'\b{k}:\s*"((?:[^"\\]|\\.)*)"', r)
            return m.group(1) if m else None

        def num(k):
            m = re.search(rf"\b{k}:\s*(\d+)", r)
            return int(m.group(1)) if m else None

        out.append({
            "id": f"ks_{b36(i)}",
            "이름": txt("name"),
            "구": txt("gu"),
            "동": txt("dong"),
            "시작달": num("startMonth"),
            "끝달": num("endMonth"),
            "달표기": txt("dateLabel"),
            "주소": txt("addr"),
            "공식": txt("officialUrl"),
            "메모": txt("note"),
            "달근거": txt("monthSource"),
        })
    return out


def photo_index():
    """사진이 어디에 있나 — 갤러리에 모아 둔 것과 **내려받아 둔 것**을 함께 본다.

    갤러리(photo-gallery.json)는 **주소만** 있고, docs/*-사진/ 은 **파일**이 있다.
    카드를 만들려면 파일이 있어야 하므로 둘을 갈라서 센다.
    """
    gal = {}
    for v in load("photo-gallery.json").values():
        gal[f"{v['gu']}|{v['name']}"] = len(v["photos"])
    local = {}
    for folder in (ROOT / "docs").glob("*-사진"):
        n = len(list(folder.rglob("*.jpg"))) + len(list(folder.rglob("*.jpeg")))
        if n:
            local[folder.name.replace("-사진", "")] = n
    return gal, local


def main():
    month = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else None
    fests = read_seed()
    gu_dates = load("gu-festival-dates.json")["곳"]
    venues = load("festival-venues.json")
    slugs = load("place-slugs.json")
    # 🌐 번역은 2026-09-17부터 **언어별 파일**로 나뉘어 있다
    #    (src/data/place-translations/en.json …). 왜 나눴는지는
    #    scripts/lib/place-translations.mjs 머리말에 있다 —
    #    한마디로, 손님 한 사람이 쓰는 말은 하나인데 열한 개를 다 받고 있었다.
    en = load("place-translations/en.json")
    gal, local = photo_index()

    rows = []
    for f in fests:
        if month and not (f["시작달"] and f["끝달"] and f["시작달"] <= month <= f["끝달"]):
            continue
        sure = gu_dates.get(f["id"]) or {}
        # 자리 — 앱 주소 → 구청 자료 → 보도자료로 확인해 둔 것 순으로 본다.
        place = f["주소"] or sure.get("place") or " · ".join(
            venues.get(f["이름"], {}).get("venues", []))
        # 사진 — 그 자리 이름으로 내려받아 둔 게 있나 먼저 본다(카드는 파일이 있어야 만든다).
        have_local = next((n for k, n in local.items() if place and k in place), 0)
        rows.append({
            "구": f["구"],
            "이름": f["이름"],
            "영문": en.get(f["이름"]),
            "자리": place,
            "확정날짜": (f"{sure['start']} ~ {sure['end']}"
                     if sure.get("start") and sure.get("end")
                     else sure.get("start")),
            "달표기": f["달표기"],
            "달": f'{f["시작달"]}~{f["끝달"]}월' if f["시작달"] else None,
            "공식": f["공식"],
            "메모": f["메모"],
            "앱주소": slugs.get(f["id"]),
            "사진파일": have_local,
            "갤러리": gal.get(f'{f["구"]}|{f["이름"]}', 0),
            "id": f["id"],
        })
    rows.sort(key=lambda r: (-r["사진파일"], -r["갤러리"], r["구"] or ""))

    title = f"{month}월에 하는 축제" if month else "축제 전체"
    L = [f"# 📋 {title} — 글 자료\n",
         "`scripts/festival-facts.py` 가 저장소 자료를 모아 만든 표입니다.",
         "**손으로 고치지 마세요** — 다시 돌리면 덮어씁니다.",
         "고칠 것이 있으면 `src/data/` 의 원본을 고칩니다.\n",
         "## 🚦 고르는 법\n",
         "| 칸 | 뜻 |",
         "|---|---|",
         "| **📷 사진** | `docs/…-사진/` 에 **파일로 받아 둔 장수**. 0이면 **카드를 못 만듭니다** |",
         "| 갤러리 | 관광공사 갤러리에 **축제 이름으로** 있는 장수 |",
         "| **🔗 앱** | 앱에 그 곳 페이지가 있나. 없으면 **미끼 뒤에 방이 없습니다** |",
         "| **📅 확정** | 구청이 서울시 문화포털에 올린 날짜. 이것만 **카드에 날짜로 박아도** 됩니다 |",
         "| 달 | 달만 아는 것. 카드에는 「Through October」처럼 **넓게** 적습니다 |\n",
         "🚨 **「갤러리 0장」을 「사진이 없다」로 읽지 마세요.**",
         "축제 이름(「서울시 태권도 공연」)으로는 갤러리에 거의 없습니다.",
         "**자리 이름**(「남산골한옥마을」)으로 찾으면 40장이 나옵니다.",
         "잠수교도 그랬습니다 — 축제 사진 0장, 반포한강공원 사진 26장.",
         "→ 📷 가 0이면 **자리 이름으로** Actions 의 `Search gallery` 를 먼저 돌립니다.\n",
         f"## 축제 {len(rows)}곳\n",
         "| 📷 | 갤러리 | 🔗앱 | 구 | 이름 | 자리 | 📅확정 | 달 |",
         "|---|---|---|---|---|---|---|---|"]
    for r in rows:
        L.append("| {} | {} | {} | {} | {} | {} | {} | {} |".format(
            f'**{r["사진파일"]}**' if r["사진파일"] else "—",
            r["갤러리"] or "—",
            "✅" if r["앱주소"] else "❌",
            r["구"] or "",
            r["이름"] or "",
            (r["자리"] or "—")[:34],
            r["확정날짜"] or "—",
            r["달표기"] or r["달"] or "—"))

    L.append("\n## 곳마다 자세히\n")
    for r in rows:
        L.append(f'### {r["이름"]}  ·  {r["구"]}')
        L.append(f'- **영문** — {r["영문"] or "⚠️ 없음 (카드에 쓸 이름이 없습니다)"}')
        L.append(f'- **자리** — {r["자리"] or "⚠️ 모름"}')
        if r["확정날짜"]:
            L.append(f'- **날짜(구청 확정)** — {r["확정날짜"]}')
        else:
            L.append(f'- 날짜 — {r["달표기"] or r["달"] or "모름"} '
                     f'(⚠️ 확정 아님. 카드에는 넓게 적을 것)')
        L.append(f'- 사진 — 받아 둔 것 **{r["사진파일"]}장** · 갤러리 {r["갤러리"]}장')
        L.append(f'- 앱 — ' + (f'`korea-street.com/place/{r["앱주소"]}/`'
                              if r["앱주소"] else "❌ **없음 — 먼저 앱에 넣어야 합니다**"))
        if r["공식"]:
            L.append(f'- 공식 — {r["공식"]}')
        if r["메모"]:
            L.append(f'- 메모 — {r["메모"]}')
        L.append("")

    OUT_MD.write_text("\n".join(L) + "\n", encoding="utf-8")
    OUT_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

    ready = [r for r in rows if r["사진파일"] and r["앱주소"]]
    print(f"📋 축제 {len(rows)}곳 → {OUT_MD.relative_to(ROOT)}")
    print(f"   🃏 지금 바로 카드로 만들 수 있는 곳 — {len(ready)}곳")
    for r in ready:
        print(f'      📷{r["사진파일"]:3}장  {r["구"]:7} {r["이름"]}')
    print(f'   📷 사진을 아직 안 받은 곳 — {sum(1 for r in rows if not r["사진파일"])}곳'
          f' (자리 이름으로 Search gallery 를 돌려야 한다)')
    print(f'   ❌ 앱에 없는 곳 — {sum(1 for r in rows if not r["앱주소"])}곳')


if __name__ == "__main__":
    main()
