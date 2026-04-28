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

    const userId = authResult.userId!;
    const userRole = authResult.role!;

    // Permission check
    let canUpdate = false;
    const isAdmin = ['ADMIN', 'DEVELOPER'].includes(userRole);
    const isOwner = existingTask.editorId === userId;
    const isQA = userRole === 'QA';

    if (isAdmin) {
      canUpdate = true;
    } else if (userRole === 'EDITOR' && isOwner) {
      // Editors can only update their own tasks, and only certain statuses
      const allowedStatusTransitions = ['IN_PROGRESS', 'SUBMITTED'];
      if (!status || allowedStatusTransitions.includes(status)) {
        canUpdate = true;
      } else {
        return NextResponse.json(
          { error: 'Editors can only set status to IN_PROGRESS or SUBMITTED' },
          { status: 403 }
        );
      }
    } else if (isQA && isOwner) {
      // QA can only review tasks (update status to APPROVED/REJECTED) on tasks they're assigned to
      // This ensures QA cannot approve their own work - must be different QA or admin
      const allowedStatusTransitions = ['APPROVED', 'REJECTED'];
      if (status && allowedStatusTransitions.includes(status)) {
        canUpdate = true;
      } else {
        return NextResponse.json(
          { error: 'QA can only approve or reject tasks' },
          { status: 403 }
        );
      }
    } else if (!isAdmin && !isOwner && !isQA) {
      // Other roles have no access
      canUpdate = false;
    }

    if (!canUpdate) {
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
      // Only allow revision notes if task is being rejected or if admin
      if (isAdmin || (isQA && status === 'REJECTED') || (isOwner && status !== 'APPROVED')) {
        updateData.revisionNotes = revisionNotes;
        if (status !== 'REJECTED') {
          updateData.revisionCount = existingTask.revisionCount + 1;
        }
      } else {
        return NextResponse.json(
          { error: 'Cannot add revision notes for this status transition' },
          { status: 403 }
        );
      }
    }

    // Editors cannot set status to APPROVED/REJECTED (only SUBMITTED/IN_PROGRESS)
    if (userRole === 'EDITOR' && status && ['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Editors cannot approve or reject tasks' },
        { status: 403 }
      );
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
