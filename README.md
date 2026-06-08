# <img src="./docs/logo.png" width="48" alt="Onde Logo" style="vertical-align: middle; margin-right: 8px;" /> Onde Frontend

Onde 웹 서비스의 최적화된 웹 애플리케이션 프론트엔드 저장소입니다.  
본 프로젝트는 **고객용 포탈 서비스**와 **비즈니스용 백오피스(판매자/어드민)** 서비스를 통합 제공하며, 실제 운영 환경(AWS 등)에서의 무중단 서빙 및 보안 아키텍처(Nginx 리버스 프록시)를 지원합니다.

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Zustand-orange?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
</p>

<!-- 👥 Onde 캐릭터 여정 시작 웰컴 배너 -->
<p align="center">
  <img src="./docs/welcome.png" width="55%" alt="Onde Welcome Character" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
</p>

---

## 🛠️ 주요 기능 (Key Features)

### 1. 고객 대면 서비스 (Portal Services)
* **숙소(Stay) & 렌터카(Car) 예약**: 상세 필터링을 거쳐 마음에 드는 숙소와 차량을 손쉽게 탐색하고 실시간 예약할 수 있습니다.
* **항공(Flight) 조회**: 일정별 노선 조회 및 예약 인터페이스를 제공합니다.
* **포토 다이어리 & 피드(Feed)**: 여행 리뷰, 감상평 및 사진을 업로드하고 관리할 수 있는 소셜 피드 기능입니다.
* **결제 연동(Payment)**: ONDE 지갑(가상 계좌) 잔액으로 차감 처리되는 안전한 결제 시스템을 갖추고 있으며, 사전 및 사후 검증 프로세스를 거쳐 예약을 완료합니다.

### 2. 비즈니스 백오피스 (Backoffice Services)
* **판매자 센터(Seller Portal)**: 파트너사가 신규 숙소(객실 정보 포함) 및 렌터카를 등록 신청할 수 있는 양식(Modal)과 승인 대기 상태(`PENDING`)를 확인하는 대시보드를 제공합니다.
* **어드민 센터(Admin Portal)**: 전체 비즈니스 지표 모니터링, 상품 승인 처리 및 회원 관리를 위한 통합 관리자 페이지입니다.

---

## 🏗️ 핵심 아키텍처 설계 (Key Architectural Highlights)

* **Cookie-based Auth Recovery**: React 렌더링(Mount) 전, 브라우저 쿠키에 저장된 JWT 로그인 정보(Member ID, Role, Username)를 파싱해 Zustand 전역 상태에 즉시 주입하여 화면 번쩍임(Flicker)을 완전히 방지합니다.
* **Mutex-based JWT Refresh Queue**: HTTP 401 Unauthorized 에러 시, 다중 API 요청이 동시에 발생하더라도 `isRefreshing` 뮤텍스 락과 대기열 큐(`refreshWaiters`)를 활용해 토큰 갱신 API를 단 1회만 호출하도록 제어합니다.
* **Portal-based Layout Guard**: 모달, 토스트, 컨펌 오버레이가 부모 요소의 `overflow: hidden`이나 `z-index` 계층 구조 왜곡에 영향받지 않도록 `AppOverlays` 단일 포털(Portal) 설계를 탑재했습니다.
* **Role-based Routing Guard**: `RequireAuth` 및 `RequireRole` 라우팅 가드를 통해 각 유저 등급(일반 회원, 판매자, 관리자)별 접근 권한을 엄격히 통제하고 권한 미달(403) 시 자동으로 차단 및 리다이렉션합니다.
* **Leaflet 지도 시각화**: Leaflet 지도 라이브러리를 사용해 마커 매핑, 좌표 기준 바운즈(Bounds) 연산 및 검색 결과 스케일에 맞춘 flyTo 화면 전환 필터링을 처리합니다.
* **Nginx 리버스 프록시(Reverse Proxy) 지원**: 실서버 및 로컬 도커 배포 환경에서 외부 포트 노출 없이 동일 출처 정책(Same-Origin Policy)을 유지할 수 있도록 API 통신을 단일 도메인 상대 경로(`/user-api`, `/admin-api`)로 추상화하고 Nginx가 백엔드 컨테이너로 안전하게 트래픽을 분산 중계합니다.

---

## 📂 디렉토리 구조 (Directory Structure)

```text
Onde_Frontend/
├── src/
│   ├── api/          # Axios Instance 및 인터셉터, 도메인별 API 연동부
│   ├── assets/       # 로컬 정적 자원 (Font, Image)
│   ├── components/   # 재사용 가능한 UI 컴포넌트
│   │   ├── auth/     # 로그인 및 회원가입 모달 UI 폼
│   │   ├── layout/   # MainLayout(고객용), BackOfficeLayout(어드민/판매자용)
│   │   ├── routing/  # RequireAuth, RequireRole 가드 및 포털 셸
│   │   └── ui/       # Toast, Confirm 등 공통 플로팅 컴포넌트
│   ├── constants/    # 공통 상수, API 경로 설정, 정적 데이터
│   ├── hooks/        # 비즈니스 로직 분리용 커스텀 훅 (useAuthForm 등)
│   ├── pages/        # Stay, Flight, Car, Map, Payment, MyPage 등 라우팅 페이지 엔트리
│   ├── store/        # Zustand 전역 스토어 (useTravelStore 등)
│   └── utils/        # 쿠키 처리, 날짜 파싱 등 유틸리티 헬퍼
├── nginx.conf        # Nginx 리버스 프록시 및 SPA 라우팅 Fallback 설정
├── Dockerfile        # Production 빌드 및 서빙을 위한 Multi-stage Dockerfile
├── .env.development  # 개발 단계용 로컬 백엔드 주소 정의
└── vite.config.ts    # React HMR, Tailwind v4 및 TS 경로 매핑 설정 파일
```

---

## 🚀 시작 가이드 (Getting Started)

### 1. 로컬 환경 수동 실행 (Local Development)

#### 1) 환경 변수 파일 정의
루트 디렉토리에 `.env.development` 파일을 작성합니다.
```ini
VITE_USER_API_BASE=http://localhost:8080
VITE_ADMIN_API_BASE=http://localhost:8081
```

#### 2) 의존성 설치 및 로컬 서버 구동
```bash
# 의존성 패키지 설치
$ npm install

# 로컬 개발 서버 구동 (Vite Dev Server)
$ npm run dev
```

---

### 2. 도커 컴포즈 실행 (Production & Docker Setup)

리버스 프록시 아키텍처가 적용된 프로덕션 서버를 빌드 및 서빙합니다.

#### 1) 빌드 및 컨테이너 구동
상위 디렉토리(루트)의 `docker-compose.yml`이 존재하는 곳에서 다음 명령을 실행합니다.
```bash
# 모든 마이크로서비스 및 Nginx 프론트엔드 빌드 후 데몬 구동
$ docker-compose up --build -d
```

#### 2) 빌드 매커니즘 (`Dockerfile` & `nginx.conf`)
* **Multi-stage Build**: `node:22-alpine`을 사용해 소스코드를 완전히 빌드하고 최적화된 정적 자산(assets)을 추출한 뒤, 최종 서빙 이미지는 아주 가벼운 `nginx:alpine`을 사용해 경량화하였습니다.
* **SPA Routing Fallback**: React Router 사용 중 페이지를 새로고침하면 Nginx가 404를 반환하지 않고 `index.html`로 트래픽을 Fallback 처리해 주도록 `try_files $uri $uri/ /index.html;` 규칙이 구현되어 있습니다.
* **Reverse Proxy Mapping**: 브라우저에서 날아오는 API 요청은 아래와 같이 Nginx 내부 프록시 모듈이 가로채 백엔드 컨테이너로 직접 배분해 줍니다:
  * `/user-api/*` ➡️ `http://api:8080/*` (유저 및 인증 서버)
  * `/admin-api/*` ➡️ `http://admin:8081/*` (어드민 서버)

---

## 🌐 운영 배포 안내 (AWS Deployment Tips)

본 프로젝트는 AWS EC2, ECS, Elastic Beanstalk 등 컨테이너 기반 환경 배포에 즉시 대응 가능하도록 설계되었습니다.

1. **포트 단일화**: 외부 로드 밸런서(ALB)나 보안 그룹 설정 시 백엔드 포트(`8080`, `8081`)는 닫고, 프론트엔드가 바인딩된 포트(`80` / `5173`) 하나만 외부에 오픈하면 정상적으로 모든 연동이 완료됩니다.
2. **CORS 우회**: 브라우저 단에서 동일 도메인 상의 주소로 비동기 요청을 보내기 때문에, 별도의 백엔드 CORS 헤더 예외 추가 작업 없이 편리하고 안전하게 통신할 수 있습니다.
