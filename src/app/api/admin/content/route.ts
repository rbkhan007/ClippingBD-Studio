import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const authResult = await requireRole(request as any, ['ADMIN', 'DEVELOPER']);
    if (!authResult.authorized) {
      return authResult.error;
    }

    const [pages, settings, services, features] = await Promise.all([
      db.cMSPage.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      db.cmsGlobalSettings.findFirst(),
      db.cmsService.findMany({ where: { isActive: true } }),
      db.cmsFeature.findMany({ where: { isActive: true } }),
    ]);

    return NextResponse.json({ 
      success: true, 
      data: { pages, settings, services, features } 
    });
  } catch (error) {
    console.error('Error fetching admin content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch admin content' 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { type, id, data } = body;

    const authResult = await requireRole(request as any, ['ADMIN', 'DEVELOPER']);
    if (!authResult.authorized) {
      return authResult.error;
    }

    let updatedItem;
    switch(type) {
      case 'page':
        updatedItem = await db.cMSPage.update({ where: { id }, data });
        break;
      case 'service':
        updatedItem = await db.cmsService.update({ where: { id }, data });
        break;
      case 'feature':
        updatedItem = await db.cmsFeature.update({ where: { id }, data });
        break;
      case 'setting':
        updatedItem = await db.cmsGlobalSettings.update({ where: { id }, data });
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid content type' 
        }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Error updating admin content:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update content' 
    }, { status: 500 });
  }
}