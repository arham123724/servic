import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Lead from "@/models/Lead";

// POST /api/leads - Log a lead (call or whatsapp click)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { providerId, type } = body;

    // Validation
    if (!providerId) {
      return NextResponse.json(
        { success: false, error: "Provider ID is required" },
        { status: 400 }
      );
    }

    if (!type || !["call", "whatsapp"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Type must be 'call' or 'whatsapp'" },
        { status: 400 }
      );
    }

    const lead = await Lead.create({
      providerId,
      type,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error("Error logging lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log lead" },
      { status: 500 }
    );
  }
}
