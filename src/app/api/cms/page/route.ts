import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Cache for 60 seconds for public CMS data
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const pages = await db.cMSPage.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Admin-only: Create new CMS page
    const data = await db.cMSPage.create({
      data: {
        slug: 'new-page',
        title: 'New Page',
        content: '',
        isPublished: false,
      },
    });
    
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create page' }, { status: 500 });
  }
}