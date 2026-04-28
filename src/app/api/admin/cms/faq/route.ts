import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// GET /api/admin/cms/faq - List all FAQ items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    if (category) where.category = category;
    if (isPublished !== null) where.isPublished = isPublished === 'true';

    const faqItems = await db.fAQItem.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const total = await db.fAQItem.count({ where });

    return NextResponse.json({
      success: true,
      faqItems,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get FAQ items error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/cms/faq - Create new FAQ item (Admin only)
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { question, answer, category, sortOrder, isPublished } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['GENERAL', 'PRICING', 'SERVICES', 'SUPPORT', 'TECHNICAL'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Get max sort order for the category if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined) {
      const maxSortOrder = await db.fAQItem.aggregate({
        where: { category },
        _max: { sortOrder: true },
      });
      finalSortOrder = (maxSortOrder._max.sortOrder || 0) + 1;
    }

    const faqItem = await db.fAQItem.create({
      data: {
        question,
        answer,
        category,
        sortOrder: finalSortOrder,
        isPublished: isPublished ?? true,
      },
    });

    return NextResponse.json({ success: true, faqItem }, { status: 201 });
  } catch (error) {
    console.error('Create FAQ item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cms/faq - Update FAQ item by ID
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
        { success: false, error: 'FAQ item ID is required' },
        { status: 400 }
      );
    }

    // Check if FAQ item exists
    const existingItem = await db.fAQItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'FAQ item not found' },
        { status: 404 }
      );
    }

    // Validate category if provided
    if (updates.category) {
      const validCategories = ['GENERAL', 'PRICING', 'SERVICES', 'SUPPORT', 'TECHNICAL'];
      if (!validCategories.includes(updates.category)) {
        return NextResponse.json(
          { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const faqItem = await db.fAQItem.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, faqItem });
  } catch (error) {
    console.error('Update FAQ item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cms/faq - Delete FAQ item by ID
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
        { success: false, error: 'FAQ item ID is required' },
        { status: 400 }
      );
    }

    // Check if FAQ item exists
    const existingItem = await db.fAQItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'FAQ item not found' },
        { status: 404 }
      );
    }

    await db.fAQItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'FAQ item deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/cms/faq - Bulk update sort order
export async function PATCH(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { items } = body as { items: Array<{ id: string; sortOrder: number }> };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Update sort order for each item
    const updatePromises = items.map((item) =>
      db.fAQItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true, message: 'Sort order updated successfully' });
  } catch (error) {
    console.error('Bulk update FAQ items error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
