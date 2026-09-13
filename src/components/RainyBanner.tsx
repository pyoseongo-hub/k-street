import { useLanguage } from "../lib/useLanguage";
import { rainyPlaces } from "../lib/rainyPlaces";

// ☔ **비 오는 날에만 나오는 한 줄 띠.**
//
// 사장님 (2026-09-13): *"비 오는 날 좀 더 눈에 띄게 하고 싶은데 **작아서 지나칠까 봐**"*
//
// ─────────────────────────────────────────────────────────────────────────
// 왜 띠인가 — 사장님이 처음에 말씀하신 두 가지 중 **아직 안 한 쪽**이다
// ─────────────────────────────────────────────────────────────────────────
// 2026-09-12: *"예보 있으면 **단추 키우거나 자리 만들어서** 더 잘 보이게 해"*
// 그때 나는 **깜박임만** 만들었다. 깜박임은 20초면 끝나고, 그 뒤에는 34px 짜리
// 그림 하나로 돌아간다 — 앱을 20초 뒤에 여는 손님에게는 없는 것이나 같다.
// 「자리 만들어서」가 바로 이 띠다.
//
// 🚨 **비 오는 날에만 나온다.** 늘 있으면 사장님이 이미 물리신 그것이 된다 —
//    *"비는 어쩌다 오는데 두 번째 줄은 너무 과하고"*. 한 달에 며칠 쓰는 것에
//    자리를 영구히 주지 않는다. 날씨가 정하는 것은 **「있느냐」가 아니라 「얼마나
//    눈에 띄느냐」**라는 이 화면의 원칙이 여기서도 그대로다(RainyPanel.tsx 머리말).
//    · 비 안 오는 날 — 머리줄 ☂️ 단추 하나(파란 단추라 다른 것과 구별된다)
//    · 비 오는 날   — 그 단추가 깜박이고 + **이 띠가 첫 화면 맨 위에** 뜬다
//
// ⚠️ **숫자를 함께 적는다.** 「비 오는 날」만 있으면 눌러야 뭔지 알지만,
//    「118곳」이 보이면 누르기 전에 이미 값어치를 안다.
export default function RainyBanner({ now, onOpen }: { now: boolean; onOpen: () => void }) {
  const { t } = useLanguage();
  const { total } = rainyPlaces();
  return (
    <button type="button" className="rain-banner" onClick={onOpen}>
      <span className="rain-banner-ic" aria-hidden="true">
        ☔
      </span>
      <span className="rain-banner-tx">
        {/* 지금 오는 비와 예보를 가른다 — 「지금 비」는 당장 갈 곳을 찾는 손님이고,
            「오늘 비 예보」는 하루를 다시 짜는 손님이다. 급한 정도가 다르다. */}
        <strong>{now ? t.rainyNow : t.rainyForecast}</strong>
        <span>{t.rainyCta(total)}</span>
      </span>
      <span className="rain-banner-go" aria-hidden="true">
        →
      </span>
    </button>
  );
}
