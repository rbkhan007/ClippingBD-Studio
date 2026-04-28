import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// GET - Fetch approved reviews (public) or all reviews (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    const isAdmin = authResult.authorized;

    const where: Record<string, unknown> = {};

    if (isAdmin && status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status;
    } else if (!isAdmin) {
      where.status = 'APPROVED';
    }

    // Fetch reviews and count in parallel
    const [reviews, total] = await Promise.all([
      db.clientReview.findMany({
        where,
        orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      db.clientReview.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      total,
      hasMore: total > offset + limit,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Submit a new review (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, role, content, rating } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validate rating is 1-5
    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get IP address and user agent for spam prevention
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check for spam (simple rate limiting - max 3 reviews per IP per day)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReviews = await db.clientReview.count({
      where: {
        ipAddress,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentReviews >= 3) {
      return NextResponse.json(
        { success: false, error: 'Too many reviews submitted. Please try again later.' },
        { status: 429 }
      );
    }

    // Create the review with PENDING status
    const review = await db.clientReview.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        company: company?.trim() || null,
        role: role?.trim() || null,
        content: content.trim(),
        rating: parsedRating,
        status: 'PENDING',
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your review! It will be visible after moderation.',
      data: {
        id: review.id,
        status: review.status,
      },
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
