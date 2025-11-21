"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { CreditCard, Users, FileText, Mail } from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Chào mừng, {user?.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Hệ thống quản lý card visit VNSKY</p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Xem Card Visit</CardTitle>
                <CreditCard className="ml-auto h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Xem và chia sẻ các card visit đã được tạo</CardDescription>
                <Button variant="outline" className="w-full mt-3" disabled>
                  Chức năng đang phát triển
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Liên hệ Admin</CardTitle>
                <Mail className="ml-auto h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Liên hệ với quản trị viên để được hỗ trợ</CardDescription>
                <Button variant="outline" className="w-full mt-3" disabled>
                  Liên hệ
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Thông tin tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tên đăng nhập:</span>
                <span className="font-medium">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quyền hạn:</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  💡 <strong>Lưu ý:</strong> Hiện tại chỉ tài khoản Admin mới có quyền tạo và quản lý card visit. Vui
                  lòng liên hệ quản trị viên để được hỗ trợ.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
