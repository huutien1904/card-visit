"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, List, Menu, X, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.getElementById("mobile-nav");
      if (nav && !nav.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const navItems = [
    {
      href: "/",
      label: "Trang chủ",
      icon: Home,
      description: "Tạo card visit mới",
    },
    {
      href: "/my-cards",
      label: "Danh sách Card",
      icon: List,
      description: "Xem tất cả card visits",
    },
  ];

  return (
    <nav
      id="mobile-nav"
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span className="text-gray-900 dark:text-white">VNSKY Cards</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn("flex items-center gap-2", isActive && "bg-blue-600 hover:bg-blue-700")}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.username}</span>
                  {user?.role === "admin" && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Admin</span>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="ml-4">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "md:hidden border-t border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start flex items-center gap-3 py-3 h-auto",
                      isActive && "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs opacity-70 font-normal">{item.description}</span>
                    </div>
                  </Button>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      <span>{user?.username}</span>
                      {user?.role === "admin" && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Admin</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
