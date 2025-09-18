import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth';
import prisma from '@/db/prisma';

// Demander l'accès à un établissement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { placeId, placeName, placeType, description, phone, email, website } = body;

    if (!placeId || !placeName || !placeType) {
      return NextResponse.json(
        { error: 'Les champs placeId, placeName et placeType sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier si l'établissement existe déjà
    const existingEstablishment = await prisma.establishment.findUnique({
      where: { placeId }
    });

    if (existingEstablishment) {
      return NextResponse.json(
        { error: 'Cet établissement est déjà enregistré' },
        { status: 400 }
      );
    }

    // Déterminer le rôle approprié
    let newRole;
    switch (placeType) {
      case 'RESTAURANT':
        newRole = 'RESTAURANT_OWNER';
        break;
      case 'HOTEL':
        newRole = 'HOTEL_OWNER';
        break;
      case 'ATTRACTION':
        newRole = 'ATTRACTION_OWNER';
        break;
      default:
        return NextResponse.json(
          { error: 'Type d\'établissement non valide' },
          { status: 400 }
        );
    }

    // Créer l'établissement et mettre à jour le rôle de l'utilisateur
    const [establishment, updatedUser] = await prisma.$transaction([
      prisma.establishment.create({
        data: {
          placeId,
          name: placeName,
          type: placeType,
          description,
          phone,
          email,
          website,
          ownerId: user.id,
          isActive: true,
          isVerified: false // Nécessite une vérification admin
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { role: newRole }
      })
    ]);

    return NextResponse.json({
      message: 'Demande d\'accès créée avec succès. En attente de vérification.',
      establishment: {
        id: establishment.id,
        name: establishment.name,
        type: establishment.type,
        isVerified: establishment.isVerified
      },
      userRole: updatedUser.role
    });

  } catch (error) {
    console.error('Erreur lors de la création de la demande d\'établissement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Récupérer les établissements de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        ownedEstablishments: {
          include: {
            _count: {
              select: {
                reservations: true,
                staff: true
              }
            }
          }
        },
        staffEstablishments: {
          include: {
            establishment: {
              include: {
                _count: {
                  select: {
                    reservations: true
                  }
                }
              }
            }
          },
          where: { isActive: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      ownedEstablishments: user.ownedEstablishments,
      staffEstablishments: user.staffEstablishments.map(staff => ({
        ...staff.establishment,
        permissions: staff.permissions
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des établissements:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}