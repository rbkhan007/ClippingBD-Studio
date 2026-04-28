import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/api-auth';

// GET /api/qa - Get QA queue
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['QA', 'ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get tasks that need QA
    const tasks = await db.task.findMany({
      where: {
        status: status === 'PENDING' ? 'SUBMITTED' : status,
      },
      take: limit,
      skip: offset,
      orderBy: { submittedAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
            priority: true,
            deadline: true,
            client: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        editor: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        reviews: {
          where: { qaId: authResult.userId },
        },
      },
    });

    // Get existing reviews by this QA
    const reviews = await db.qAReview.findMany({
      where: {
        qaId: authResult.userId,
      },
      include: {
        task: {
          include: {
            order: {
              select: { id: true, orderNumber: true, title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const totalPending = await db.task.count({
      where: { status: 'SUBMITTED' },
    });

    return NextResponse.json({
      queue: tasks,
      reviews,
      stats: {
        pending: totalPending,
        reviewed: reviews.length,
      },
    });
  } catch (error) {
    console.error('Get QA queue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/qa - Submit QA review
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['QA', 'ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { taskId, orderId, status, score, feedback, annotations } = body;

    if (!taskId || !orderId || !status) {
      return NextResponse.json(
        { error: 'Task ID, Order ID, and status are required' },
        { status: 400 }
      );
    }

    // Create review
    const review = await db.qAReview.create({
      data: {
        taskId,
        orderId,
        qaId: authResult.userId!,
        status,
        score,
        feedback,
        annotations,
        reviewedAt: new Date(),
      },
    });

    // Update task status based on review
    if (status === 'APPROVED') {
      await db.task.update({
        where: { id: taskId },
        data: { status: 'APPROVED' },
      });
    } else if (status === 'REJECTED') {
      await db.task.update({
        where: { id: taskId },
        data: {
          status: 'REJECTED',
          revisionCount: { increment: 1 },
        },
      });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Create QA review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/qa - Update QA review
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['QA', 'ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { reviewId, status, score, feedback } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await db.qAReview.update({
      where: { id: reviewId },
      data: {
        status,
        score,
        feedback,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Update QA review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
