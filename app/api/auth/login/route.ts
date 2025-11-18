import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { comparePassword, createToken } from "@/lib/auth-utils";
import { LoginRequest, User, AuthResponse } from "@/lib/auth-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Tên đăng nhập và mật khẩu là bắt buộc" }, { status: 400 });
    }

    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("username", "==", username).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không hợp lệ" }, { status: 401 });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data() as Omit<User, "id">;

    const isValidPassword = await comparePassword(password, userData.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không hợp lệ" }, { status: 401 });
    }

    const token = await createToken({
      userId: userDoc.id,
      username: userData.username,
      role: userData.role,
    });

    const response: AuthResponse = {
      user: {
        id: userDoc.id,
        username: userData.username,
        role: userData.role,
        createdAt: userData.createdAt,
      },
      token,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Đăng nhập thất bại" }, { status: 500 });
  }
}
