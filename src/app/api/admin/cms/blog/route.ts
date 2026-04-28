import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// GET /api/admin/cms/blog - List all blog posts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');
    const isFeatured = searchParams.get('isFeatured');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};
    
    if (category) where.category = category;
    if (isPublished !== null) where.isPublished = isPublished === 'true';
    if (isFeatured !== null) where.isFeatured = isFeatured === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const posts = await db.blogPost.findMany({
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
        category: true,
        tags: true,
        authorId: true,
        authorName: true,
        isPublished: true,
        isFeatured: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
      },
    });

    const total = await db.blogPost.count({ where });

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/cms/blog - Create new blog post (Admin only)
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
      category,
      tags,
      authorName,
      isPublished,
      isFeatured,
    } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Slug, title, and content are required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await db.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['TUTORIAL', 'NEWS', 'UPDATE', 'CASE_STUDY'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const post = await db.blogPost.create({
      data: {
        slug,
        title,
        content,
        excerpt,
        metaTitle,
        metaDescription,
        metaKeywords,
        featuredImage,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        authorId: authResult.userId,
        authorName: authorName || 'ClippingBD Team',
        isPublished: isPublished ?? false,
        isFeatured: isFeatured ?? false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cms/blog - Update blog post by ID
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
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await db.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check for conflicts
    if (updates.slug && updates.slug !== existingPost.slug) {
      const slugConflict = await db.blogPost.findUnique({
        where: { slug: updates.slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Validate category if provided
    if (updates.category) {
      const validCategories = ['TUTORIAL', 'NEWS', 'UPDATE', 'CASE_STUDY'];
      if (!validCategories.includes(updates.category)) {
        return NextResponse.json(
          { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Handle publishedAt update
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.tags) {
      updateData.tags = JSON.stringify(updates.tags);
    }
    if (updates.isPublished && !existingPost.isPublished) {
      updateData.publishedAt = new Date();
    } else if (updates.isPublished === false) {
      updateData.publishedAt = null;
    }

    const post = await db.blogPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Update blog post error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cms/blog - Delete blog post by ID
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
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await db.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    await db.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
