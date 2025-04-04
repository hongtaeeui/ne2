"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useLogin } from "@/lib/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [error, setError] = useState("");

  console.log("error", error);
  const login = useLogin();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login.mutateAsync({ email, password });
      router.push("/");
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // 백엔드에서 전달된 오류 데이터 확인
      if (err.message && err.message.includes("500")) {
        // 500 서버 오류 처리
        setError("서버 연결에 문제가 있습니다. 관리자에게 문의해 주세요.");
      } else if (err.response?.data) {
        // 백엔드에서 보낸 메시지가 있으면 사용
        setError(err.response.data.message || "로그인에 실패했습니다");
      } else if (err.message && err.message.includes("401")) {
        // 401 오류 (인증 실패) 처리
        setError("아이디 또는 비밀번호를 확인해주세요(대소문자 확인필)");
      } else if (err instanceof Error) {
        // 일반 오류 처리
        setError(err.message);
      } else {
        // 기타 오류
        setError("로그인에 실패했습니다, 관리자에게 문의해 주세요.");
      }
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-6 items-center justify-center min-h-screen",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center justify-center space-y-4">
          <Image
            src="/logos/logo-black-square.png"
            alt="Logo"
            width={240} // 원하는 너비
            height={200} // 원하는 높이
            className="-my-10" // 추가적인 스타일
          />
          <CardTitle className="text-center ">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nvision@neuronaware.com"
                  required
                  disabled={login.isPending}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>관리자에게 문의해주세요.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="*********"
                  disabled={login.isPending}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={login.isPending}
                >
                  {login.isPending ? "로그인 중..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
