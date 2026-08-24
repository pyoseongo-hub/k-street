# K-Street

서울 동네마다 열리는 축제·전통시장·꽃길·산책로·둘레길·박물관을 외국인 관광객에게 보여주는
안내 서비스. 가제(working title). **Kfood와는 별개 프로젝트**입니다 — 작업 지시는 [CLAUDE.md](./CLAUDE.md) 참고.

**출시 범위: 서울만, 무료.** 호응이 좋으면 전국으로 넓힙니다. 서울 외 지역은 코드 게이트로 막아 뒀습니다
(`src/config/launchScope.ts`).

## 배포

`main`에 푸시하면 GitHub Pages로 자동 배포됩니다(무료) — 최초 1회 리포 Settings → Pages → Source를
"GitHub Actions"로 설정해야 합니다. 켜진 뒤에는 https://pyoseongo-hub.github.io/k-street/ 에서 볼 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

## 지금 여기까지 됐습니다

- 홈 화면 뼈대: 상단은 "이달의 축제"(계절·월 선택), 하단은 시장·꽃길·산책로·둘레길·박물관을
  자치구 단위로 훑는 탐색 화면.
- 시드 데이터(`src/data/seed.ts`): 25개 구 × 6개 카테고리 조사 결과. 확인 못 한 항목은
  `confirmed: false`로 정직하게 표시됩니다.
- 아직 진짜 지도가 아닙니다 — 네이버·카카오 지도 API 연동 전이라 구 단위 그리드로 대신합니다.

다음 할 일은 [CLAUDE.md](./CLAUDE.md)의 "다음에 할 일" 참고.
