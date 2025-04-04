"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider } from "../components/providers/theme-provider";
import { ActiveThemeProvider } from "../components/active-theme";
import { Providers } from "../components/providers";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [activeTheme, setActiveTheme] = useState<string>("");

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
  }, []);

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
