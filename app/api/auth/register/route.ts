import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { hashPassword } from "@/lib/auth-utils";
import { RegisterRequest, User } from "@/lib/auth-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { username, password, role = "user" } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Tên đăng nhập và mật khẩu là bắt buộc" }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "Tên đăng nhập phải có ít nhất 3 ký tự" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
    }

    const usersRef = adminDb.collection("users");
    const existingUser = await usersRef.where("username", "==", username).limit(1).get();

    if (!existingUser.empty) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const userData: Omit<User, "id"> = {
      username,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await usersRef.add(userData);

    return NextResponse.json(
      {
        message: "Đăng ký thành công",
        user: {
          id: docRef.id,
          username: userData.username,
          role: userData.role,
          createdAt: userData.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Đăng ký thất bại" }, { status: 500 });
  }
}
