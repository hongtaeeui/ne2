import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useRouter } from "next/navigation";
// User 타입 정의 (더 명확하게 설정)
interface User {
  id: number;
  email: string;
  name: string;
  tel: string;
  isAdmin: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
}

// AuthState 타입 정의
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Zustand store 생성 - persist 미들웨어 사용
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        console.log("로그아웃 호출");
        set({ token: null, isAuthenticated: false, user: null });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },
    }),
    {
      name: "auth-storage", // 스토리지 키 이름
      storage: createJSONStorage(() => {
        // SSR 대응을 위한 조건부 스토리지
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

export default useAuthStore;
