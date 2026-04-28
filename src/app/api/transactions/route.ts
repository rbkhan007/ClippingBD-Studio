import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, canAccessResource } from '@/lib/api-auth';

// GET /api/transactions - List transactions
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    // Users can only see their own transactions (unless admin)
    if (!['ADMIN', 'DEVELOPER'].includes(authResult.role!)) {
      where.userId = authResult.userId;
    }

    if (type) where.type = type;

    // Fetch count, transactions, and totals in parallel
    const [transactions, total, totals] = await Promise.all([
      db.transaction.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      db.transaction.count({ where }),
      db.transaction.aggregate({
        where: { userId: authResult.userId! },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      transactions,
      totals: { totalAmount: totals._sum.amount || 0 },
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create transaction (deposit, etc.)
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { type, amount, currency, paymentMethod, description, stripeId } = body;

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Type and amount are required' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        userId: authResult.userId!,
        type,
        amount: type === 'DEPOSIT' ? Math.abs(amount) : -Math.abs(amount),
        currency: currency || 'USD',
        status: 'PENDING',
        paymentMethod,
        description,
        stripeId,
      },
    });

    // For deposits, update wallet balance immediately (in real app, this would be via webhook)
    if (type === 'DEPOSIT') {
      await db.user.update({
        where: { id: authResult.userId! },
        data: {
          walletBalance: {
            increment: Math.abs(amount),
          },
        },
      });

      // Mark transaction as success
      await db.transaction.update({
        where: { id: transaction.id },
        data: { status: 'SUCCESS' },
      });

      // Get user info for notification
      const user = await db.user.findUnique({
        where: { id: authResult.userId! },
        select: { name: true, email: true },
      });

      // Notify all admins about the payment
      const adminUsers = await db.user.findMany({
        where: { role: { in: ['ADMIN', 'DEVELOPER'] }, status: 'ACTIVE' },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        await db.notification.create({
          data: {
            userId: admin.id,
            type: 'PAYMENT',
            title: 'Payment Received',
            message: `${user?.name || user?.email || 'User'} deposited $${amount} via ${paymentMethod || 'manual'}`,
            link: '/admin/transactions',
          },
        });
      }
    }

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/transactions - Update transaction status
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { transactionId, status } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'Transaction ID and status are required' },
        { status: 400 }
      );
    }

    const existingTransaction = await db.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Only admin or transaction owner can update
    if (!canAccessResource(authResult, existingTransaction.userId)) {
      return NextResponse.json(
        { error: 'You do not have permission to update this transaction' },
        { status: 403 }
      );
    }

    const transaction = await db.transaction.update({
      where: { id: transactionId },
      data: { status },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
