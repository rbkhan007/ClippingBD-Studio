import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const [hero, statistics, features, services, testimonials] = await Promise.all([
      db.cmsHero.findMany({ where: { isActive: true }, take: 1, orderBy: { createdAt: 'desc' } }),
      db.cmsStatistic.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      db.cmsFeature.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      db.cmsService.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      db.cmsTestimonial.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    ]);
    
    return NextResponse.json({ 
      success: true, 
      data: { hero, statistics, features, services, testimonials } 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}
