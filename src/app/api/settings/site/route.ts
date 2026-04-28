import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

// GET /api/settings/site - Get site settings
export async function GET() {
  try {
    const settings = await db.systemSetting.findMany();
    
    // Convert array to object
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Default settings
    const defaultSettings = {
      logo: settingsMap.logo || '/icon', // Dynamic favicon route
      siteName: settingsMap.siteName || 'ClippingPath & Website Services Studio',
      socialLinks: settingsMap.socialLinks ? JSON.parse(settingsMap.socialLinks) : [
        { name: 'Twitter', url: 'https://twitter.com/clippingbd', icon: 'twitter' },
        { name: 'LinkedIn', url: 'https://linkedin.com/company/clippingbd', icon: 'linkedin' },
        { name: 'Instagram', url: 'https://instagram.com/clippingbd', icon: 'instagram' },
      ],
      partnerSites: settingsMap.partnerSites ? JSON.parse(settingsMap.partnerSites) : [],
    };

    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/site - Update site settings
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }
  
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const setting = await db.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
