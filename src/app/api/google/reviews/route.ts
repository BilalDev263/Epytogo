import { fetchGoogleReviews } from "@/services/PlacesReviewService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "Missing placeId" },
      { status: 400 }
    );
  }

  try {
    const reviews = await fetchGoogleReviews(placeId);
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("Google Reviews API Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}