import { adminDb } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { createSlug, generateUniqueSlug } from "@/lib/slug-utils";

// get list card
export async function GET() {
  try {
    const cardsRef = adminDb.collection("cards");
    const snapshot = await cardsRef.orderBy("createdAt", "desc").get();

    const cards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ cards }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}
// create new card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requiredFields = ["name", "title", "phone1", "email1", "address", "avatar", "imageCover"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Generate slug from name
    const baseSlug = createSlug(body.name);

    // Get existing slugs to ensure uniqueness
    const cardsRef = adminDb.collection("cards");
    const existingCards = await cardsRef.select("slug").get();
    const existingSlugs = existingCards.docs.map((doc) => doc.data().slug).filter(Boolean);

    // Generate unique slug
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

    const cardData = {
      ...body,
      slug: uniqueSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("cards").add(cardData);

    return NextResponse.json(
      {
        message: "Card created successfully",
        id: docRef.id,
        card: { id: docRef.id, ...cardData },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 });
  }
}
