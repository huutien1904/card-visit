"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { CreditCard } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Trang chủ",
      icon: Home,
      description: "Tạo card visit mới",
    },
    {
      href: "/my-cards",
      label: "Card visits của tôi",
      icon: List,
      description: "Xem tất cả card visits",
    },
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span className="text-gray-900 dark:text-white">Digital Cards</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

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
              )
            })}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
