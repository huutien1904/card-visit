"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { login, register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  if (isAuthenticated) {
    router.push("/my-cards");
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
      router.push("/my-cards");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "❌ Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "❌ Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        username: registerData.username,
        password: registerData.password,
      });
      toast({
        title: "✅ Đăng ký thành công!",
        description: "Tài khoản của bạn đã được tạo.",
        className: "border-green-500 bg-green-50 text-green-900",
      });
      router.push("/my-cards");
    } catch (error) {
      toast({
        title: "❌ Đăng ký thất bại",
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">VNSKY Cards</CardTitle>
          <CardDescription>Quản lý card visit của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
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
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Tên đăng nhập</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Nhập tên đăng nhập (ít nhất 3 ký tự)"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    disabled={loading}
                    minLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mật khẩu</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Xác nhận mật khẩu</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
