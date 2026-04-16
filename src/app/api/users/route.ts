import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole, canAccessResource } from '@/lib/api-auth';
import * as bcrypt from 'bcrypt';

// GET /api/users - List users (Admin only)
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        walletBalance: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            orders: true,
            tasks: true,
          },
        },
      },
    });

    const total = await db.user.count({ where });

    return NextResponse.json({
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create user (Admin only)
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { email, password, name, role, status } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: role || 'CLIENT',
        status: status || 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        walletBalance: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users - Update user
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    const targetUserId = userId || authResult.userId;

    // Check permissions
    if (!canAccessResource(authResult, targetUserId)) {
      return NextResponse.json(
        { error: 'You do not have permission to update this user' },
        { status: 403 }
      );
    }

    // Filter allowed updates based on role
    const allowedUpdates: Record<string, unknown> = {};
    
    if (authResult.role === 'ADMIN' || authResult.role === 'DEVELOPER') {
      // Admin can update all fields
      if (updates.name) allowedUpdates.name = updates.name;
      if (updates.avatar) allowedUpdates.avatar = updates.avatar;
      if (updates.role) allowedUpdates.role = updates.role;
      if (updates.status) allowedUpdates.status = updates.status;
      if (updates.walletBalance !== undefined) allowedUpdates.walletBalance = updates.walletBalance;
    } else {
      // Users can only update their own basic info
      if (updates.name) allowedUpdates.name = updates.name;
      if (updates.avatar) allowedUpdates.avatar = updates.avatar;
    }

    // Handle password update
    if (updates.password) {
      allowedUpdates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await db.user.update({
      where: { id: targetUserId },
      data: allowedUpdates,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        walletBalance: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Delete user (Admin only)
export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userId === authResult.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
