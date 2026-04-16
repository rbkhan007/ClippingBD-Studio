import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

/**
 * GET /api/admin/users/approval
 * Get list of pending users awaiting approval (ADMIN/DEVELOPER only)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: { status },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          company: true,
          country: true,
          phone: true,
          approvedBy: true,
          approvedAt: true,
          rejectionReason: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.user.count({ where: { status } })
    ]);

    return NextResponse.json({ 
      users,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users/approval
 * Approve or reject a user (ADMIN/DEVELOPER only)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { userId, action, role, rejectionReason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get the user to be approved/rejected
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Determine the role to assign
      const assignedRole = role || targetUser.role || 'CLIENT';
      
      // Validate role
      const validRoles = ['CLIENT', 'EDITOR', 'QA', 'ADMIN'];
      if (!validRoles.includes(assignedRole)) {
        return NextResponse.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        );
      }

      // Update user status to ACTIVE
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          role: assignedRole,
          approvedBy: authResult.userId,
          approvedAt: new Date(),
          rejectionReason: null,
        },
      });

      // Create notification for the approved user
      await db.notification.create({
        data: {
          userId: userId,
          type: 'SYSTEM',
          title: 'Account Approved',
          message: `Your account has been approved! You can now log in and access your dashboard.`,
          link: '/dashboard',
        },
      });

      return NextResponse.json({
        success: true,
        message: `User "${targetUser.name}" has been approved as ${assignedRole}`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          status: updatedUser.status,
        },
      });
    } else if (action === 'reject') {
      // Update user status to BANNED for rejected users
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          status: 'BANNED',
          rejectionReason: rejectionReason || 'Application rejected',
          approvedBy: authResult.userId,
          approvedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `User "${targetUser.name}" has been rejected`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          status: updatedUser.status,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in user approval:', error);
    return NextResponse.json(
      { error: 'Failed to process user approval' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/approval
 * Update user role or status (ADMIN/DEVELOPER only)
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (role) {
      const validRoles = ['CLIENT', 'EDITOR', 'QA', 'ADMIN', 'DEVELOPER'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (status) {
      const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status specified' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        walletBalance: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
