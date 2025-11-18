import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getTokenFromRequest, verifyToken } from "@/lib/auth-utils";
import { UserPublic } from "@/lib/auth-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: "Tài khoản không hợp lệ" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token không hợp lệ" }, { status: 401 });
    }

    const userDoc = await adminDb.collection("users").doc(payload.userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
    }

    const userData = userDoc.data();

    const user: UserPublic = {
      id: userDoc.id,
      username: userData!.username,
      role: userData!.role,
      createdAt: userData!.createdAt,
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Lấy thông tin người dùng thất bại" }, { status: 500 });
  }
}
