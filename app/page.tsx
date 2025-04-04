"use client"; // ✅ 클라이언트 컴포넌트로 선언

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../lib/authStore";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 토큰을 확인하여 인증 상태 초기화
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem("auth_token");
        if (storedToken && !token) {
          useAuthStore.getState().setToken(storedToken);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("로컬 스토리지 접근 오류:", error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // replace는 현재 페이지를 대체하여 브라우저 히스토리에 남지 않게 함
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, router, isLoading]);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null; // ✅ 리다이렉트 중이기 때문에 아무것도 렌더링하지 않음
}
