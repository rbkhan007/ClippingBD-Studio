/**
 * PayPal Payments API
 * 
 * Handles PayPal order creation and capture for wallet top-ups.
 * Uses admin-configured PayPal credentials from the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getSession } from '@/lib/auth-cookies';

// PayPal API base URL (sandbox or live)
function getPayPalBaseUrl(isSandbox: boolean = true): string {
  return isSandbox 
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

// Get PayPal access token
async function getPayPalAccessToken(clientId: string, clientSecret: string, isSandbox: boolean): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch(`${getPayPalBaseUrl(isSandbox)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get PayPal access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * GET /api/payments/paypal
 * Get PayPal gateway configuration (public info only)
 */
export async function GET(request: NextRequest) {
  try {
    // Get enabled PayPal gateway
    const gateway = await db.paymentGateway.findFirst({
      where: {
        provider: 'paypal',
        isEnabled: true,
      },
    });

    if (!gateway) {
      return NextResponse.json({
        enabled: false,
        message: 'PayPal payment is not available',
      });
    }

    // Return only public info
    return NextResponse.json({
      enabled: true,
      clientId: gateway.publicKey,
      currency: gateway.currency,
      displayName: gateway.displayName,
    });
  } catch (error) {
    console.error('Error getting PayPal config:', error);
    return NextResponse.json(
      { error: 'Failed to get payment configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/paypal
 * Create or capture PayPal order
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, orderId, amount, currency = 'USD' } = body;

    // Get PayPal gateway config
    const gateway = await db.paymentGateway.findFirst({
      where: {
        provider: 'paypal',
        isEnabled: true,
      },
    });

    if (!gateway || !gateway.publicKey || !gateway.secretKey) {
      return NextResponse.json(
        { error: 'PayPal payment is not configured' },
        { status: 400 }
      );
    }

    // Decrypt secret
    const clientSecret = decrypt(gateway.secretKey);
    const clientId = gateway.publicKey;
    
    // Check if sandbox mode (from additional config)
    const additionalConfig = gateway.additionalConfig 
      ? JSON.parse(gateway.additionalConfig) 
      : {};
    const isSandbox = additionalConfig.sandbox !== false; // Default to sandbox

    // Get access token
    const accessToken = await getPayPalAccessToken(clientId, clientSecret, isSandbox);

    if (action === 'create') {
      // Create PayPal order
      const orderResponse = await fetch(`${getPayPalBaseUrl(isSandbox)}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency.toUpperCase(),
              value: amount.toFixed(2),
            },
            description: 'ClippingPath & Website Services Studio Wallet Top-up',
          }],
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        console.error('PayPal order creation failed:', error);
        return NextResponse.json(
          { error: 'Failed to create PayPal order', details: error },
          { status: 400 }
        );
      }

      const order = await orderResponse.json();

      // Create pending transaction
      await db.transaction.create({
        data: {
          userId: session.userId,
          type: 'DEPOSIT',
          amount: amount,
          currency: currency.toUpperCase(),
          status: 'PENDING',
          paymentMethod: 'paypal',
          description: `PayPal wallet top-up - Order ${order.id}`,
          metadata: JSON.stringify({
            paypalOrderId: order.id,
            gatewayId: gateway.id,
          }),
        },
      });

      return NextResponse.json({
        orderId: order.id,
        status: order.status,
      });
    }

    if (action === 'capture') {
      // Capture PayPal order
      const captureResponse = await fetch(
        `${getPayPalBaseUrl(isSandbox)}/v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!captureResponse.ok) {
        const error = await captureResponse.json();
        console.error('PayPal capture failed:', error);
        return NextResponse.json(
          { error: 'Failed to capture PayPal payment', details: error },
          { status: 400 }
        );
      }

      const captureData = await captureResponse.json();

      // Validate response structure before accessing
      const purchaseUnit = captureData.purchase_units?.[0];
      const capture = purchaseUnit?.payments?.captures?.[0];
      const amount = capture?.amount;

      if (captureData.status === 'COMPLETED' && purchaseUnit && capture && amount) {
        // Get the captured amount with null checks
        const capturedAmount = parseFloat(amount.value || '0');
        const capturedCurrency = amount.currency_code || 'USD';

        // Update transaction and user wallet in a transaction
        await db.$transaction(async (tx) => {
          // Update transaction status
          await tx.transaction.updateMany({
            where: {
              userId: session.userId,
              metadata: { contains: orderId },
              status: 'PENDING',
            },
            data: {
              status: 'SUCCESS',
              metadata: JSON.stringify({
                paypalOrderId: orderId,
                paypalCaptureId: capture?.id || 'unknown',
                gatewayId: gateway.id,
              }),
            },
          });

          // Update user wallet balance
          await tx.user.update({
            where: { id: session.userId },
            data: {
              walletBalance: {
                increment: capturedAmount,
              },
            },
          });
        });

        return NextResponse.json({
          success: true,
          status: 'COMPLETED',
          amount: capturedAmount,
          currency: capturedCurrency,
        });
      }

      return NextResponse.json({
        success: false,
        status: captureData.status,
        message: 'Payment not completed',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create" or "capture"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PayPal payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
