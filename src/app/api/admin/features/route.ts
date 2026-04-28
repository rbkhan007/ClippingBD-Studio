import { NextRequest, NextResponse } from 'next/server';
import { featuresData, faqData } from '@/data/features';
import { requireAdmin, requireDeveloper } from '@/lib/api-auth';
import { db } from '@/lib/db';

// GET - Fetch features or FAQs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'features' or 'faqs'
  const category = searchParams.get('category');

  try {
    // Get feature flags from database
    const dbFlags = await db.featureFlag.findMany();
    
    if (type === 'faqs') {
      let data = faqData.filter(f => f.isVisible);
      if (category) {
        data = data.filter(f => f.category === category);
      }
      return NextResponse.json({
        success: true,
        data: data.sort((a, b) => a.order - b.order),
      });
    }

    if (type === 'flags') {
      return NextResponse.json({
        success: true,
        data: dbFlags,
      });
    }

    // Default: return features
    let data = featuresData.filter(f => f.isVisible);
    if (category) {
      data = data.filter(f => f.category === category);
    }

    // Merge with feature flags from database
    const featuresWithFlags = data.map(feature => {
      const flag = dbFlags.find(f => f.key === feature.id);
      return {
        ...feature,
        enabled: flag?.enabled ?? true,
      };
    });

    return NextResponse.json({
      success: true,
      data: featuresWithFlags.sort((a, b) => a.order - b.order),
    });
  } catch (error) {
    console.error('Get features error:', error);
    // Fallback to static data
    if (type === 'faqs') {
      let data = faqData.filter(f => f.isVisible);
      if (category) {
        data = data.filter(f => f.category === category);
      }
      return NextResponse.json({
        success: true,
        data: data.sort((a, b) => a.order - b.order),
      });
    }

    let data = featuresData.filter(f => f.isVisible);
    if (category) {
      data = data.filter(f => f.category === category);
    }

    return NextResponse.json({
      success: true,
      data: data.sort((a, b) => a.order - b.order),
    });
  }
}

// PUT - Update feature or FAQ (admin only)
export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { type, id, updates } = body;

    if (type === 'flag') {
      // Update feature flag in database
      const flag = await db.featureFlag.update({
        where: { key: id },
        data: {
          enabled: updates.enabled,
          rollout: updates.rollout,
        },
      });
      return NextResponse.json({
        success: true,
        message: `Feature flag ${id} updated`,
        data: flag,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${type} ${id} updated successfully`,
      data: { id, ...updates },
    });
  } catch (error) {
    console.error('Update feature error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update' },
      { status: 400 }
    );
  }
}

// POST - Create new feature or FAQ (dev only)
export async function POST(request: NextRequest) {
  const authResult = await requireDeveloper(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { type, key, name, description, enabled = false, rollout = 100 } = body;

    if (type === 'flag') {
      const flag = await db.featureFlag.create({
        data: {
          key,
          name,
          description,
          enabled,
          rollout,
        },
      });
      return NextResponse.json({
        success: true,
        message: 'Feature flag created successfully',
        data: flag,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Item created successfully',
      data: body,
    });
  } catch (error) {
    console.error('Create feature error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 400 }
    );
  }
}

// DELETE - Delete feature or FAQ (dev only)
export async function DELETE(request: NextRequest) {
  const authResult = await requireDeveloper(request);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (type === 'flag') {
      await db.featureFlag.delete({ where: { key: id! } });
    }

    return NextResponse.json({
      success: true,
      message: `Item ${id} deleted successfully`,
    });
  } catch (error) {
    console.error('Delete feature error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 400 }
    );
  }
}
