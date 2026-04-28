import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/api-auth';
import { applyRateLimit, getRateLimitHeaders, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

// GET /api/static-data - Get all static data or by category
export async function GET(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_CONFIGS.default);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');
    const activeOnly = searchParams.get('active') !== 'false';

    const where: Record<string, unknown> = {};
    
    if (category) where.category = category;
    if (key) where.key = key;
    if (activeOnly) where.isActive = true;

    const staticData = await db.staticData.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
      ],
    });

    // Group by category if no specific category requested
    const grouped = category 
      ? staticData 
      : staticData.reduce((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;
        }, {} as Record<string, typeof staticData>);

    return NextResponse.json({ 
      data: grouped,
      count: staticData.length 
    });
  } catch (error) {
    console.error('Get static data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch static data' },
      { status: 500 }
    );
  }
}

// POST /api/static-data - Create new static data (Admin only)
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error!;
  }

  const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_CONFIGS.default);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { category, key, title, subtitle, content, description, imageUrl, icon, link, sortOrder, isActive, metadata } = body;

    if (!category || !key) {
      return NextResponse.json(
        { error: 'Category and key are required' },
        { status: 400 }
      );
    }

    // Check if key already exists in category
    const existing = await db.staticData.findFirst({
      where: { category, key },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Static data with this category and key already exists' },
        { status: 400 }
      );
    }

    const staticData = await db.staticData.create({
      data: {
        category,
        key,
        title,
        subtitle,
        content,
        description,
        imageUrl,
        icon,
        link,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({ staticData }, { status: 201 });
  } catch (error) {
    console.error('Create static data error:', error);
    return NextResponse.json(
      { error: 'Failed to create static data' },
      { status: 500 }
    );
  }
}

// PUT /api/static-data - Update static data (Admin only)
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error!;
  }

  const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_CONFIGS.default);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { id, category, key, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...updates };
    
    if (updates.metadata) {
      updateData.metadata = JSON.stringify(updates.metadata);
    }

    const staticData = await db.staticData.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ staticData });
  } catch (error) {
    console.error('Update static data error:', error);
    return NextResponse.json(
      { error: 'Failed to update static data' },
      { status: 500 }
    );
  }
}

// DELETE /api/static-data - Delete static data (Admin only)
export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await db.staticData.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete static data error:', error);
    return NextResponse.json(
      { error: 'Failed to delete static data' },
      { status: 500 }
    );
  }
}