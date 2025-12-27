import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";
import { validatePhone, getPhoneError } from "@/lib/validation";

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { providerId, date, timeSlot, notes, clientPhone } = body;

    // Validation
    if (!providerId || !date || !timeSlot || !clientPhone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate phone number
    if (!validatePhone(clientPhone)) {
      return NextResponse.json(
        { success: false, error: getPhoneError(clientPhone) },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return NextResponse.json(
        { success: false, error: "Cannot book a past date" },
        { status: 400 }
      );
    }

    // Check if the time slot is already booked
    const existingBooking = await Booking.findOne({
      providerId,
      date: bookingDate,
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: "This time slot is already booked" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      providerId,
      userId: session.userId,
      clientName: session.name,
      clientEmail: session.email,
      clientPhone,
      date: bookingDate,
      timeSlot,
      notes: notes || "",
      status: "pending",
    });

    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Get all bookings for the logged-in user
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

    const bookings = await Booking.find({ userId: session.userId })
      .populate("providerId", "name category location phone")
      .sort({ date: 1, timeSlot: 1 });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
