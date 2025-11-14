import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

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
