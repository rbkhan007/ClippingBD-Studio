import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, canAccessResource } from '@/lib/api-auth';

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
          client: { select: { id: true, name: true, email: true, avatar: true } },
          service: { select: { id: true, name: true, category: true } },
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
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

    // Calculate pricing based on service
    let basePrice = 0.20; // Default price per image
    
    if (serviceId) {
      const service = await db.service.findUnique({ where: { id: serviceId } });
      if (service) {
        basePrice = service.basePrice;
      }
    }

    const baseAmount = basePrice * quantity;
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
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Find admin users and create notifications
    const adminUsers = await db.user.findMany({
      where: { role: { in: ['ADMIN', 'DEVELOPER'] }, status: 'ACTIVE' },
      select: { id: true },
    });

    for (const admin of adminUsers) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: 'ORDER_UPDATE',
          title: 'New Order Created',
          message: `New order ${orderNumber}: ${title} - $${totalAmount.toFixed(2)} from ${order.client?.name || 'Client'}`,
          link: '/admin/orders',
        },
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/orders - Update order
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

    // Check if order exists and user has access
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (!canAccessResource(authResult, existingOrder.clientId)) {
      return NextResponse.json(
        { error: 'You do not have permission to update this order' },
        { status: 403 }
      );
    }

    // Update order
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
