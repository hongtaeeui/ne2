import { useMutation } from "@tanstack/react-query";
import axiosClient from "../axiosClient";
import useAuthStore from "../store/authStore";

interface LoginCredentials {
  email: string;
  password: string;
}

export const useLogin = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const token = data.access_token || data.token;

      // console.log("로그인 성공:", JSON.stringify(data.user)); // ✅ Log the respons

      if (token && data.user) {
        try {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user", JSON.stringify(data.user)); // ✅ 사용자 정보도 저장
        } catch (error) {
          console.error("로컬 스토리지 저장 오류:", error);
        }

        setToken(token);
        setUser(data.user);
      }
    },
  });
};

// 로그아웃 훅
export const useLogout = () => {
  // console.log("로그아웃 훅 호출");
  const logout = useAuthStore((state) => state.logout);

  return async () => {
    try {
      // 서버 쿠키 제거를 위한 API 호출
      await axiosClient.post("/auth/logout");

      // 로컬 스토리지에서 토큰 제거
      try {
        localStorage.removeItem("auth_token");
      } catch (error) {
        console.error("로컬 스토리지 삭제 오류:", error);
      }

      // Zustand 상태 초기화
      logout();
    } catch (error) {
      console.error("로그아웃 오류:", error);
      // 에러가 발생해도 클라이언트 상태는 로그아웃 처리
      try {
        localStorage.removeItem("auth_token");
      } catch (storageError) {
        console.error("로컬 스토리지 삭제 오류:", storageError);
      }
      logout();
    }
  };
};
