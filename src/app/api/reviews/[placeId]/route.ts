import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Gestionnaire pour les requêtes GET
export async function GET(
  req: NextRequest,
  { params }: { params: { placeId: string } }
) {
  const { placeId } = params;

  if (!placeId) {
    return NextResponse.json(
      { error: "Invalid or missing placeId" },
      { status: 400 }
    );
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { placeId },
      include: {
        user: {
          select: { firstname: true, lastname: true, image: true },
        },
      },
    });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// Gestionnaire pour les requêtes POST
export async function POST(
  req: NextRequest,
  { params }: { params: { placeId: string } }
) {
  const { placeId } = params;
  const { userId, rating, comment } = await req.json();

  if (!userId || typeof rating !== "number" || !comment) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        placeId,
        userId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this user" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        placeId,
        user: { connect: { id: userId } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { placeId: string } }
) {
  const { placeId } = params;
  const { userId, rating, comment } = await req.json();

  if (!userId || typeof rating !== "number" || !comment) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        placeId,
        userId,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review does not exist for this user" },
        { status: 400 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: existingReview.id,
      },
      data: {
        rating,
        comment,
      },
    });

    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}
