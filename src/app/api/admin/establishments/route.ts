import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/db/prisma';

// Force la route à être dynamique
export const dynamic = 'force-dynamic';

// Récupérer tous les établissements pour les admins
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth('ADMIN');

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || ''; // 'verified', 'pending', 'all'

    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { placeId: { contains: search, mode: 'insensitive' } },
        { owner: {
          OR: [
            { firstname: { contains: search, mode: 'insensitive' } },
            { lastname: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status === 'verified') {
      where.isVerified = true;
    } else if (status === 'pending') {
      where.isVerified = false;
    }

    // Récupérer les établissements avec pagination
    const [establishments, total] = await Promise.all([
      prisma.establishment.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: {
              reservations: true,
              staff: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.establishment.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      establishments,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des établissements:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}