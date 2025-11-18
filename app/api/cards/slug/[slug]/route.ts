import { withAuth } from "@/lib/auth-middleware";
import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const cardsRef = adminDb.collection("cards");
    const snapshot = await cardsRef.where("slug", "==", slug).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Thẻ không tồn tại" }, { status: 404 });
    }

    const cardDoc = snapshot.docs[0];
    const cardData = cardDoc.data();

    return NextResponse.json({
      card: {
        id: cardDoc.id,
        ...cardData,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thẻ theo slug:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  return withAuth(request, async (req, user) => {
    try {
      const { slug } = params;
      const body = await req.json();

      if (!slug) {
        return NextResponse.json({ error: "Slug là bắt buộc" }, { status: 400 });
      }

      // Find card by slug
      const cardsRef = adminDb.collection("cards");
      const snapshot = await cardsRef.where("slug", "==", slug).limit(1).get();

      if (snapshot.empty) {
        return NextResponse.json({ error: "Thẻ không tồn tại" }, { status: 404 });
      }

      const cardDoc = snapshot.docs[0];
      const cardData = cardDoc.data();

      if (user.role !== "admin" && cardData.userId !== user.userId) {
        return NextResponse.json({ error: "Bạn không có quyền cập nhật thẻ này" }, { status: 403 });
      }

      const requiredFields = ["name", "title", "phone1", "email1", "address", "avatar", "imageCover"];
      for (const field of requiredFields) {
        if (body[field] !== undefined && (!body[field] || body[field].toString().trim() === "")) {
          return NextResponse.json({ error: `Trường ${field} không được để trống` }, { status: 400 });
        }
      }

      // Company is optional, but if provided, should not be empty
      if (body.company !== undefined && body.company.toString().trim() === "") {
        return NextResponse.json({ error: "Trường company không được để trống nếu được cung cấp" }, { status: 400 });
      }

      const updateData = {
        ...body,
        updatedAt: new Date().toISOString(),
      };

      await cardDoc.ref.update(updateData);

      const updatedDoc = await cardDoc.ref.get();
      const updatedCard = { id: updatedDoc.id, ...updatedDoc.data() };

      return NextResponse.json(
        {
          message: "Cập nhật thẻ thành công",
          card: updatedCard,
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json({ error: "Lỗi khi cập nhật thẻ" }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  return withAuth(request, async (req, user) => {
    try {
      const { slug } = params;

      if (!slug) {
        return NextResponse.json({ error: "Slug là bắt buộc" }, { status: 400 });
      }

      // Find card by slug
      const cardsRef = adminDb.collection("cards");
      const snapshot = await cardsRef.where("slug", "==", slug).limit(1).get();

      if (snapshot.empty) {
        return NextResponse.json({ error: "Thẻ không tồn tại" }, { status: 404 });
      }

      const cardDoc = snapshot.docs[0];
      const cardData = cardDoc.data();
      if (user.role !== "admin" && cardData.userId !== user.userId) {
        return NextResponse.json({ error: "Bạn không có quyền xóa thẻ này" }, { status: 403 });
      }

      await cardDoc.ref.delete();

      return NextResponse.json({ message: "Xóa thẻ thành công" }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Lỗi khi xóa thẻ" }, { status: 500 });
    }
  });
}
