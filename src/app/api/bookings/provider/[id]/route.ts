import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";

// GET /api/bookings/provider/[id] - Get all booked time slots for a provider (anonymous for clients viewing)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    // Build query for booked slots only
    const query: any = {
      providerId: id,
      status: { $in: ["pending", "confirmed"] },
    };

    // If date is provided, filter by that date
    if (dateParam) {
      const date = new Date(dateParam);
      query.date = date;
    }

    // Get booked slots (only return date and timeSlot, no personal info for privacy)
    const bookings = await Booking.find(query)
      .select("date timeSlot")
      .sort({ date: 1, timeSlot: 1 });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booked slots" },
      { status: 500 }
    );
  }
}
