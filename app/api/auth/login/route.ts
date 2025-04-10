import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    // 백엔드 외부 API 요청보내기
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_EXTERNAL_API_URL}/auth/login`,
      body,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // 응답에서 토큰 추출
    const token = response.data.access_token || response.data.token;

    // 응답 생성
    const nextResponse = NextResponse.json(response.data);

    // 쿠키에 토큰 저장 (secure는 HTTPS에서만 작동, HTTP 개발 환경에서는 false로 설정)
    if (token) {
      // 쿠키 설정 (HTTP에서는 secure: false, HTTPS에서는 secure: true)
      nextResponse.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1주일
      });
    }

    return nextResponse;
  } catch (error: unknown) {
    console.error(
      "백엔드 연결 오류:",
      error instanceof Error ? error.message : String(error)
    );

    if (axios.isAxiosError(error)) {
      console.error("상태 코드:", error.response?.status);
      console.error("응답 데이터:", error.response?.data);

      // 401 오류일 경우 비밀번호 관련 메시지 표시
      if (error.response?.status === 401) {
        console.error("비밀번호 오류:", error.response?.data.message);
        return NextResponse.json(
          {
            error: "인증 실패",
            message: "아이디 또는 비밀번호를 확인해주세요",
            status: 401,
            data: error.response?.data,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: "백엔드 연결 실패",
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "서버 오류",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
