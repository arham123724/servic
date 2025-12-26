import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";

// GET /api/bookings/provider/[id] - Get all bookings for a specific provider
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get bookings for this provider
    const bookings = await Booking.find({ providerId: id })
      .populate("userId", "name email")
      .sort({ date: 1, timeSlot: 1 });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching provider bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
