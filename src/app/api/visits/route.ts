import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";
import { getLastVisits, recordVisit } from "@/db/visit";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ visits: [] });
  }

  const visits = await getLastVisits(session.user.id);
  return NextResponse.json({ visits });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    const { placeId, placeName } = await request.json();
    
    if (!placeId || !placeName) {
      return NextResponse.json({ error: "placeId et placeName requis" }, { status: 400 });
    }

    await recordVisit(session.user.id, placeId, placeName);
    
    return NextResponse.json({ 
      success: true,
      message: "Visite enregistrée avec succès" 
    });

  } catch (error) {
    console.error("Erreur API visits POST:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}