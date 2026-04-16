import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { siteName, tagline, logoUrl, faviconUrl, footerText, primaryColor, secondaryColor, accentColor } = body;

    const settings = await db.cmsGlobalSettings.upsert({
      where: { id: 'default' },
      update: {
        siteName,
        tagline,
        logoUrl,
        faviconUrl,
        footerText,
        primaryColor,
        secondaryColor,
        accentColor,
      },
      create: {
        id: 'default',
        siteName: siteName || 'ClippingBD Studio',
        tagline,
        logoUrl,
        faviconUrl,
        footerText,
        primaryColor: primaryColor || '#00d4ff',
        secondaryColor: secondaryColor || '#22d3ee',
        accentColor: accentColor || '#f97316',
      },
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
