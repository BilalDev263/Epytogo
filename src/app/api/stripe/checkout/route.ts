import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/auth';
import { prisma } from '@/db/prisma';

// Force la route à être dynamique
export const dynamic = 'force-dynamic';

// Configuration des plans Stripe
const STRIPE_PLANS = {
  business: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!, // À configurer dans Stripe
    name: 'Business',
    price: 2000, // 20€ en centimes
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!, // À configurer dans Stripe
    name: 'Enterprise',
    price: 5000, // 50€ en centimes
  }
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');

    if (!plan || !STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Configuration Stripe (simulation pour la démo)
    const stripeConfig = {
      sessionId: `cs_demo_${Date.now()}`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing/success?session_id=cs_demo_${Date.now()}&plan=${plan}`,
      plan: STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]
    };

    // En production, tu créerais une vraie session Stripe ici :
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [{
        price: STRIPE_PLANS[plan].priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        userId: user.id,
        plan: plan
      }
    });
    */

    // Pour la démo, on simule un succès immédiat
    return NextResponse.redirect(stripeConfig.url);

  } catch (error) {
    console.error('Erreur lors de la création du checkout:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}