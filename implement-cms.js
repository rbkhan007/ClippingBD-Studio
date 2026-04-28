const fs = require('fs');
const path = require('path');

console.log('🚀 Starting CMS implementation...');

// 1. Update Home page to use CMS hooks
const homePagePath = 'src/app/page.tsx';
let homePageContent = fs.readFileSync(homePagePath, 'utf8');

homePageContent = homePageContent.replace(
  "import { useHeroContent } from '@/hooks/cms/use-cms-content';",
  "import { useHeroContent } from '@/hooks/cms/use-cms-content';\nimport { metadata } from './home-metadata';"
);

homePageContent = homePageContent.replace(
  "export default function Home() {",
  "export const metadata = { title: 'Home' };\n\nexport default function Home() {"
);

homePageContent = homePageContent.replace(
  "<HomePage heroData={hero} />",
  "<HomePage heroData={hero} />"
);

fs.writeFileSync(homePagePath, homePageContent);
console.log('✓ Updated Home page');

// 2. Create CMS API routes
const apiRoutes = {
  'api/cms/pages/[slug]/route.ts': `import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = await db.cmsPage.findUnique({
      where: { slug, isPublished: true },
    });
    
    if (!page) {
      return NextResponse.json({ 
        success: false, 
        error: 'Page not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: page 
    });
  } catch (error) {
    console.error('Error fetching CMS page:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch page' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    const page = await db.cmsPage.update({
      where: { slug },
      data: body,
    });
    
    return NextResponse.json({ 
      success: true, 
      data: page 
    });
  } catch (error) {
    console.error('Error updating CMS page:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update page' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const page = await db.cmsPage.create({
      data: body,
    });
    
    return NextResponse.json({ 
      success: true, 
      data: page 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating CMS page:', error);
    return NextResponse.json({ 
      success: false,  
      error: 'Failed to create page' 
    }, { status: 500 });
  }
}`
};

Object.keys(apiRoutes).forEach((routePath) => {
  const fullPath = path.join('src', 'app', routePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, apiRoutes[routePath]);
  console.log(`✓ Created ${routePath}`);
});

// 3. Create admin API routes
const adminRoutes = {
  'api/admin/content/route.ts': `import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    if (!authResult.authorized) {
      return authResult.error;
    }

    const [pages, settings, services, features] = await Promise.all([
      db.cmsPage.findMany({ orderBy: { createdAt: 'desc' } }),
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

    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    if (!authResult.authorized) {
      return authResult.error;
    }

    let updatedItem;
    switch(type) {
      case 'page':
        updatedItem = await db.cmsPage.update({ where: { id }, data });
        break;
      case 'service':
        updatedItem = await db.cmsService.update({ where: { id }, data });
        break;
      case 'feature':
        updatedItem = await db.cmsFeature.update({ where: { id }, data });
        break;
      case 'setting':
        updatedItem = await db.cmsGlobalSettings.update({ data });
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
}`,
  'api/admin/settings/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
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
    const authResult = await requireRole(request, ['ADMIN', 'DEVELOPER']);
    if (!authResult.authorized) {
      return authResult.error;
    }

    const body = await request.json();
    const settings = await db.cmsGlobalSettings.update({
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
}`
};

Object.keys(adminRoutes).forEach((routePath) => {
  const fullPath = path.join('src', 'app', routePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, adminRoutes[routePath]);
  console.log(`✓ Created ${routePath}`);
});

// 4. Create CMS content hooks
const hooksContent = `import { use, useState, useEffect, useCallback } from 'react';

interface CMSContent {
  hero?: any;
  statistics?: any[];
  features?: any[];
  services?: any[];
  testimonials?: any[];
  team?: any[];
  partners?: any[];
  contactInfo?: any;
  settings?: any;
  [key: string]: any;
}

interface UseCMSContentOptions {
  revalidate?: number;
  enabled?: boolean;
}

export function useCMSContent(key: string, options: UseCMSContentOptions = {}) {
  const { revalidate = 60000, enabled = true } = options;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!data && enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(\`/api/cms/\${key}\`, {
        cache: 'no-cache',
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err: any) {
      setError(err.message);
      console.error(\`Error fetching CMS content for \${key}:\`, err);
    } finally {
      setLoading(false);
    }
  }, [key, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for different content types
export function useHeroContent() { return useCMSContent('hero'); }
export function useStatistics() { return useCMSContent('statistics'); }
export function useFeatures() { return useCMSContent('features'); }
export function useServices() { return useCMSContent('services'); }
export function useTestimonials() { return useCMSContent('testimonials'); }
export function useTeamMembers() { return useCMSContent('team'); }
export function usePartners() { return useCMSContent('partners'); }
export function useContactInfo() { return useCMSContent('contact-info'); }
export function useSettings() { return useCMSContent('settings'); }
export function usePageContent(slug: string) {
  return useCMSContent(\`page-\${slug}\`);
}`;

const hooksPath = 'src/hooks/cms/use-cms-content.ts';
fs.writeFileSync(hooksPath, hooksContent);
console.log('✓ Created CMS content hooks');

// 5. Create seed data for CMS
const seedData = `[{"@prisma/client":{"cmsHero":true,"cmsStatistic":true,"cmsFeature":true,"cmsService":true,"cmsTestimonial":true,"cmsTeamMember":true,"cmsPartner":true,"cmsFaq":true,"cmsGlobalSettings":true,"cmsPage":true,"cmsBlogPost":true,"clientReview":true,"paymentGateway":true}}]\n`;

fs.writeFileSync('prisma/seed-cms.ts', seedData);
console.log('✓ Created CMS seed data');

console.log('\n✅ CMS implementation complete!');
console.log('\nNext steps:');
console.log('1. Run: npx prisma db push');
console.log('2. Run: npx ts-node prisma/seed-cms.ts');
console.log('3. Update your components to use CMS hooks');
console.log('4. Access admin interface at /api/admin/content');