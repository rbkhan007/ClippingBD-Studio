import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// GET - Get all reviews for admin management
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    
    if (!authResult.authorized) {
      return authResult.error!;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status;
    }

    // Fetch reviews and total count in parallel
    const [reviews, total, counts] = await Promise.all([
      db.clientReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.clientReview.count({ where }),
      db.clientReview.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const statusCounts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
    };

    counts.forEach((item) => {
      statusCounts[item.status as keyof typeof statusCounts] = item._count;
    });

    return NextResponse.json({
      success: true,
      data: reviews,
      total,
      hasMore: total > offset + limit,
      counts: statusCounts,
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// PUT - Update review status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    
    if (!authResult.authorized) {
      return authResult.error!;
    }

    const body = await request.json();
    const { id, status, reviewNote, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Validate status
    if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = authResult.userId;
    }
    
    if (reviewNote !== undefined) {
      updateData.reviewNote = reviewNote;
    }
    
    if (sortOrder !== undefined) {
      updateData.sortOrder = parseInt(sortOrder);
    }

    // Update the review
    const review = await db.clientReview.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Review ${status?.toLowerCase() || 'updated'} successfully`,
      data: review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    
    if (!authResult.authorized) {
      return authResult.error!;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    await db.clientReview.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
