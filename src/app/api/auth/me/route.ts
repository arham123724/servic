import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({
        success: true,
        data: { user: null },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
        },
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({
      success: true,
      data: { user: null },
    });
  }
}
