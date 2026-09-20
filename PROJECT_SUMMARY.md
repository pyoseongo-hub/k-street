# K-Street — 한 장 요약

처음 보는 사람을 위한 안내. 자세한 규칙은 `CLAUDE.md`, 주제별 문서는 `docs/`.

---

## 무엇인가

**한국에 온 외국인 관광객에게 "오늘 어디 갈까"를 알려 주는 웹앱(PWA).**

- 공개 주소 — **https://korea-street.com**
- 12개 언어. 광고 없음, 가입 없음.
- 자료는 **공공 출처**에서만 온다 — 한국관광공사·구청·지자체. 블로그나 후기는 안 쓴다.
- 축제·산책길·시장·박물관·전망대 같은 **장소**가 중심이고, 구(區)별로 훑어보게 돼 있다.

---

## 사용 기술

| | |
|---|---|
| 화면 | **React 19 + TypeScript** |
| 빌드 | **Vite** (`npm run dev` / `npm run build`) |
| 앱화 | `vite-plugin-pwa` — 홈 화면에 설치되고 오프라인에서도 뜬다 |
| 린트 | `oxlint` |
| 지도 | 네이버 지도 (화면 내 지도), 길찾기는 카카오·네이버·구글로 **넘긴다** |
| 서버 | **없다.** 정적 파일만 올린다 |

런타임 의존성은 `react`·`react-dom` **둘뿐**이다. 나머지는 전부 빌드 도구다.
가볍게 유지하는 것이 이 저장소의 방침이다 — 손님 폰에서 빨리 떠야 한다.

---

## 폴더 구조

```
k-street/
├── index.html              진입점
├── src/
│   ├── App.tsx             화면 뼈대
│   ├── components/         화면 조각 25개 (DistrictExplorer, MapDirections …)
│   ├── lib/                로직 38개 (mapLinks, nearestStation, translations …)
│   ├── data/               ⭐ 장소 자료 (아래 따로 설명)
│   ├── config/             설정
│   └── styles/             CSS
├── scripts/                자료 받아오기·검사 스크립트 (100개 넘음)
├── .github/workflows/      자동 작업 — 배포 + 자료 갱신 30여 개
├── assets/photo-korea/     공공누리 1유형 사진 + credits.json
├── public/                 CNAME, robots.txt, sitemap.xml, 아이콘
├── docs/                   작업 기록·계획 문서
└── CLAUDE.md               🚨 작업 전에 반드시 읽는 규칙
```

---

## 배포 방식

**GitHub Pages.** `main`에 푸시하면 `.github/workflows/deploy.yml`이 자동으로 돈다.

```
푸시 → 검사 10여 개 → npm run build → npm run place-pages → Pages 업로드
```

- **검사를 하나라도 통과 못 하면 배포가 안 된다.** 자료가 틀린 채로 나가는 것을
  막으려고 일부러 그렇게 뒀다 (`audit-seed`, `check-city-places`, `check-place-pages` …).
- 🚨 **`npm run build`는 `dist`를 통째로 지운다.** 그래서 `place-pages`(곳마다 정적
  페이지를 만드는 단계)는 **반드시 build 뒤에** 돌려야 한다. 순서를 바꾸면 조용히 사라진다.
- 도메인은 `public/CNAME`에 적혀 있다 — `korea-street.com`.

**자료 갱신은 따로 돈다.** 축제 날짜·좌표·사진 같은 것은 `.github/workflows/`의
`fetch-*.yml`이 주기적으로 또는 손으로 눌러서 받아 오고, 바뀐 것만 커밋한다.

---

## 장소 데이터의 형태

한 곳은 `src/data/seed.ts`의 **`Place`** 로 표현된다. 핵심 칸만 적으면:

```ts
interface Place {
  id: string;            // "ks_4" 같은 열쇠. 좌표·역·사진이 전부 이걸로 붙는다
  city?: string;         // "seoul" · "busan" — 비면 서울
  gu: string;            // 자치구 ("강남구")
  dong?: string;         // 법정동
  category: Category;    // festival | market | walk | museum | temple | view …
  name: string;
  addr?: string;         // 도로명 주소 (택시 기사에게 보여 줄 때 쓴다)
  image?: string;        // 관광공사 사진 (공공누리 1유형)
  photoCredit?: string;  // 사진 출처 — 공공누리 조건이라 화면에 띄운다
  officialUrl?: string;  // 공식 안내 주소. 이름을 누르면 여기로 간다
  startMonth?: number;   // 축제 전용: 열리는 달
  endMonth?: number;
  period?: "early" | "mid" | "late";
}
```

**따로 관리하는 곳이 두 개 더 있다. 둘 다 `id`를 열쇠로 쓴다.**

**① 좌표 — `src/data/coords.json`**
```json
"ks_2": { "lat": 37.5605, "lng": 127.1302, "source": "kakao+naver", "matchedName": "강동선사문화축제" }
```
어디서 받았는지(`source`)와 **어느 이름으로 찾아진 것인지**(`matchedName`)를 같이 적는다.
이름이 안 맞으면 남의 곳 좌표를 붙인 것이라 바로 보인다.

**② 가장 가까운 역 — `src/data/nearest-station.json`**
```json
"ks_4": { "station": "가양역 9호선", "dist": 776, "lat": 37.5614, "lng": 126.8544 }
```
⚠️ **이 표를 화면에서 직접 읽지 않는다.** `src/lib/nearestStation.ts`를 거친다 —
곳이 옮겨 가면 표의 값이 조용히 틀려지기 때문이다(빛섬축제가 노들섬으로 옮겼는데
자양역이 그대로 떴던 적이 있다). 지금 좌표로 **다시 재서** 확인한다.

**그 밖의 자료 파일** — `seoul-places.json`·`busan-places.json`(관광공사에서 받은 곳),
`subway-stations.json`, `photo-gallery.json`, `festival-dates.json`, `place-slugs.json` 등.

---

## 길찾기 버튼이 있는 곳

| 파일 | 하는 일 |
|---|---|
| **`src/components/MapDirections.tsx`** | ⭐ **화면에 보이는 길찾기 버튼.** 카카오·네이버·구글 |
| **`src/lib/mapLinks.ts`** | 링크를 만드는 곳. `getMapLinks()` · `openMapLink()` |
| `src/components/SeoulMap.tsx` | 지도 말풍선 안의 같은 버튼 — **여긴 문자열 HTML이라 따로 있다** |
| `src/components/LuggageCard.tsx` | 짐 보관소로 가는 길찾기 |
| `src/components/DriverCard.tsx` | 택시 기사에게 보여 주는 목적지 화면 |

**어떻게 동작하나**

- **직접 경로를 계산하지 않는다.** 지도 3사로 넘기기만 한다. 정확도는 그쪽이 낫다.
- 버튼을 누르면 **앱 스킴으로 길찾기 화면을 바로 연다.** 앱이 안 열리면 1.2초 뒤
  웹 주소로 대신 간다 — 이때 **새 탭이 아니라 같은 탭 이동**이어야 팝업 차단에 안 걸린다.
- **위치 권한은 버튼을 누른 순간에만 묻는다.** 앱을 켜자마자 물으면 대부분 거절한다.
  위치를 못 받아도 목적지만으로 그대로 연다.
- ⚠️ `MapDirections.tsx`와 `SeoulMap.tsx`는 **같은 마크업을 두 군데서 만든다.**
  구조를 바꾸면 둘 다 고쳐야 한다.

---

## 비밀값

**이 저장소에는 키가 하나도 없다.** 전부 **GitHub Secrets**에만 있고,
워크플로가 실행될 때 환경변수로 주입된다.

🚨 **어떤 키·비밀번호도 저장소에 적지 않는다.** 대화창에도 붙여넣지 않는다.
새 키가 필요하면 GitHub 설정 화면에서 직접 넣는다.

---

## 처음 온 사람이 읽을 순서

1. **`CLAUDE.md`** — 이 프로젝트의 원칙과 하지 말아야 할 것
2. `docs/이렇게-일한다.md` · `docs/사장님과-일하는-법.md`
3. `docs/사진-저작권.md` — 어떤 사진을 쓸 수 있나
4. `docs/SNS-만들기.md` — 틱톡·인스타 만드는 법
5. `src/data/seed.ts` 머리말 — 자료를 왜 이렇게 적는지가 주석에 길게 적혀 있다
