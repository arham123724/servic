import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import "@/models/User"; // <--- THIS IS THE MAGIC FIX. It prevents the crash!

// PATCH /api/bookings/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Check if params is a Promise (Next.js 15 fix) and resolve it
    // If you are on Next.js 14, this still works safely
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const body = await request.json();
    const { status, isNew } = body;

    console.log(`⚡ Updating Booking ${id} to status: ${status}`);

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status: status, isNew: isNew },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}