/**
 * Payment Gateways API
 * 
 * CRUD operations for managing payment gateways.
 * Only accessible by ADMIN and DEVELOPER roles.
 * Secret keys are encrypted before storage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/encryption';
import { getTokenFromCookies, verifyToken, getSession } from '@/lib/auth-cookies';

// Supported payment providers
const SUPPORTED_PROVIDERS = [
  'paypal',
  'stripe', 
  'payoneer',
  'bkash',
  'nagad',
  'others'
] as const;

type PaymentProvider = typeof SUPPORTED_PROVIDERS[number];

/**
 * Log audit event for payment gateway changes
 */
async function logAuditEvent(params: {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE';
  entityType: 'PAYMENT_GATEWAY';
  entityId: string;
  userId: string;
  details: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.analyticsEvent.create({
      data: {
        type: `PAYMENT_GATEWAY_${params.action}`,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.userId,
        data: JSON.stringify({
          details: params.details,
          ...params.metadata,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

interface PaymentGatewayInput {
  provider: PaymentProvider;
  displayName: string;
  isEnabled?: boolean;
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  merchantId?: string;
  currency?: string;
  additionalConfig?: Record<string, unknown>;
  description?: string;
  logoUrl?: string;
  sortOrder?: number;
}

/**
 * Verify admin access
 */
async function verifyAdminAccess(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return { authorized: false, error: 'Unauthorized' };
  }
  if (!['ADMIN', 'DEVELOPER'].includes(session.role)) {
    return { authorized: false, error: 'Forbidden' };
  }
  return { authorized: true, session };
}

/**
 * GET /api/admin/payment-gateways
 * List all payment gateways (with masked secrets)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const access = await verifyAdminAccess(request);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.error === 'Unauthorized' ? 401 : 403 });
    }

    const { searchParams } = new URL(request.url);
    const gatewayId = searchParams.get('id');
    const provider = searchParams.get('provider');
    const includeDisabled = searchParams.get('includeDisabled') === 'true';

    // Get specific gateway
    if (gatewayId) {
      const gateway = await db.paymentGateway.findUnique({
        where: { id: gatewayId },
      });

      if (!gateway) {
        return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
      }

      // Return with masked secrets (never expose full secret)
      return NextResponse.json({
        gateway: {
          ...gateway,
          secretKey: gateway.secretKey ? '******' : null,
          webhookSecret: gateway.webhookSecret ? '******' : null,
        },
      });
    }

    // Build query
    const where: Record<string, unknown> = {};
    if (provider && SUPPORTED_PROVIDERS.includes(provider as PaymentProvider)) {
      where.provider = provider;
    }
    if (!includeDisabled) {
      where.isEnabled = true;
    }

    const gateways = await db.paymentGateway.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    // Return with masked secrets
    const maskedGateways = gateways.map(g => ({
      ...g,
      secretKey: g.secretKey ? '******' : null,
      webhookSecret: g.webhookSecret ? '******' : null,
    }));

    return NextResponse.json({ gateways: maskedGateways });
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment gateways' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/payment-gateways
 * Create a new payment gateway
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const access = await verifyAdminAccess(request);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.error === 'Unauthorized' ? 401 : 403 });
    }

    const body: PaymentGatewayInput = await request.json();

    // Validate required fields
    if (!body.provider || !body.displayName) {
      return NextResponse.json(
        { error: 'Provider and display name are required' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_PROVIDERS.includes(body.provider)) {
      return NextResponse.json(
        { error: `Unsupported provider. Supported: ${SUPPORTED_PROVIDERS.join(', ')}` },
        { status: 400 }
      );
    }

    // Encrypt sensitive fields
    const encryptedSecretKey = body.secretKey ? encrypt(body.secretKey) : null;
    const encryptedWebhookSecret = body.webhookSecret ? encrypt(body.webhookSecret) : null;

    const gateway = await db.paymentGateway.create({
      data: {
        provider: body.provider,
        displayName: body.displayName,
        isEnabled: body.isEnabled ?? false,
        publicKey: body.publicKey || null,
        secretKey: encryptedSecretKey,
        webhookSecret: encryptedWebhookSecret,
        merchantId: body.merchantId || null,
        currency: body.currency || 'USD',
        additionalConfig: body.additionalConfig ? JSON.stringify(body.additionalConfig) : null,
        description: body.description || null,
        logoUrl: body.logoUrl || null,
        sortOrder: body.sortOrder || 0,
      },
    });

    // Audit log
    await logAuditEvent({
      action: 'CREATE',
      entityType: 'PAYMENT_GATEWAY',
      entityId: gateway.id,
      userId: access.session!.userId,
      details: `Created ${gateway.displayName} (${gateway.provider}) gateway`,
      metadata: { provider: gateway.provider, currency: gateway.currency },
    });

    // Return with masked secrets
    return NextResponse.json({
      gateway: {
        ...gateway,
        secretKey: gateway.secretKey ? '******' : null,
        webhookSecret: gateway.webhookSecret ? '******' : null,
      },
      message: 'Payment gateway created successfully',
    });
  } catch (error) {
    console.error('Error creating payment gateway:', error);
    return NextResponse.json(
      { error: 'Failed to create payment gateway' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/payment-gateways
 * Update an existing payment gateway
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const access = await verifyAdminAccess(request);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.error === 'Unauthorized' ? 401 : 403 });
    }

    const body = await request.json();
    const { id, ...updates }: { id: string } & PaymentGatewayInput = body;

    if (!id) {
      return NextResponse.json({ error: 'Gateway ID is required' }, { status: 400 });
    }

    // Check if gateway exists
    const existing = await db.paymentGateway.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
    if (updates.isEnabled !== undefined) updateData.isEnabled = updates.isEnabled;
    if (updates.publicKey !== undefined) updateData.publicKey = updates.publicKey;
    if (updates.merchantId !== undefined) updateData.merchantId = updates.merchantId;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.logoUrl !== undefined) updateData.logoUrl = updates.logoUrl;
    if (updates.sortOrder !== undefined) updateData.sortOrder = updates.sortOrder;
    if (updates.additionalConfig !== undefined) {
      updateData.additionalConfig = JSON.stringify(updates.additionalConfig);
    }

    // Only encrypt and update secret if a new value is provided (not "******")
    if (updates.secretKey && updates.secretKey !== '******') {
      updateData.secretKey = encrypt(updates.secretKey);
    }
    if (updates.webhookSecret && updates.webhookSecret !== '******') {
      updateData.webhookSecret = encrypt(updates.webhookSecret);
    }

    const gateway = await db.paymentGateway.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await logAuditEvent({
      action: 'UPDATE',
      entityType: 'PAYMENT_GATEWAY',
      entityId: id,
      userId: access.session!.userId,
      details: `Updated ${gateway.displayName} (${gateway.provider}) gateway`,
      metadata: { changes: Object.keys(updateData) },
    });

    // Return with masked secrets
    return NextResponse.json({
      gateway: {
        ...gateway,
        secretKey: gateway.secretKey ? '******' : null,
        webhookSecret: gateway.webhookSecret ? '******' : null,
      },
      message: 'Payment gateway updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment gateway:', error);
    return NextResponse.json(
      { error: 'Failed to update payment gateway' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/payment-gateways
 * Delete a payment gateway
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const access = await verifyAdminAccess(request);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.error === 'Unauthorized' ? 401 : 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gateway ID is required' }, { status: 400 });
    }

    // Check if gateway exists
    const existing = await db.paymentGateway.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
    }

    // Audit log before deletion
    await logAuditEvent({
      action: 'DELETE',
      entityType: 'PAYMENT_GATEWAY',
      entityId: id,
      userId: access.session!.userId,
      details: `Deleted ${existing.displayName} (${existing.provider}) gateway`,
      metadata: { provider: existing.provider },
    });

    await db.paymentGateway.delete({ where: { id } });

    return NextResponse.json({ message: 'Payment gateway deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment gateway:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment gateway' },
      { status: 500 }
    );
  }
}
