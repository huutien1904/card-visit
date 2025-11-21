import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { createSlug, generateUniqueSlug } from "@/lib/slug-utils";
import { withAuth } from "@/lib/auth-middleware";
import { getTokenFromRequest, verifyToken } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    const cardsRef = adminDb.collection("cards");
    let snapshot;

    if (token) {
      const user = await verifyToken(token);

      if (user && user.role === "user") {
        snapshot = await cardsRef.where("userId", "==", user.userId).get();
      } else if (user && user.role === "admin") {
        snapshot = await cardsRef.get();
      } else {
        return NextResponse.json({ cards: [] }, { status: 200 });
      }
    } else {
      return NextResponse.json({ cards: [] }, { status: 200 });
    }

    const cards = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

    return NextResponse.json({ cards }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("index")) {
      return NextResponse.json(
        {
          error: "Cần có chỉ mục cơ sở dữ liệu. Vui lòng tạo chỉ mục tổng hợp cho các trường userId và createdAt.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Lấy thẻ thất bại" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Chỉ admin mới có quyền tạo card visit" }, { status: 403 });
    }

    try {
      const body = await req.json();
      const requiredFields = ["name", "title", "phone1", "email1", "address", "avatar", "imageCover"];
      for (const field of requiredFields) {
        if (!body[field]) {
          return NextResponse.json({ error: `Thiếu trường bắt buộc: ${field}` }, { status: 400 });
        }
      }

      if (body.company !== undefined && body.company.toString().trim() === "") {
        return NextResponse.json({ error: "Trường công ty không được để trống nếu được cung cấp" }, { status: 400 });
      }

      const baseSlug = createSlug(body.name);

      const cardsRef = adminDb.collection("cards");
      const existingCards = await cardsRef.select("slug").get();
      const existingSlugs = existingCards.docs.map((doc) => doc.data().slug).filter(Boolean);

      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

      const cardData = {
        ...body,
        userId: user.userId,
        slug: uniqueSlug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await adminDb.collection("cards").add(cardData);

      return NextResponse.json(
        {
          message: "Tạo thẻ thành công",
          id: docRef.id,
          card: { id: docRef.id, ...cardData },
        },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json({ error: "Tạo thẻ thất bại" }, { status: 500 });
    }
  });
}
