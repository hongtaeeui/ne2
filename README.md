# Next.js 웹 애플리케이션

## 프로젝트 개요

이 프로젝트는 Next.js 15와 React 19를 기반으로 하는 웹 애플리케이션입니다. 사용자 인증 기능이 구현되어 있으며, 현대적인 UI 컴포넌트 라이브러리를 사용하고 있습니다.

## 기술 스택

- Next.js 15.2.4 (Turbopack 사용)
- React 19.0.0
- TypeScript
- Tailwind CSS 4
- Radix UI 컴포넌트
- Axios (HTTP 클라이언트)
- Zustand (상태 관리)
- React Query (데이터 페칭)
- shadcn/ui (UI 컴포넌트 라이브러리)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 프로젝트 구조

### 인증 시스템

- `app/(auth)/login/page.tsx`: 로그인 페이지
- `components/login-form.tsx`: 로그인 폼 컴포넌트
- `app/api/auth/route.ts`: 인증 API 엔드포인트

### UI 컴포넌트

- `components/ui/`: 재사용 가능한 UI 컴포넌트 모음
  - button, card, input, label 등 기본 컴포넌트
  - sidebar, avatar, drawer 등 복합 컴포넌트

### 네비게이션

- `components/app-sidebar.tsx`: 애플리케이션 사이드바
- `components/nav-user.tsx`: 사용자 네비게이션 메뉴
- `components/nav-main.tsx`: 메인 네비게이션
- `components/nav-documents.tsx`: 문서 네비게이션
- `components/nav-secondary.tsx`: 보조 네비게이션

## 주요 기능

### 인증 시스템

사용자는 이메일과 비밀번호를 사용하여 로그인할 수 있습니다. 인증 과정:

1. 클라이언트에서 이메일/비밀번호 입력
2. Next.js API 라우트로 요청 전송
3. 백엔드 서버(localhost:3005)에 인증 요청 전달
4. JWT 토큰을 쿠키에 저장하여 인증 상태 유지

### 백엔드 연동

- API 엔드포인트: `http://localhost:3005/v1/auth/login`
- Axios를 통한 API 통신
- 에러 핸들링 및 상태 관리

### UI/UX

- 반응형 디자인 (모바일, 데스크톱 지원)
- 다크 모드 지원 (next-themes)
- 접근성 고려한 UI 컴포넌트

## 개발 가이드

### 클라이언트 컴포넌트

모든 인터랙티브한 컴포넌트는 "use client" 지시자로 시작하여 클라이언트 컴포넌트로 정의됩니다. 이를 통해 React Hooks와 브라우저 API 사용이 가능합니다.

```tsx
"use client";

import { useState } from "react";

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 서버 컴포넌트

데이터 페칭이나 백엔드 로직에 관련된 부분은 서버 컴포넌트로 구현되어 있습니다.

```tsx
// server component (기본값)
import { getData } from "@/lib/data";

export default async function ServerComponent() {
  const data = await getData();
  return <div>{data.title}</div>;
}
```

### API 라우트

Next.js API 라우트를 통해 백엔드 서버와의 통신을 프록시하며, 클라이언트 보안을 유지합니다.

```tsx
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 처리 로직
  return NextResponse.json({ data: "example" });
}
```

## 백엔드 요구사항

- 로컬 개발 환경에서 백엔드 서버가 `http://localhost:3005`에서 실행 중이어야 함
- 백엔드 API는 `/v1/auth/login` 엔드포인트를 제공해야 함
- JWT 기반 인증 시스템 필요

npx create-next-app@latest
npx shadcn@latest add dashboard-01
npm install next-themes
https://ui.shadcn.com/docs/dark-mode/next

폴더 구조
