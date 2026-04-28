import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET - Fetch hero data (public)
export async function GET() {
  try {
    const data = await db.cmsHero.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST - Create hero (admin only)
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) return authResult.error;

  try {
    const body = await request.json();
    const { headline, subheadline, description, ctaText, ctaUrl, secondaryCtaText, secondaryCtaUrl, backgroundImageUrl } = body;

    if (!headline) {
      return NextResponse.json({ success: false, error: 'Headline required' }, { status: 400 });
    }

    const hero = await db.cmsHero.create({
      data: {
        headline,
        subheadline,
        description,
        ctaText: ctaText || 'Start Free Trial',
        ctaUrl: ctaUrl || '/auth',
        secondaryCtaText,
        secondaryCtaUrl,
        backgroundImageUrl,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Hero created', data: hero }, { status: 201 });
  } catch (error) {
    console.error('Create hero error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });
  }
}

// PUT - Update hero (admin only)
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) return authResult.error;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    const hero = await db.cmsHero.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, message: 'Hero updated', data: hero });
  } catch (error) {
    console.error('Update hero error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE - Delete hero (admin only)
export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    await db.cmsHero.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Hero deleted' });
  } catch (error) {
    console.error('Delete hero error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}