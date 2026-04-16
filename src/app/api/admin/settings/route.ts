import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import type { SettingType } from '@/types/database';

// Setting type validation
const VALID_SETTING_TYPES: SettingType[] = ['TEXT', 'JSON', 'IMAGE', 'URL'];

// Common setting keys with their default types
const COMMON_SETTINGS: Record<string, { type: SettingType; description: string }> = {
  // Site settings
  site_name: { type: 'TEXT', description: 'The name of the website' },
  site_description: { type: 'TEXT', description: 'Website description for SEO and meta tags' },
  site_logo: { type: 'IMAGE', description: 'URL to the site logo image' },
  site_favicon: { type: 'IMAGE', description: 'URL to the site favicon' },
  
  // Contact settings
  contact_email: { type: 'TEXT', description: 'Primary contact email address' },
  contact_phone: { type: 'TEXT', description: 'Primary contact phone number' },
  contact_address: { type: 'TEXT', description: 'Business address' },
  
  // Social media links
  social_facebook: { type: 'URL', description: 'Facebook page URL' },
  social_twitter: { type: 'URL', description: 'Twitter/X profile URL' },
  social_linkedin: { type: 'URL', description: 'LinkedIn company page URL' },
  social_instagram: { type: 'URL', description: 'Instagram profile URL' },
  
  // Pricing settings
  pricing_currency: { type: 'TEXT', description: 'Default currency code (e.g., USD)' },
  pricing_tax_rate: { type: 'JSON', description: 'Tax rate configuration as JSON' },
  
  // Feature flags
  email_notifications_enabled: { type: 'JSON', description: 'Email notification settings as JSON' },
  maintenance_mode: { type: 'JSON', description: 'Maintenance mode configuration' },
};

/**
 * GET /api/admin/settings
 * Get all system settings as key-value pairs, grouped by type
 * 
 * Query params:
 * - key: Get a specific setting by key
 * - format: 'object' | 'grouped' | 'list' (default: 'list')
 * - public: 'true' to get only public settings (no auth required)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const format = searchParams.get('format') || 'list';
  const publicOnly = searchParams.get('public') === 'true';

  // For non-public settings, require admin auth
  if (!publicOnly) {
    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    if (!authResult.authorized) {
      return authResult.error;
    }
  }

  try {
    // Get specific setting by key
    if (key) {
      const setting = await db.systemSetting.findUnique({
        where: { key },
      });
      
      if (!setting) {
        return NextResponse.json(
          { success: false, error: 'Setting not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: {
          key: setting.key,
          value: setting.value,
          type: setting.type,
          description: setting.description,
          updatedAt: setting.updatedAt,
        },
      });
    }

    // Get all settings from database
    const dbSettings = await db.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    // If no settings in database, return default structure
    const settings = dbSettings.length > 0 ? dbSettings : [];

    // Return as simple key-value object
    if (format === 'object') {
      const settingsObj: Record<string, string> = {};
      settings.forEach(s => {
        settingsObj[s.key] = s.value;
      });
      return NextResponse.json({
        success: true,
        data: settingsObj,
      });
    }

    // Return grouped by type
    if (format === 'grouped') {
      const grouped: Record<SettingType, typeof settings> = {
        TEXT: [],
        JSON: [],
        IMAGE: [],
        URL: [],
      };
      
      settings.forEach(s => {
        const type = s.type as SettingType;
        if (grouped[type]) {
          grouped[type].push(s);
        }
      });
      
      return NextResponse.json({
        success: true,
        data: grouped,
        types: VALID_SETTING_TYPES,
      });
    }

    // Return as list (default)
    return NextResponse.json({
      success: true,
      data: settings.map(s => ({
        id: s.id,
        key: s.key,
        value: s.value,
        type: s.type,
        description: s.description,
        updatedAt: s.updatedAt,
      })),
      types: VALID_SETTING_TYPES,
      commonSettings: Object.keys(COMMON_SETTINGS),
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Create or update a single setting (upsert by key)
 * 
 * Body:
 * - key: Setting key (required)
 * - value: Setting value (required)
 * - type: Setting type - TEXT, JSON, IMAGE, URL (optional, defaults based on key or TEXT)
 * - description: Setting description (optional)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { key, value, type, description } = body;

    // Validate required fields
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Setting key is required and must be a string' },
        { status: 400 }
      );
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: 'Setting value is required' },
        { status: 400 }
      );
    }

    // Normalize key (lowercase, replace spaces with underscores)
    const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');

    // Determine type
    let settingType: SettingType = 'TEXT';
    if (type && VALID_SETTING_TYPES.includes(type.toUpperCase() as SettingType)) {
      settingType = type.toUpperCase() as SettingType;
    } else if (COMMON_SETTINGS[normalizedKey]) {
      settingType = COMMON_SETTINGS[normalizedKey].type;
    }

    // Validate JSON type
    if (settingType === 'JSON') {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        } else {
          JSON.stringify(value); // Ensure it's serializable
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON value' },
          { status: 400 }
        );
      }
    }

    // Validate URL type
    if (settingType === 'URL' && value) {
      try {
        new URL(value);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid URL value' },
          { status: 400 }
        );
      }
    }

    // Convert value to string for storage
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    // Determine description
    const settingDescription = description || COMMON_SETTINGS[normalizedKey]?.description || null;

    // Upsert the setting
    const setting = await db.systemSetting.upsert({
      where: { key: normalizedKey },
      update: {
        value: stringValue,
        type: settingType,
        description: settingDescription,
      },
      create: {
        key: normalizedKey,
        value: stringValue,
        type: settingType,
        description: settingDescription,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Setting '${normalizedKey}' saved successfully`,
      data: {
        id: setting.id,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create/update setting error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save setting' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Batch update multiple settings at once
 * Requires ADMIN role
 * 
 * Body:
 * - settings: Array of { key, value, type?, description? }
 */
export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { settings } = body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Settings array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate all settings
    const errors: string[] = [];
    const validSettings: Array<{
      key: string;
      value: string;
      type: SettingType;
      description: string | null;
    }> = [];

    for (let i = 0; i < settings.length; i++) {
      const s = settings[i];
      
      if (!s.key || typeof s.key !== 'string') {
        errors.push(`Setting at index ${i}: key is required`);
        continue;
      }

      if (s.value === undefined || s.value === null) {
        errors.push(`Setting at index ${i} (${s.key}): value is required`);
        continue;
      }

      const normalizedKey = s.key.toLowerCase().trim().replace(/\s+/g, '_');
      
      // Determine type
      let settingType: SettingType = 'TEXT';
      if (s.type && VALID_SETTING_TYPES.includes(s.type.toUpperCase() as SettingType)) {
        settingType = s.type.toUpperCase() as SettingType;
      } else if (COMMON_SETTINGS[normalizedKey]) {
        settingType = COMMON_SETTINGS[normalizedKey].type;
      }

      // Validate JSON type
      if (settingType === 'JSON') {
        try {
          if (typeof s.value === 'string') {
            JSON.parse(s.value);
          } else {
            JSON.stringify(s.value);
          }
        } catch {
          errors.push(`Setting at index ${i} (${s.key}): invalid JSON value`);
          continue;
        }
      }

      // Validate URL type
      if (settingType === 'URL' && s.value) {
        try {
          new URL(s.value);
        } catch {
          errors.push(`Setting at index ${i} (${s.key}): invalid URL value`);
          continue;
        }
      }

      const stringValue = typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value);
      const description = s.description || COMMON_SETTINGS[normalizedKey]?.description || null;

      validSettings.push({
        key: normalizedKey,
        value: stringValue,
        type: settingType,
        description,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Batch upsert using transaction
    const results = await db.$transaction(
      validSettings.map(s =>
        db.systemSetting.upsert({
          where: { key: s.key },
          update: {
            value: s.value,
            type: s.type,
            description: s.description,
          },
          create: {
            key: s.key,
            value: s.value,
            type: s.type,
            description: s.description,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `${results.length} settings updated successfully`,
      data: {
        updated: results.length,
        settings: results.map(s => ({
          id: s.id,
          key: s.key,
          value: s.value,
          type: s.type,
          description: s.description,
          updatedAt: s.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Batch update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to batch update settings' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/settings
 * Delete a setting by key
 * 
 * Query params:
 * - key: Setting key to delete (required)
 */
export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
  if (!authResult.authorized) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Setting key is required' },
        { status: 400 }
      );
    }

    // Check if setting exists
    const existing = await db.systemSetting.findUnique({
      where: { key },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Setting not found' },
        { status: 404 }
      );
    }

    // Delete the setting
    await db.systemSetting.delete({
      where: { key },
    });

    return NextResponse.json({
      success: true,
      message: `Setting '${key}' deleted successfully`,
      data: {
        deletedKey: key,
      },
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}
