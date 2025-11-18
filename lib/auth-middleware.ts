import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth-utils";
import { AuthToken } from "@/lib/auth-types";

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthToken) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: "Đăng nhập để tạo card" }, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Tài khoản không hợp lệ hãy đăng xuất và đăng nhập lại" }, { status: 401 });
    }

    return handler(request, user);
  } catch (error) {
    return NextResponse.json({ error: "Xác thực thất bại" }, { status: 401 });
  }
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthToken) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req, user) => {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Yêu cầu quyền admin" }, { status: 403 });
    }
    return handler(req, user);
  });
}
