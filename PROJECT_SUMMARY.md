# K-Street — 한 장 요약

> 이 프로젝트를 **처음 보는 사람**을 위한 설명서입니다.
> 작업 규칙(무엇을 해도 되고 무엇을 하면 안 되는지)은 `CLAUDE.md`에 따로 있습니다.
> 마지막 갱신: 2026-09-20

---

## 무엇인가

외국인 관광객에게 **서울·부산의 갈 만한 곳**(축제·시장·산책길·절·전망대·단풍길…)을
**12개 언어**로 보여 주는 웹앱입니다.

- 공개 주소: **https://korea-street.com**
- 저장소: `pyoseongo-hub/k-street` · 작업 브랜치는 **`main` 하나**
- 설치형 앱(PWA)이라 폰에서 「홈 화면에 추가」가 됩니다.
- 12개 언어: `ko · en · ja · zh · zh-TW · vi · es · fr · de · ru · id · th`

**밥집은 이 앱이 다루지 않습니다.** 배고픈 손님은 같은 제작자의 다른 앱(Kfood)으로
넘겨줍니다 — 아래 「Kfood로 넘어가는 링크」 참고.

---

## 사용 기술

| 갈래 | 무엇 |
|---|---|
| 화면 | **React 19** + **TypeScript** |
| 빌드 | **Vite 8** (`npm run build` = `tsc -b && vite build`) |
| 설치형 앱 | `vite-plugin-pwa` (서비스워커·매니페스트) |
| 검사 | `oxlint` + 손으로 만든 점검 스크립트 여러 개 |
| 자료 수집 | **GitHub Actions** + `scripts/*.mjs` (Node 22) |

**실행에 필요한 라이브러리는 `react`와 `react-dom` 둘뿐입니다.**
상태관리·UI킷·차트 라이브러리를 쓰지 않습니다. 나머지는 전부 빌드 때만 쓰는 도구입니다.

---

## 폴더 구조

```
k-street/
├─ index.html              앱의 뼈대 한 장
├─ vite.config.ts          빌드·PWA 설정
├─ public/                 그대로 복사되는 것 (CNAME · robots.txt · sitemap.xml · 아이콘)
├─ src/
│  ├─ App.tsx              화면 전체를 묶는 곳
│  ├─ components/  (25개)  화면 조각 — MapDirections · SeoulMap · CityPicker …
│  ├─ lib/         (38개)  로직 — mapLinks · partnerLinks · placeText · nearestStation …
│  ├─ data/                ⭐ 장소 자료가 전부 여기 (아래 설명)
│  ├─ config/              공개 범위 등 설정값
│  └─ styles/              CSS
├─ scripts/        (87개)  자료를 받아 오고 점검하는 프로그램
├─ .github/workflows/(44개) 위 스크립트를 깃허브에서 돌리는 설정 + 배포
├─ docs/           (47개)  작업 기록·안내서 (한국어)
└─ tests/
```

`src/data/` 안에서 **중심이 되는 파일**:

| 파일 | 내용 |
|---|---|
| `seed.ts` | `Place` 자료형 정의 + 축제 목록 + **모든 장소를 합치는 `ALL_PLACES`** |
| `seoul-places.json` | 서울 341곳 (관광공사 자료) |
| `busan-places.json` | 부산 202곳 (관광공사 자료) |
| `coords.json` | 좌표 (167곳 — 관광공사가 좌표를 안 준 곳을 따로 채운 것) |
| `nearest-station.json` | 가장 가까운 지하철역 (364곳) |
| `place-translations/` | **11개 언어 파일** — 장소 이름·설명 번역 |

---

## 배포 방식

**서버가 없습니다. 정적 사이트입니다.**
데이터베이스도, 백엔드 API도, 로그인도 없습니다. 자료는 전부 **빌드할 때 파일에서
읽어 화면에 박아 넣습니다.** 손님 브라우저는 만들어진 파일만 내려받습니다.

- **어디에 올라가 있나** — GitHub Pages
- **주소** — `public/CNAME` 에 적힌 `korea-street.com` (직접 산 도메인)
- **언제 올라가나** — `main` 브랜치에 푸시하면 `.github/workflows/deploy.yml` 이 자동으로 돕니다

배포 순서(`deploy.yml`):

1. `npm ci`
2. **점검 10가지** — 워크플로 문법 · 갈래 분류 · 도시별 장소 · 육각지도 · 한자 이름 ·
   seed 감사 · CSS 변수 · 문구 검사 … **하나라도 실패하면 배포가 멈춥니다.**
3. `npm run build` → `dist/`
4. `npm run place-pages` → 검색엔진용 장소별 페이지를 `dist/` 에 **덧붙입니다**
   🚨 **순서가 중요합니다.** `build` 가 `dist` 를 지우고 다시 만들기 때문에
   반드시 **build 다음에** place-pages 를 돌려야 합니다.
5. `actions/deploy-pages` 로 올림

⚠️ **자료 수집 워크플로가 저장한 커밋으로는 배포가 저절로 안 돕니다.**
깃허브는 봇이 기본 토큰으로 민 커밋으로 다른 워크플로를 띄우지 않습니다.
그래서 자료 워크플로들은 끝에서 `gh workflow run deploy.yml` 로 **배포를 직접 깨웁니다.**

---

## 장소 데이터의 형태

### 몇 곳인가

| | 곳 수 |
|---|---|
| **전체 (앱에 보이는 것)** | **932곳** |
| ├ 서울 | **742곳** (25개 구 전부) |
| └ 부산 | **190곳** |
| 그중 축제 | 91개 |

갈래별: 박물관·미술관 234 · 산책 149 · 단풍 107 · 시장 99 · 상점가 75 ·
축제 72 · 거리 69 · 절 60 · 등산 28 · 꽃 15 · 전망 15 · 해변 9

> 숫자를 세는 법: `ALL_PLACES` 는 **사진이 붙은 곳만** 내보냅니다(사진 없는 곳은
> 화면이 휑해서 가립니다). 그래서 원본 파일의 줄 수(서울 341 + 부산 202)와
> 앱에 뜨는 수가 다릅니다.

### 자료형 (`src/data/seed.ts`)

```ts
export interface Place {
  id: string;            // 절대 다시 쓰지 않는 열쇠 (사진·좌표가 이걸로 붙는다)
  city?: string;         // 없으면 서울
  gu: string;            // 구
  dong?: string;         // 법정동
  category: Category;    // festival|market|flower|walk|hike|museum|
                         // street|shop|autumn|temple|beach|view
  name: string;          // 한국어 이름 (택시 기사에게 보여줄 것)
  note?: string;         // 한 줄 설명
  addr?: string;         // 한국어 주소 — 번역하지 않는다
  lat?: number; lng?: number;
  image?: string; thumb?: string;
  tourContentId?: string;
  officialUrl?: string;
  startMonth?: number; endMonth?: number; dateLabel?: string;
}
```

### 실제 예시 한 곳 — 광장시장

**① 장소 자체** (`ALL_PLACES` 안)
```json
{
  "id": "ks_1k",
  "gu": "종로구",
  "category": "market",
  "name": "광장시장",
  "note": "100년 상설시장",
  "addr": "서울특별시 종로구 창경궁로 88",
  "lat": 37.5701653166,
  "lng": 126.9997217621,
  "image": "https://tong.visitkorea.or.kr/cms/resource/81/2668981_image2_1.jpg",
  "tourContentId": "132183",
  "confirmed": true
}
```

**② 좌표 보강** (`src/data/coords.json` — 관광공사 좌표가 없거나 틀린 곳만)
```json
"ks_1k": { "lat": 37.57005529646949, "lng": 126.99894728223626,
           "source": "kakao+naver", "matchedName": "광장시장", "for": "광장시장" }
```

**③ 가까운 지하철역** (`src/data/nearest-station.json` 의 `곳` 아래)
```json
"ks_1k": { "station": "종로5가역 1호선", "dist": 250,
           "lat": 37.57097610838373, "lng": 127.00153834521934,
           "url": "http://place.map.kakao.com/21160791" }
```
출처: 카카오 지역검색(SW8 지하철역), 받은 날 2026-09-15.
⚠️ **화면은 이 표를 그대로 읽지 않습니다.** `src/lib/nearestStation.ts` 가
**지금 좌표에서 다시 잽니다.** 장소를 옮겼는데 역 이름만 옛것으로 남는 사고를
한 번 겪어서 그렇게 바꿨습니다.

**④ 12개 언어 이름** (`src/data/place-translations/<언어>.json`)
열쇠는 **한국어 원문 그 자체**입니다(번호가 아닙니다 — 목록 중간에 한 곳을
넣거나 빼면 번호가 통째로 밀리기 때문입니다).
```
en     "광장시장" → "Gwangjang Market"   · "100년 상설시장" → "100-Year Permanent Market"
ja     "광장시장" → "広蔵市場"            · "100년 상설시장" → "100年常設市場"
zh     "광장시장" → "广藏市场"            · "100년 상설시장" → "百年永久市场"
vi     "광장시장" → "Chợ Gwangjang"      · "100년 상설시장" → "Thị trường thường trực 100 năm"
```
- 읽는 함수: **`src/lib/placeText.ts`** 의 `placeName()` · `translateText()`
- 채우는 곳: `scripts/translate-places.mjs` (구글 번역) —
  Actions 의 **Translate places** 워크플로로 돌립니다.
- **주소(`addr`)는 번역하지 않습니다.** 택시 기사에게 보여 줄 한국어여야 합니다.
- 번역이 없는 언어는 **영어로 대신** 보여 주므로 화면이 깨지지 않습니다.

---

## 길찾기 버튼 (카카오맵 · 네이버지도 · 구글지도)

**주소를 만드는 함수 — 여기 한 곳뿐입니다.**

| 파일 | 함수 | 하는 일 |
|---|---|---|
| **`src/lib/mapLinks.ts`** | `getMapLinks(place, from?)` | KAKAO·NAVER·GOOGLE **세 개의 링크를 만든다** |
| | `openMapLink(link)` | 앱이 깔려 있으면 앱으로, 없으면 웹으로 넘긴다 |
| | `renderMapLinksHtml(...)` | 같은 버튼을 **HTML 글자**로 만든다(지도 말풍선용) |
| | `getPlaceInfoLink()` · `openPlaceInfo()` | 길찾기 말고 **가게 정보** 쪽 링크 |

만들어지는 주소:

```
KAKAO   앱  kakaomap://route?sp=<출발>&ep=<도착>&by=PUBLICTRANSIT
        웹  https://map.kakao.com/link/to/<이름>,<lat>,<lng>
NAVER   앱  nmap://route/public?slat=…&dlat=…&appname=com.kstreet.app
        웹  https://map.naver.com/p/directions/…/-/transit
GOOGLE  웹  https://www.google.com/maps/dir/?api=1&origin=…&destination=…
```

**버튼이 실제로 그려지는 화면들:**

| 파일 | 어디 |
|---|---|
| **`src/components/MapDirections.tsx`** | 기본 길찾기 버튼 줄 (가장 많이 쓰임) |
| **`src/components/SeoulMap.tsx`** | 지도 위 말풍선 — 같은 버튼을 **HTML 글자로** 만든다 |
| `src/components/DistrictExplorer.tsx` | 구 둘러보기 |
| `src/components/MonthlyFestivalPanel.tsx` | 달별 축제 |
| `src/components/SavedPanel.tsx` | 저장한 곳 |
| `src/components/LuggageCard.tsx` · `DriverCard.tsx` | 짐 보관 · 기사 안내 |

🚨 **`MapDirections.tsx` 를 고치면 `SeoulMap.tsx` 도 같이 고쳐야 합니다.**
지도 말풍선은 React 가 아니라 **문자열로 된 HTML** 이라 자동으로 따라오지 않습니다.

---

## Kfood 로 넘어가는 링크

손님이 구경을 하다 배가 고프면 밥집을 줘야 하는데, 이 앱에는 밥집 자료가 없습니다.
그래서 같은 제작자의 **Kfood**(`kfood-t493.onrender.com`)로 넘깁니다.

**주소를 만드는 곳은 파일 하나뿐입니다 — `src/lib/partnerLinks.ts`.**

| 것 | 하는 일 |
|---|---|
| `BASE` | 저쪽 주소의 뿌리. **주소가 바뀌면 여기 한 줄만 고칩니다.** |
| `PARTNER_READY` | 껐다 켜는 스위치. `false` 로 두면 **모든 화면에서 링크가 한꺼번에 사라집니다** |
| `partnerSlug(gu)` | `종로구` → `jongno-gu` |
| `partnerLang(lang)` | 언어 코드 맞추기 — 우리는 `zh-TW`, 저쪽은 `zhTW` |
| `eatNearbyUrl(gu, lang)` | 구 단위 주소 → `…/seoul/jongno-gu?hl=en` |
| `eatUrlForPlace(...)` | 곳에 맞는 주소 (동네까지 아는 곳은 홍대·이태원 같은 **동네 페이지**로) |

**화면에 그리는 곳:** `src/components/MapDirections.tsx` (길찾기 버튼 옆).
주소를 아는 곳이 아니면 **`null` 을 돌려주고 링크를 아예 안 그립니다** — 없는 주소를
지어내지 않습니다.

---

## 비밀값

**이 저장소에는 열쇠 값이 한 글자도 들어 있지 않습니다.**
전부 GitHub 저장소의 **Secrets**(Settings → Secrets and variables → Actions)에만 있고,
GitHub Actions 안에서만 쓰입니다. 손님 브라우저로는 나가지 않습니다.

쓰이는 **이름**만 적습니다 (값은 여기에도, 코드에도 적지 않습니다):

```
TOUR_API_KEY                 한국관광공사
KAKAO_REST_API_KEY           카카오 (좌표·지하철역)
NAVER_GEOCODE_CLIENT_ID      네이버 (좌표)
NAVER_GEOCODE_CLIENT_SECRET  네이버 (좌표)
GOOGLE_TRANSLATE_API_KEY     구글 번역
YOUTUBE_API_KEY              유튜브
SEOUL_OPEN_API_KEY           서울 열린데이터광장
KCTI_API_KEY                 한국문화관광연구원
GITHUB_TOKEN                 깃허브가 자동으로 넣어 주는 것 (따로 만들 필요 없음)
```

🚨 열쇠를 **대화창이나 코드에 붙여 넣지 않습니다.** 넣을 곳은 Secrets 화면뿐입니다.

---

## 처음 온 사람이 읽을 순서

1. **이 문서** — 전체 그림
2. `CLAUDE.md` — 지켜야 할 규칙 (정확도 기준, 하면 안 되는 것)
3. `docs/` — 주제별 자세한 기록 47개
4. `src/data/seed.ts` — 자료형과 장소 목록
5. `src/App.tsx` — 화면이 어떻게 묶이는지

로컬에서 띄워 보기:

```
npm ci
npm run dev
```
