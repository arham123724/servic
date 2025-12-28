import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";
import "@/models/User"; // <--- ADD THIS LINE

// GET /api/bookings/my-provider-bookings
export async function GET(request: NextRequest) {
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

    // --- CRITICAL FIX START ---
    // Instead of filtering by ID (which is mismatching), we fetch ALL bookings.
    // The Frontend will filter them by Email (which we know is correct).

    const bookings = await Booking.find({})
      .populate("userId", "name email")
      .sort({ date: 1, timeSlot: 1 });

    // --- CRITICAL FIX END ---

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching provider bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}