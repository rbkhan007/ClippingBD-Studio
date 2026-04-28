import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

// GET /api/portfolio - Get all portfolio items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active') !== 'false';

    // Try CMS portfolio items first
    let portfolioItems: any[] = [];
    try {
      const cmsWhere: Record<string, unknown> = {};
      if (category) cmsWhere.category = category;
      if (activeOnly) cmsWhere.isActive = true;

      portfolioItems = await (db as any).cmsPortfolioItem.findMany({
        where: cmsWhere,
        orderBy: { order: 'asc' },
      });

      // Map CMS fields to match expected format
      portfolioItems = portfolioItems.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        serviceType: p.serviceType,
        beforeImageUrl: p.beforeImageUrl,
        afterImageUrl: p.afterImageUrl,
        thumbnailUrl: p.thumbnailUrl,
        clientName: p.clientName,
        isPublished: p.isActive,
        sortOrder: p.order,
      }));
    } catch {
      // Fallback to old portfolioItem table
      const where: Record<string, unknown> = {};
      if (category) where.category = category;
      if (activeOnly) where.isPublished = true;

      const oldItems = await db.portfolioItem.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      });

      portfolioItems = oldItems.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        serviceType: p.serviceType,
        beforeImageUrl: p.beforeImage,
        afterImageUrl: p.afterImage,
        thumbnailUrl: p.thumbnail,
        clientName: 'Client',
        isPublished: p.isPublished,
        sortOrder: p.sortOrder,
      }));
    }

    return NextResponse.json({
      success: true,
      portfolioItems,
    });
  } catch (error) {
    console.error('Get portfolio items error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - Create portfolio item (Admin/Developer only)
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { title, description, category, serviceType, beforeImage, afterImage, thumbnail, isPublished, sortOrder, beforeImageUrl, afterImageUrl, thumbnailUrl, clientName } = body;

    if (!title || !(beforeImage || beforeImageUrl) || !(afterImage || afterImageUrl)) {
      return NextResponse.json(
        { success: false, error: 'Title, beforeImage, and afterImage are required' },
        { status: 400 }
      );
    }

    // Try CMS first, fallback to old table
    let portfolioItem: any;
    try {
      portfolioItem = await (db as any).cmsPortfolioItem.create({
        data: {
          title,
          description: description || '',
          category: category || 'CLIPPING_PATH',
          serviceType: serviceType || 'IMAGE',
          beforeImageUrl: beforeImageUrl || beforeImage,
          afterImageUrl: afterImageUrl || afterImage,
          thumbnailUrl: thumbnailUrl || thumbnail || '',
          clientName: clientName || 'Client',
          isActive: isPublished ?? true,
          order: sortOrder || 0,
        },
      });
    } catch {
      portfolioItem = await db.portfolioItem.create({
        data: {
          title,
          description: description || '',
          category: category || 'CLIPPING_PATH',
          serviceType: serviceType || 'IMAGE',
          beforeImage: beforeImage || beforeImageUrl,
          afterImage: afterImage || afterImageUrl,
          thumbnail: thumbnail || thumbnailUrl || '',
          isPublished: isPublished ?? true,
          sortOrder: sortOrder || 0,
        },
      });
    }

    return NextResponse.json({ success: true, portfolioItem }, { status: 201 });
  } catch (error) {
    console.error('Create portfolio item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/portfolio - Update portfolio item (Admin/Developer only)
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Portfolio item ID is required' },
        { status: 400 }
      );
    }

    let portfolioItem: any;
    try {
      portfolioItem = await (db as any).cmsPortfolioItem.update({
        where: { id },
        data: updates,
      });
    } catch {
      portfolioItem = await db.portfolioItem.update({
        where: { id },
        data: updates,
      });
    }

    return NextResponse.json({ success: true, portfolioItem });
  } catch (error) {
    console.error('Update portfolio item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolio - Delete portfolio item (Admin/Developer only)
export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Portfolio item ID is required' },
        { status: 400 }
      );
    }

    // Try CMS first, fallback to old table
    try {
      await (db as any).cmsPortfolioItem.delete({
        where: { id },
      });
    } catch {
      await db.portfolioItem.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true, message: 'Portfolio item deleted' });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}