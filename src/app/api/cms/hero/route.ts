import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Cache for 60 seconds for public CMS data
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const data = await db.cmsHero.findMany({
      where: { isActive: true },
      take: 1,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}
