# <img src="./docs/logo.png" width="48" alt="Onde Logo" style="vertical-align: middle; margin-right: 8px;" /> Onde Frontend

Onde 웹 서비스의 프론트엔드 애플리케이션 저장소입니다.

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Zustand-orange?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

<!-- 👥 Onde 캐릭터 여정 시작 웰컴 배너 -->
<p align="center">
  <img src="./docs/welcome.png" width="55%" alt="Onde Welcome Character" style="border-radius: 16px;" />
</p>

---

## 🛠️ Tech Stack & Environment

* **Core**: React v18, TypeScript, Vite
* **State Management**: Zustand
* **Styling**: Tailwind CSS v4, Vanilla CSS
* **Routing**: React Router DOM v6
* **Map API**: Leaflet

---

## ⚙️ Core Implementations

* **Cookie-based Auth Recovery**: React 렌더링(Mount) 전, 쿠키에서 로그인 정보(Member ID, Role, Username)를 동적으로 파싱하여 Zustand 전역 상태에 즉시 주입(Flicker 방지).
* **Mutex-based JWT Refresh Queue**: HTTP 401 Unauthorized 에러 시, 다중 API 요청이 동시에 발생하더라도 `isRefreshing` 락(Lock) 및 대기열 큐(`refreshWaiters`)를 활용해 JWT 재갱신 API를 단 1회만 중복 없이 호출.
* **Portal-based Layout Guard**: 모달, 토스트, 컨펌 오버레이가 CSS `overflow: hidden`이나 부모 컨테이너 `z-index` 계층 구조의 왜곡 없이 최상단에 마운트되도록 `AppOverlays` 단일 포털(Portal) 적용.
* **Role-based Routing Guard**: `RequireAuth` 및 `RequireRole` 라우팅 가드를 통해 비인증 유저(401)와 권한 등급 미달 유저(403, e.g., 일반 회원이 어드민/셀러 페이지 침범 시)를 탐지하고 강제 격하 이송 처리.
* **Map Bounds Tracker**: Leaflet 지도 상의 마커 데이터 매핑 및 Bounds 트리거를 이용한 위경도 위치 자동 스케일 플라이투(flyTo) 필터링 렌더러 처리.

---

## 📂 Directory Structure

```text
Onde_Frontend/
├── src/
│   ├── api/          # Axios Instance 및 인터셉터, 도메인별 API 연동부
│   ├── assets/       # 로컬 정적 파일 (Font, Image)
│   ├── components/
│   │   ├── auth/     # 로그인 및 회원가입 모달 UI 폼
│   │   ├── layout/   # MainLayout(대고객), BackOfficeLayout(어드민/파트너)
│   │   ├── routing/  # RequireAuth, RequireRole 가드 및 포털 셸
│   │   └── ui/       # Toast, Confirm 등 공통 플로팅 컴포넌트
│   ├── constants/    # 공통 상수, API 설정, 정적 데이터
│   ├── hooks/        # UI로부터 격리된 비즈니스 로직 훅 (useAuthForm 등)
│   ├── pages/        # Stay, Flight, Car, Map, MyPage 등 라우팅 엔트리
│   ├── store/        # Zustand 전역 스토어 (useTravelStore 등)
│   └── utils/        # 쿠키 제어, 달력 일자 맵핑 등 유틸리티 헬퍼
├── .env.development  # 로컬 개발용 API 엔드포인트 환경 변수
└── vite.config.ts    # React HMR 및 Tailwind v4 컴파일 설정 파일
```

---

## 🚀 Getting Started

### 1. Environment Variables (`.env.development`)
루트 디렉터리에 `.env.development` 파일을 작성합니다.

```ini
VITE_USER_API_BASE=http://localhost:8080
VITE_ADMIN_API_BASE=http://localhost:8081
```

### 2. Install & Run
```bash
# 의존성 패키지 설치
$ npm install

# 로컬 개발 서버 구동
$ npm run dev
```
