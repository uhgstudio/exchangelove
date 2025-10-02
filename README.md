# 환승연애4 X예측

환승연애4 출연자들의 X를 예측하고, 방송 결과와 비교하며 순위를 경쟁하는 웹 서비스입니다.

## 🎯 주요 기능

- **회차별 예측**: 드래그 앤 드롭으로 간편한 커플 매칭
- **실시간 랭킹**: 정확한 예측으로 점수 획득 및 순위 경쟁
- **결과 확인**: 방송 종료 후 즉시 결과 확인 및 통계 제공
- **사용자 관리**: 개인 예측 이력 및 성과 추적
- **관리자 패널**: 회차 관리, 출연자 관리, 결과 입력

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Drag & Drop**: @dnd-kit
- **Charts**: Chart.js, react-chartjs-2
- **Icons**: Lucide React

## 📋 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # 인증 관련 페이지
│   ├── episodes/          # 회차별 예측 페이지
│   ├── rankings/          # 랭킹 페이지
│   ├── my-predictions/    # 내 예측 페이지
│   └── admin/             # 관리자 페이지
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/          # Supabase 클라이언트
│   ├── auth.ts            # 인증 함수
│   └── utils.ts           # 공통 유틸리티
├── types/                 # TypeScript 타입 정의
└── components/            # 재사용 가능한 컴포넌트
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 설정을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. 데이터베이스 설정

Supabase 프로젝트에서 `supabase/schema.sql` 파일의 SQL을 실행하여 데이터베이스 스키마를 생성하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 📊 데이터베이스 스키마

주요 테이블:
- `users`: 사용자 정보
- `seasons`: 시즌 정보
- `participants`: 출연자 정보
- `episodes`: 회차 정보
- `couple_pairs`: 커플 조합 (공식 결과 포함)
- `user_predictions`: 사용자 예측
- `user_scores`: 사용자 점수
- `agg_episodes`: 회차별 집계

## 🎮 사용법

1. **회원가입/로그인**: 이메일과 비밀번호로 계정 생성
2. **예측하기**: 회차별로 출연자들을 드래그해서 매칭
3. **결과 확인**: 방송 종료 후 결과와 정답률 확인
4. **랭킹 경쟁**: 다른 사용자들과 점수 및 순위 경쟁

## 🔧 관리자 기능

- 회차 오픈/마감 관리
- 출연자 정보 관리
- 방송 결과 입력
- 통계 및 분석

## 📝 라이선스

본 서비스는 프로그램 공식 서비스가 아니며, 팬 참여 목적의 비상업적 웹 서비스입니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
