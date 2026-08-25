import { useEffect, useState } from "react";

// 매 시간(기본값)마다 값이 바뀌는 시드 — "시간마다 이미지가 바뀐다"는 요구를
// 실제 사진 없이도 만족시킨다(SeasonArt가 이 값으로 모티프·팔레트를 다시 뽑는다).
export function useRotatingSeed(periodMs = 60 * 60 * 1000): number {
  const bucket = () => Math.floor(Date.now() / periodMs);
  const [seed, setSeed] = useState(bucket());

  useEffect(() => {
    const id = setInterval(() => setSeed(bucket()), 60 * 1000);
    return () => clearInterval(id);
  }, [periodMs]);

  return seed;
}
