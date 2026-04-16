import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, canAccessResource } from '@/lib/api-auth';

// GET /api/assets - List assets
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const mimeType = searchParams.get('mimeType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    // Users can only see their own assets (unless admin)
    if (!['ADMIN', 'DEVELOPER'].includes(authResult.role!)) {
      where.userId = authResult.userId;
    }

    if (orderId) where.orderId = orderId;
    if (mimeType) where.mimeType = { startsWith: mimeType };

    const assets = await db.asset.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: { id: true, orderNumber: true, title: true },
        },
      },
    });

    const total = await db.asset.count({ where });

    // Calculate total storage used
    const storage = await db.asset.aggregate({
      where: { userId: authResult.userId },
      _sum: {
        size: true,
      },
    });

    return NextResponse.json({
      assets,
      storage: {
        used: storage._sum.size || 0,
        limit: 5 * 1024 * 1024 * 1024, // 5GB
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get assets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/assets - Create asset record (after upload)
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { filename, originalName, mimeType, size, bucket, path, url, orderId, isPublic } = body;

    if (!filename || !mimeType || !size || !bucket || !path || !url) {
      return NextResponse.json(
        { error: 'Missing required asset fields' },
        { status: 400 }
      );
    }

    const asset = await db.asset.create({
      data: {
        userId: authResult.userId!,
        orderId,
        filename,
        originalName: originalName || filename,
        mimeType,
        size,
        bucket,
        path,
        url,
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error('Create asset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/assets - Delete asset
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    const asset = await db.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (!canAccessResource(authResult, asset.userId)) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this asset' },
        { status: 403 }
      );
    }

    await db.asset.delete({
      where: { id: assetId },
    });

    // In a real app, would also delete from storage

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete asset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
