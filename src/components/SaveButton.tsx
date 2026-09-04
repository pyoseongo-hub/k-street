import { useLanguage } from "../lib/useLanguage";
import { isSaved, toggleSaved, useSavedEntries } from "../lib/savedPlaces";

// 🤍 카드에 붙는 저장 단추. 누르면 ❤️ 로 바뀌고 '저장한 곳' 탭에 쌓인다.
//
// 사진 위에 얹는다 — 카드에서 가장 눈에 띄면서, 이름·날짜·길찾기 어느 것도
// 안 가리는 유일한 자리다. 사진이 없는 카드에서는 계절 그림 위에 얹힌다.
//
// 카드 전체가 눌리는 자리가 아니므로(이름·날짜·길찾기가 각각 따로 눌린다)
// 이 단추도 자기 몫만 받는다 — stopPropagation으로 바깥으로 안 새게 막는다.
export default function SaveButton({
  place,
  className = "save-btn",
}: {
  place: { gu: string; name: string };
  className?: string;
}) {
  const { t } = useLanguage();
  const entries = useSavedEntries();
  const on = isSaved(entries, place);

  return (
    <button
      type="button"
      className={className + (on ? " on" : "")}
      aria-pressed={on}
      aria-label={on ? t.unsaveLabel : t.saveLabel}
      title={on ? t.unsaveLabel : t.saveLabel}
      onClick={(e) => {
        e.stopPropagation();
        toggleSaved(place);
      }}
    >
      <span aria-hidden="true">{on ? "❤️" : "🤍"}</span>
    </button>
  );
}
