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
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    return handler(request, user);
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthToken) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req, user) => {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    return handler(req, user);
  });
}
