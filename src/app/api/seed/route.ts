import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Provider from "@/models/Provider";

const dummyProviders = [
  {
    name: "Ahmad Khan",
    phone: "+923001234567",
    email: "ahmad.khan@email.com",
    bio: "Expert electrician with 10+ years experience. Specializing in home wiring, AC repair, and solar panel installation.",
    category: "Electrician",
    location: "Karachi",
    address: "Block 5, Clifton, Karachi",
    hourlyRate: 800,
    experience: 10,
    services: ["Home Wiring", "AC Repair", "Solar Panel Installation", "Electrical Maintenance"],
    workingHours: {
      start: "09:00",
      end: "18:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    isVerified: true,
    rating: 4.8,
    totalReviews: 156,
  },
  {
    name: "Bilal Ahmed",
    phone: "+923012345678",
    email: "bilal.ahmed@email.com",
    bio: "Professional plumber. Quick service for pipe fitting, bathroom renovation, and water heater repair.",
    category: "Plumber",
    location: "Lahore",
    address: "DHA Phase 5, Lahore",
    hourlyRate: 600,
    experience: 8,
    services: ["Pipe Fitting", "Bathroom Renovation", "Water Heater Repair", "Leak Fixing"],
    workingHours: {
      start: "08:00",
      end: "20:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    isVerified: true,
    rating: 4.5,
    totalReviews: 89,
  },
  {
    name: "Fatima Zahra",
    phone: "+923023456789",
    email: "fatima.zahra@email.com",
    bio: "Experienced home tutor for Math, Physics, and Chemistry. O/A Level specialist with proven results.",
    category: "Tutor",
    location: "Islamabad",
    address: "F-7, Islamabad",
    hourlyRate: 1500,
    experience: 6,
    services: ["Math Tutoring", "Physics Tutoring", "Chemistry Tutoring", "O/A Level Preparation"],
    workingHours: {
      start: "14:00",
      end: "21:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    isVerified: false,
    rating: 4.9,
    totalReviews: 42,
  },
  {
    name: "Hassan Ali",
    phone: "+923034567890",
    email: "hassan.ali@email.com",
    bio: "Skilled carpenter specializing in custom furniture, kitchen cabinets, and home renovations.",
    category: "Carpenter",
    location: "Karachi",
    address: "Gulshan-e-Iqbal, Block 13, Karachi",
    hourlyRate: 700,
    experience: 12,
    services: ["Custom Furniture", "Kitchen Cabinets", "Home Renovation", "Wood Polishing"],
    workingHours: {
      start: "09:00",
      end: "17:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    isVerified: true,
    rating: 4.7,
    totalReviews: 203,
  },
  {
    name: "Usman Ghani",
    phone: "+923045678901",
    email: "usman.ghani@email.com",
    bio: "Auto mechanic with expertise in Japanese and European cars. Engine repair, AC service, and general maintenance.",
    category: "Mechanic",
    location: "Lahore",
    address: "Johar Town, Block B, Lahore",
    hourlyRate: 500,
    experience: 15,
    services: ["Engine Repair", "AC Service", "Oil Change", "Brake Service", "General Maintenance"],
    workingHours: {
      start: "08:00",
      end: "19:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    isVerified: false,
    rating: 4.3,
    totalReviews: 67,
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
        message: `Database already has ${existingCount} providers. Skipping seed. Use POST to force reseed.`,
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
// POST /api/seed - Force reseed the database (clears existing providers)
export async function POST() {
  try {
    await dbConnect();

    // Delete all existing providers
    await Provider.deleteMany({});

    // Insert dummy providers
    const providers = await Provider.insertMany(dummyProviders);

    return NextResponse.json({
      success: true,
      message: `Successfully reseeded with ${providers.length} providers`,
      data: providers,
    });
  } catch (error) {
    console.error("Error reseeding database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reseed database" },
      { status: 500 }
    );
  }
}