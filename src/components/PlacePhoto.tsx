import { useState } from "react";
import type { Place } from "../data/seed";
import { galleryOf } from "../lib/tourGallery";
import { useLanguage } from "../lib/useLanguage";

// 📷 카드 위의 사진 한 자리. 사진이 여러 장이면 **넘겨 볼 수 있게** 한다
// (2026-09-02 사용자 지시: "사진 이쁜걸로 교체 / 전수조사").
//
// 왜 자동으로 안 넘기나 — 계절 표지(SeasonPhotoHero)는 저절로 바뀌지만, 목록의
// 카드가 여럿 동시에 깜빡이면 눈이 어지럽다. 손님이 보고 싶을 때만 넘긴다.
//
// 왜 대표 사진을 그냥 다른 걸로 바꾸지 않나 — 대표 이미지는 관광공사가 고른
// 것이고 지금까지 화면에 나오던 그 사진이다. 포스터인 경우가 있어 아쉽지만,
// 어느 게 '더 이쁜지'를 기계가 판단하면 멀쩡한 사진을 버리는 쪽이 더 잦다
// (좌표에서 겪은 그 문제와 같다). 그래서 **고르는 건 손님에게 맡긴다** —
// 첫 장은 그대로 두고, 나머지를 넘겨 볼 수 있게만 한다.

export default function PlacePhoto({ place, className = "fc-art fc-art-photo" }: {
  place: Place;
  className?: string;
}) {
  const { t } = useLanguage();
  const photos = galleryOf(place);
  const [idx, setIdx] = useState(0);

  if (!photos.length) return null;

  const many = photos.length > 1;
  const current = photos[Math.min(idx, photos.length - 1)];
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div
      className={className + (many ? " has-more" : "")}
      style={{ backgroundImage: `url(${current.url})` }}
      // 사진이 한 장뿐이면 누를 것이 없으므로 버튼처럼 굴지 않는다.
      {...(many
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-label": t.morePhotos(photos.length),
            onClick: next,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                next();
              }
            },
          }
        : {})}
    >
      <span className="fc-photo-credit">{place.photoCredit ?? t.photoCredit}</span>
      {many && (
        <span className="fc-photo-dots" aria-hidden="true">
          {/* 장수가 많으면 점이 줄줄이 늘어져 사진을 가린다 — 여덟 개까지만 그리고
              그 뒤로는 숫자로 알린다(강동북페스티벌이 10장이었다). */}
          {photos.length <= 8 ? (
            photos.map((p, i) => (
              <i key={p.url} className={i === idx ? "on" : undefined} />
            ))
          ) : (
            <b>
              {idx + 1} / {photos.length}
            </b>
          )}
        </span>
      )}
    </div>
  );
}
