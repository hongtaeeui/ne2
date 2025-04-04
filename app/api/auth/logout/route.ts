import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 응답 생성
    const response = NextResponse.json({ success: true });

    // 쿠키에서 토큰 제거
    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // 쿠키 즉시 만료
    });

    return response;
  } catch (error) {
    console.error("로그아웃 처리 중 오류:", error);
    return NextResponse.json(
      { error: "로그아웃 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
