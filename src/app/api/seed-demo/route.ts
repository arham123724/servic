import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Provider from "@/models/Provider";

// POST /api/seed-demo - Create demo accounts (one-time setup)
export async function POST() {
    try {
        await dbConnect();

        // Demo Client Account
        const clientEmail = "demo_client@servic.com";
        let client = await User.findOne({ email: clientEmail });

        if (!client) {
            client = await User.create({
                name: "Demo Client",
                email: clientEmail,
                password: "password123",
                role: "user",
            });
            console.log("Created demo client account");
        }

        // Demo Provider Account
        const providerEmail = "demo_provider@servic.com";
        let provider = await User.findOne({ email: providerEmail });

        if (!provider) {
            provider = await User.create({
                name: "Demo Provider",
                email: providerEmail,
                password: "password123",
                role: "provider",
            });

            // Also create a provider profile
            await Provider.create({
                name: "Demo Provider",
                phone: "0300-1234567",
                email: providerEmail,
                category: "Electrician",
                location: "Karachi",
                bio: "Demo provider account for testing the platform.",
                userId: provider._id,
                isVerified: true,
                hourlyRate: 500,
                experience: 5,
                workingHours: {
                    start: "09:00",
                    end: "18:00",
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                },
            });
            console.log("Created demo provider account and profile");
        }

        return NextResponse.json({
            success: true,
            message: "Demo accounts ready!",
            data: {
                client: { email: clientEmail, password: "password123" },
                provider: { email: providerEmail, password: "password123" },
            },
        });
    } catch (error) {
        console.error("Error seeding demo accounts:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create demo accounts" },
            { status: 500 }
        );
    }
}

// GET /api/seed-demo - Check if demo accounts exist
export async function GET() {
    try {
        await dbConnect();

        const client = await User.findOne({ email: "demo_client@servic.com" });
        const provider = await User.findOne({ email: "demo_provider@servic.com" });

        return NextResponse.json({
            success: true,
            data: {
                clientExists: !!client,
                providerExists: !!provider,
            },
        });
    } catch (error) {
        console.error("Error checking demo accounts:", error);
        return NextResponse.json(
            { success: false, error: "Failed to check demo accounts" },
            { status: 500 }
        );
    }
}
