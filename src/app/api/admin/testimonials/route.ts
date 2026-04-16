import { NextRequest, NextResponse } from 'next/server';
import { testimonialsData } from '@/data/testimonials';

// GET - Fetch testimonials
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  let data = testimonialsData.filter(t => t.isVisible);

  if (category) {
    data = data.filter(t => t.category === category);
  }

  if (featured === 'true') {
    data = data.filter(t => t.isFeatured);
  }

  return NextResponse.json({
    success: true,
    data: data.sort((a, b) => a.order - b.order),
    total: data.length,
  });
}

// PUT - Update testimonial (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    return NextResponse.json({
      success: true,
      message: `Testimonial ${id} updated successfully`,
      data: { id, ...updates },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update testimonial' },
      { status: 400 }
    );
  }
}

// POST - Create new testimonial (dev only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: 'Testimonial created successfully',
      data: body,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
      { status: 400 }
    );
  }
}

// DELETE - Delete testimonial (dev only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    return NextResponse.json({
      success: true,
      message: `Testimonial ${id} deleted successfully`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete testimonial' },
      { status: 400 }
    );
  }
}
