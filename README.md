# 🎥 시험용 화면 녹화 MVP

시험 감독을 위한 화면 녹화 시스템 (MVP 버전)

## 📋 프로젝트 개요

이 프로젝트는 시험 중 화면을 녹화하여 감독관이 시험 과정을 확인할 수 있도록 하는 MVP 시스템입니다.

### 주요 기능

- ✅ 전체 화면 녹화 (getDisplayMedia)
- ✅ 비밀번호 기반 시작
- ✅ 실시간 녹화 상태 표시
- ✅ 로컬 파일 저장 (webm 형식)
- ✅ 전체 화면 강제 확인
- ✅ 화면 공유 중단 감지

## 🛠️ 기술 스택

- **Framework**: Next.js 16.x (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **APIs**: 
  - getDisplayMedia API
  - MediaRecorder API
  - Blob API

## 📁 프로젝트 구조

```
screen-record/
├── app/                    # Next.js App Router 페이지
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # [S01] 대기 화면
│   ├── recording/          # [S03] 시험 진행 화면
│   └── complete/           # [S04] 시험 종료 화면
├── components/             # React 컴포넌트
│   ├── ui/                 # UI 컴포넌트
│   └── layout/             # 레이아웃 컴포넌트
├── hooks/                  # 커스텀 훅
├── contexts/               # Context API
├── utils/                  # 유틸리티 함수
├── types/                  # TypeScript 타입 정의
└── docs/                   # 문서
```

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

## 📝 개발 계획

자세한 개발 계획은 [docs/plan/2026-02-11-nextjs-개발계획.md](./docs/plan/2026-02-11-nextjs-개발계획.md)를 참고하세요.

## ⚙️ 환경 변수 (선택)

`.env.example`을 참고해 `.env.local`을 만들 수 있습니다.

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_GOOGLE_FORM_URL` | 답안지용 구글 폼 URL. 설정 시 녹화 페이지에 "답안지(구글 폼) 열기" 버튼이 표시됩니다. |
| `NEXT_PUBLIC_RECORDING_VIDEO_BITRATE` | 녹화 비트레이트(bps). 예: `1250000` = 1.25Mbps (용량 절감). 미설정 시 2.5Mbps. |

## ⚠️ 주의사항

- **HTTPS 필수**: getDisplayMedia는 HTTPS 환경에서만 동작합니다.
- **브라우저 호환성**: Chrome, Edge 권장. (Safari는 미지원 — Chrome 사용 안내 권장)
- **로컬 저장**: MVP 버전은 로컬 저장만 지원합니다 (서버 업로드 제외).

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.
