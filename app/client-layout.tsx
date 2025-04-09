"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider } from "../components/providers/theme-provider";
import { ActiveThemeProvider } from "../components/active-theme";
import { Providers } from "../components/providers";
import useIpStore from "@/lib/store/ipStore";

// IP 주소 가져오는 함수
const getIpAddress = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("IP 주소를 가져오는 중 오류 발생:", error);
    return "0.0.0.0";
  }
};

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [activeTheme, setActiveTheme] = useState<string>("");
  const setIp = useIpStore((state) => state.setIp);

  useEffect(() => {
    // 클라이언트 측에서 쿠키를 읽음
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return "";
    };

    const cookieTheme = getCookie("active_theme") || "";
    setActiveTheme(cookieTheme);

    // IP 주소 가져오기
    getIpAddress().then((ip) => {
      console.log("현재 IP 주소:", ip);
      setIp(ip);
    });
  }, [setIp]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <ActiveThemeProvider initialTheme={activeTheme}>
        <Providers>{children}</Providers>
      </ActiveThemeProvider>
    </ThemeProvider>
  );
}
