import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Provider from "@/models/Provider";
import { getSession } from "@/lib/auth";

// PATCH /api/bookings/[id] - Update booking (approve/reject/mark as read)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, isNew } = body;

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify that the user is the provider for this booking
    const provider = await Provider.findOne({
      _id: booking.providerId,
      userId: session.userId,
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - You are not the provider for this booking" },
        { status: 403 }
      );
    }

    // Update booking
    const updateData: any = {};
    
    if (status !== undefined) {
      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (isNew !== undefined) {
      updateData.isNew = isNew;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
