import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Provider from "@/models/Provider";

const dummyProviders = [
  {
    name: "Ahmad Khan",
    phone: "+923001234567",
    bio: "Expert electrician with 10+ years experience. Specializing in home wiring, AC repair, and solar panel installation.",
    category: "Electrician",
    location: "Karachi",
    isVerified: true,
  },
  {
    name: "Bilal Ahmed",
    phone: "+923012345678",
    bio: "Professional plumber. Quick service for pipe fitting, bathroom renovation, and water heater repair.",
    category: "Plumber",
    location: "Lahore",
    isVerified: true,
  },
  {
    name: "Fatima Zahra",
    phone: "+923023456789",
    bio: "Experienced home tutor for Math, Physics, and Chemistry. O/A Level specialist with proven results.",
    category: "Tutor",
    location: "Islamabad",
    isVerified: false,
  },
  {
    name: "Hassan Ali",
    phone: "+923034567890",
    bio: "Skilled carpenter specializing in custom furniture, kitchen cabinets, and home renovations.",
    category: "Carpenter",
    location: "Karachi",
    isVerified: true,
  },
  {
    name: "Usman Ghani",
    phone: "+923045678901",
    bio: "Auto mechanic with expertise in Japanese and European cars. Engine repair, AC service, and general maintenance.",
    category: "Mechanic",
    location: "Lahore",
    isVerified: false,
  },
];

// GET /api/seed - Seed the database with dummy providers
export async function GET() {
  try {
    await dbConnect();

    // Check if providers already exist
    const existingCount = await Provider.countDocuments();

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingCount} providers. Skipping seed.`,
        count: existingCount,
      });
    }

    // Insert dummy providers
    const providers = await Provider.insertMany(dummyProviders);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${providers.length} providers`,
      data: providers,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
