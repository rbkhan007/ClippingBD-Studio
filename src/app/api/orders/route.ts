import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, canAccessResource } from '@/lib/api-auth';
import { checkRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  // Require authentication
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause - clients can only see their own orders
    const where: Record<string, unknown> = {};
    
    // Non-admin users can only see their own orders
    if (!['ADMIN', 'DEVELOPER'].includes(authResult.role!)) {
      where.clientId = authResult.userId;
    }
    
    if (status) where.status = status;

    // Fetch orders and count in parallel
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              basePrice: true,
            },
          },
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  // Rate limiting for order creation
  const rateLimitResult = checkRateLimit(request, RATE_LIMIT_CONFIGS.order);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.message || 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Require authentication
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const {
      serviceId,
      title,
      description,
      quantity,
      priority,
      deadline,
    } = body;

    // Validate required fields
    if (!title || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: title and quantity are required' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderCount = await db.order.count();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`;

    // Get service pricing
    const service = await db.service.findFirst({
      where: { id: serviceId || 'service-clipping' },
    });

    const baseAmount = service?.basePrice || 0.20;
    const priorityBonus = priority === 'NITRO' ? baseAmount * 0.25 : 
                          priority === 'EXPRESS' ? baseAmount * 0.15 : 0;
    const totalAmount = baseAmount + priorityBonus;

    const order = await db.order.create({
      data: {
        orderNumber,
        clientId: authResult.userId!,
        serviceId: serviceId || 'service-clipping',
        title,
        description,
        quantity,
        status: 'DRAFT',
        priority: priority || 'STANDARD',
        baseAmount,
        priorityBonus,
        totalAmount,
        isPaid: false,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders - Update order (admin only)
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { orderId, ...updates } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check permissions - only admin/developer or the client who owns the order
    if (!canAccessResource(authResult, existingOrder.clientId)) {
      return NextResponse.json(
        { error: 'No permission to update this order' },
        { status: 403 }
      );
    }

    // Only allow certain status transitions
    if (updates.status && !['DRAFT', 'PENDING', 'IN_PROGRESS', 'QA', 'COMPLETED', 'DELIVERED', 'REVISION'].includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: updates,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
