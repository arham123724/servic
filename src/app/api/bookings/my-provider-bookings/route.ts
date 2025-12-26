import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Provider from "@/models/Provider";
import { getSession } from "@/lib/auth";

// GET /api/bookings/my-provider-bookings - Get all bookings for the logged-in provider
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

    // Find provider profile for this user
    const provider = await Provider.findOne({ userId: session.userId });

    if (!provider) {
      // User is not a provider, return empty bookings
      return NextResponse.json({ success: true, data: [] });
    }

    // Get bookings for this provider
    const bookings = await Booking.find({ providerId: provider._id })
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
