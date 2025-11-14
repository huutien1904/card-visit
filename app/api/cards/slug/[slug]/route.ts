import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Query Firebase to find card by slug
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

// Update card by slug
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const body = await request.json();

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

    // Validation for required fields (but allow partial updates)
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
}

// Delete card by slug
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
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
    await cardDoc.ref.delete();

    return NextResponse.json({ message: "Card deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
  }
}
