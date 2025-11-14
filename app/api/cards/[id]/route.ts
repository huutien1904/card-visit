import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// get card by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const doc = await adminDb.collection("cards").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const card = { id: doc.id, ...doc.data() };
    return NextResponse.json({ card }, { status: 200 });
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 });
  }
}

// update card by id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

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

    await adminDb.collection("cards").doc(id).update(updateData);

    const updatedDoc = await adminDb.collection("cards").doc(id).get();
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

// delete card by id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Kiểm tra card có tồn tại không
    const doc = await adminDb.collection("cards").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    await adminDb.collection("cards").doc(id).delete();

    return NextResponse.json({ message: "Card deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
  }
}
