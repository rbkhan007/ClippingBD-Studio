/**
 * Payment Webhooks API
 * 
 * Handles webhooks from PayPal, Stripe, and other payment providers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decrypt, verifyWebhookSignature } from '@/lib/encryption';

/**
 * POST /api/payments/webhooks
 * Handle payment webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = request.headers;

    // Determine provider from headers
    const paypalAuth = headers.get('paypal-transmission-sig');
    const stripeSignature = headers.get('stripe-signature');

    if (paypalAuth) {
      return await handlePayPalWebhook(body, headers);
    }

    if (stripeSignature) {
      return await handleStripeWebhook(body, stripeSignature);
    }

    // Unknown provider
    console.warn('Unknown webhook source');
    return NextResponse.json({ error: 'Unknown webhook source' }, { status: 400 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle PayPal webhook
 */
async function handlePayPalWebhook(body: string, headers: Headers): Promise<NextResponse> {
  try {
    const data = JSON.parse(body);
    const eventType = data.event_type;

    console.log(`PayPal webhook received: ${eventType}`);

    // Get PayPal gateway config
    const gateway = await db.paymentGateway.findFirst({
      where: {
        provider: 'paypal',
        isEnabled: true,
      },
    });

    if (!gateway?.webhookSecret) {
      console.warn('PayPal gateway not configured or no webhook secret');
      return NextResponse.json({ received: true });
    }

    // Process different event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptureCompleted(data);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED':
        await handlePaymentFailed(data);
        break;
      
      default:
        console.log(`Unhandled PayPal event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ received: true }); // Return 200 to prevent retries
  }
}

/**
 * Handle Stripe webhook
 */
async function handleStripeWebhook(body: string, signature: string): Promise<NextResponse> {
  try {
    // Get Stripe gateway config
    const gateway = await db.paymentGateway.findFirst({
      where: {
        provider: 'stripe',
        isEnabled: true,
      },
    });

    if (!gateway?.webhookSecret) {
      console.warn('Stripe gateway not configured or no webhook secret');
      return NextResponse.json({ received: true });
    }

    // Decrypt webhook secret
    const webhookSecret = decrypt(gateway.webhookSecret);

    // Verify signature
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const data = JSON.parse(body);
    const eventType = data.type;

    console.log(`Stripe webhook received: ${eventType}`);

    // Process different event types
    switch (eventType) {
      case 'payment_intent.succeeded':
        await handleStripePaymentSucceeded(data);
        break;
      
      case 'payment_intent.payment_failed':
        await handleStripePaymentFailed(data);
        break;
      
      default:
        console.log(`Unhandled Stripe event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ received: true }); // Return 200 to prevent retries
  }
}

/**
 * Handle PayPal payment capture completed
 */
async function handlePaymentCaptureCompleted(data: Record<string, unknown>) {
  const resource = data.resource as Record<string, unknown>;
  const captureId = resource?.id as string;
  const amount = parseFloat((resource?.amount as Record<string, string>)?.value || '0');
  const currency = (resource?.amount as Record<string, string>)?.currency_code || 'USD';
  const customId = resource?.custom_id as string;

  console.log(`PayPal payment completed: ${captureId} - ${amount} ${currency}`);

  // Find and update transaction
  if (customId) {
    const transaction = await db.transaction.findFirst({
      where: {
        metadata: { contains: customId },
        status: 'PENDING',
      },
    });

    if (transaction) {
      await db.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'SUCCESS',
            metadata: JSON.stringify({
              ...JSON.parse(transaction.metadata || '{}'),
              paypalCaptureId: captureId,
            }),
          },
        });

        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            walletBalance: { increment: amount },
          },
        });
      });
    }
  }
}

/**
 * Handle PayPal payment failed
 */
async function handlePaymentFailed(data: Record<string, unknown>) {
  const resource = data.resource as Record<string, unknown>;
  const captureId = resource?.id as string;

  console.log(`PayPal payment failed/reversed: ${captureId}`);

  // Find and update transaction
  const transaction = await db.transaction.findFirst({
    where: {
      metadata: { contains: captureId },
      status: 'SUCCESS',
    },
  });

  if (transaction) {
    // Reverse the transaction
    await db.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          walletBalance: { decrement: transaction.amount },
        },
      });
    });
  }
}

/**
 * Handle Stripe payment succeeded
 */
async function handleStripePaymentSucceeded(data: Record<string, unknown>) {
  const paymentIntent = data.data as Record<string, unknown>;
  const piId = paymentIntent?.id as string;
  const amount = ((paymentIntent?.amount as number) || 0) / 100; // Convert from cents
  const currency = ((paymentIntent?.currency as string) || 'usd').toUpperCase();
  const metadata = paymentIntent?.metadata as Record<string, string> | undefined;

  console.log(`Stripe payment succeeded: ${piId} - ${amount} ${currency}`);

  // Find and update transaction
  const transaction = await db.transaction.findFirst({
    where: {
      metadata: { contains: piId },
      status: 'PENDING',
    },
  });

  if (transaction) {
    await db.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'SUCCESS',
          stripeId: piId,
        },
      });

      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          walletBalance: { increment: amount },
        },
      });
    });
  }
}

/**
 * Handle Stripe payment failed
 */
async function handleStripePaymentFailed(data: Record<string, unknown>) {
  const paymentIntent = data.data as Record<string, unknown>;
  const piId = paymentIntent?.id as string;

  console.log(`Stripe payment failed: ${piId}`);

  // Find and update transaction
  await db.transaction.updateMany({
    where: {
      metadata: { contains: piId },
      status: 'PENDING',
    },
    data: {
      status: 'FAILED',
    },
  });
}
