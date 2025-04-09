import { NextRequest, NextResponse } from "next/server";

// 인증이 필요한 경로
const protectedPaths = ["/dashboard", "/profile"];
// 인증된 사용자가 접근하면 리다이렉트할 경로 (로그인 상태에서 로그인 페이지 접근 등)
const authRedirectPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const isAuthenticated = !!token;

  // 프라이빗 경로에 접근하려는 경우 (인증 필요)
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 인증된 사용자가 로그인/회원가입 페이지에 접근하려는 경우
  if (authRedirectPaths.some((path) => pathname.startsWith(path))) {
    // 이미 인증된 경우 대시보드로 리다이렉트
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/inspection", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // 미들웨어가 적용될 경로 패턴
  matcher: [
    /*
     * 미들웨어가 실행되어야 하는 경로 패턴 목록
     * '/((?!api|_next/static|_next/image|favicon.ico).*)' - 모든 경로에서 실행되지만 다음 경로는 제외:
     * - /api (API 경로)
     * - /_next/static (정적 파일)
     * - /_next/image (최적화된 이미지)
     * - /favicon.ico (파비콘)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
