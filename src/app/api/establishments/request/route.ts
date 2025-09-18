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
      where: { email: session.user.email },
      include: {
        ownedEstablishments: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier les limites d'abonnement
    const currentEstablishmentCount = user.ownedEstablishments.length;
    let maxEstablishments = 0;

    switch (user.subscription) {
      case 'FREEMIUM':
        maxEstablishments = 0;
        break;
      case 'BUSINESS':
        maxEstablishments = 1;
        break;
      case 'ENTERPRISE':
        maxEstablishments = 3;
        break;
      case 'PREMIUM_PLUS':
        maxEstablishments = 999; // Illimité
        break;
      default:
        maxEstablishments = 0;
    }

    if (currentEstablishmentCount >= maxEstablishments) {
      let errorMessage = '';
      switch (user.subscription) {
        case 'FREEMIUM':
          errorMessage = 'Vous devez souscrire à un abonnement payant pour enregistrer un établissement. Consultez nos plans sur la page pricing.';
          break;
        case 'BUSINESS':
          errorMessage = 'Votre plan Business permet 1 établissement maximum. Passez au plan Enterprise pour en ajouter plus.';
          break;
        case 'ENTERPRISE':
          errorMessage = 'Votre plan Enterprise permet 3 établissements maximum. Contactez-nous pour le plan Premium+ si vous avez besoin de plus.';
          break;
        default:
          errorMessage = 'Limite d\'établissements atteinte pour votre abonnement.';
      }

      return NextResponse.json(
        {
          error: errorMessage,
          currentPlan: user.subscription,
          currentCount: currentEstablishmentCount,
          maxAllowed: maxEstablishments,
          upgradeRequired: true
        },
        { status: 403 }
      );
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