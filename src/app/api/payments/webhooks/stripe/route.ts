import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/encryption';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ status: 'active', provider: 'stripe' });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    const gw = await db.paymentGateway.findFirst({ where: { provider: 'stripe', isEnabled: true } });
    if (gw?.webhookSecret) webhookSecret = await decrypt(gw.webhookSecret);
  }
  if (!webhookSecret) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const stripe = new Stripe(webhookSecret);
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook sig error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handleSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handleFailure(event.data.object);
      break;
    case 'checkout.session.completed':
      const sess = event.data.object as any;
      if (sess.paymentIntent) {
        const pi = await stripe.paymentIntents.retrieve(sess.paymentIntent);
        await handleSuccess(pi);
      }
      break;
  }
  return NextResponse.json({ received: true, event: event.type });
}

async function handleSuccess(pi: any) {
  const id = pi.id;
  const amount = (pi.amount || 0) / 100;
  const userId = pi.metadata?.userId;
  const orderId = pi.metadata?.orderId;
  if (!userId) return;

  const exists = await db.transaction.findFirst({ where: { stripeId: id } });
  if (exists) return;

  await db.transaction.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      type: 'DEPOSIT',
      amount,
      currency: 'USD',
      status: 'SUCCESS',
      paymentMethod: 'stripe',
      stripeId: id,
      description: 'Wallet top-up via Stripe',
    },
  });

  await db.user.update({
    where: { id: userId },
    data: { walletBalance: { increment: amount } },
  });

  await db.notification.create({
    data: {
      userId,
      type: 'PAYMENT',
      title: 'Payment Successful',
      message: `$${amount.toFixed(2)} added to wallet.`,
      link: '/billing',
    },
  });

  if (orderId) {
    await db.order.update({
      where: { id: orderId },
      data: { status: 'PENDING', isPaid: true },
    });
  }
}

async function handleFailure(pi: any) {
  const { id, metadata, last_payment_error } = pi;
  const userId = metadata?.userId;
  if (!userId) return;

  await db.transaction.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      type: 'DEPOSIT',
      amount: 0,
      currency: 'USD',
      status: 'FAILED',
      paymentMethod: 'stripe',
      stripeId: id,
      description: 'Stripe payment failed',
      metadata: JSON.stringify({ error: last_payment_error?.message }),
    },
  });

  await db.notification.create({
    data: {
      userId,
      type: 'SYSTEM',
      title: 'Payment Failed',
      message: 'Your Stripe payment could not be processed.',
      link: '/billing',
    },
  });
}
