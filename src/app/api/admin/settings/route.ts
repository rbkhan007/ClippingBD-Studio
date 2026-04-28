import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin or developer role
    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    if (!authResult.authorized) {
      return authResult.error;
    }

    const settings = await db.cmsGlobalSettings.findFirst();
    
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching CMS settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require admin or developer role
    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    if (!authResult.authorized) {
      return authResult.error;
    }

    const body = await request.json();
    const existingSettings = await db.cmsGlobalSettings.findFirst();
    
    if (!existingSettings) {
      return NextResponse.json({
        success: false,
        error: 'Settings not found',
      }, { status: 404 });
    }
    
    const settings = await db.cmsGlobalSettings.update({
      where: { id: existingSettings.id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error updating CMS settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings',
    }, { status: 500 });
  }
}