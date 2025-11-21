"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  if (isAuthenticated) {
    router.push(isAdmin ? "/my-cards" : "/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(loginData);
      toast({
        title: "✅ Đăng nhập thành công!",
        description: "Chào mừng bạn quay trở lại.",
        className: "border-green-500 bg-green-50 text-green-900",
      });
      // Điều hướng dựa trên role: admin -> my-cards, user -> dashboard
      router.push(isAdmin ? "/my-cards" : "/dashboard");
    } catch (error) {
      toast({
        title: "❌ Đăng nhập thất bại",
        description: error instanceof Error ? error.message : "Vui lòng kiểm tra lại thông tin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mt-4">VNSKY Cards</CardTitle>
          <CardDescription>Quản lý card visit của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">Tên đăng nhập</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Mật khẩu</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
