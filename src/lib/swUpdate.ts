// 🔄 **새 내용이 올라갔는데 앱은 어제 화면을 보여 주는 문제.**
//
// 사장님이 예전에 짚으셨다: *"앱이 옛날 화면을 보여 준다."*
//
// ── 왜 그런가 ─────────────────────────────────────────────────────────────
//   서비스워커는 화면을 **먼저 캐시에서 꺼내 준다**(그래야 오프라인에서도 열린다).
//   새 판은 그 뒤에 조용히 내려받아 설치된다. `registerType: 'autoUpdate'` 라
//   설치되면 **바로 주도권을 가져간다**(skipWaiting + clientsClaim).
//
//   그런데 **이미 열려 있는 화면은 그대로다.** 주도권만 바뀌었을 뿐, 그 창이
//   들고 있는 HTML·자바스크립트는 어제 것이다. 손님이 앱을 껐다 켜도 —
//   설치형 앱은 대개 **껐다 켜는 게 아니라 되돌아오는 것**이라 — 그 창이 그대로 산다.
//   그래서 며칠씩 옛 화면을 본다. 오류가 안 나서 티도 안 난다.
//
// ── 어떻게 고치나 ─────────────────────────────────────────────────────────
//   새 서비스워커가 주도권을 가져가면(`controllerchange`) 한 번 새로고침한다.
//
//   🚨 다만 **보고 있는 중에 갑자기 새로고침하면 안 된다.** 읽던 자리가 날아가고,
//      손님은 앱이 고장 난 줄 안다. 그래서 두 갈래로 나눈다:
//        · 화면이 **안 보이는 중**이면(다른 앱에 있거나 잠금 화면) → 바로 새로고침.
//        · 보고 있는 중이면 → **표시만 해 두고**, 나갔다가 돌아올 때 새로고침한다.
//      되돌아오는 순간이 손님에게는 「앱을 다시 켠 것」이라 자연스럽다.
//
//   🚨 **처음 오는 손님은 건드리지 않는다.** 서비스워커가 처음 설치될 때도
//      `controllerchange` 가 뜨는데, 그때 새로고침하면 **첫 방문이 한 번 깜빡인다.**
//      시작할 때 `controller` 가 이미 있었는지를 보고 가른다.
//
// ⚠️ 이 파일은 **등록을 하지 않는다.** 등록은 vite-plugin-pwa 가 넣어 주는
//    registerSW.js 가 한다. 여기서 또 등록하면 두 번 등록된다.

export function watchForNewVersion(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  // 시작할 때 이미 서비스워커가 이 창을 맡고 있었나. 없었다면 **처음 오는 손님**이다.
  const hadController = Boolean(navigator.serviceWorker.controller);
  if (!hadController) return;

  let reloading = false;
  let waiting = false;

  const reloadOnce = () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (document.visibilityState === "hidden") reloadOnce();
    else waiting = true;      // 보고 있는 중이다 — 나갔다 돌아올 때 바꾼다
  });

  document.addEventListener("visibilitychange", () => {
    if (waiting && document.visibilityState === "visible") reloadOnce();
  });
}
