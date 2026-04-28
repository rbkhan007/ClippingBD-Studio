import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET - Fetch testimonials (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const [data, total] = await Promise.all([
      db.cmsTestimonial.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        take: limit,
        skip: offset,
      }),
      db.cmsTestimonial.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST - Create testimonial (admin only)
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { name, role, company, content, avatarUrl, rating, order, isActive } = body;

    if (!name || !content) {
      return NextResponse.json({ success: false, error: 'Name and content required' }, { status: 400 });
    }

    const testimonial = await db.cmsTestimonial.create({
      data: { name, role, company, content, avatarUrl, rating: rating || 5, order: order || 0, isActive: isActive ?? true },
    });

    return NextResponse.json({ success: true, message: 'Testimonial created', data: testimonial }, { status: 201 });
  } catch (error) {
    console.error('Create testimonial error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
  }
}

// PUT - Update testimonial (admin only)
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    const testimonial = await db.cmsTestimonial.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, message: 'Testimonial updated', data: testimonial });
  } catch (error) {
    console.error('Update testimonial error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE - Delete testimonial (admin only)
export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    await db.cmsTestimonial.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}