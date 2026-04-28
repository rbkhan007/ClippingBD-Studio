import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// GET /api/admin/cms/pages - List all CMS pages with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublished = searchParams.get('isPublished');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    if (isPublished !== null) {
      where.isPublished = isPublished === 'true';
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const pages = await db.cMSPage.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        featuredImage: true,
        isPublished: true,
        isHomePage: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    });

    const total = await db.cMSPage.count({ where });

    return NextResponse.json({
      success: true,
      pages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get CMS pages error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/cms/pages - Create new CMS page (Admin only)
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const {
      slug,
      title,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      metaKeywords,
      featuredImage,
      isPublished,
      isHomePage,
    } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Slug, title, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPage = await db.cMSPage.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { success: false, error: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    // If setting as homepage, unset other homepages
    if (isHomePage) {
      await db.cMSPage.updateMany({
        where: { isHomePage: true },
        data: { isHomePage: false },
      });
    }

    const page = await db.cMSPage.create({
      data: {
        slug,
        title,
        content,
        excerpt,
        metaTitle,
        metaDescription,
        metaKeywords,
        featuredImage,
        isPublished: isPublished ?? false,
        isHomePage: isHomePage ?? false,
        authorId: authResult.userId,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error) {
    console.error('Create CMS page error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cms/pages - Update CMS page by ID
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
        { success: false, error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Check if page exists
    const existingPage = await db.cMSPage.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check for conflicts
    if (updates.slug && updates.slug !== existingPage.slug) {
      const slugConflict = await db.cMSPage.findUnique({
        where: { slug: updates.slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'A page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // If setting as homepage, unset other homepages
    if (updates.isHomePage) {
      await db.cMSPage.updateMany({
        where: { isHomePage: true, NOT: { id } },
        data: { isHomePage: false },
      });
    }

    // Handle publishedAt update
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.isPublished && !existingPage.isPublished) {
      updateData.publishedAt = new Date();
    } else if (updates.isPublished === false) {
      updateData.publishedAt = null;
    }

    const page = await db.cMSPage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Update CMS page error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cms/pages - Delete CMS page by ID
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
        { success: false, error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // Check if page exists
    const existingPage = await db.cMSPage.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of homepage
    if (existingPage.isHomePage) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the homepage. Set another page as homepage first.' },
        { status: 400 }
      );
    }

    await db.cMSPage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete CMS page error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
