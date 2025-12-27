import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Provider from "@/models/Provider";

// GET /api/providers - Fetch all providers with optional filters
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const location = searchParams.get("location");

    // Build query object
    const query: Record<string, string> = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (location && location !== "all") {
      query.location = location;
    }

    const providers = await Provider.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: providers });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

// POST /api/providers - Create a new provider
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, phone, bio, category, location, email, address, hourlyRate, experience, services, workingHours } = body;

    // Basic validation
    if (!name || !phone || !category || !location) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get session to link provider to user
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();

    const providerData: any = {
      name,
      phone,
      bio: bio || "",
      category,
      location,
      isVerified: false,
    };

    // Add optional fields
    if (email) providerData.email = email;
    if (address) providerData.address = address;
    if (hourlyRate) providerData.hourlyRate = hourlyRate;
    if (experience) providerData.experience = experience;
    if (services) providerData.services = services;
    if (workingHours) providerData.workingHours = workingHours;

    // Link to user if logged in
    if (session) {
      providerData.userId = session.userId;
    }

    const provider = await Provider.create(providerData);

    // Update the user's role to 'provider' if logged in
    if (session) {
      const User = (await import("@/models/User")).default;
      await User.findByIdAndUpdate(session.userId, { role: "provider" });
    }

    return NextResponse.json({ success: true, data: provider }, { status: 201 });
  } catch (error) {
    console.error("Error creating provider:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create provider" },
      { status: 500 }
    );
  }
}
