import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, canAccessResource } from '@/lib/api-auth';

// GET /api/tickets - List support tickets
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    // Clients can only see their own tickets
    if (!['ADMIN', 'DEVELOPER', 'QA'].includes(authResult.role!)) {
      where.clientId = authResult.userId;
    }

    if (status) where.status = status;

    const tickets = await db.supportTicket.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        order: {
          select: { id: true, orderNumber: true, title: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    const total = await db.supportTicket.count({ where });

    return NextResponse.json({
      tickets,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create support ticket
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { orderId, subject, description, priority } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400 }
      );
    }

    const ticket = await db.supportTicket.create({
      data: {
        clientId: authResult.userId!,
        orderId,
        subject,
        description,
        priority: priority || 'NORMAL',
        status: 'OPEN',
      },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: { id: true, orderNumber: true },
        },
      },
    });

    // Create initial message
    await db.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: authResult.userId!,
        message: description,
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tickets - Update ticket
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { ticketId, status, priority, message } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    const existingTicket = await db.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (!canAccessResource(authResult, existingTicket.clientId) && 
        !['ADMIN', 'DEVELOPER', 'QA'].includes(authResult.role!)) {
      return NextResponse.json(
        { error: 'You do not have permission to update this ticket' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date();
      }
    }
    
    if (priority) updateData.priority = priority;

    const ticket = await db.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // Add message if provided
    if (message) {
      await db.ticketMessage.create({
        data: {
          ticketId,
          senderId: authResult.userId!,
          message,
        },
      });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
