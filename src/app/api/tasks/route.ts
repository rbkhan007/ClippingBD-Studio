import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole, canAccessResource } from '@/lib/api-auth';

// GET /api/tasks - List tasks
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    // Role-based filtering
    if (authResult.role === 'EDITOR') {
      // Editors can see available tasks and their own claimed tasks
      where.OR = [
        { status: 'AVAILABLE' },
        { editorId: authResult.userId }
      ];
    } else if (authResult.role === 'QA') {
      // QA can see submitted tasks for review
      where.OR = [
        { status: 'SUBMITTED' },
        { status: 'REJECTED' }
      ];
    } else if (!['ADMIN', 'DEVELOPER'].includes(authResult.role!)) {
      // Other roles see limited tasks
      where.OR = [
        { status: 'AVAILABLE' }
      ];
    }

    if (status) where.status = status;
    if (department) where.department = department;

    const tasks = await db.task.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
            quantity: true,
            priority: true,
            deadline: true,
            serviceType: true,
          },
        },
        editor: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    const total = await db.task.count({ where });

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Claim a task (Editor only)
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['EDITOR', 'ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Check if task is available
    const task = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (task.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Task is not available for claiming' },
        { status: 400 }
      );
    }

    // Claim the task
    const claimedTask = await db.task.update({
      where: { id: taskId },
      data: {
        editorId: authResult.userId,
        status: 'CLAIMED',
        claimedAt: new Date(),
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
            quantity: true,
            priority: true,
            deadline: true,
          },
        },
      },
    });

    return NextResponse.json({ task: claimedTask });
  } catch (error) {
    console.error('Claim task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks - Update task (submit, progress, etc.)
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { taskId, status, progress, revisionNotes } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const existingTask = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (!canAccessResource(authResult, existingTask.editorId || '') && 
        !['ADMIN', 'DEVELOPER', 'QA'].includes(authResult.role!)) {
      return NextResponse.json(
        { error: 'You do not have permission to update this task' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'SUBMITTED') {
        updateData.submittedAt = new Date();
      }
    }
    
    if (revisionNotes !== undefined) {
      updateData.revisionNotes = revisionNotes;
      updateData.revisionCount = existingTask.revisionCount + 1;
    }

    const task = await db.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        order: {
          select: { id: true, title: true, orderNumber: true },
        },
        editor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
