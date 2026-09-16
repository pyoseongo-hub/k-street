// 서울 25개 자치구. seed.ts와 DistrictExplorer가 이 목록을 공유한다 —
// "서울만 보이게" 게이트(launchScope.ts)가 실제로 걸리려면 두 군데서 따로
// 자치구 목록을 들고 있으면 안 된다(하나만 고치고 하나는 안 고치는 사고가 난다).
//
// 🗺️ 2026-09-16부터 **원본은 여기가 아니라 cities.ts** 다.
//    전국 17개 시·도를 한 명부에 모으면서 서울도 그 안으로 들어갔다
//    (사장님: *"도별로 나누고 지도 참조해서 대도시 따로"*).
//    이 파일은 예전 이름을 계속 쓸 수 있게 남겨 둔 **얇은 껍데기**다 —
//    목록을 고칠 일이 있으면 cities.ts 를 고친다.
import { CITY_BY_KEY, sidoOf } from "./cities";

export const SEOUL_DISTRICTS: readonly string[] =
  CITY_BY_KEY.get("seoul")!.units;

export { sidoOf };
