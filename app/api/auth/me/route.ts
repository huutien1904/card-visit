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
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userDoc = await adminDb.collection("users").doc(payload.userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    console.error("Error getting current user:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
