````markdown
# 개인형 이동장치(PM) 관제 시스템 - Frontend

이 프로젝트는 개인형 이동장치(PM)의 실시간 위치, 상태, 이용 현황을 모니터링하고 통계 데이터를 분석하기 위한 웹 대시보드 프론트엔드입니다.

## ✨ 주요 기능

* **로그인:** 시스템 접근을 위한 인증 페이지
* **대시보드:** KPI 현황, PM 상태 요약, 법규 준수율 등 핵심 지표 시각화
* **실시간 관제:** Kakao Maps API를 이용한 PM 기기의 실시간 위치 및 상태 모니터링
* **통계 분석:** KPI 트렌드, 위험 행동 유형, 지역별 분석 등 심층 데이터 리포트
* **정보 조회:** 사용자, 기기, 운행 이력, 이벤트 로그 검색 및 상세 조회
* **내 정보 관리:** 관리자 계정 정보 및 비밀번호 변경

## 🛠️ 기술 스택

* **Framework:** Vue 3 (Script Setup)
* **Build Tool:** Vite
* **Routing:** Vue Router
* **HTTP Client:** Axios
* **Charts:** Chart.js (via `vue-chartjs`)
* **Maps:** Kakao Maps API (Heatmap 포함)
* **Icons:** `oh-vue-icons`

## ⚙️ 프로젝트 설정

### 1. Kakao Maps API 키 설정

프로젝트를 실행하려면 Kakao Maps API 키가 필요합니다.
`index.html` 파일의 스크립트 URL에 있는 `appkey` 값을 본인의 키로 교체해야 합니다.

```html
<script
    type="text/javascript"
    src="//[dapi.kakao.com/v2/maps/sdk.js?appkey=](https://dapi.kakao.com/v2/maps/sdk.js?appkey=)[여기에_본인의_API_키를_입력하세요]&autoload=false&libraries=heatmap"
></script>
````

### 2\. 프로젝트 설치 및 실행

```sh
# 종속성 설치
npm install
```

```sh
# 개발 서버 실행 (HMR)
npm run dev
```

```sh
# 프로덕션 빌드
npm run build
```

```
```
