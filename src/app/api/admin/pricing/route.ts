import { NextRequest, NextResponse } from 'next/server';
import { pricingPlans, volumeDiscounts, currencies } from '@/data/pricing';

// GET - Fetch pricing data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'plans', 'discounts', 'currencies'

  if (type === 'plans') {
    return NextResponse.json({
      success: true,
      data: pricingPlans,
    });
  }

  if (type === 'discounts') {
    return NextResponse.json({
      success: true,
      data: volumeDiscounts,
    });
  }

  if (type === 'currencies') {
    return NextResponse.json({
      success: true,
      data: currencies,
    });
  }

  // Return all pricing data
  return NextResponse.json({
    success: true,
    data: {
      plans: pricingPlans,
      discounts: volumeDiscounts,
      currencies,
    },
  });
}

// PUT - Update pricing plan (dev only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, updates } = body;

    return NextResponse.json({
      success: true,
      message: `${type} ${id} updated successfully`,
      data: { id, ...updates },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update pricing' },
      { status: 400 }
    );
  }
}

// POST - Create new pricing plan (dev only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: 'Pricing item created successfully',
      data: body,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create pricing item' },
      { status: 400 }
    );
  }
}

// DELETE - Delete pricing item (dev only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    return NextResponse.json({
      success: true,
      message: `Pricing item ${id} deleted successfully`,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete pricing item' },
      { status: 400 }
    );
  }
}
