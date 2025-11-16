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
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
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
    console.error("Error fetching card by slug:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  return withAuth(request, async (req, user) => {
    try {
      const { slug } = params;
      const body = await req.json();

      if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
      }

      // Find card by slug
      const cardsRef = adminDb.collection("cards");
      const snapshot = await cardsRef.where("slug", "==", slug).limit(1).get();

      if (snapshot.empty) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      const cardDoc = snapshot.docs[0];
      const cardData = cardDoc.data();

      if (user.role !== "admin" && cardData.userId !== user.userId) {
        return NextResponse.json({ error: "You don't have permission to update this card" }, { status: 403 });
      }

      const requiredFields = ["name", "title", "phone1", "email1", "address", "avatar", "imageCover"];
      for (const field of requiredFields) {
        if (body[field] !== undefined && (!body[field] || body[field].toString().trim() === "")) {
          return NextResponse.json({ error: `Field ${field} cannot be empty` }, { status: 400 });
        }
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
          message: "Card updated successfully",
          card: updatedCard,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating card:", error);
      return NextResponse.json({ error: "Failed to update card" }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  return withAuth(request, async (req, user) => {
    try {
      const { slug } = params;

      if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
      }

      // Find card by slug
      const cardsRef = adminDb.collection("cards");
      const snapshot = await cardsRef.where("slug", "==", slug).limit(1).get();

      if (snapshot.empty) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }

      const cardDoc = snapshot.docs[0];
      const cardData = cardDoc.data();
      if (user.role !== "admin" && cardData.userId !== user.userId) {
        return NextResponse.json({ error: "You don't have permission to delete this card" }, { status: 403 });
      }

      await cardDoc.ref.delete();

      return NextResponse.json({ message: "Card deleted successfully" }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
    }
  });
}
