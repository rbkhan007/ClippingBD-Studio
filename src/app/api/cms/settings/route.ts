import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    // Allow public access for basic settings (for WhatsApp, theme, etc.)
    // Only require auth for sensitive settings
    const settings = await db.cmsGlobalSettings.findFirst();
    
    // Return only public-safe fields
    const publicData = settings ? {
      id: settings.id,
      siteName: settings.siteName,
      tagline: settings.tagline,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      whatsappNumber: settings.whatsappNumber,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      footerText: settings.footerText,
    } : null;
    
    return NextResponse.json({
      success: true,
      data: publicData,
    });
  } catch (error) {
    console.error('Error fetching CMS settings:', error);
    // Return default settings if DB fails
    return NextResponse.json({
      success: true,
      data: {
        whatsappNumber: '+8801722646692',
        siteName: 'ClippingPath & Website Services Studio',
        primaryColor: '#10b981',
      },
    });
  }
}

export async function PUT(request: NextRequest) {
  // Require admin or developer role
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const {
      siteName, tagline, logoUrl, faviconUrl, footerText,
      primaryColor, secondaryColor, accentColor, whatsappNumber
    } = body;

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
        whatsappNumber,
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
        whatsappNumber: whatsappNumber || null,
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
