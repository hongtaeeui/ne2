"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconChevronLeft,
  IconChevronRight,
  IconClipboardCheck,
  IconGauge,
  IconLogout,
  IconMenu2,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/lib/hooks/useAuth";
import useAuthStore from "@/lib/store/authStore";
// 사이드바 네비게이션 아이템 정의
const navItems = [
  // {
  //   title: "Dashboard",
  //   href: "/dashboard",
  //   icon: <IconGauge className="size-4" />,
  // },
  {
    title: "Inspection",
    href: "/inspection",
    icon: <IconClipboardCheck className="size-4" />,
  },
  // {
  //   title: "Analytics",
  //   href: "/analytics",
  //   icon: <IconChartBar className="size-4" />,
  // },
  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: <IconSettings className="size-4" />,
  // },
];

// 모바일 네비게이션 컴포넌트
function MobileNav({
  pathname,
  setIsMobileSidebarOpen,
  handleLogout,
}: {
  pathname: string;
  setIsMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => void;
}) {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="px-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <IconGauge className="size-5" />
          <span>NeuronAware</span>
        </Link>
      </div>
      <nav className="grid gap-1 px-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
            className="justify-start"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <Link href={item.href}>
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto border-t px-2 pt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
            <IconUser className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-500"
          onClick={handleLogout}
        >
          <IconLogout className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mainMargin, setMainMargin] = useState("0");

  const { user } = useAuthStore();

  // useLogout 훅 사용
  const logout = useLogout();

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMainMargin(isSidebarCollapsed ? "4rem" : "16rem");
      } else {
        setMainMargin("0");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarCollapsed]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* 모바일 헤더 */}
      <header className="bg-background fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-4 border-b px-4 md:hidden">
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <IconMenu2 className="size-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pr-0">
            <MobileNav
              pathname={pathname}
              setIsMobileSidebarOpen={setIsMobileSidebarOpen}
              handleLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <Link href="/inspection" className="text-xl font-bold">
            NeuronAware
          </Link>
        </div>
        <Button variant="ghost" size="icon">
          <IconSearch className="size-5" />
          <span className="sr-only">Search</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconUser className="size-5" />
              <span className="sr-only">User Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">프로필</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/">설정</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <IconLogout className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex flex-1 md:flex-row md:pt-0 pt-14">
        {/* 데스크톱 사이드바 */}
        <aside
          className={`border-r bg-background hidden md:block fixed left-0 top-0 h-screen transition-all duration-300 ${
            isSidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="flex h-14 items-center border-b px-4 justify-between">
            {!isSidebarCollapsed && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 font-semibold"
              >
                <IconGauge className="size-5" />
                <span>NeuronAware</span>
              </Link>
            )}
            {isSidebarCollapsed && (
              <div className="w-full flex justify-center">
                <IconGauge className="size-5" />
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? (
                <IconChevronRight className="size-4" />
              ) : (
                <IconChevronLeft className="size-4" />
              )}
              <span className="sr-only">
                {isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </span>
            </Button>
          </div>
          <nav className="flex-1 overflow-auto py-4 h-[calc(100vh-8rem)]">
            <div className="flex flex-col gap-1 px-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={
                    pathname.startsWith(item.href) ? "secondary" : "ghost"
                  }
                  className={`justify-start ${
                    isSidebarCollapsed ? "px-2" : ""
                  }`}
                >
                  <Link href={item.href}>
                    {item.icon}
                    {!isSidebarCollapsed && (
                      <span className="ml-2">{item.title}</span>
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          </nav>
          <div className="border-t p-4">
            <div
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "gap-2"
              }`}
            >
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
                <IconUser className="size-4" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main
          className="flex-1 flex flex-col"
          style={{ marginLeft: mainMargin }}
        >
          {/* 데스크톱 헤더 */}
          <header
            className="bg-background fixed top-0 right-0 z-30 hidden h-14 items-center gap-4 border-b px-6 md:flex"
            style={{ left: mainMargin }}
          >
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {navItems.find((item) => pathname.startsWith(item.href))
                  ?.title || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* <div className="relative">
                <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 bg-background pl-8"
                />
              </div>
              <Button variant="ghost" size="icon">
                <IconSettings className="size-5" />
                <span className="sr-only">Settings</span>
              </Button> */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <IconUser className="size-5" />
                    <span className="sr-only">User Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">프로필</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">설정</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500"
                  >
                    <IconLogout className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* 페이지 콘텐츠 */}
          <div className="flex-1 overflow-auto p-0 md:pt-14">{children}</div>
        </main>
      </div>
    </div>
  );
}
